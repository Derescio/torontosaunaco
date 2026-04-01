"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";

// Simple sale config for DX-friendly toggling
// Toggle SALE.active to true and adjust label/discount/appliesTo as needed
const SALE = {
  active: false,
  label: "10% OFF Black Friday",
  discount: 0.1,
  appliesTo: (sauna) => sauna.name === "The Mini" || sauna.name === "The Max",
};

const BestSellers = () => {
  const [visibleCards, setVisibleCards] = useState([
    false,
    false,
    false,
    false,
    false,
    false,
  ]);
  const cardRefs = useRef([]);

  useEffect(() => {
    const observers = cardRefs.current.map((ref, index) => {
      if (!ref) return null;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setVisibleCards((prev) => {
                const newState = [...prev];
                newState[index] = true;
                return newState;
              });
            }
          });
        },
        {
          threshold: 0.15,
          rootMargin: "0px 0px -50px 0px",
        },
      );

      observer.observe(ref);
      return observer;
    });

    return () => {
      observers.forEach((observer) => {
        if (observer) observer.disconnect();
      });
    };
  }, []);

  const bestSellers = [
    {
      id: 1,
      name: "The Mini",
      description:
        "The Studio 6 Mini Sauna sits 2 to 3 people. It is a sleek and modern design that combines efficiency and elegance in a compact footprint.",
      image:
        "https://res.cloudinary.com/dw4ev5whz/image/upload/v1771386024/torontosaunaco/studio/MiniONE_nabv0c.png",
      href: "/saunas/668af06648215c199c418a96",
      price: "$15,999",
    },
    {
      id: 2,
      name: "The Max",
      description:
        "The Studio 6 Max Sauna sits 4 people it is the largest model in the Studio 6 collection,designed to bring the full sauna wellness experience.",
      image:
        "https://res.cloudinary.com/dw4ev5whz/image/upload/v1771386022/torontosaunaco/studio/MaxONE_sd9kqd.png",
      href: "/saunas/69950e9f11eb36b604c4687b",
      price: "$20,650",
    },
    {
      id: 3,
      name: "The Max Plus",
      description:
        "The Studio 6 Max Plus Sauna sits 4 people it is the largest model in the Studio 6 collection,designed to bring the full sauna wellness experience.",
      image:
        "https://res.cloudinary.com/dw4ev5whz/image/upload/v1771386026/torontosaunaco/studio/PlusONE_wi1qzh.png",
      href: "/saunas/668af06648215c199c427a97",
      price: "$23,550",
    },

    {
      id: 4,
      name: "Pure Cube Neptune",
      description:
        "The Neptune Sauna seamlessly integrates the outdoors into its design through an expansive glass front wall.",
      image:
        "https://res.cloudinary.com/dw4ev5whz/image/upload/v1720653214/torontosaunaco/Cubes/NE6110/neptune_900x_u29c1e.webp",
      href: "/saunas/668af06648215c199c406a65",
      price: "$17,499",
    },
    {
      id: 5,
      name: "Pure Cube Hudson",
      description:
        "A modern and sophisticated design that features a peaked roof. Relax and rejuvenate with your family or friends.",
      image: "/images/hudson_900_pgonnk.jpg",
      href: "/saunas/668af06648215c199c406a64",
      price: "$16,995",
    },
    {
      id: 6,
      name: "The Orion",
      description:
        "A modern and sophisticated design that features a peaked roof. Relax and rejuvenate with your family or friends.",
      image:
        "https://res.cloudinary.com/dw4ev5whz/image/upload/v1720653285/torontosaunaco/Cubes/OR6110/MS-_-Orion-PDP_900_atvbal.jpg",
      href: "/saunas/668af06648215c199c406a66",
      price: "$17,995",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-green-50 to-white py-16 md:py-24">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12 md:mb-16">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-[#4E7302] mb-4 font-archivo">
              Best Sellers
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto font-archivo">
              Our best selling outdoor saunas, built for four season use. All
              but one are fully insulated with metal/aluminum cladding for long
              term durability and consistent heat, year round.
            </p>
          </div>
        </div>
      </section>

      {/* Saunas Grid */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {bestSellers.map((sauna, index) => {
              const isStudio6Sale = SALE.active && SALE.appliesTo(sauna);
              const originalPriceNumber = Number(
                (sauna.price || "").replace(/[^0-9]/g, "") || 0,
              );
              const discountedPrice = Math.round(originalPriceNumber * 0.9);

              return (
                <div
                  key={sauna.id}
                  ref={(el) => {
                    cardRefs.current[index] = el;
                  }}
                  className={`transform transition-all duration-700 ease-out ${
                    visibleCards[index]
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-12"
                  }`}
                  style={{
                    transitionDelay: visibleCards[index]
                      ? `${index * 100}ms`
                      : "0ms",
                  }}
                >
                  <Link href={sauna.href}>
                    <div className="group bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer h-full flex flex-col">
                      {/* Image */}
                      <div className="relative h-72 md:h-96 overflow-hidden">
                        <Image
                          src={sauna.image}
                          alt={sauna.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                        {/* Badge */}
                        <div className="absolute top-4 left-4 bg-[#4E7302] text-white px-3 py-1 rounded-full text-xs font-semibold font-archivo">
                          Best Seller
                        </div>
                        {/* Sale Banner */}
                        {isStudio6Sale && (
                          <div className="absolute top-4 right-4 mt-[-2px] bg-black/80 text-white px-3 py-1 rounded-full text-xs font-semibold font-archivo">
                            {SALE.label}
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-6 bg-[#BF9774]/30 flex-1 flex flex-col">
                        <h3 className="text-xl font-light text-black mb-2 font-archivo">
                          {sauna.name}
                        </h3>
                        <p className="text-black text-sm mb-4 leading-relaxed font-archivo font-normal flex-1">
                          {sauna.description}
                        </p>

                        {/* Price and CTA */}
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mt-auto pt-4 border-t border-white/20">
                          {isStudio6Sale ? (
                            <span className="text-black font-archivo">
                              <span className="line-through text-gray-700 mr-2">
                                {sauna.price}
                              </span>
                              <span className="font-semibold text-sm">
                                $
                                {Math.round(
                                  originalPriceNumber * (1 - SALE.discount),
                                ).toLocaleString()}
                              </span>
                            </span>
                          ) : (
                            <span className="text-black font-semibold font-archivo">
                              {sauna.price}
                            </span>
                          )}
                          <div className="text-black bg-[#BF9774]/50 text-sm rounded-lg px-5 py-2 font-archivo font-medium hover:bg-white transition-colors w-full md:w-auto text-center md:text-left md:shrink-0">
                            View Details
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-white to-green-50/30">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-light text-[#4E7302] mb-6 font-archivo">
            View Our Full Collection or Get a Quote.
          </h2>
          <p className="text-lg text-gray-600 mb-8 font-archivo">
            Explore our full collection or contact us for a custom quote
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/saunas"
              className="inline-block border-4 border-[#e2b48c] text-black text-lg font-archivo font-light px-8 md:px-12 py-4 rounded-xl hover:bg-gray-100 transition-colors"
            >
              View All Saunas
            </Link>
            <Link
              href="/quote"
              className="inline-block bg-black/90 text-white text-lg font-archivo font-light px-8 md:px-12 py-4 rounded-xl hover:bg-[#3d5a1f] transition-colors"
            >
              Get a Quote
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
// cname.vercel-dns.com.
export default BestSellers;
