// SEO for the redesign pages: Next metadata + JSON-LD from the design's head (content/seo.json, written by
// npm run extract:dc) with the site's rules applied in one place. Spec: docs/superpowers/specs/2026-11-25-seo-helper-design.md
//
//   export const metadata = pageSeo("/about").metadata;
//   <JsonLd data={pageSeo("/about").jsonLd} />
//   product pages: pageSeo(route, { price })  (price from MongoDB; the design's prices are never published)

import seoData from "../../content/seo.json";
import imageMapData from "../../content/image-map.json";

export const SITE = "https://www.thetorontosaunaco.com";
export const FALLBACK_OG_IMAGE = `${SITE}/og/Redesign_BG_Image.png`;
const BUSINESS_ID = `${SITE}/#business`;
const BUSINESS_TYPES = ["Store", "LocalBusiness", "HomeAndConstructionBusiness"];

// Any spelling of the domain (with or without www / "the", http or https) → the canonical origin.
const DOMAIN = /https?:\/\/(?:www\.)?(?:the)?torontosaunaco\.com/g;
const BLOB = /^https:\/\/www\.thetorontosaunaco\.com\/_blob\/([A-Za-z0-9]+)$/;
const DROP = Symbol("drop");

const typesOf = (node) => [].concat(node?.["@type"] ?? []);

function isoDatePlusYear(now) {
  const d = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
  return d.toISOString().slice(0, 10);
}

function fixString(value, imageMap) {
  const s = value.replace(DOMAIN, SITE);
  const blob = s.match(BLOB);
  if (!blob) return s;
  // Map entries are { url, width, height } (scripts/images); a bare URL string is still accepted.
  const hit = imageMap[blob[1]];
  if (!hit) return DROP;
  return typeof hit === "string" ? hit : hit.url ?? DROP;
}

/** Deep copy with domains fixed and design images mapped (DROP marks an unmapped image for removal). */
function normalise(value, imageMap) {
  if (typeof value === "string") return fixString(value, imageMap);
  if (Array.isArray(value)) return value.map((v) => normalise(v, imageMap)).filter((v) => v !== DROP);
  if (value && typeof value === "object") {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      const n = normalise(v, imageMap);
      if (n !== DROP) out[k] = n;
    }
    return out;
  }
  return value;
}

function validPrice(price) {
  return typeof price === "number" && Number.isFinite(price) && price > 0;
}

/** "https://www.thetorontosaunaco.com/saunas/x/" → "/saunas/x"; null for other sites or non-strings. */
function pathOf(url) {
  if (typeof url !== "string" || !url.startsWith(SITE)) return null;
  const p = url.slice(SITE.length).split(/[?#]/)[0].replace(/\/+$/, "");
  return p || "/";
}

function priced(offers, price, now) {
  const amount = price.toFixed(2);
  const offer = (o) => {
    const base = { ...(o ?? { "@type": "Offer" }), availability: "https://schema.org/InStock" };
    if (base["@type"] === "AggregateOffer") {
      const { highPrice, offerCount, price: _p, ...rest } = base;
      return { ...rest, lowPrice: amount };
    }
    return { ...base, price: amount, priceValidUntil: isoDatePlusYear(now) };
  };
  return Array.isArray(offers) ? offers.map(offer) : offer(offers);
}

/**
 * Business @id and address, and prices, for every node however deeply nested (returns a new value; DROP removes it).
 * Catalogue prices come only from MongoDB: a node's price is `prices[<its URL path>]`, or `price` when that path is
 * the page itself (a node with no URL counts as the page). A Product with no price is removed (a Product without
 * offers is an invalid rich result); inside a list it becomes a plain link to its page. Other nodes just lose
 * `offers`. A Service's offer is the fixed business rule ($1,750 Ontario delivery + installation, CLAUDE.md).
 */
function applyRules(value, ctx, parentKey) {
  if (Array.isArray(value)) return value.map((v) => applyRules(v, ctx, parentKey)).filter((v) => v !== DROP);
  if (!value || typeof value !== "object") return value;

  const node = { ...value };
  const types = typesOf(node);
  if (typeof node["@id"] === "string" && node["@id"].endsWith("#store")) node["@id"] = BUSINESS_ID;
  if (types.some((t) => BUSINESS_TYPES.includes(t)) && node.address && typeof node.address === "object") {
    node.address = { ...node.address, addressLocality: "Schomberg" };
  }
  if ("offers" in node && !types.includes("Service")) {
    const path = pathOf(node.url) ?? pathOf(node.offers?.url) ?? ctx.pageRoute;
    const price = ctx.prices[path] ?? (path === ctx.pageRoute ? ctx.price : undefined);
    if (validPrice(price)) {
      node.offers = priced(node.offers, price, ctx.now);
    } else if (types.includes("Product")) {
      return parentKey === "item" && typeof node.url === "string" ? node.url : DROP;
    } else {
      delete node.offers;
    }
  }
  for (const [k, v] of Object.entries(node)) {
    const next = applyRules(v, ctx, k);
    if (next === DROP) delete node[k];
    else node[k] = next;
  }
  return node;
}

/**
 * Pure: one content/seo.json entry → { metadata, jsonLd }.
 * `price`: this page's own product (MongoDB). `prices`: { "<route>": number } for products listed on the page.
 */
export function buildSeo(entry, { price, prices = {}, imageMap = {}, now = new Date() } = {}) {
  const head = normalise(entry.head ?? {}, imageMap);
  const og = head.og ?? {};
  const image = typeof og.image === "string" ? og.image : FALLBACK_OG_IMAGE;
  const ogTitle = og.title ?? head.title;
  const ogDescription = og.description ?? head.description;

  const metadata = {
    title: head.title,
    description: head.description,
    alternates: { canonical: head.canonical },
    openGraph: {
      type: "website",
      siteName: og.site_name ?? "The Toronto Sauna Co.",
      title: ogTitle,
      description: ogDescription,
      url: og.url ?? head.canonical,
      locale: "en_CA",
      images: [{ url: image }],
    },
    twitter: {
      card: head.twitter?.card ?? "summary_large_image",
      title: ogTitle,
      description: ogDescription,
      images: [image],
    },
  };
  if (String(entry.pageMap?.index ?? "").toLowerCase().includes("noindex")) {
    metadata.robots = { index: false, follow: true };
  }

  const pageRoute = entry.pageMap?.route ?? pathOf(head.canonical);
  const jsonLd = applyRules(Array.isArray(head.jsonLd) ? head.jsonLd : [], { price, prices: prices ?? {}, pageRoute, now });
  return { metadata, jsonLd };
}

/** SEO for a design route ("/about", "/saunas/indoor/pure-cube-552"); null when the design has no such page. */
export function pageSeo(route, { price, prices } = {}) {
  if (typeof route !== "string") return null;
  const key = route.length > 1 ? route.replace(/\/+$/, "") : route;
  const entry = seoData.routes?.[key];
  if (!entry) return null;
  return buildSeo(entry, { price, prices, imageMap: imageMapData });
}
