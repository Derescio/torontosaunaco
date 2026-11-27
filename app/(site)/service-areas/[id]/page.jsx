import { notFound } from "next/navigation";
import JsonLd from "../../../../components/site/JsonLd";
import CityPage from "../../../../components/site/CityPage";
import { CITIES, getCity } from "../../../../lib/site/cities";
import { pageSeo } from "../../../../lib/site/seo";

// Copy is static design content; rebuild daily at most.
export const revalidate = 86400;

export async function generateStaticParams() {
  return CITIES.map(({ slug }) => ({ id: slug }));
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const city = getCity(id);
  return city ? pageSeo(city.route).metadata : {};
}

export default async function Page({ params }) {
  const { id } = await params;
  const city = getCity(id);
  if (!city) notFound();
  const seo = pageSeo(city.route);
  return (
    <>
      <JsonLd data={seo.jsonLd} />
      <CityPage page={city.page} />
    </>
  );
}
