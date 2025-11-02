import ProductCard from "@/components/ProductCard";
import { fetchProducts } from "@/assets/utils/request";
import SaunaCollectionHero from "@/components/redesign/SaunaCollectionHero";

export const metadata = {
  title:
    "Saunas in Toronto | Outdoor & Indoor Cedar Saunas | Toronto Sauna Co.",
  description:
    "Discover premium cedar saunas in Toronto. Outdoor & indoor barrel, cube & custom sauna kits. Relax, recharge & enjoy cold plunges.",
  keywords:
    "sauna, toronto, ontario, canada, wellness, relaxation, steam, Best sauna shop in Ontario, Home Saunas near me",
};

const Saunas = async () => {
  const products = await fetchProducts();

  const filteredProducts = Object.values(products).filter(
    (x) =>
      x.type !== "Cold Plunge" &&
      x.type !== "Outdoor Shower" &&
      x.type !== "Hot Tub"
  );
  // console.log(typeof filteredProducts);
  return (
    <div>
      <SaunaCollectionHero />
      <section className="px-4 py-6 mt-6">
        <div className="container-xl lg:container m-auto px-4 py-6">
          {products.length === 0 ? (
            <p>No products found</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 gap-8">
              {filteredProducts.map((product, index) => (
                <ProductCard product={product} key={index} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Saunas;
