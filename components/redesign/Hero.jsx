// import React from "react";
// import Image from "next/image";
// import Link from "next/link";

// const Hero = () => {
//   return (
//     <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
//       {/* Background Image */}
//       <div className="absolute inset-0 z-0">
//         <Image
//           src="https://klgko4j9xb.ufs.sh/f/QU3WlvTtWXxINXUnmbY6EFDuZUGftA81BP9QXmlCKO5vzsew"
//           alt="Sauna Wellness Background"
//           fill
//           className="object-cover"
//           priority={true}
//           fetchPriority="high"
//           sizes="100vw"
//         />
//       </div>

//       {/* Dark Overlay */}
//       <div className="absolute inset-0 z-10 bg-black/40"></div>

//       {/* Centered Content */}
//       <div className="relative z-20 text-center px-4 max-w-5xl mx-auto">
//         <h1 className="text-white text-5xl md:text-6xl lg:text-7xl font-thin mb-6 tracking-wide">
//           Welcome To Wellness
//         </h1>
//         <p className="text-white text-xl md:text-2xl lg:text-3xl font-light mb-8 tracking-wide font-atkinson">
//           Relax Recharge Rejuvenate
//         </p>
//         <div className="flex flex-col md:flex-row items-center justify-center gap-2">
//           <Link
//             href="/best-sellers"
//             className="ml-2 inline-block border-2 border-[#8B7355] hover:bg-[#7A6345] bg-[#BF9774]/30 md:bg-[#BF9774]/70 text-white px-2 py-1 md:px-8 md:py-4 rounded-lg text-lg font-medium font-atkinson transition-colors shadow-lg"
//           >
//             Best Sellers
//           </Link>
//           <Link
//             href="/saunas"
//             className="inline-block border-2 border-[#8B7355] hover:bg-[#7A6345] text-white px-2 py-1 md:px-8 md:py-4 rounded-lg text-lg font-medium font-atkinson transition-colors shadow-lg"
//           >
//             View Collection
//           </Link>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default Hero;



"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import useMediaQuery from "@/lib/useMediaQuery";

const Hero = () => {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const videoRef = useRef(null);

  const isMobile = useMediaQuery("(max-width: 768px)");

const posterUrl = isMobile
  ? "/images/mobile_bg.png"   // NO TEXT
  : "/images/mobile_bg.png"; // Can match video
  // const posterUrl =
  //   "/images/mobile_bg.png"

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleCanPlay = () => {
      setIsVideoLoaded(true);
    };

    video.addEventListener("canplay", handleCanPlay);

    if (video.readyState >= 3) {
      setIsVideoLoaded(true);
    }

    return () => {
      video.removeEventListener("canplay", handleCanPlay);
    };
  }, []);

  return (
    <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background Image (always renders, instant paint) */}
      <div className="absolute inset-0 z-0">
        <Image
          src={posterUrl}
          alt="Sauna Wellness Background"
          fill
          priority
          // fetchPriority="high"
          sizes="100vw"
          className={`object-cover transition-opacity duration-1000 ${
            isVideoLoaded ? "opacity-0" : "opacity-100"
          }`}
        />
      </div>

      {/* Background Video (CDN) */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        aria-hidden="true"
        data-testid="hero-video"
        className={`absolute inset-0 z-[1] h-full w-full object-cover transition-opacity duration-1000 ${
          isVideoLoaded ? "opacity-100" : "opacity-0"
        }`}
        // poster={posterUrl}
      >
        <source
          src="https://res.cloudinary.com/dw4ev5whz/video/upload/f_auto,q_auto:eco,w_960/torontosaunaco/stoves/ttsc-hero-sauna-720p_lgturi"
          type="video/mp4"
          // src="https://res.cloudinary.com/dw4ev5whz/video/upload/v1770173947/torontosaunaco/stoves/ttsc-hero-sauna-720p_lgturi.mov"
          // src="https://res.cloudinary.com/dw4ev5whz/video/upload/f_auto,q_auto,w_1280/torontosaunaco/stoves/ttsc-hero-sauna-720p_lgturi.mov"
          // src="https://res.cloudinary.com/dw4ev5whz/video/upload/f_auto,q_auto:eco,w_960/torontosaunaco/stoves/ttsc-hero-sauna-720p_lgturi.mov"
        />
      </video>

      {/* Dark Overlay */}
      <div className="absolute inset-0 z-10 bg-black/60" />

      {/* Centered Content */}
      <div className="relative z-20 text-center px-4 max-w-5xl mx-auto">
        <h1 className="text-white text-5xl md:text-6xl lg:text-7xl font-thin mb-6 tracking-wide">
          Welcome To Wellness
        </h1>
        <p className="text-white text-xl md:text-2xl lg:text-3xl font-light mb-8 tracking-wide font-atkinson">
          Relax Recharge Rejuvenate
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

export default Hero;
