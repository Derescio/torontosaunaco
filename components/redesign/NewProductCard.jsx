import Image from "next/image";
import Link from "next/link";

const NewProductCard = ({ product }) => {
  // Determine the link based on product type
  const saunaLink = `/saunas/${product._id}`;
  const coldPlungeLink = `/cold-plunge/${product._id}`;
  const link = product.type === "Cold Plunge" ? coldPlungeLink : saunaLink;

  // Get price - use baseCost if available, otherwise use price
  const basePrice = product.baseCost || product.price || 0;
  const normalize = (s) =>
    typeof s === "string" ? s.toLowerCase().replace(/\s+/g, "") : "";
  // const isStudio6Sale =
  //   normalize(product?.series).includes("studio6") ||
  //   normalize(product?.name).includes("studio6") ||
  //   normalize(product?.type).includes("studio6");
  // const discountedPrice = Math.round(basePrice * 0.9);

  // Get description - use the description field
  const description = product.description || "";

  // Get first image
  const imageUrl =
    product.images && product.images.length > 0
      ? product.images[0]
      : "/images/placeholder.jpg";

  // console.log(product);
  return (
    <>
      <Link href={link}>
        <div className="border border-gray-200 group relative rounded-xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300  cursor-pointer">
          {/* Sale Banner */}
          {/* {isStudio6Sale && (
            <div className="absolute top-2 right-2 z-10 bg-black/80 text-white text-[10px] md:text-xs px-2 py-1 rounded-md tracking-wide">
              10% OFF Black Friday
            </div>
          )} */}
          {/* Image Section */}
          <div className="relative aspect-square overflow-hidden">
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          </div>

          {/* Content Section with Dark Green Background */}
          <div className="bg-[#BF9774]/30 p-6 text-black text-archivo font-light">
            {/* Product Name */}
            <h3 className="text-xl font-light text-black mb-2 font-archivo">
              {product.name}
            </h3>

            {/* Description */}
            <p className="text-black text-sm mb-4 leading-relaxed font-archivo font-normal flex-1">
              {product.description?.substring(0, 110)}...
            </p>

            {/* Price and CTA Section */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mt-auto pt-4 border-t border-white/20">
              {/* {isStudio6Sale ? (
                <span className="text-black font-archivo">
                  Starting at{" "}
                  <span className="line-through text-gray-700 mr-2">
                    ${basePrice.toLocaleString()}
                  </span>
                  <span className="font-semibold">
                    ${discountedPrice.toLocaleString()}
                  </span>
                </span>
              ) : (
               
              )} */}
              <span className="text-black font-semibold font-archivo">
                Starting at ${basePrice.toLocaleString()}
              </span>
              <div className="text-black bg-[#BF9774]/50 text-sm rounded-lg md:px-4 px-2 mt-1 md:mt-0 md:w-auto py-2 font-archivo font-medium hover:bg-white transition-colors">
                View Details
              </div>
            </div>
          </div>
        </div>
      </Link>
    </>
  );
};

export default NewProductCard;
