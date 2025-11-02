"use client";
import Contact from "@/components/Contact";
import Image from "next/image";
// import { GoogleTagManager } from "@next/third-parties/google";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

const QuoteContent = () => {
  const searchParams = useSearchParams();
  const sauna = searchParams.get("sauna");
  const dimensions = searchParams.get("dimensions");

  // Create a dynamic subject based on the sauna information
  let defaultSubject = "General Inquiry";
  if (sauna) {
    defaultSubject = `Quote Request - ${sauna}`;
    if (dimensions) {
      defaultSubject += ` (${dimensions})`;
    }
  }

  return (
    <>
      <Contact defaultSubject={defaultSubject} />
      {/* <GoogleTagManager gtmId="AW-16622832527" /> */}
    </>
  );
};

const Quote = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      {/* Hero Section with Background Image */}
      <section className="drop-shadow-lg relative h-[400px] md:h-[500px] lg:h-[600px] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/panoramic.jpeg"
            alt="Sauna Panoramic View"
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        </div>

        {/* Dark Overlay */}
        <div className="absolute inset-0 z-10 bg-black/50"></div>

        {/* Centered Content */}
        <div className="relative z-20 text-center px-4 max-w-5xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-white mb-4 font-archivo tracking-wide">
            Get a Quote
          </h1>
          <p className="text-xl md:text-2xl lg:text-3xl text-gray-200 font-light font-archivo">
            Let's bring your sauna vision to life
          </p>
        </div>
      </section>

      <QuoteContent />
    </Suspense>
  );
};

export default Quote;
