import React from "react";
import Image from "next/image";
import Link from "next/link";
import { fetchProducts } from "@/assets/utils/request";
import NewProductCard from "@/components/redesign/NewProductCard";

export const metadata = {
  title:
    "Studio Six Collection - Toronto Sauna Co. | Sauna for Sale| outdoor sauna for sale | custome sauna Toronto",
  description:
    "Contemporary. Minimalist. Built for Canadian backyards. The Studio Six Collection blends timeless wellness with modern design, featuring CharClad black aluminum siding and premium Western Red Cedar.",
  keywords:
    "studio six, modern sauna, contemporary sauna, canadian sauna, toronto sauna, minimalist design, backyard sauna",
};

const STUDIO_SIX_SERIES_TERMS = ["studio 6", "studio six", "Studio 6"];

function matchesSeriesStudio6(p) {
  const s = p?.series;
  if (typeof s !== "string") return false;
  const lower = s.toLowerCase().trim();
  return STUDIO_SIX_SERIES_TERMS.some((term) => lower.includes(term));
}

function minProductPrice(products) {
  let min = null;
  for (const p of products) {
    const n = p?.baseCost ?? p?.price;
    if (typeof n === "number" && Number.isFinite(n)) {
      min = min === null ? n : Math.min(min, n);
    }
  }
  return min;
}

const Studio6Page = async () => {
  const products = await fetchProducts();
  const values = Array.isArray(products)
    ? products
    : Object.values(products || {});

  const studioSixProducts = values.filter((p) => matchesSeriesStudio6(p));

  const sortedProducts = [...studioSixProducts].sort(
    (a, b) =>
      (a.displayOrder ?? 999) - (b.displayOrder ?? 999) ||
      new Date(b.updatedAt || b.createdAt || 0) -
        new Date(a.updatedAt || a.createdAt || 0) ||
      (a.name || "").localeCompare(b.name || ""),
  );

  const lowestPrice = minProductPrice(sortedProducts);

  const heroImage =
    "/images/west_coast/The-Max-w-Porch_1.PNG" ||
    sortedProducts[0]?.images?.[0];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gray-900 text-white py-32 overflow-hidden">
        <div className="absolute inset-0 bg-black/50 z-10"></div>
        <div className="absolute inset-0 ">
          <Image
            src={heroImage}
            alt="Studio Six Collection"
            fill
            className="object-cover "
            priority
            sizes="100vw"
          />
        </div>

        <div className="container mx-auto px-4 relative z-20 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl md:text-6xl font-archivo tracking-wide text-nowrap md:mb-6">
              Studio Six Collection
            </h1>
            <p className="text-xl md:text-2xl mb-6 font-archivo">
              Contemporary. Minimalist. Built for Canadian backyards.
            </p>
            <div className="text-lg md:text-xl mb-8 max-w-3xl mx-auto leading-relaxed font-archivo">
              The Studio Six Collection represents the next evolution in outdoor
              sauna design, where modern architecture meets advanced
              performance. Designed in Toronto and built for Canadian
              conditions, these premium cedar saunas are constructed using
              Structurally Insulated Panels (SIPs) to deliver exceptional
              strength, superior insulation, and industry leading heat
              retention. With enhanced construction, upgraded seating, and
              refined finishes, Studio Six sets a new benchmark for quality,
              comfort, and year round usability.
            </div>
            {/* {lowestPrice != null && (
              <div className="text-2xl md:text-3xl font-semibold mb-4">
                Prices starting at ${lowestPrice.toLocaleString()}
              </div>
            )}
            <Link href="/quote?sauna=Studio%20Six%20Collection">
              <button className="bg-white  text-black px-8 py-4 rounded-xl  font-semibold text-lg hover:bg-gray-200 transition-colors">
                Get Your Quote
              </button>
            </Link> */}
          </div>
        </div>
      </section>

      {/* Models from database (series: Studio 6) */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          {/* <div className="text-center mb-16">
            <h2 className="text-2xl font-semibold font-roboto mb-4">
              Available Models
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose the perfect size for your space and lifestyle
            </p>
          </div> */}

          <div className="max-w-7xl mx-auto">
            {sortedProducts.length === 0 ? (
              <p className="text-center text-gray-600">
                No Studio Six models are listed yet. Please check back soon or
                contact us for a quote.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {sortedProducts.map((product) => (
                  <NewProductCard
                    key={product._id || product.id}
                    product={product}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Studio6Page;
