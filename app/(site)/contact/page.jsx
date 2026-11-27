import JsonLd from "../../../components/site/JsonLd";
import ContactPage from "../../../components/site/ContactPage";
import { pageSeo } from "../../../lib/site/seo";
import { isProduction } from "../../../lib/env/safety";

const seo = pageSeo("/contact");

export const metadata = seo.metadata;

// The "open your email app" fallback exists only in production (decided per deployment at build time), so no
// staging, preview or local page ever offers a link that would mail the team before cutover.
export default function Page() {
  return (
    <>
      <JsonLd data={seo.jsonLd} />
      <ContactPage fallbackEmail={isProduction() ? "sales@thetorontosaunaco.com" : null} />
    </>
  );
}
