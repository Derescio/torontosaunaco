import { notFound, permanentRedirect } from "next/navigation";
import { SaunaProductClient } from "@/components/sauna";
import { resolveProductParam } from "@/lib/products/resolve";
import { productPath } from "@/lib/products/slugs";

// Shared by /saunas/[id] and /saunas/indoor/[slug]: today's sauna product page, served at its slug URL.

const SITE = "https://www.thetorontosaunaco.com";

/** The product's public URL: its slug URL, or the old ID URL while it has none (or is a hot tub). */
function productUrl(product) {
  return `${SITE}${productPath(product) ?? `/saunas/${product._id}`}`;
}

/** Resolve the param; redirect ID URLs to their slug; 404 for anything unknown. */
export async function loadSauna(param) {
  const result = await resolveProductParam(param, "sauna");
  if (!result) notFound();
  if (result.redirectTo) permanentRedirect(result.redirectTo);
  return result.product;
}

/** Metadata for a resolved param (no redirect or 404 here: the page does those). */
export async function saunaMetadataFor(param) {
  const result = await resolveProductParam(param, "sauna");
  if (!result?.product) {
    return {
      title: "Product Not Found | Toronto Sauna Co.",
      description: "The requested product could not be found.",
    };
  }
  return saunaMetadata(result.product);
}

export function saunaMetadata(product) {
  const description = product.description?.slice(0, 160) || `Shop ${product.name} at Toronto Sauna Co.`;
  const url = productUrl(product);

  const fallbackImage = "https://klgko4j9xb.ufs.sh/f/QU3WlvTtWXxIKHBPF5JCIZtVTnlc4dX3YxhzgQfs85b0DSaU";
  const productImages = Array.isArray(product.images) ? product.images : [];
  // Prefer JPG for better social sharing compatibility
  const jpgImage = productImages.find(
    (img) => img?.toLowerCase().endsWith(".jpg") || img?.toLowerCase().endsWith(".jpeg")
  );
  const socialImage = jpgImage || productImages[0] || fallbackImage;

  return {
    title: `${product.name} | Toronto Sauna Co.`,
    description,
    keywords: `${product.name}, sauna, cedar sauna, ${product.type || "outdoor sauna"}, toronto sauna, canada sauna`,
    metadataBase: new URL(SITE),
    alternates: { canonical: url },
    openGraph: {
      title: `${product.name} | Toronto Sauna Co.`,
      description,
      url,
      siteName: "Toronto Sauna Co.",
      images: [{ url: socialImage, width: 1200, height: 630, alt: product.name }],
      locale: "en_CA",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} | Toronto Sauna Co.`,
      description,
      images: [socialImage],
    },
  };
}

/** JSON-LD structured data for Google rich snippets. */
export function saunaJsonLd(product) {
  const url = productUrl(product);
  const price = product.baseCost || product.price || product.startingFromPrice;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description?.slice(0, 500) || `Premium ${product.name} sauna from Toronto Sauna Co.`,
    image: product.images || [],
    brand: { "@type": "Brand", name: "Toronto Sauna Co." },
    manufacturer: { "@type": "Organization", name: "Toronto Sauna Co.", url: SITE },
    url,
    sku: product._id,
    category: product.type || "Sauna",
    ...(price && {
      offers: {
        "@type": "Offer",
        url,
        priceCurrency: "CAD",
        price: price,
        priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        availability: "https://schema.org/InStock",
        seller: { "@type": "Organization", name: "The Toronto Sauna Co." },
      },
    }),
    ...(Array.isArray(product.features) &&
      product.features.length > 0 && {
        additionalProperty: product.features.map((feature) => ({
          "@type": "PropertyValue",
          name: "Feature",
          value: feature,
        })),
      }),
  };
}

export function SaunaProductView({ product }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(saunaJsonLd(product)) }} />
      <SaunaProductClient product={product} productId={product._id} />
    </>
  );
}
