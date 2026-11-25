// SEO head of a design page: title, description, canonical, OpenGraph, Twitter card and JSON-LD.

const OG_KEYS = ["site_name", "type", "title", "description", "url", "image"];

/** @param root parsed document (`parse(html, { comment: true })`) */
export function extractHead(root, warn) {
  const attr = (selector, name) => root.querySelector(selector)?.getAttribute(name) ?? null;
  const og = {};
  for (const key of OG_KEYS) og[key] = attr(`meta[property="og:${key}"]`, "content");

  const jsonLd = [];
  for (const script of root.querySelectorAll('script[type="application/ld+json"]')) {
    const raw = script.rawText.trim();
    try {
      jsonLd.push(JSON.parse(raw));
    } catch {
      warn(`invalid JSON-LD: ${raw.slice(0, 60)}`);
    }
  }

  const title = root.querySelector("title");
  return {
    title: title ? title.text.trim() : null,
    description: attr('meta[name="description"]', "content"),
    canonical: attr('link[rel="canonical"]', "href"),
    og,
    twitter: { card: attr('meta[name="twitter:card"]', "content") },
    jsonLd,
  };
}
