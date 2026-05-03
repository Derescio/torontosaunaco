"use client";
import { useDispatch } from "react-redux";
import { usePathname } from "next/navigation";
import { addToCart } from "@/redux/slices/cartSlice";
import { ShoppingCart } from "lucide-react";
import toast from "react-hot-toast";
import posthog from "posthog-js";
import { posthogEvents } from "@/assets/utils/posthogEvents";
import { buildPosthogContext } from "@/assets/utils/posthogContext";

/**
 * PriceSummary - Selection summary and total price with Add to Cart
 * @param {Object} props
 * @param {Object} props.product - Product data
 * @param {Object} props.selections - Current selections
 * @param {number} props.totalPrice - Calculated total price
 * @param {number} props.deliveryFee - Delivery fee (if DIY)
 */
const PriceSummary = ({ product, selections, totalPrice, deliveryFee }) => {
  const dispatch = useDispatch();
  const pathname = usePathname();
  const {
    selectedSize,
    selectedWoodType,
    selectedStove,
    selectedUpgrades,
    selectedInstallation,
  } = selections;

  const hasSelections =
    selectedWoodType ||
    selectedStove ||
    selectedUpgrades.length > 0 ||
    selectedInstallation;

  /**
   * Build configuration object for cart item
   */
  const buildConfiguration = () => {
    const config = {
      upgrades: [],
    };

    // Size
    if (selectedSize && product?.sizes) {
      const sizeObj = product.sizes.find((s) => s.key === selectedSize);
      if (sizeObj) {
        const price =
          selectedWoodType && sizeObj.priceByWood
            ? sizeObj.priceByWood[selectedWoodType] || 0
            : 0;
        config.size = {
          key: selectedSize,
          label: sizeObj.label || selectedSize,
          price,
        };
      }
    }

    // Wood Type
    if (selectedWoodType && product?.wood_type) {
      const woodOption = product.wood_type[selectedWoodType];
      config.woodType = {
        name: selectedWoodType,
        price: woodOption?.price || 0,
      };
    }

    // Stove
    if (selectedStove && product?.stove_type) {
      const stoveOption = product.stove_type[selectedStove];
      config.stove = {
        name: selectedStove,
        price: stoveOption?.price || 0,
        wifi: stoveOption?.wifi || false,
      };
    }

    // Installation
    if (selectedInstallation && product?.installation) {
      const installOption = product.installation[selectedInstallation];
      config.installation = {
        name: selectedInstallation,
        price: installOption?.price || 0,
      };
    }

    // Delivery
    config.delivery = {
      cost: selectedInstallation === "DIY" ? product?.delivery?.cost || 0 : 0,
      included: selectedInstallation === "Professional Install",
    };

    // Upgrades
    if (selectedUpgrades.length > 0 && product?.additional_upgrades) {
      config.upgrades = selectedUpgrades.map((upgradeName) => {
        const upgrade = product.additional_upgrades.find(
          (u) => u.name === upgradeName
        );
        return {
          name: upgradeName,
          price: upgrade?.price || 0,
        };
      });
    }

    return config;
  };

  /**
   * Generate unique cart item ID based on product + configuration
   */
  const generateCartItemId = () => {
    const configStr = JSON.stringify({
      productId: product._id,
      size: selectedSize,
      wood: selectedWoodType,
      stove: selectedStove,
      upgrades: [...selectedUpgrades].sort(),
      installation: selectedInstallation,
    });
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < configStr.length; i++) {
      const char = configStr.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return `${product._id}-${Math.abs(hash).toString(36)}`;
  };

  const handleAddToCart = () => {
    if (!product) return;

    const configuration = buildConfiguration();
    const cartItem = {
      id: generateCartItemId(),
      productId: product._id,
      name: product.name,
      image: product.images?.[0] || "",
      price: totalPrice,
      qty: 1,
      configuration,
      // Legacy fields for backward compatibility
      selectedOptions: {
        size: selectedSize
          ? { type: selectedSize, price: configuration.size?.price || 0 }
          : null,
        wood: selectedWoodType
          ? {
              type: selectedWoodType,
              price: configuration.woodType?.price || 0,
            }
          : null,
        stove: selectedStove
          ? { type: selectedStove, price: configuration.stove?.price || 0 }
          : null,
        installation: selectedInstallation
          ? {
              type: selectedInstallation,
              price: configuration.installation?.price || 0,
            }
          : null,
      },
    };

    dispatch(addToCart(cartItem));
    toast.success(`${product.name} added to cart!`, { duration: 2500 });

    // Track add to cart
    try {
      posthog.capture(posthogEvents.config_option_selected, {
        ...buildPosthogContext(pathname),
        productId: product._id,
        optionType: "add_to_cart",
        totalPrice,
        configuration,
      });
    } catch {}
  };

  return (
    <div className="space-y-6">
      {/* Selection Summary */}
      {hasSelections && (
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <div className="flex items-center gap-4 mb-4">
            <div className="text-[#4E7302] font-bold text-lg font-archivo">
              THE TORONTO SAUNA CO.
            </div>
          </div>
          <div className="space-y-2 text-sm font-archivo">
            {selectedStove && (
              <p>
                You Have Chosen:{" "}
                <span className="font-semibold">{selectedStove}</span>
                {product?.stove_type?.[selectedStove]?.wifi &&
                  " with Wifi Controller"}
              </p>
            )}
            {selectedWoodType && (
              <p>
                Wood Type:{" "}
                <span className="font-semibold">{selectedWoodType}</span>
              </p>
            )}
            {selectedUpgrades.length > 0 && (
              <p>
                Upgrades:{" "}
                <span className="font-semibold">
                  {selectedUpgrades.join(", ")}
                </span>
              </p>
            )}
            {selectedInstallation && (
              <p>
                Installation:{" "}
                <span className="font-semibold">{selectedInstallation}</span>
              </p>
            )}
            {selectedInstallation && (
              <p>
                Delivery:{" "}
                <span className="font-semibold">
                  {selectedInstallation === "DIY"
                    ? `$${deliveryFee.toLocaleString()}`
                    : "Included"}
                </span>
              </p>
            )}
            {selectedSize && (
              <p>
                Size: <span className="font-semibold">{selectedSize}</span>
              </p>
            )}
            <p className="mt-4 font-semibold text-lg">See the total below</p>
          </div>
        </div>
      )}

      {/* Total Price */}
      <div className="bg-[#4E7302]/80 backdrop-blur-sm text-white p-6 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-xl font-light font-archivo">
            {selectedInstallation === "DIY"
              ? `Total (+ $${deliveryFee.toLocaleString()} delivery)`
              : selectedInstallation === "Professional Install"
                ? "Total (delivery included)"
                : "Total"}
          </span>
          <span className="text-2xl font-medium font-archivo">
            ${totalPrice.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Add to Cart Button */}
      <button
        onClick={handleAddToCart}
        className="w-full bg-[#4E7302] hover:bg-[#3d5a02] text-white font-semibold py-4 px-6 rounded-lg transition-colors font-archivo flex items-center justify-center gap-3"
      >
        <ShoppingCart className="w-5 h-5" />
        Add to Cart
      </button>
    </div>
  );
};

export default PriceSummary;
