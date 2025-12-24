"use client";
import { useState } from "react";
import Image from "next/image";

/**
 * ProductGallery - Image gallery with main image and thumbnails
 * @param {Object} props
 * @param {Object} props.product - Product data with images array
 */
const ProductGallery = ({ product }) => {
  const [selectedImage, setSelectedImage] = useState(0);

  if (!product?.images || product.images.length === 0) {
    return (
      <div className="aspect-square bg-gray-100 rounded-xl flex items-center justify-center">
        <p className="text-gray-400 font-archivo">No images available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-100">
        <Image
          src={product.images[selectedImage]}
          alt={product.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
      </div>

      {/* Thumbnail Images */}
      {product.images.length > 1 && (
        <div className="grid grid-cols-3 md:gap-1">
          {product.images.slice(0, 3).map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(index)}
              className={`relative aspect-square overflow-hidden rounded-lg border-2 transition-all ${
                selectedImage === index
                  ? "border-[#4E7302]"
                  : "border-transparent"
              }`}
            >
              <Image
                src={image}
                alt={`${product.name} view ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 33vw, 150px"
                priority
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductGallery;
