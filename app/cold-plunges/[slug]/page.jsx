import { notFound } from "next/navigation";
import { resolveProductParam, staticSlugs } from "@/lib/products/resolve";
import ColdPlungeClient from "@/app/cold-plunge/[id]/ColdPlungeClient";

// /cold-plunges/<slug>: today's product page at its new URL. Phase 3 reskins this route.
export const revalidate = 3600;

export async function generateStaticParams() {
  const slugs = await staticSlugs("cold-plunge");
  return slugs.map((slug) => ({ slug }));
}

async function load(slug) {
  const result = await resolveProductParam(slug, "cold-plunge");
  return result?.product ?? null;
}

// Placeholder until the shared SEO helper (rd/1-seo) supplies the design's head.
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await load(slug);
  if (!product) return { title: "Product Not Found | The Toronto Sauna Co." };
  return {
    title: `${product.name} | The Toronto Sauna Co.`,
    alternates: { canonical: `https://www.thetorontosaunaco.com/cold-plunges/${product.slug}` },
  };
}

export default async function ColdPlungeSlugPage({ params }) {
  const { slug } = await params;
  const product = await load(slug);
  if (!product) notFound();
  return <ColdPlungeClient id={product._id} />;
}
