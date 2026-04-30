"use client";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import Image from "next/image";
import { useState } from "react";

const FALLBACK_IMAGE = "/images/barrel/Barrel-Sauna_1.png";

export default function PureCubeSlider({ cubes = [] }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    afterChange: (index) => setCurrentSlide(index),
  };

  if (!cubes.length) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-4">
      <div className="slider-container">
        <Slider {...settings}>
          {cubes.map((x, index) => (
            <div key={index}>
              <div className="image-wrapper relative aspect-video min-h-[240px]">
                <Image
                  src={x.images?.[0] || FALLBACK_IMAGE}
                  alt={x.name || "Product Image"}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </div>
          ))}
        </Slider>
      </div>
      <div className="flex flex-col items-center justify-center">
        <div className="product-info sm:mt-4 md:mt-6 lg:mt-8">
          <h2 className="text-2xl font-bold mb-4">{cubes[currentSlide]?.name}</h2>
          <p className="text-gray-600">{cubes[currentSlide]?.description}</p>
        </div>
      </div>
    </div>
  );
}
