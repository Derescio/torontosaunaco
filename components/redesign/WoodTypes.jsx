import React from "react";
import Image from "next/image";

const WoodTypes = () => {
  const cards = [
    {
      id: 1,
      title: "Wood Type",
      description:
        "Discover the finest wood types used in our saunas, known for their durability, beauty, and excellent heat retention.",
      image: "/images/woodtypes.png",
    },
    {
      id: 2,
      title: "Ethically Sourced",
      description:
        "We ensure all our wood is ethically sourced, supporting sustainable forestry practices and eco-friendly management.",
      image: "/images/Ethicall_Sourced.png",
    },
    {
      id: 3,
      title: "Health Benefits",
      description:
        "Experience the numerous health benefits of our saunas, from improved circulation to detoxification and stress relief.",
      image: "/images/Healt_Benefits.png",
    },
  ];

  return (
    <section className="rounded-2xl overflow-hidden my-16 md:my-24 max-w-7xl mx-auto">
      {/* Top Section - Header with Forest Background */}
      <div className="relative h-[300px] md:h-[400px] lg:h-[450px] xl:h-[500px] flex items-center justify-center">
        <Image
          src="/images/john-lee-oMneOBYhJxY-unsplash(1).jpg"
          alt="Forest background"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/50"></div>

        {/* Content */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 font-archivo">
            Our Commitment to the Environment
          </h2>
          <p className="text-lg md:text-xl text-gray-200 font-light font-archivo">
            We are proudly canadian and we are committed to using only the best
            materials and craftsmanship to create the best saunas for our
            customers.
          </p>
        </div>
      </div>

      {/* Bottom Section - Three Cards */}
      <div className="grid md:grid-cols-3 gap-1 mt-1">
        {cards.map((card, index) => (
          <div
            key={card.id}
            className="bg-[#4E7302] text-white overflow-hidden flex flex-col  font-archivo  font-light rounded-lg"
          >
            {/* Image with rounded top corners - using aspect ratio for better scaling */}
            <div className="relative aspect-[4/3] overflow-hidden rounded-b-lg">
              <Image
                src={card.image}
                alt={card.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>

            {/* Content */}
            <div className="p-6 flex-1 flex flex-col gap-2">
              <h3 className="text-xl md:text-2xl text-white mb-3 text-center font-archivo font-light">
                {card.title}
              </h3>
              <p className="text-gray-100 text-md leading-relaxed text-left font-archivo flex-1">
                {card.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default WoodTypes;
