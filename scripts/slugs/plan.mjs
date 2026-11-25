// Plans the slug backfill: which product and accessory gets which slug. Pure (no database), so it's unit tested;
// scripts/slugs/backfill-slugs.mjs does the I/O. Spec: docs/superpowers/specs/2026-11-25-slugs-design.md

import { matchDocs } from "../price-diff/report.mjs";
import { slugFromRoute } from "../../lib/products/slugs.js";
import { slugify } from "../../assets/utils/slugify.js";

// Design pages whose route becomes a product slug. Heaters already have slugs; accessories have no per-item pages.
const CATEGORIES = new Set(["Outdoor saunas", "Indoor saunas", "Cold plunges", "Outdoor showers"]);

const idOf = (doc) => String(doc._id);

/**
 * @returns {{ rows: {collection, id, name, slug, source: "design"|"name"|"existing"}[], errors: string[] }}
 * Existing slugs are kept, design slugs come next, and names last (with -1, -2… on a clash).
 */
export function planSlugs({ designProducts, products = [], accessories = [], overrides = { products: {} }, primary = {} }) {
  const errors = [];
  const rows = [];
  const plan = (collection, docs) => {
    const taken = new Map(); // slug → id
    const planned = new Map(); // id → row
    const add = (doc, slug, source) => {
      const row = { collection, id: idOf(doc), name: doc.name, slug, source };
      taken.set(slug, row.id);
      planned.set(row.id, row);
    };

    for (const doc of docs) {
      if (!doc.slug) continue;
      if (taken.has(doc.slug)) errors.push(`${collection}: ${taken.get(doc.slug)} and ${idOf(doc)} both have slug "${doc.slug}"`);
      else add(doc, doc.slug, "existing");
    }
    return { taken, planned, add };
  };

  const prod = plan("products", products);
  const byDesign = new Map(); // id → design file
  for (const page of designProducts) {
    if (!CATEGORIES.has(page.category)) continue;
    const matched = matchDocs(page, products, overrides);
    if (!matched.length) continue;
    let doc = matched[0];
    if (matched.length > 1) {
      const pick = primary[page.file];
      doc = matched.find((d) => idOf(d) === pick);
      if (!doc) {
        errors.push(`${page.file} matches ${matched.map(idOf).join(", ")}: name one in scripts/slugs/primary.json`);
        continue;
      }
    }
    const id = idOf(doc);
    if (byDesign.has(id)) {
      errors.push(`${id} is matched by both ${byDesign.get(id)} and ${page.file}`);
      continue;
    }
    byDesign.set(id, page.file);
    if (prod.planned.has(id)) continue; // already has a slug: never overwritten
    const slug = slugFromRoute(page.route);
    if (!slug) continue;
    if (prod.taken.has(slug)) {
      errors.push(`products: "${slug}" (${page.file}) is already taken by ${prod.taken.get(slug)}`);
      continue;
    }
    prod.add(doc, slug, "design");
  }

  const fillFromNames = (state, docs) => {
    for (const doc of docs) {
      if (state.planned.has(idOf(doc))) continue;
      const base = slugify(doc.name);
      if (!base) continue; // no name: the pre-save hook can't name it either
      let slug = base;
      for (let n = 1; state.taken.has(slug); n += 1) slug = `${base}-${n}`;
      state.add(doc, slug, "name");
    }
  };
  fillFromNames(prod, products);
  const acc = plan("accessories", accessories);
  fillFromNames(acc, accessories);

  const ordered = (state, docs) => docs.map((d) => state.planned.get(idOf(d))).filter(Boolean);
  rows.push(...ordered(prod, products), ...ordered(acc, accessories));
  return { rows, errors };
}
