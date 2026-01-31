import connectDB from "@/config/db";
import Products from "@/models/Products";
import { SaunaProductClient } from "@/components/sauna";
import { notFound } from "next/navigation";

/**
 * Server component for sauna product page
 * Fetches product data server-side and passes to client component
 */

// Force dynamic rendering to bypass any stale cache
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Generate metadata for SEO
export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  console.log("[generateMetadata] Called with ID:", id);

  // Validate MongoDB ObjectId format
  if (!id || !/^[a-fA-F0-9]{24}$/.test(id)) {
    console.log("[generateMetadata] Invalid ObjectId format:", id);
    return {
      title: "Product Not Found | Toronto Sauna Co.",
      description: "The requested product could not be found.",
    };
  }

  try {
    await connectDB();
    console.log("[generateMetadata] DB connected, querying...");
    const product = await Products.findById(id).lean();
    console.log("[generateMetadata] Query result:", product ? `Found: ${product.name}` : "NOT FOUND");

    if (!product) {
      return {
        title: "Product Not Found | Toronto Sauna Co.",
        description: "The requested product could not be found.",
      };
    }

    const description =
      product.description?.slice(0, 160) ||
      `Shop ${product.name} at Toronto Sauna Co.`;

    const productUrl = `https://www.thetorontosaunaco.com/saunas/${id}`;

    // Fallback image for products without images
    const fallbackImage =
      "https://klgko4j9xb.ufs.sh/f/QU3WlvTtWXxIKHBPF5JCIZtVTnlc4dX3YxhzgQfs85b0DSaU";

    // Get the best image for social sharing (prefer JPG over PNG for better compatibility)
    const productImages = Array.isArray(product.images) ? product.images : [];
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
      alternates: {
        canonical: productUrl,
      },
      openGraph: {
        title: `${product.name} | Toronto Sauna Co.`,
        description,
        url: productUrl,
        siteName: "Toronto Sauna Co.",
        images: [
          {
            url: socialImage,
            width: 1200,
            height: 630,
            alt: product.name,
          },
        ],
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
  } catch (error) {
    return {
      title: "Toronto Sauna Co.",
      description: "Premium saunas crafted for wellness and relaxation.",
    };
  }
}

/**
 * Generate Product JSON-LD structured data for rich snippets
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
    brand: {
      "@type": "Brand",
      name: "Toronto Sauna Co.",
    },
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
        seller: {
          "@type": "Organization",
          name: "The Toronto Sauna Co.",
        },
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

// Server component
export default async function SaunaPage({ params }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  console.log("[SaunaPage] Fetching product with ID:", id);

  // Validate MongoDB ObjectId format
  if (!id || !/^[a-fA-F0-9]{24}$/.test(id)) {
    console.log("[SaunaPage] Invalid ObjectId format:", id);
    notFound();
  }

  try {
    await connectDB();
    console.log("[SaunaPage] Database connected, querying for:", id);
    
    const product = await Products.findById(id).lean();
    console.log("[SaunaPage] Query result:", product ? `Found: ${product.name}` : "NOT FOUND");

    if (!product) {
      console.log("[SaunaPage] Product not found in database for ID:", id);
      notFound();
    }

    // Serialize the MongoDB document for client component
    // Convert _id and any ObjectId fields to strings
    const serializedProduct = JSON.parse(JSON.stringify(product));

    // Generate JSON-LD structured data
    const jsonLd = generateProductJsonLd(serializedProduct, id);

    return (
      <>
        {/* JSON-LD Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <SaunaProductClient product={serializedProduct} productId={id} />
      </>
    );
  } catch (error) {
    console.error("Error fetching product:", error);
    notFound();
  }
}
