"use client";
import Image from "next/image";
import Link from "next/link";

/**
 * ProductHero - Hero section with background image and breadcrumbs
 * @param {Object} props
 * @param {Object} props.product - Product data
 * @param {string} props.introText - First ~109 characters of description
 */
const ProductHero = ({ product, introText }) => {
  if (!product) return null;

  return (
    <section className="drop-shadow-xl md:drop-shadow-2xl shadow-[#4E7302]/80 relative h-[400px] md:h-[500px] lg:h-[600px] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        {product.images && product.images.length > 1 && (
          <Image
            src={product.images[1]}
            alt={product.name}
            fill
            className="object-cover"
            priority
          />
        )}
      </div>

      {/* Dark Overlay */}
      <div className="absolute inset-0 z-10 bg-black/50"></div>

      {/* Breadcrumbs */}
      <div className="absolute top-6 left-4 md:left-8 z-20">
        <nav className="flex items-center gap-2 text-white text-sm">
          <Link
            href="/saunas"
            className="hover:text-[#FFA726] transition-colors"
          >
            All Saunas
          </Link>
          <span>/</span>
          <span>{product.name}</span>
        </nav>
      </div>

      {/* Centered Content */}
      <div className="relative z-20 text-center px-4 max-w-5xl mx-auto">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-white mb-4 font-archivo tracking-wide">
          {product.name}
        </h1>
        <p className="text-xl md:text-2xl text-gray-200 font-light font-archivo">
          {introText}
        </p>
      </div>
    </section>
  );
};

export default ProductHero;
