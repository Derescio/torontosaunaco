import React from "react";
import Image from "next/image";
import { fetchProducts } from "@/assets/utils/request";
import NewProductCard from "@/components/redesign/NewProductCard";

export const metadata = {
  title:
    "Cube Saunas | Toronto Sauna Co.| Ontario | Sauna for Sale| outdoor sauna for sale | custome sauna Toronto",
  description:
    "Explore premium outdoor and indoor saunas for your home, crafted from high-quality cedar wood. Proudly made in Canada, our cedar barrel and cube saunas, sauna kits, and backyard wellness solutions provide relaxation, health benefits, and timeless luxury. Elevate your space today—cold plunges available!",
};

const PureCubePage = async () => {
  const products = await fetchProducts();

  // const cubeProducts = (
  //   Array.isArray(products) ? products : Object.values(products || {})
  // ).filter(
  //   (p) =>
  //     (p.type &&
  //       typeof p.type === "string" &&
  //       p.type.toLowerCase().includes("cube")) ||
  //     (p.collectionType &&
  //       typeof p.collectionType === "string" &&
  //       p.collectionType.toLowerCase().includes("cube"))

  const values = Array.isArray(products)
    ? products
    : Object.values(products || {});
  const matches = (v, term) =>
    typeof v === "string" && v.toLowerCase().includes(term);
  const isStudio6 = (p) =>
    matches(p?.type, "studio 6") ||
    matches(p?.type, "studio six") ||
    matches(p?.collectionType, "studio 6") ||
    matches(p?.collectionType, "studio six") ||
    matches(p?.series, "studio 6") ||
    matches(p?.series, "studio six") ||
    matches(p?.name, "studio 6") ||
    matches(p?.name, "studio six");
  const isCube = (p) =>
    matches(p?.type, "cube") ||
    matches(p?.collectionType, "cube") ||
    matches(p?.series, "cube") ||
    matches(p?.name, "cube");

  // Include both Cube and Studio 6 products on this page
  const cubeProducts = values.filter((p) => isCube(p) || isStudio6(p));
  // Sort by displayOrder first (lower is earlier), then Studio 6 priority,
  // then most recently updated, then name for stability
  const sortedCubeProducts = [...cubeProducts].sort(
    (a, b) =>
      (a.displayOrder ?? 999) - (b.displayOrder ?? 999) ||
      (isStudio6(a) === isStudio6(b) ? 0 : isStudio6(a) ? -1 : 1) ||
      new Date(b.updatedAt || b.createdAt || 0) -
        new Date(a.updatedAt || a.createdAt || 0) ||
      (a.name || "").localeCompare(b.name || "")
  );

  return (
    <div>
      <div>
        {/* Hero with Background Image and Overlay */}
        <section className="relative h-[400px] md:h-[500px] lg:h-[600px] flex items-center justify-center overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <Image
              src="https://res.cloudinary.com/dw4ev5whz/image/upload/v1762535855/torontosaunaco/Cubes/Trinity/IMG_7216_jjnmr0.jpg"
              alt="Cube Saunas background"
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
          </div>

          {/* Dark Overlay */}
          <div className="absolute inset-0 z-10 bg-black/50"></div>

          {/* Centered Content */}
          <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-white mb-4 font-archivo tracking-wide">
              Cube Saunas
            </h1>
            <p className="text-lg md:text-xl text-gray-200 font-light font-archivo">
              Bold, geometric design meets modern wellness. Our Cube collection
              combines clean lines, spacious interiors, and Canadian
              craftsmanship for a luxurious, long-lasting sauna experience.
            </p>
          </div>
        </section>
      </div>

      {/* New product grid (updated format) */}
      <section className="px-4 py-8">
        <div className="container mx-auto max-w-7xl">
          {sortedCubeProducts.length === 0 ? (
            <p className="text-center text-gray-600">No Cube products found.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedCubeProducts.map((product) => (
                <NewProductCard
                  key={product._id || product.id}
                  product={product}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/** Old component kept for reference during transition */}
      {/** <PureCube /> */}
    </div>
  );
};

export default PureCubePage;
