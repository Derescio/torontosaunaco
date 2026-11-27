import JsonLd from "../../../components/site/JsonLd";
import AboutPage from "../../../components/site/AboutPage";
import { pageSeo } from "../../../lib/site/seo";

const seo = pageSeo("/about");

export const metadata = seo.metadata;

export default function Page() {
  return (
    <>
      <JsonLd data={seo.jsonLd} />
      <AboutPage />
    </>
  );
}
