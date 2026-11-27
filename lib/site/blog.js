// Blog posts for the new site: every published Sanity post, newest first, with the design's category, summary and
// photo for the posts Blog.dc.html covers. Spec: docs/superpowers/specs/2026-11-26-blog-design.md

import { client } from "@/lib/sanity";
import Blog from "../../content/redesign/Blog.json";

const FIELDS = `title, "slug": slug.current, publishedAt, description, titleimage`;
const DATE = /^[A-Z][a-z]+ \d{1,2}, \d{4}$/;

function designCards() {
  const cards = [];
  const walk = (x) => {
    if (x && typeof x === "object") {
      if (x.type === "card") cards.push(x);
      Object.values(x).forEach(walk);
    }
  };
  walk(Blog.sections);
  return cards.map((card) => {
    const [image, line, title, summary] = card.blocks;
    const parts = line.text.split(" · ").filter((p) => p !== "Latest");
    const date = parts.find((p) => DATE.test(p)) ?? null;
    return {
      slug: card.href.replace(/\/+$/, "").split("/").pop(),
      category: parts.find((p) => !DATE.test(p)) ?? null,
      date,
      title: title.text,
      summary: summary.text,
      image: { src: image.src, alt: image.alt },
    };
  });
}

const DESIGN_LIST = designCards();
export const DESIGN_CARDS = new Map(DESIGN_LIST.map((c) => [c.slug, c]));

// A Sanity image reference looks like "image-<id>-<w>x<h>-<ext>"; anything else would make urlFor() throw mid-render.
const SANITY_REF = /^image-[A-Za-z0-9]+-\d+x\d+-[a-z]+$/;
export function isSanityImage(source) {
  return SANITY_REF.test(String(source?.asset?._ref ?? ""));
}

/** Shortens text to `max` characters at a word boundary, with an ellipsis. Some Sanity descriptions hold a whole article. */
export function clip(text, max = 160) {
  const s = String(text ?? "").replace(/\s+/g, " ").trim();
  if (s.length <= max) return s;
  const cut = s.slice(0, max - 1);
  const atWord = cut.slice(0, Math.max(cut.lastIndexOf(" "), 1)).replace(/[\s,;:–—-]+$/, "");
  return `${atWord}…`;
}

export function formatDate(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "America/Toronto" });
}

export function toCard(post) {
  const design = DESIGN_CARDS.get(post.slug);
  let image = null;
  if (design) image = { kind: "design", ...design.image };
  else if (isSanityImage(post.titleimage)) image = { kind: "sanity", source: post.titleimage, alt: post.title };
  return {
    slug: post.slug,
    href: `/blog/${post.slug}`,
    title: post.title,
    date: formatDate(post.publishedAt),
    category: design?.category ?? null,
    summary: design?.summary ?? (post.description ? clip(post.description) : null),
    image,
  };
}

export async function getPosts() {
  try {
    const posts = await client.fetch(
      `*[_type == "blogPost" && defined(slug.current)] | order(publishedAt desc) { ${FIELDS} }`
    );
    return Array.isArray(posts) ? posts.filter((p) => p && p.slug && p.title) : [];
  } catch (error) {
    console.error("blog: Sanity posts fetch failed:", error?.message ?? error);
    return [];
  }
}

/**
 * One post, or null when it doesn't exist. A Sanity failure throws on purpose: the render fails, so ISR keeps serving
 * the last good page instead of caching a 404 for two hours.
 */
export async function getPost(slug) {
  const post = await client.fetch(`*[_type == "blogPost" && slug.current == $slug][0] { ${FIELDS}, content }`, { slug });
  return post && post.title ? post : null;
}

/** Cards for /blog. When Sanity has nothing (or fails), the design's 11 cards keep the page useful. */
export async function getCards() {
  const posts = await getPosts();
  if (posts.length) return { cards: posts.map(toCard), fromDesign: false };
  return {
    cards: DESIGN_LIST.map((c) => ({
      slug: c.slug,
      href: `/blog/${c.slug}`,
      title: c.title,
      date: c.date,
      category: c.category,
      summary: c.summary,
      image: { kind: "design", ...c.image },
    })),
    fromDesign: true,
  };
}

export function relatedCards(cards, slug, n = 3) {
  return (Array.isArray(cards) ? cards : []).filter((c) => c.slug !== slug).slice(0, n);
}
