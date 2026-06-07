export const UNPRICED_LABEL = "Request Price";
export const UNPRICED_LINK = "/contact";

export function isValidPrice(value) {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

export function getProductListPrice(product) {
  if (!product) return null;
  if (isValidPrice(product.baseCost)) return product.baseCost;
  if (isValidPrice(product.price)) return product.price;
  return null;
}

export function getProductStartingPrice(product, { isSingleWoodModel = false } = {}) {
  if (!product) return null;

  if (Array.isArray(product.sizes) && product.sizes.length > 0) {
    let minPrice = Infinity;
    for (const size of product.sizes) {
      if (size?.priceByWood && typeof size.priceByWood === "object") {
        if (isSingleWoodModel) {
          const knotty = size.priceByWood["Knotty Cedar"];
          if (isValidPrice(knotty) && knotty < minPrice) {
            minPrice = knotty;
          }
        } else {
          for (const value of Object.values(size.priceByWood)) {
            if (isValidPrice(value) && value < minPrice) {
              minPrice = value;
            }
          }
        }
      }
    }
    if (minPrice !== Infinity) return minPrice;
  }

  let base = getProductListPrice(product);
  if (base === null) return null;

  if (product.wood_type && typeof product.wood_type === "object") {
    const deltas = Object.values(product.wood_type)
      .map((o) => (o && typeof o.price === "number" ? o.price : 0))
      .filter((n) => typeof n === "number" && Number.isFinite(n));
    if (deltas.length > 0) {
      const minDelta = Math.min(...deltas);
      if (minDelta > 0) base += minDelta;
    }
  }

  return isValidPrice(base) ? base : null;
}
