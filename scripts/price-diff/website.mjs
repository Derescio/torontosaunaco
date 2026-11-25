// Website price points from MongoDB documents (products, heaters, accessories), as staff maintain them in /editor.

import { parseMoney } from "./text.mjs";

const pt = (doc, path, label, price, kind) => ({
  id: `db:${String(doc._id)}:${path}`,
  product: doc.name,
  group: null,
  label: String(label).trim(),
  price,
  kind,
});

/** `{ key: { price } }` or `[{ name|type, price }]` → [label, price] pairs. */
function entries(value) {
  if (Array.isArray(value)) return value.map((v) => [v?.name ?? v?.type ?? "", v?.price]);
  if (value && typeof value === "object") return Object.entries(value).map(([k, v]) => [k, v?.price]);
  return [];
}

function addons(doc, field, out) {
  for (const [label, raw] of entries(doc[field])) {
    const price = parseMoney(raw);
    if (price === null || price === 0 || !String(label).trim()) continue;
    out.push(pt(doc, `${field}.${String(label).trim()}`, label, price, "addon"));
  }
}

export function productPoints(doc) {
  const out = [];
  const price = parseMoney(doc.price);
  const sizes = Array.isArray(doc.sizes) ? doc.sizes : [];
  // With sizes, `price` only repeats the smallest size, so the sizes alone are the base prices.
  if (price !== null && !sizes.length) out.push(pt(doc, "price", doc.name, price, "base"));
  for (const s of sizes) {
    const byWood = s.priceByWood instanceof Map ? Object.fromEntries(s.priceByWood) : s.priceByWood ?? {};
    for (const [wood, raw] of Object.entries(byWood)) {
      const p = parseMoney(raw);
      if (p !== null) out.push(pt(doc, `sizes.${s.key}.${wood}`, `${s.label} ${wood}`, p, "base"));
    }
  }
  // baseCost only stands in when the product has no price and no sizes (sizes are the real base prices).
  if (price === null && !sizes.length) {
    const base = parseMoney(doc.baseCost);
    if (base !== null) out.push(pt(doc, "baseCost", doc.name, base, "base"));
  }
  for (const field of ["wood_type", "stove_type", "installation", "additional_upgrades"]) addons(doc, field, out);
  const wifi = parseMoney(doc.wifi_controller?.price);
  if (wifi) out.push(pt(doc, "wifi_controller", "Wi-Fi controller", wifi, "addon"));
  const delivery = parseMoney(doc.delivery?.cost);
  if (delivery) out.push(pt(doc, "delivery", "Delivery", delivery, "addon"));
  return out;
}

export function heaterPoints(doc) {
  const out = [];
  const base = parseMoney(doc.basePrice);
  if (base !== null) out.push(pt(doc, "basePrice", `${doc.name} ${doc.power} kW`, base, "base"));
  for (const [group, list] of Object.entries(doc.options ?? {})) {
    for (const o of Array.isArray(list) ? list : []) {
      const price = parseMoney(o?.price);
      const label = o?.type ?? o?.name;
      if (price && label) out.push(pt(doc, `options.${group}.${label}`, label, price, "addon"));
    }
  }
  return out;
}

export function accessoryPoints(doc) {
  const price = parseMoney(doc.price);
  return price === null ? [] : [pt(doc, "price", doc.name, price, "base")];
}

/** ISO date of the most recent updatedAt, or null. */
export function newestUpdate(docs) {
  const times = docs.map((d) => (d.updatedAt ? new Date(d.updatedAt).getTime() : NaN)).filter(Number.isFinite);
  return times.length ? new Date(Math.max(...times)).toISOString() : null;
}
