/** Normalize API/catalog payloads (array or object map) for listing UIs */
export function normalizeProducts(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  return Object.values(data);
}

/** Homepage carousel: Pure Cube products, randomized subset */
export function buildPureCubeCarouselItems(products, limit = 7) {
  const list = normalizeProducts(products);
  const filtered = list.filter(
    (x) => x?.type !== "Cold Plunge" && x?.type === "Pure Cube"
  );
  const shuffled = [...filtered].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, limit);
  return selected.map((product) => ({
    id: product._id,
    image: product.images?.[0],
    name: product.name,
    price: product.price,
  }));
}
