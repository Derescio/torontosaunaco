import { fetchProducts } from "@/assets/utils/request";
import Image from "next/image";
import NewProductCard from "@/components/redesign/NewProductCard";

export const metadata = {
  title:
    "Luna Saunas | Toronto Sauna Co. | Sauna for Sale| outdoor sauna for sale | custome sauna Toronto",
  description:
    "Discover premium cedar saunas in Toronto. Outdoor & indoor barrel, cube & custom sauna kits. Relax, recharge & enjoy cold plunges.",
};

const page = async () => {
  const products = await fetchProducts();
  const values = Array.isArray(products)
    ? products
    : Object.values(products || {});

  const matches = (v, term) =>
    typeof v === "string" && v.toLowerCase().includes(term);

  const isLuna = (p) =>
    matches(p?.type, "luna") ||
    matches(p?.collectionType, "luna") ||
    matches(p?.series, "luna");
  //matches(p?.name, "luna");

  const lunaProducts = values.filter((p) => isLuna(p));

  const sortedLunaProducts = [...lunaProducts].sort(
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
            src="https://res.cloudinary.com/dw4ev5whz/image/upload/v1720933070/torontosaunaco/Barrell/Filler_Image2_wjdarw.jpg"
            alt="Luna Saunas background"
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
            Luna Saunas
          </h1>
          <p className="text-lg md:text-xl text-gray-200 font-light font-archivo">
            Curved modern lines with wide front glazing for a bright, airy feel.
          </p>
        </div>
      </section>

      {/* Grid */}
      <section className="px-4 py-8">
        <div className="container mx-auto max-w-7xl">
          {sortedLunaProducts.length === 0 ? (
            <p className="text-center text-gray-600">No Luna products found.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedLunaProducts.map((product) => (
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
