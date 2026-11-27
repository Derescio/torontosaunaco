import Finder from "../../../content/redesign/SaunaFinder.json";
import { fetchProducts } from "@/assets/utils/request";
import JsonLd from "../../../components/site/JsonLd";
import Breadcrumb from "../../../components/site/Breadcrumb";
import SectionHeader from "../../../components/site/SectionHeader";
import SaunaFinder from "../../../components/site/SaunaFinder";
import { finderCopy } from "../../../lib/site/finderCopy";
import { linkProductPages } from "../../../lib/site/saunaFinder";
import { productPath } from "../../../lib/products/slugs";
import { pageSeo } from "../../../lib/site/seo";

// /sauna-finder, from SaunaFinder.dc.html. The catalogue is the design's fdData (owner, 2026-11-27, until Phase 3).
// The product catalogue only decides which cards can link to a product page (the rest go to the contact form).

export const revalidate = 7200;

const seo = pageSeo("/sauna-finder");
const copy = finderCopy(Finder);

export const metadata = seo.metadata;

async function productPaths() {
  try {
    const products = await fetchProducts();
    return new Set((Array.isArray(products) ? products : []).map(productPath).filter(Boolean));
  } catch {
    return null;
  }
}

export default async function Page() {
  const catalogue = linkProductPages(Finder.data.fdData, await productPaths());
  return (
    <>
      <JsonLd data={seo.jsonLd} />
      <section className="mx-auto flex max-w-site flex-col gap-10 px-5 py-12 desktop:px-8 desktop:py-16">
        <Breadcrumb items={copy.breadcrumb} />
        <SectionHeader as="h1" eyebrow={copy.eyebrow} heading={copy.heading} lead={copy.lead} />
        <SaunaFinder catalogue={catalogue} copy={copy} />
      </section>
    </>
  );
}
