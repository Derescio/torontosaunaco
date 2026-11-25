import { staticSlugs } from "@/lib/products/resolve";
import { loadSauna, saunaMetadataFor, SaunaProductView } from "./saunaPage";

/**
 * ISR: rebuild each product page at most once per hour. Slug pages are pre-rendered at build time; old ID URLs
 * (/saunas/<ObjectId>) render on demand and permanently redirect to their slug URL.
 */
export const revalidate = 3600;

export async function generateStaticParams() {
  const slugs = await staticSlugs("sauna", { indoor: false });
  return slugs.map((id) => ({ id }));
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  return saunaMetadataFor(id);
}

export default async function SaunaPage({ params }) {
  const { id } = await params;
  const product = await loadSauna(id);
  return <SaunaProductView product={product} />;
}
