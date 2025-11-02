"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";

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
        }
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
      name: "Studio 6 Max",
      description:
        "The Studio 6 Max Sauna sits 4 people it is the largest model in the Studio 6 collection,designed to bring the full sauna wellness experience.",
      image: "/images/Max 1.png",
      href: "/saunas/studio-6",
      price: "Starting at $16,549",
    },
    {
      id: 2,
      name: "Studio 6 Mini",
      description:
        "The Studio 6 Mini Sauna sits 2 to 3 people. It is a sleek and modern design that combines efficiency and elegance in a compact footprint.",
      image: "/images/Mini 1.png",
      href: "/saunas/studio-6",
      price: "Starting at $14,999",
    },
    {
      id: 3,
      name: "Pure Cube Hudson",
      description:
        "A modern and sophisticated design that features a peaked roof. Relax and rejuvenate with your family or friends.",
      image: "/images/PureCubeHudsonClear_ Web-12.jpg",
      href: "/saunas/668af06648215c199c406a64",
      price: "Starting at $15,757",
    },

    {
      id: 4,
      name: "Pure Cube Neptune",
      description:
        "The Neptune Sauna seamlessly integrates the outdoors into its design through an expansive glass front wall.",
      image:
        "https://res.cloudinary.com/dw4ev5whz/image/upload/v1720653214/torontosaunaco/Cubes/NE6110/neptune_900x_u29c1e.webp",
      href: "/saunas/668af06648215c199c406a65",
      price: "Starting at $15,999",
    },

    {
      id: 5,
      name: "Outdoor 552 Pure Cube Sauna ",
      description:
        "The Outdoor 552 Pure Cube Sauna sits 2 people and is an attractive and stylish design that features a large window panel on the front wall.",
      image:
        "https://res.cloudinary.com/dw4ev5whz/image/upload/v1720653090/torontosaunaco/Cubes/CU580/CU580PureCube5Person_900_xs7nw4.jpg",
      href: "/saunas/668af06648215c199c406a61",
      price: "Starting at $9,950",
    },
    {
      id: 6,
      name: "Pure Cube Sauna w/ Shower ",
      description:
        "The OutdoorSauna With Shower sits 3 people and is another sophisticated design.",
      image:
        "https://res.cloudinary.com/dw4ev5whz/image/upload/v1721090420/torontosaunaco/Cubes/CU582/4-PersonOutdoorSauna_Shower_900_acxnyb.jpg",
      href: "/saunas/6695c201a93a72ff9464ef74",
      price: "Starting at $12,850",
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
              Discover our most popular saunas, trusted by most of our customers
              across Canada for exceptional quality and wellness benefits.
            </p>
          </div>
        </div>
      </section>

      {/* Saunas Grid */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {bestSellers.map((sauna, index) => (
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
                    <div className="relative h-64 md:h-72 overflow-hidden">
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
                    </div>

                    {/* Content */}
                    <div className="p-6 bg-[#4E7302] flex-1 flex flex-col">
                      <h3 className="text-xl font-light text-white mb-2 font-archivo">
                        {sauna.name}
                      </h3>
                      <p className="text-white text-sm mb-4 leading-relaxed font-archivo font-normal flex-1">
                        {sauna.description}
                      </p>

                      {/* Price and CTA */}
                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/20">
                        <span className="text-white font-semibold font-archivo">
                          {sauna.price}
                        </span>
                        <div className="text-[#4E7302] bg-white/90 text-sm rounded-lg px-4 py-2 font-archivo font-medium hover:bg-white transition-colors">
                          View Details
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
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
              className="inline-block bg-[#4E7302] text-white text-lg font-archivo font-light px-8 md:px-12 py-4 rounded-xl hover:bg-[#3d5a1f] transition-colors"
            >
              Get a Quote
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BestSellers;
