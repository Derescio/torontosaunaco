import Finder from "../../../content/redesign/SaunaFinder.json";
import JsonLd from "../../../components/site/JsonLd";
import Breadcrumb from "../../../components/site/Breadcrumb";
import SectionHeader from "../../../components/site/SectionHeader";
import SaunaFinder from "../../../components/site/SaunaFinder";
import { finderCopy } from "../../../lib/site/finderCopy";
import { pageSeo } from "../../../lib/site/seo";

// /sauna-finder, from SaunaFinder.dc.html. The catalogue is the design's fdData (owner, 2026-11-27, until Phase 3).

const seo = pageSeo("/sauna-finder");
const copy = finderCopy(Finder);

export const metadata = seo.metadata;

export default function Page() {
  return (
    <>
      <JsonLd data={seo.jsonLd} />
      <section className="mx-auto flex max-w-site flex-col gap-10 px-5 py-12 desktop:px-8 desktop:py-16">
        <Breadcrumb items={copy.breadcrumb} />
        <SectionHeader as="h1" eyebrow={copy.eyebrow} heading={copy.heading} lead={copy.lead} />
        <SaunaFinder catalogue={Finder.data.fdData} copy={copy} />
      </section>
    </>
  );
}
