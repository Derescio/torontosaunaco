// Pairs design price points with website (MongoDB) price points and builds the report the Word document is made from.
// Spec: docs/superpowers/specs/2026-11-24-price-diff-design.md

import { similarity, samePrice } from "./text.mjs";
import { productPoints, heaterPoints, accessoryPoints, newestUpdate } from "./website.mjs";

const SECTION_ORDER = ["Outdoor saunas", "Indoor saunas", "Cold plunges", "Outdoor showers", "Heaters", "Accessories"];
const PRODUCT_THRESHOLD = 0.5;
const OPTION_THRESHOLD = 0.5;
const OUTCOMES = ["same", "differs", "on-request", "design-only", "website-only"];

const idOf = (doc) => String(doc._id);
const basePriceOf = (points) => points.find((p) => p.kind === "base")?.price ?? null;

function matchDocs(product, docs, overrides) {
  if (Object.hasOwn(overrides.products ?? {}, product.file)) {
    const ids = overrides.products[product.file];
    return ids === null ? [] : docs.filter((d) => ids.includes(idOf(d)));
  }
  if (product.category === "Accessories") return docs;
  let best = 0;
  let matched = [];
  for (const doc of docs) {
    const score = similarity(product.name, doc.name);
    if (score < PRODUCT_THRESHOLD) continue;
    if (score > best + 1e-9) {
      best = score;
      matched = [doc];
    } else if (Math.abs(score - best) <= 1e-9) {
      matched.push(doc);
    }
  }
  return matched;
}

/** Greedy one-to-one pairing by label similarity: best scores first, ties in design order. */
function pairGreedy(designPts, websitePts, paired, used) {
  const candidates = [];
  designPts.forEach((d, i) => {
    if (paired.has(d.id)) return;
    websitePts.forEach((w, j) => {
      if (used.has(w.id) || w.kind !== d.kind) return;
      const score = similarity(d.label, w.label);
      if (score >= OPTION_THRESHOLD) candidates.push({ d, w, score, i, j });
    });
  });
  candidates.sort((a, b) => b.score - a.score || a.i - b.i || a.j - b.j);
  for (const { d, w } of candidates) {
    if (paired.has(d.id) || used.has(w.id)) continue;
    paired.set(d.id, w);
    used.add(w.id);
  }
}

function designRow(d, w) {
  if (!w) return { id: d.id, group: d.group, label: d.label, websiteLabel: null, website: null, design: d.price, outcome: "design-only" };
  let outcome;
  if (d.price === null) outcome = "on-request";
  else outcome = samePrice(d.price, w.price) ? "same" : "differs";
  return { id: d.id, group: d.group, label: d.label, websiteLabel: w.label, website: w.price, design: d.price, outcome };
}

export function buildReport({ designProducts, catalogue, overrides = { products: {}, options: {} }, now = new Date().toISOString() }) {
  const pointsOf = new Map();
  for (const doc of catalogue.products) pointsOf.set(idOf(doc), productPoints(doc));
  for (const doc of catalogue.heaters) pointsOf.set(idOf(doc), heaterPoints(doc));
  for (const doc of catalogue.accessories) pointsOf.set(idOf(doc), accessoryPoints(doc));
  // Configurators offer heaters and accessories; unpaired add-ons are looked up here before being called design-only.
  const fallback = [...catalogue.heaters, ...catalogue.accessories]
    .flatMap((doc) => pointsOf.get(idOf(doc)))
    .filter((p) => p.kind === "base")
    .map((p) => ({ ...p, kind: "addon" }));

  const totals = Object.fromEntries(OUTCOMES.map((o) => [o, 0]));
  const matchedIds = new Set();
  const bySection = new Map();
  const designOnly = [];

  for (const product of designProducts) {
    const pool =
      product.category === "Accessories" ? catalogue.accessories : product.category === "Heaters" ? catalogue.heaters : catalogue.products;
    const docs = matchDocs(product, pool, overrides);
    if (!docs.length) {
      designOnly.push({ name: product.name, file: product.file, basePrice: basePriceOf(product.points) });
      continue;
    }
    for (const doc of docs) matchedIds.add(idOf(doc));

    const websitePts = docs.flatMap((doc) => pointsOf.get(idOf(doc)));
    const paired = new Map();
    const used = new Set();
    for (const d of product.points) {
      const forcedId = overrides.options?.[d.id];
      const w = forcedId && websitePts.find((p) => p.id === forcedId && !used.has(p.id));
      if (w) {
        paired.set(d.id, w);
        used.add(w.id);
      }
    }
    pairGreedy(product.points, websitePts, paired, used);
    pairGreedy(
      product.points.filter((d) => d.kind === "addon"),
      fallback,
      paired,
      new Set(),
    );

    const rows = [];
    let sameCount = 0;
    for (const d of product.points) {
      const row = designRow(d, paired.get(d.id));
      totals[row.outcome]++;
      if (row.outcome === "same") sameCount++;
      else rows.push(row);
    }
    for (const w of websitePts) {
      if (used.has(w.id)) continue;
      totals["website-only"]++;
      rows.push({ id: w.id, group: null, label: w.label, websiteLabel: w.label, website: w.price, design: null, outcome: "website-only" });
    }

    const entry = { name: product.name, file: product.file, matchedTo: [...new Set(docs.map((d) => d.name))], sameCount, rows };
    if (!bySection.has(product.category)) bySection.set(product.category, []);
    bySection.get(product.category).push(entry);
  }

  const byName = (a, b) => a.name.localeCompare(b.name);
  const sections = SECTION_ORDER.filter((c) => bySection.has(c)).map((category) => ({
    category,
    products: bySection.get(category).sort(byName),
  }));
  const websiteOnly = [
    ...catalogue.products.filter((d) => !matchedIds.has(idOf(d))).map((d) => ({ doc: d, collection: "products" })),
    ...catalogue.heaters.filter((d) => !matchedIds.has(idOf(d))).map((d) => ({ doc: d, collection: "heaters" })),
  ]
    .map(({ doc, collection }) => ({ name: doc.name, collection, basePrice: basePriceOf(pointsOf.get(idOf(doc))) }))
    .sort(byName);

  return {
    generatedAt: now,
    websiteAsOf: newestUpdate([...catalogue.products, ...catalogue.heaters, ...catalogue.accessories]),
    totals,
    sections,
    designOnly: designOnly.sort(byName),
    websiteOnly,
  };
}
