import JsonLd from "../../../components/site/JsonLd";
import ServiceAreasPage from "../../../components/site/ServiceAreasPage";
import { pageSeo } from "../../../lib/site/seo";

const seo = pageSeo("/service-areas");

export const metadata = seo.metadata;

export default function Page() {
  return (
    <>
      <JsonLd data={seo.jsonLd} />
      <ServiceAreasPage />
    </>
  );
}
