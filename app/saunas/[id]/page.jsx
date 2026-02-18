import connectDB from "@/config/db";
import Products from "@/models/Products";
import { SaunaProductClient } from "@/components/sauna";
import { notFound } from "next/navigation";

/**
 * ISR: rebuild each product page at most once per hour.
 * Combined with generateStaticParams, pages are served from CDN
 * and only revalidated on the first request after 1 hour.
 */
export const revalidate = 3600;

/**
 * Shared product fetcher — called at build time by both
 * generateStaticParams, generateMetadata, and the page component.
 * Next.js deduplicates this automatically during the build.
 */
async function getProduct(id) {
  // Reject anything that isn't a valid MongoDB ObjectId
  if (!id || !/^[a-fA-F0-9]{24}$/.test(id)) return null;

  await connectDB();
  const product = await Products.findById(id).lean();
  if (!product) return null;

  // Serialize ObjectIds / Dates so the result is plain JSON
  return JSON.parse(JSON.stringify(product));
}

/**
 * Pre-render every sauna product page at build time.
 * This is the key change that eliminates the 16K serverless invocations:
 * all pages become static HTML on Vercel's CDN.
 */
export async function generateStaticParams() {
  await connectDB();
  const products = await Products.find({}, "_id").lean();
  return products.map((p) => ({ id: p._id.toString() }));
}

/**
 * SEO metadata — reuses the same cached getProduct() result.
 */
export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const product = await getProduct(resolvedParams.id);

  if (!product) {
    return {
      title: "Product Not Found | Toronto Sauna Co.",
      description: "The requested product could not be found.",
    };
  }

  const description =
    product.description?.slice(0, 160) ||
    `Shop ${product.name} at Toronto Sauna Co.`;

  const productUrl = `https://www.thetorontosaunaco.com/saunas/${resolvedParams.id}`;

  const fallbackImage =
    "https://klgko4j9xb.ufs.sh/f/QU3WlvTtWXxIKHBPF5JCIZtVTnlc4dX3YxhzgQfs85b0DSaU";

  const productImages = Array.isArray(product.images) ? product.images : [];
  // Prefer JPG for better social sharing compatibility
  const jpgImage = productImages.find(
    (img) =>
      img?.toLowerCase().endsWith(".jpg") ||
      img?.toLowerCase().endsWith(".jpeg")
  );
  const socialImage = jpgImage || productImages[0] || fallbackImage;

  return {
    title: `${product.name} | Toronto Sauna Co.`,
    description,
    keywords: `${product.name}, sauna, cedar sauna, ${product.type || "outdoor sauna"}, toronto sauna, canada sauna`,
    metadataBase: new URL("https://www.thetorontosaunaco.com"),
    alternates: { canonical: productUrl },
    openGraph: {
      title: `${product.name} | Toronto Sauna Co.`,
      description,
      url: productUrl,
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

/**
 * JSON-LD structured data for Google rich snippets.
 */
function generateProductJsonLd(product, id) {
  const productUrl = `https://www.thetorontosaunaco.com/saunas/${id}`;
  const price = product.baseCost || product.price || product.startingFromPrice;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description:
      product.description?.slice(0, 500) ||
      `Premium ${product.name} sauna from Toronto Sauna Co.`,
    image: product.images || [],
    brand: { "@type": "Brand", name: "Toronto Sauna Co." },
    manufacturer: {
      "@type": "Organization",
      name: "Toronto Sauna Co.",
      url: "https://www.thetorontosaunaco.com",
    },
    url: productUrl,
    sku: id,
    category: product.type || "Sauna",
    ...(price && {
      offers: {
        "@type": "Offer",
        url: productUrl,
        priceCurrency: "CAD",
        price: price,
        priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
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

/**
 * Page component — product is already fetched at build time via
 * generateStaticParams so this function runs zero times in production
 * (until ISR triggers a background regeneration).
 */
export default async function SaunaPage({ params }) {
  const resolvedParams = await params;
  const product = await getProduct(resolvedParams.id);

  if (!product) notFound();

  const jsonLd = generateProductJsonLd(product, resolvedParams.id);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SaunaProductClient product={product} productId={resolvedParams.id} />
    </>
  );
}
