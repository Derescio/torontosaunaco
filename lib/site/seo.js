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
  return imageMap[blob[1]] ?? DROP;
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

/** Business @id and address, product offers: applied to every node, however deeply nested. */
function applyRules(value, { price, now }) {
  if (Array.isArray(value)) return value.forEach((v) => applyRules(v, { price, now }));
  if (!value || typeof value !== "object") return;

  const types = typesOf(value);
  if (typeof value["@id"] === "string" && value["@id"].endsWith("#store")) value["@id"] = BUSINESS_ID;
  if (types.some((t) => BUSINESS_TYPES.includes(t)) && value.address && typeof value.address === "object") {
    value.address.addressLocality = "Schomberg";
  }
  // Catalogue prices (products, listings) come only from MongoDB. A Service's offer is the fixed business rule
  // ($1,750 Ontario delivery + installation, CLAUDE.md), so it stays as designed.
  if ("offers" in value && !types.includes("Service")) {
    if (!validPrice(price)) {
      delete value.offers;
    } else {
      const amount = price.toFixed(2);
      const offer = (o) => {
        const base = { ...(o ?? { "@type": "Offer" }), availability: "https://schema.org/InStock" };
        if (base["@type"] === "AggregateOffer") return { ...base, lowPrice: amount };
        return { ...base, price: amount, priceValidUntil: isoDatePlusYear(now) };
      };
      value.offers = Array.isArray(value.offers) ? value.offers.map(offer) : offer(value.offers);
    }
  }
  for (const v of Object.values(value)) applyRules(v, { price, now });
}

/** Pure: one content/seo.json entry → { metadata, jsonLd }. */
export function buildSeo(entry, { price, imageMap = {}, now = new Date() } = {}) {
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

  const jsonLd = Array.isArray(head.jsonLd) ? head.jsonLd : [];
  applyRules(jsonLd, { price, now });
  return { metadata, jsonLd };
}

/** SEO for a design route ("/about", "/saunas/indoor/pure-cube-552"); null when the design has no such page. */
export function pageSeo(route, { price } = {}) {
  if (typeof route !== "string") return null;
  const key = route.length > 1 ? route.replace(/\/+$/, "") : route;
  const entry = seoData.routes?.[key];
  if (!entry) return null;
  return buildSeo(entry, { price, imageMap: imageMapData });
}
