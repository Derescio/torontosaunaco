"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import "animate.css";

const Signature = () => {
  const [visibleCards, setVisibleCards] = useState([false, false, false]);
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
          threshold: 0.2,
          rootMargin: "0px 0px -100px 0px",
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

  const saunas = [
    {
      id: 1,
      name: "Pure Cube Saunas",
      description:
        "Modern outdoor sauna with panoramic glass views. Perfect for small spaces and condos.",
      image: "/images/PureCube_redesign_1.png",
      href: "/saunas/cube",
      features: ["Compact Design", "Tempered Glass", "Western Red Cedar"],
    },
    {
      id: 2,
      name: "Studio 6 Max",
      description:
        "The ideal balance of space and efficiency. Classic design meets modern wellness technology.",
      image: "/images/Studio_Max.jpg",
      href: "/saunas/studio-6",
      features: ["Spacious Interior", "Premium Cedar", "Chromatherapy"],
    },
    {
      id: 3,
      name: "Barrel Sauna",
      description:
        "Traditional barrel design with authentic Finnish sauna experience. Beautiful curved architecture.",
      image: "/images/Barrel_redesign.png",
      href: "/saunas/barell",
      features: [
        "Traditional Design",
        "Efficient Heating",
        "Weather Resistant",
      ],
    },
  ];

  return (
    <section className="bg-white py-16 md:py-24">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-light text-black mb-4  font-archivo ">
            Signature Saunas
          </h2>

          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover our handpicked collection of premium saunas, each crafted
            for exceptional relaxation and wellness
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {saunas.map((sauna, index) => (
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
                  ? `${index * 300}ms`
                  : "100ms",
              }}
            >
              <Link href={sauna.href}>
                <div className="group bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer">
                  {/* Image */}
                  <div className="relative h-64 md:h-72 overflow-hidden">
                    <Image
                      src={sauna.image}
                      alt={sauna.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>

                  {/* Content */}
                  <div className="p-6 bg-[#4E7302]">
                    <h3 className="text-xl font-light text-white mb-2 font-archivo">
                      {sauna.name}
                    </h3>
                    <p className="text-white text-md mb-4 leading-relaxed font-archivo font-normal">
                      {sauna.description}
                    </p>

                    <div className="flex justify-start drop-shadow-md   ">
                      <div className="text-[#4E7302] bg-white/70 text-md rounded-lg px-2 py-2 leading-relaxed font-archivo font-normal hover:bg-white/90">
                        View More
                      </div>
                    </div>

                    {/* Features */}
                    {/* <div className="flex flex-wrap gap-2">
                      {sauna.features.map((feature, featureIndex) => (
                        <span
                          key={featureIndex}
                          className="text-xs px-3 py-1 bg-amber-50 text-amber-800 rounded-full font-medium"
                        >
                          {feature}
                        </span>
                      ))}
                    </div> */}
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
      {/* View Collection Button */}

      <Link href="/saunas">
        <div className="flex justify-center mt-8 mx-auto px-10 py-4 ">
          <div className=" border-4 border-[#e2b48c] text-black text-xl md:text-2xl  font-archivo font-light px-10 md:px-20 py-4 rounded-xl hover:bg-gray-100">
            View Catalog
          </div>
        </div>
      </Link>
    </section>
  );
};

export default Signature;
