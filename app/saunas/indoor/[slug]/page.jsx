import { staticSlugs } from "@/lib/products/resolve";
import { loadSauna, saunaMetadataFor, SaunaProductView } from "../../[id]/saunaPage";

// Indoor saunas whose design route sits under /saunas/indoor/ (slug "indoor/<slug>").
export const revalidate = 3600;

export async function generateStaticParams() {
  const slugs = await staticSlugs("sauna", { indoor: true });
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  return saunaMetadataFor(`indoor/${slug}`);
}

export default async function IndoorSaunaPage({ params }) {
  const { slug } = await params;
  const product = await loadSauna(`indoor/${slug}`);
  return <SaunaProductView product={product} />;
}
