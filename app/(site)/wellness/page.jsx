import JsonLd from "../../../components/site/JsonLd";
import WellnessPage from "../../../components/site/WellnessPage";
import { pageSeo } from "../../../lib/site/seo";

const seo = pageSeo("/wellness");

export const metadata = seo.metadata;

export default function Page() {
  return (
    <>
      <JsonLd data={seo.jsonLd} />
      <WellnessPage />
    </>
  );
}
