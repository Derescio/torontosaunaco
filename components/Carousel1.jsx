"use client";

import CarouselDynamic from "./CarouselID";

export default function Carousel1({ items = [] }) {
  return (
    <>
      <CarouselDynamic images={items} />
    </>
  );
}
