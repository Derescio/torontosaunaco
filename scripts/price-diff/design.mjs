// Design price points from the extracted pages (content/redesign/*.json): product configurators (data.D), heater
// configurators (data.d) and the accessories catalogue.

import { parseMoney } from "./text.mjs";

const ACCESSORY_LISTS = [
  ["items", "Accessories"],
  ["items_2", "Accessories"],
  ["packages", "Packages"],
  ["lighting", "Lighting"],
  ["finishes", "Finishes"],
];

const slug = (s) =>
  String(s)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export function categoryOf(route) {
  if (route.startsWith("/cold-plunges")) return "Cold plunges";
  if (route.startsWith("/outdoor-showers")) return "Outdoor showers";
  if (route.startsWith("/sauna-heaters")) return "Heaters";
  if (route.startsWith("/accessories")) return "Accessories";
  // Element saunas are indoor rooms even though their routes sit directly under /saunas.
  if (route.startsWith("/saunas/indoor") || route.startsWith("/saunas/element-")) return "Indoor saunas";
  return "Outdoor saunas";
}

// Options with none: true, and add-ons priced 0, are defaults rather than prices.
const keep = (option, kind) => !option.none && !(kind === "addon" && option.price === 0);

function point(stem, product, groupId, group, option, kind) {
  return { id: `${stem}:${groupId}:${option.id}`, product, group, label: option.label, price: parseMoney(option.price), kind };
}

function configuratorPoints(stem, D) {
  const points = [];
  for (const step of D.steps) {
    for (const g of Array.isArray(step.groups) ? step.groups : []) {
      const kind = g.base ? "base" : "addon";
      for (const o of g.options ?? []) if (keep(o, kind)) points.push(point(stem, D.name, g.id, g.title, o, kind));
    }
  }
  return points;
}

function heaterPoints(stem, d) {
  const points = [];
  d.steps.forEach((step, i) => {
    const kind = i === 0 ? "base" : "addon";
    for (const o of step.options ?? []) if (keep(o, kind)) points.push(point(stem, d.name, step.id, step.title, o, kind));
  });
  return points;
}

function accessoryPoints(data) {
  const product = "Accessories catalogue";
  const points = [];
  for (const [list, group] of ACCESSORY_LISTS) {
    for (const item of Array.isArray(data[list]) ? data[list] : []) {
      if (!item?.name) continue;
      const label = item.fullName ?? item.name;
      points.push({ id: `Accessories:${list}:${item.sku ?? slug(item.name)}`, product, group, label, price: parseMoney(item.price), kind: "base" });
    }
  }
  return points;
}

/** Product pages of the design, each with its price points. */
export function designProducts(pages) {
  const out = [];
  for (const page of pages) {
    const stem = page.file.replace(/\.dc\.html$/, "");
    const route = page.route ?? "";
    const D = page.data?.D;
    const d = page.data?.d;
    let name;
    let points;
    if (stem === "Accessories") {
      name = "Accessories catalogue";
      points = accessoryPoints(page.data ?? {});
    } else if (Array.isArray(D?.steps)) {
      name = D.name;
      points = configuratorPoints(stem, D);
    } else if (Array.isArray(d?.steps)) {
      name = d.name;
      points = heaterPoints(stem, d);
    } else {
      continue;
    }
    out.push({ file: page.file, stem, name, category: categoryOf(route), route, points });
  }
  return out;
}
