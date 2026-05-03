"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import posthog from "posthog-js";
import { posthogEvents } from "@/assets/utils/posthogEvents";
import { buildPosthogContext } from "@/assets/utils/posthogContext";
import Spinner from "@/components/Spinner";
import ProductHero from "./ProductHero";
import ProductGallery from "./ProductGallery";
import ProductConfigurator from "./ProductConfigurator";
import PriceSummary from "./PriceSummary";
import ProductContactForm from "./ProductContactForm";
import ProductDocuments from "./ProductDocuments";
import Product from "../Product";
import Link from "next/link";

/**
 * SaunaProductClient - Main client component orchestrating product page
 * @param {Object} props
 * @param {Object} props.product - Product data from server
 * @param {string} props.productId - Product ID
 */
const SaunaProductClient = ({ product, productId }) => {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  // Selection states
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedWoodType, setSelectedWoodType] = useState(null);
  const [selectedStove, setSelectedStove] = useState(null);
  const [selectedUpgrades, setSelectedUpgrades] = useState([]);
  const [selectedInstallation, setSelectedInstallation] = useState(null);

  // Determine product type flags
  const isBarrel =
    product?.type?.toLowerCase().includes("barrel") ||
    product?.collectionType?.toLowerCase().includes("barrel") ||
    product?.series?.toLowerCase().includes("barrel") ||
    product?.name?.toLowerCase().includes("barrel");

  const isIndoorDundalk =
    product?.type?.toLowerCase().includes("dundalk") ||
    product?.collectionType?.toLowerCase().includes("dundalk") ||
    product?.series?.toLowerCase().includes("ls460") ||
    product?.name?.toLowerCase().includes("dundalk");

  const isLuna =
    product?.type?.toLowerCase().includes("luna") ||
    product?.collectionType?.toLowerCase().includes("luna") ||
    product?.series?.toLowerCase().includes("luna") ||
    product?.name?.toLowerCase().includes("luna");

  const isSingleWoodModel = isBarrel || isIndoorDundalk || isLuna;

  // Mount effect
  useEffect(() => {
    setMounted(true);
  }, []);

  // Track product viewed
  useEffect(() => {
    if (!product || !mounted) return;
    try {
      posthog.capture(posthogEvents.product_viewed, {
        ...buildPosthogContext(pathname),
        productId: product._id || productId,
        type: product.type,
        name: product.name,
      });
    } catch {}
  }, [product, productId, mounted, pathname]);

  // Default wood selection for single-wood models
  useEffect(() => {
    if (product && isSingleWoodModel && !selectedWoodType) {
      setSelectedWoodType("Knotty Cedar");
    }
  }, [product, isSingleWoodModel, selectedWoodType]);

  // Track installation/delivery changes
  useEffect(() => {
    if (!product || !selectedInstallation) return;
    try {
      posthog.capture(posthogEvents.installation_selected, {
        ...buildPosthogContext(pathname),
        productId: product._id || productId,
        installation: selectedInstallation,
      });
      posthog.capture(posthogEvents.delivery_applied, {
        ...buildPosthogContext(pathname),
        productId: product._id || productId,
        applied: selectedInstallation === "DIY",
        cost: selectedInstallation === "DIY" ? product?.delivery?.cost || 0 : 0,
      });
    } catch {}
  }, [selectedInstallation, product, productId, pathname]);

  // Price calculation functions
  const computeBasePrice = () => {
    if (
      product?.sizes &&
      Array.isArray(product.sizes) &&
      product.sizes.length > 0
    ) {
      if (selectedSize && selectedWoodType) {
        const sizeObj = product.sizes.find((s) => s.key === selectedSize);
        const sizePrice = sizeObj?.priceByWood?.[selectedWoodType];
        if (typeof sizePrice === "number") {
          return sizePrice;
        }
      }
    }
    return product?.baseCost || product?.price || 0;
  };

  const computeStartingFromPrice = () => {
    if (
      product?.sizes &&
      Array.isArray(product.sizes) &&
      product.sizes.length > 0
    ) {
      let minPrice = Infinity;
      for (const size of product.sizes) {
        if (size?.priceByWood && typeof size.priceByWood === "object") {
          if (isSingleWoodModel) {
            const knotty = size.priceByWood["Knotty Cedar"];
            if (
              typeof knotty === "number" &&
              isFinite(knotty) &&
              knotty < minPrice
            ) {
              minPrice = knotty;
            }
          } else {
            for (const value of Object.values(size.priceByWood)) {
              if (
                typeof value === "number" &&
                isFinite(value) &&
                value < minPrice
              ) {
                minPrice = value;
              }
            }
          }
        }
      }
      if (minPrice !== Infinity) return minPrice;
    }
    let base = product?.baseCost || product?.price || 0;
    if (product?.wood_type && typeof product.wood_type === "object") {
      const deltas = Object.values(product.wood_type)
        .map((o) => (o && typeof o.price === "number" ? o.price : 0))
        .filter((n) => typeof n === "number" && isFinite(n));
      if (deltas.length > 0) {
        const minDelta = Math.min(...deltas);
        if (minDelta > 0) base += minDelta;
      }
    }
    return base;
  };

  const calculateTotal = () => {
    let total = computeBasePrice();
    if (selectedWoodType && product?.wood_type) {
      const woodOption = product.wood_type[selectedWoodType];
      const hasSizes =
        product?.sizes &&
        Array.isArray(product.sizes) &&
        product.sizes.length > 0;
      if (!hasSizes && woodOption?.price) {
        total += woodOption.price;
      }
    }
    if (selectedStove && product?.stove_type) {
      const stoveOption = product.stove_type[selectedStove];
      if (stoveOption?.price) total += stoveOption.price;
    }
    if (selectedUpgrades.length > 0 && product?.additional_upgrades) {
      selectedUpgrades.forEach((upgradeName) => {
        const upgrade = product.additional_upgrades.find(
          (u) => u.name === upgradeName
        );
        if (upgrade?.price) total += upgrade.price;
      });
    }
    if (selectedInstallation && product?.installation) {
      const installOption = product.installation[selectedInstallation];
      if (installOption?.price) total += installOption.price;
    }
    if (selectedInstallation === "DIY") {
      total += product?.delivery?.cost || 0;
    }
    return total;
  };

  // Handle selection changes from Configurator
  const handleSelectionChange = (type, value) => {
    switch (type) {
      case "size":
        setSelectedSize(value);
        break;
      case "wood":
        setSelectedWoodType(value);
        break;
      case "stove":
        setSelectedStove(value);
        break;
      case "upgrades":
        setSelectedUpgrades(value);
        break;
      case "installation":
        setSelectedInstallation(value);
        break;
    }
  };

  // Computed values
  const totalPrice = product ? calculateTotal() : 0;
  const basePrice = computeBasePrice();
  const startingFromPrice = computeStartingFromPrice();
  const deliveryFee =
    selectedInstallation === "DIY" ? product?.delivery?.cost || 0 : 0;

    // console.log(deliveryFee)
    // console.log(product)
    // console.log(product?.delivery?.cost)
    // console.log(product?.delivery?.included)
    // console.log(product?.delivery?.description)
    // console.log(product?.delivery?.cost)
    // console.log(product?.delivery?.included)
    // console.log(product?.delivery?.description)
    // console.log(product?.delivery?.cost)
    // console.log(product?.delivery?.included)
    // console.log(product?.delivery?.description)

  // Description segments
  const introText = product?.description?.slice(0, 109) || "";
  const bodyText = product?.description?.slice(110) || "";

  // Track price recalculation
  useEffect(() => {
    if (!product) return;
    try {
      posthog.capture(posthogEvents.price_recalculated, {
        ...buildPosthogContext(pathname),
        productId: product._id || productId,
        totalPrice,
        basePrice,
        numAddons: selectedUpgrades.length,
        installation: selectedInstallation || "unset",
      });
    } catch {}
  }, [
    totalPrice,
    product,
    productId,
    basePrice,
    selectedUpgrades.length,
    selectedInstallation,
    pathname,
  ]);

  if (!product) {
    return <p className="text-center py-20">Product not found</p>;
  }

  if (!mounted) {
    return <Spinner loading={true} />;
  }

  const selections = {
    selectedSize,
    selectedWoodType,
    selectedStove,
    selectedUpgrades,
    selectedInstallation,
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <ProductHero product={product} introText={introText} />

      {/* Main Content Section */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Gallery and Description */}
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 mb-12">
            <div className="min-w-0">
              <ProductGallery product={product} />
            </div>

            {/* Product Price, Title and Description */}
            <div className="mt-12 mb-12">
              <h2 className="text-2xl md:text-3xl font-light text-[#4E7302] mb-6 font-archivo">
                {product.name} {product.type === "Barrel" ? "Starting from $" : "$"}
                {startingFromPrice.toLocaleString()}
              </h2>
              <div className="prose max-w-none text-gray-700 leading-relaxed font-archivo">
                {bodyText && (
                  <p className="text-base md:text-lg leading-relaxed whitespace-pre-line break-words">
                    {bodyText}
                  </p>
                )}
                <Link href="/shipping">
                  <p className="text-xs italic hover:text-blue-700 underline-none">Shipping Details</p>
                </Link>
              </div>
            </div>
          </div>

          {/* Configurator and Price Summary */}
          <ProductConfigurator
            product={product}
            productId={product._id || productId}
            isSingleWoodModel={isSingleWoodModel}
            isBarrel={isBarrel}
            selections={selections}
            onSelectionChange={handleSelectionChange}
          />

          <div className="mt-8">
            <PriceSummary
              product={product}
              selections={selections}
              totalPrice={totalPrice}
              deliveryFee={deliveryFee}
            />
          </div>

          {/* Contact Form */}
          <div className="mt-12">
            <ProductContactForm
              product={product}
              totalPrice={totalPrice}
              selectedInstallation={selectedInstallation}
            />
          </div>

          {/* Documents */}
          <ProductDocuments product={product} />
        </div>
      </section>
    </div>
  );
};

export default SaunaProductClient;
