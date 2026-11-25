// Where a product lives on the new site. A product's slug is its route below the category root, so indoor saunas keep
// their folder ("indoor/pure-cube-552" → /saunas/indoor/pure-cube-552). Hot tubs aren't in the redesign: no URL yet.
// Plain module with no database imports: the slug backfill CLI imports it too.

export const ROOTS = {
  sauna: "/saunas",
  "cold-plunge": "/cold-plunges",
  shower: "/outdoor-showers",
};

const KIND_BY_TYPE = {
  "Cold Plunge": "cold-plunge",
  "Outdoor Shower": "shower",
  "Hot Tub": "hot-tub",
};

/** "sauna" | "cold-plunge" | "shower" | "hot-tub", from the product's `type`. */
export function kindOf(product) {
  return KIND_BY_TYPE[product?.type] ?? "sauna";
}

/** The product's slug URL path, or null (no slug yet, or a hot tub). */
export function productPath(product) {
  if (!product?.slug) return null;
  const root = ROOTS[kindOf(product)];
  return root ? `${root}/${product.slug}` : null;
}

/** "/saunas/indoor/pure-cube-552" → "indoor/pure-cube-552"; null for a bare root or any other route. */
export function slugFromRoute(route) {
  if (typeof route !== "string") return null;
  for (const root of Object.values(ROOTS)) {
    if (route.startsWith(`${root}/`)) {
      const slug = route.slice(root.length + 1).replace(/\/+$/, "");
      return slug || null;
    }
  }
  return null;
}
