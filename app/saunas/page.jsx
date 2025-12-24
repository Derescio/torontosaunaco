import ProductCard from "@/components/ProductCard";
import NewProductCard from "@/components/redesign/NewProductCard";
import { fetchProducts } from "@/assets/utils/request";
import SaunaCollectionHero from "@/components/redesign/SaunaCollectionHero";

export const metadata = {
  title:
    "Saunas in Toronto | Outdoor & Indoor Cedar Saunas | Toronto Sauna Co.",
  description:
    "Discover premium cedar saunas in Toronto. Outdoor & indoor barrel, cube & custom sauna kits. Relax, recharge & enjoy cold plunges.",
  keywords:
    "sauna, toronto, ontario, canada, wellness, relaxation, steam, Best sauna shop in Ontario, Home Saunas near me, barrel sauna, cube sauna, backyard sauna",
  metadataBase: new URL("https://www.thetorontosaunaco.com"),
  alternates: {
    canonical: "https://www.thetorontosaunaco.com/saunas",
  },
  openGraph: {
    title: "Saunas in Toronto | Outdoor & Indoor Cedar Saunas",
    description:
      "Discover premium cedar saunas in Toronto. Outdoor & indoor barrel, cube & custom sauna kits. Relax, recharge & enjoy cold plunges.",
    url: "https://www.thetorontosaunaco.com/saunas",
    siteName: "Toronto Sauna Co.",
    images: [
      {
        url: "/og/IMG_6773_black.png",
        width: 1200,
        height: 630,
        alt: "Toronto Sauna Co. - Saunas in Toronto",
      },
    ],
    locale: "en_CA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Saunas in Toronto | Outdoor & Indoor Cedar Saunas",
    description:
      "Discover premium cedar saunas in Toronto, Ontario. Barrel, cube, custom & so much more. Relax & recharge!",
    images: [
      {
        url: "/og/Sauna_Twitter_Image.png",
        width: 1200,
        height: 630,
        alt: "Toronto Sauna Co. - Saunas in Toronto",
      },
    ],
  },
};

const Saunas = async () => {
  const products = await fetchProducts();

  const filteredProducts = Object.values(products).filter(
    (x) =>
      x.type !== "Cold Plunge" &&
      x.type !== "Outdoor Shower" &&
      x.type !== "Hot Tub" &&
      x.type !== "Indoor" &&
      x.collectionType !== "Indoor"
  );
  const sortedProducts = [...filteredProducts].sort(
    (a, b) =>
      (a.displayOrder ?? 999) - (b.displayOrder ?? 999) ||
      new Date(b.updatedAt || b.createdAt || 0) -
        new Date(a.updatedAt || a.createdAt || 0) ||
      (a.name || "").localeCompare(b.name || "")
  );
  //console.log(products);
  return (
    <div>
      <SaunaCollectionHero />
      <section className="px-4 py-6 mt-6">
        <div className="container-xl lg:container m-auto px-4 py-6">
          {sortedProducts.length === 0 ? (
            <p>No products found</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 gap-8">
              {sortedProducts.map((product, index) => (
                <NewProductCard product={product} key={index} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Saunas;
