import JsonLd from "../../../components/site/JsonLd";
import BlogIndex from "../../../components/site/BlogIndex";
import { pageSeo } from "../../../lib/site/seo";
import { getCards } from "../../../lib/site/blog";

const seo = pageSeo("/blog");

export const metadata = seo.metadata;
// New Sanity posts appear within two hours without a deploy.
export const revalidate = 7200;

export default async function Page() {
  const { cards } = await getCards();
  return (
    <>
      <JsonLd data={seo.jsonLd} />
      <BlogIndex cards={cards} />
    </>
  );
}
