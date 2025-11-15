import { fetchProducts } from "@/assets/utils/request";
import Image from "next/image";
import NewProductCard from "@/components/redesign/NewProductCard";

export const metadata = {
  title: "Tubs | Toronto Sauna Co.| Ontario",
  description:
    "Explore premium outdoor and indoor saunas for your home, crafted from high-quality cedar wood. Proudly made in Canada, our cedar barrel and cube saunas, sauna kits, and backyard wellness solutions provide relaxation, health benefits, and timeless luxury. Elevate your space today—cold plunges available!",
};

const page = async () => {
  const products = await fetchProducts();
  const values = Array.isArray(products)
    ? products
    : Object.values(products || {});

  const matches = (v, term) =>
    typeof v === "string" && v.toLowerCase().includes(term);

  const isTub = (p) =>
    matches(p?.type, "hot tub") ||
    matches(p?.type, "cold plunge") ||
    matches(p?.collectionType, "hot tub") ||
    matches(p?.collectionType, "cold plunge") ||
    matches(p?.series, "tub") ||
    matches(p?.series, "plunge") ||
    matches(p?.name, "tub") ||
    matches(p?.name, "plunge");

  const tubProducts = values.filter((p) => isTub(p));

  const sortedTubProducts = [...tubProducts].sort(
    (a, b) =>
      (a.displayOrder ?? 999) - (b.displayOrder ?? 999) ||
      new Date(b.updatedAt || b.createdAt || 0) -
        new Date(a.updatedAt || a.createdAt || 0) ||
      (a.name || "").localeCompare(b.name || "")
  );

  return (
    <div>
      {/* Hero */}
      <section className="relative h-[400px] md:h-[500px] lg:h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/New_Hero.JPG"
            alt="Tubs background"
            fill
            className="object-cover"
            priority
            fetchPriority="high"
            sizes="100vw"
          />
        </div>
        <div className="absolute inset-0 z-10 bg-black/50"></div>
        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-white mb-4 font-archivo tracking-wide">
            Tubs
          </h1>
          <p className="text-lg md:text-xl text-gray-200 font-light font-archivo">
            Hot tubs and cold plunges for contrast therapy and recovery.
          </p>
        </div>
      </section>

      {/* Grid */}
      <section className="px-4 py-8">
        <div className="container mx-auto max-w-7xl">
          {sortedTubProducts.length === 0 ? (
            <p className="text-center text-gray-600">No Tub products found.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedTubProducts.map((product) => (
                <NewProductCard
                  key={product._id || product.id}
                  product={product}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default page;
