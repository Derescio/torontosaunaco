import connectDB from "@/config/db";
import Products from "@/models/Products";
import { SaunaProductClient } from "@/components/sauna";
import { notFound } from "next/navigation";

/**
 * Server component for sauna product page
 * Fetches product data server-side and passes to client component
 */

// Generate metadata for SEO
export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  // Validate MongoDB ObjectId format
  if (!id || !/^[a-fA-F0-9]{24}$/.test(id)) {
    return {
      title: "Product Not Found | Toronto Sauna Co.",
      description: "The requested product could not be found.",
    };
  }

  try {
    await connectDB();
    const product = await Products.findById(id).lean();

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
        images: product.images?.[0]
          ? [
              {
                url: product.images[0],
                width: 1200,
                height: 630,
                alt: product.name,
              },
            ]
          : [],
        locale: "en_CA",
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: `${product.name} | Toronto Sauna Co.`,
        description,
        images: product.images?.[0]
          ? [
              {
                url: product.images[0],
                width: 1200,
                height: 630,
                alt: product.name,
              },
            ]
          : [],
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

  // Validate MongoDB ObjectId format
  if (!id || !/^[a-fA-F0-9]{24}$/.test(id)) {
    notFound();
  }

  try {
    await connectDB();
    const product = await Products.findById(id).lean();

    if (!product) {
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
