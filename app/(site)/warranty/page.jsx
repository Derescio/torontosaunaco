import JsonLd from "../../../components/site/JsonLd";
import PolicyPage from "../../../components/site/PolicyPage";
import { POLICY_PAGES } from "../../../lib/site/policy";
import { pageSeo } from "../../../lib/site/seo";

const ROUTE = "/warranty";
const seo = pageSeo(ROUTE);

export const metadata = seo.metadata;

export default function Page() {
  return (
    <>
      <JsonLd data={seo.jsonLd} />
      <PolicyPage page={POLICY_PAGES[ROUTE]} />
    </>
  );
}
