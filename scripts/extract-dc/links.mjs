// Turns design links (`Contact.dc.html#visit`) into live routes (`/contact#visit`) using the page map.

const DC_LINK = /^([\w-]+\.dc\.html)([#?].*)?$/;

/** Maps one href. Non-design links (tel:, mailto:, http, #frag, {{…}}) pass through unchanged. */
export function mapHref(href, pageMap) {
  const m = DC_LINK.exec(href);
  if (!m) return { href, unmapped: false };
  const row = pageMap.get(m[1]);
  if (!row) return { href, unmapped: true };
  return { href: row.route + (m[2] ?? ""), unmapped: false };
}

/** Deep copy of `value` with every design-link string mapped; warns once per unmapped link. */
export function mapDataLinks(value, pageMap, warn) {
  if (typeof value === "string") {
    if (!DC_LINK.test(value)) return value;
    const { href, unmapped } = mapHref(value, pageMap);
    if (unmapped) warn(`unmapped link: ${value}`);
    return href;
  }
  if (Array.isArray(value)) return value.map((v) => mapDataLinks(v, pageMap, warn));
  if (value && typeof value === "object") {
    const out = {};
    for (const [k, v] of Object.entries(value)) out[k] = mapDataLinks(v, pageMap, warn);
    return out;
  }
  return value;
}
