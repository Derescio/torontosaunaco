"use client";
import { useState } from "react";
import Image from "next/image";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

/**
 * ProductGallery - Image gallery with main image and horizontal thumbnail carousel
 * @param {Object} props
 * @param {Object} props.product - Product data with images array
 */
const ProductGallery = ({ product }) => {
  const [selectedImage, setSelectedImage] = useState(0);

  // Navigate to previous image
  const handlePrevious = () => {
    setSelectedImage((prev) =>
      prev === 0 ? product.images.length - 1 : prev - 1
    );
  };

  // Navigate to next image
  const handleNext = () => {
    setSelectedImage((prev) =>
      prev === product.images.length - 1 ? 0 : prev + 1
    );
  };

  if (!product?.images || product.images.length === 0) {
    return (
      <div className="aspect-square bg-gray-100 rounded-xl flex items-center justify-center">
        <p className="text-gray-400 font-archivo">No images available</p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {/* Main Image with Navigation Arrows */}
      <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-100">
        <Image
          src={product.images[selectedImage]}
          alt={product.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />

        {/* Navigation Arrows on Main Image */}
        {product.images.length > 1 && (
          <>
           <div className="absolute inset-0 flex items-center justify-between px-3">
  <button
    onClick={handlePrevious}
    className="rounded-full bg-black/50 p-2 text-white backdrop-blur-sm hover:bg-black/70"
  >
    <FaChevronLeft className="h-5 w-5" />
  </button>

  <button
    onClick={handleNext}
    className="rounded-full bg-black/50 p-2 text-white backdrop-blur-sm hover:bg-black/70"
  >
    <FaChevronRight className="h-5 w-5" />
  </button>
</div>
          </>
        )}

        {/* Image Counter */}
        {product.images.length > 1 && (
          <div className="absolute bottom-3 right-3 rounded-full bg-black/50 px-3 py-1 text-sm text-white backdrop-blur-sm">
            {selectedImage + 1} / {product.images.length}
          </div>
        )}
      </div>

      {/* Thumbnail Grid */}
      {product.images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "thin" }}>
          {product.images.map((image, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setSelectedImage(index)}
              className={`ml-1 relative shrink-0 w-16 h-16 overflow-hidden rounded-sm transition-all ${
                selectedImage === index
                  ? "ring-1 ring-[#4E7302]"
                  : "opacity-70 hover:opacity-100"
              }`}
            >
              <Image
                src={image}
                alt={`${product.name} thumbnail ${index + 1}`}
                fill
                className="object-cover"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductGallery;
