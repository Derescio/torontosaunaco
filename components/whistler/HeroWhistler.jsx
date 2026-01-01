import React from "react";
import Image from "next/image";
import Link from "next/link";

const HeroWhistler = () => {
  return (
    <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://klgko4j9xb.ufs.sh/f/QU3WlvTtWXxINXUnmbY6EFDuZUGftA81BP9QXmlCKO5vzsew"
          alt="Whistler Sauna Wellness Background"
          fill
          className="object-cover"
          priority={true}
          fetchPriority="high"
          sizes="100vw"
        />
      </div>

      {/* Dark Overlay */}
      <div className="absolute inset-0 z-10 bg-black/40"></div>

      {/* Centered Content */}
      <div className="relative z-20 text-center px-4 max-w-5xl mx-auto">
        <p className="text-white/90 text-lg md:text-xl font-light mb-4 tracking-widest uppercase font-atkinson">
          The Whistler Sauna Co.
        </p>
        <h1 className="text-white text-5xl md:text-6xl lg:text-7xl font-thin mb-6 tracking-wide">
          Welcome To Wellness
        </h1>
        <p className="text-white text-xl md:text-2xl lg:text-3xl font-light mb-8 tracking-wide font-atkinson">
          Premium Saunas in Beautiful British Columbia
        </p>
        <div className="flex flex-col md:flex-row items-center justify-center gap-2">
          <Link
            href="/best-sellers"
            className="ml-2 inline-block border-2 border-[#8B7355] hover:bg-[#7A6345] bg-[#BF9774]/30 md:bg-[#BF9774]/70 text-white px-2 py-1 md:px-8 md:py-4 rounded-lg text-lg font-medium font-atkinson transition-colors shadow-lg"
          >
            Best Sellers
          </Link>
          <Link
            href="/saunas"
            className="inline-block border-2 border-[#8B7355] hover:bg-[#7A6345] text-white px-2 py-1 md:px-8 md:py-4 rounded-lg text-lg font-medium font-atkinson transition-colors shadow-lg"
          >
            View Collection
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HeroWhistler;
