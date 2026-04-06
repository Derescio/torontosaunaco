import React from "react";
import Image from "next/image";
import { fetchProducts } from "@/assets/utils/request";
import NewProductCard from "@/components/redesign/NewProductCard";

export const metadata = {
  title:
    "Barrel Saunas | Toronto Sauna Co.| Ontario | Sauna for Sale| outdoor sauna for sale | custome sauna Toronto",
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

  const isBarrel = (p) =>
    matches(p?.type, "barrel") ||
    matches(p?.type, "barrell") ||
    matches(p?.collectionType, "barrel") ||
    matches(p?.collectionType, "barrell") ||
    matches(p?.series, "barrel") ||
    matches(p?.name, "barrel");

  const barrelProducts = values.filter((p) => isBarrel(p));

  const sortedBarrelProducts = [...barrelProducts].sort(
    (a, b) =>
      (a.displayOrder ?? 999) - (b.displayOrder ?? 999) ||
      new Date(b.updatedAt || b.createdAt || 0) -
        new Date(a.updatedAt || a.createdAt || 0) ||
      (a.name || "").localeCompare(b.name || ""),
  );

  return (
    <div>
      <div>
        {/* Hero with Background Image and Overlay */}
        <section className="relative h-[400px] md:h-[500px] lg:h-[600px] flex items-center justify-center overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <Image
              src="https://res.cloudinary.com/dw4ev5whz/image/upload/v1762805848/torontosaunaco/Barrell/Half_Moon_Front_Wall_utsmmy.jpg"
              alt="Barrel Saunas background"
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
              Barrel Saunas
            </h1>
            <p className="text-lg md:text-xl text-gray-200 font-light font-archivo">
              Timeless, efficient heat circulation in a compact, beautiful form.
              Crafted in Canadian cedar for durability and year‑round wellness.
            </p>
          </div>
        </section>
      </div>

      {/* New product grid (updated format) */}
      <section className="px-4 py-8">
        <div className="container mx-auto max-w-7xl">
          {sortedBarrelProducts.length === 0 ? (
            <p className="text-center text-gray-600">
              No Barrel products found.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedBarrelProducts.map((product) => (
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
      {/** <BarrelPage /> */}
    </div>
  );
};

export default page;
