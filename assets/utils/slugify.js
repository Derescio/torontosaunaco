/**
 * URL-safe slug from a display string (names, titles).
 */
export function slugify(input) {
  if (typeof input !== "string" || !input.trim()) return "";

  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function isLikelyMongoObjectId(segment) {
  return typeof segment === "string" && /^[a-f0-9]{24}$/i.test(segment);
}
