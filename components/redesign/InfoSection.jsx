import React from "react";
import Image from "next/image";

const InfoSection = () => {
  return (
    <section className="bg-[#ecebea]/20 py-16 md:py-24">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Top Section */}
        <div className="grid md:grid-cols-2 gap-12 mb-16">
          {/* Left Side */}
          <div className="pr-4 md:pr-8">
            {/* <p className="text-sm uppercase tracking-wider text-gray-500 mb-4">
              Wellness
            </p> */}
            <h2 className="text-xl md:text-2xl text-[#4E7302] leading-tight mb-8 font-atkinson font-semibold">
              Transform Your Home into a Haven of Tranquility: Modern Saunas for
              Ultimate Relaxation. Modern Cedar Saunas in Toronto – Relaxation &
              Wellness at Home
            </h2>
          </div>

          {/* Right Side */}
          <div className="flex flex-col justify-center pl-4 md:pl-8">
            {/* <p className="text-lg text-gray-700 leading-relaxed mb-8">
              Pacific Tide Saunas blend Scandinavian design with modern wellness
              technology. Each sauna is handcrafted to deliver precise heat
              therapy and transformative relaxation.
            </p> */}

            {/* Feature Boxes */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Pure Wellness Feature */}
              <div className="border border-gray-200 rounded-lg p-6 hover:scale-[1.02] hover:shadow-lg transition-all duration-300 cursor-default">
                <div className="w-12 h-12 mb-4 flex items-center justify-center border border-gray-300 rounded bg-amber-50/50">
                  <svg
                    className="w-6 h-6 text-amber-800/70"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                </div>
                <h3 className="font-bold text-[#4E7302] mb-2">Pure wellness</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Forged from raw cedar and precision engineering, our saunas
                  breathe life into ancient healing traditions.
                </p>
              </div>

              {/* Crafted Design Feature */}
              <div className="border border-gray-200 rounded-lg p-6 hover:scale-[1.02] hover:shadow-lg transition-all duration-300 cursor-default">
                <div className="w-12 h-12 mb-4 flex items-center justify-center border border-gray-300 rounded bg-amber-50/50">
                  <svg
                    className="w-6 h-6 text-amber-800/70"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                </div>
                <h3 className="font-bold text-[#4E7302] mb-2">
                  Crafted design
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  We build more than saunas. We create sanctuaries of heat,
                  healing, and human potential.
                </p>
              </div>
            </div>

            {/* Action Links */}
            {/* <div className="flex items-center gap-6">
              <Link
                href="/saunas"
                className="px-6 py-3 border-2 border-gray-900 rounded-lg text-gray-900 font-medium hover:bg-gray-900 hover:text-white transition-colors"
              >
                Learn more
              </Link>
              <Link
                href="/about"
                className="text-gray-900 font-medium hover:text-[#FFA726] transition-colors flex items-center gap-2"
              >
                Our story <span>&gt;</span>
              </Link>
            </div> */}
          </div>
        </div>

        {/* Bottom Image Section */}
        <div className="rounded-xl overflow-hidden bg-gray-100 h-[400px] md:h-[500px] lg:h-[600px] relative">
          <Image
            src="/images/PureCubeHudsonClear_ Web-12.jpg"
            alt="Modern sauna wellness"
            fill
            className="object-cover"
            sizes="100vw"
          />
        </div>
      </div>
    </section>
  );
};

export default InfoSection;
