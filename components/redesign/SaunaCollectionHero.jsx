"use client";
import { useEffect, useRef } from "react";
import Image from "next/image";

const SaunaCollectionHero = () => {
  const imageRef = useRef(null);

  useEffect(() => {
    // Zoom in animation on page load
    if (imageRef.current) {
      // Start zoomed in
      imageRef.current.style.transform = "scale(1.15)";
      imageRef.current.style.transition = "transform 3s ease-out";

      // Animate to normal scale
      setTimeout(() => {
        if (imageRef.current) {
          imageRef.current.style.transform = "scale(1)";
        }
      }, 50);
    }
  }, []);

  return (
    <section className="relative h-[400px] md:h-[500px] lg:h-[600px] flex items-center justify-center overflow-hidden">
      {/* Background Image with zoom animation */}
      <div className="absolute inset-0 z-0" ref={imageRef}>
        <Image
          src="/images/Redesign_BG_Image.png"
          alt="Sauna Collection Background"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Slight Overlay */}
      <div className="absolute inset-0 z-10 bg-black/40"></div>

      {/* Content */}
      <div className="relative z-20 text-center px-4 max-w-5xl mx-auto">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-white mb-4 font-archivo tracking-wide">
          Sauna Collection
        </h1>
        <p className="text-xl md:text-2xl lg:text-3xl text-gray-200 font-light font-archivo">
          Explore all our premium saunas
        </p>
      </div>
    </section>
  );
};

export default SaunaCollectionHero;
