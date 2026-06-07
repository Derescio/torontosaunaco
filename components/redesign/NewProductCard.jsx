import Image from "next/image";
import Link from "next/link";
import {
  getProductListPrice,
  UNPRICED_LABEL,
  UNPRICED_LINK,
} from "@/assets/utils/productPrice";

const NewProductCard = ({ product }) => {
  // Determine the link based on product type
  const saunaLink = `/saunas/${product._id}`;
  const coldPlungeLink = `/cold-plunge/${product._id}`;
  const link = product.type === "Cold Plunge" ? coldPlungeLink : saunaLink;

  const listPrice = getProductListPrice(product);

  const description = product.description || "";

  // Get first image
  const imageUrl =
    product.images && product.images.length > 0
      ? product.images[0]
      : "/images/placeholder.jpg";

  // console.log(product);
  return (
    <div className="border border-gray-200 group relative rounded-xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 h-full flex flex-col">
      <Link href={link} className="block cursor-pointer">
        <div className="relative aspect-square overflow-hidden">
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>
      </Link>

      <div className="bg-[#BF9774]/30 flex flex-col flex-1 p-6">
        <Link href={link} className="block flex-1 flex flex-col cursor-pointer">
          <h3 className="text-xl font-light text-black mb-2 font-archivo">
            {product.name}
          </h3>
          <p className="text-black text-sm leading-relaxed font-archivo font-normal line-clamp-3 min-h-[4.5rem] flex-1">
            {description.length > 110
              ? `${description.substring(0, 110)}...`
              : description || "\u00A0"}
          </p>
        </Link>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between pt-4 mt-4 border-t border-white/20">
          <span className="text-black font-semibold font-archivo">
            {listPrice === null ? (
              <Link
                href={UNPRICED_LINK}
                className="underline hover:text-[#4E7302] transition-colors"
              >
                {UNPRICED_LABEL}
              </Link>
            ) : (
              <>
                <span className="text-black font-light font-archivo">
                  {product.type === "Barrel"
                    ? "Starting from $"
                    : "Base Price: "}
                </span>
                ${listPrice.toLocaleString()}
              </>
            )}
          </span>
          <Link
            href={link}
            className="text-black bg-[#BF9774]/50 text-sm rounded-lg md:px-4 px-2 mt-1 md:mt-0 md:w-auto py-2 font-archivo font-medium hover:bg-white transition-colors"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NewProductCard;
