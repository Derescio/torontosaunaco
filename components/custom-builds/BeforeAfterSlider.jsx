"use client";

import dynamic from "next/dynamic";
import "./BeforeAfterSlider.css";

const ReactCompareImage = dynamic(() => import("react-compare-image"), {
  ssr: false,
  loading: () => (
    <div
      className="aspect-[3/4] w-full animate-pulse bg-[#1C1813]"
      aria-hidden
    />
  ),
});

const sliderHandle = (
  <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#D9A97D] bg-[#17140F] shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
    <span className="select-none font-playfair text-sm tracking-widest text-[#D9A97D]">
      ‹ ›
    </span>
  </div>
);

const BeforeAfterSlider = ({
  beforeSrc,
  afterSrc,
  beforeAlt,
  afterAlt,
}) => {
  return (
    <div className="before-after-slider">
      <ReactCompareImage
        leftImage={beforeSrc}
        rightImage={afterSrc}
        leftImageAlt={beforeAlt}
        rightImageAlt={afterAlt}
        leftImageLabel="Before"
        rightImageLabel="After"
        handle={sliderHandle}
        handleSize={44}
        sliderLineColor="#D9A97D"
        sliderLineWidth={2}
        sliderPositionPercentage={0.5}
        aspectRatio="taller"
        hover
      />
    </div>
  );
};

export default BeforeAfterSlider;
