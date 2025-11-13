import CanadianTimber from "@/components/CanadianTimber";
import Image from "next/image";
import { fetchProducts } from "@/assets/utils/request";
import NewProductCard from "@/components/redesign/NewProductCard";

export const metadata = {
  title: "Canadian Timber Saunas | Toronto Sauna Co.| Ontario",
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

  const isCanadianTimber = (p) =>
    matches(p?.type, "canadian timber") ||
    matches(p?.collectionType, "canadian timber") ||
    matches(p?.series, "canadian timber") ||
    matches(p?.name, "canadian timber") ||
    matches(p?.series, "ctc");

  const canadianProducts = values.filter((p) => isCanadianTimber(p));

  const sortedCanadianProducts = [...canadianProducts].sort(
    (a, b) =>
      (a.displayOrder ?? 999) - (b.displayOrder ?? 999) ||
      new Date(b.updatedAt || b.createdAt || 0) -
        new Date(a.updatedAt || a.createdAt || 0) ||
      (a.name || "").localeCompare(b.name || "")
  );

  return (
    <div>
      <div>
        {/* Hero with Background Image and Overlay */}
        <section className="relative h-[400px] md:h-[500px] lg:h-[600px] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image
              src="https://res.cloudinary.com/dw4ev5whz/image/upload/v1721007667/torontosaunaco/CTC/Canadian%20Timber/IMG-20240714-WA0013_ptdiat.jpg"
              alt="Canadian Timber Saunas background"
              fill
              className="object-cover"
              priority
              fetchPriority="high"
              sizes="100vw"
            />
          </div>
          <div className="absolute inset-0 z-10 bg-black/50"></div>
          <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-light text-white mb-4 font-archivo tracking-wide">
              Canadian Timber Saunas
            </h2>
            <p className="text-lg md:text-xl text-gray-200 font-light font-archivo">
              Economical Eastern White Cedar kits with classic, durable designs.
            </p>
          </div>
        </section>
      </div>

      {/* Product grid */}
      <section className="px-4 py-8">
        <div className="container mx-auto max-w-7xl">
          {sortedCanadianProducts.length === 0 ? (
            <p className="text-center text-gray-600">
              No Canadian Timber products found.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedCanadianProducts.map((product) => (
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
