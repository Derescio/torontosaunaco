"use client";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Check } from "lucide-react";
import posthog from "posthog-js";
import { posthogEvents } from "@/assets/utils/posthogEvents";
import { buildPosthogContext } from "@/assets/utils/posthogContext";

/**
 * ProductConfigurator - Tabs for configuring sauna options
 * @param {Object} props
 * @param {Object} props.product - Product data
 * @param {string} props.productId - Product ID for tracking
 * @param {boolean} props.isSingleWoodModel - Whether product is barrel/luna type
 * @param {boolean} props.isBarrel - Whether product is barrel type
 * @param {Object} props.selections - Current selections state
 * @param {Function} props.onSelectionChange - Callback when selection changes
 */
const ProductConfigurator = ({
  product,
  productId,
  isSingleWoodModel,
  isBarrel,
  selections,
  onSelectionChange,
}) => {
  const pathname = usePathname();
  const {
    selectedSize,
    selectedWoodType,
    selectedStove,
    selectedUpgrades,
    selectedInstallation,
  } = selections;

  const handleSizeSelect = (sizeKey, sizeLabel) => {
    onSelectionChange("size", sizeKey);
    try {
      posthog.capture(posthogEvents.size_selected, {
        ...buildPosthogContext(pathname),
        productId,
        sizeKey,
        sizeLabel,
      });
    } catch {}
  };

  const handleWoodSelect = (name, priceDelta) => {
    onSelectionChange("wood", name);
    try {
      posthog.capture(posthogEvents.config_option_selected, {
        ...buildPosthogContext(pathname),
        productId,
        optionType: "wood",
        optionName: name,
        priceDelta,
      });
    } catch {}
  };

  const handleStoveSelect = (name, priceDelta) => {
    onSelectionChange("stove", name);
    try {
      posthog.capture(posthogEvents.config_option_selected, {
        ...buildPosthogContext(pathname),
        productId,
        optionType: "stove",
        optionName: name,
        priceDelta,
      });
    } catch {}
  };

  const handleUpgradeToggle = (upgradeName) => {
    const isApplied = !selectedUpgrades.includes(upgradeName);
    const newUpgrades = isApplied
      ? [...selectedUpgrades, upgradeName]
      : selectedUpgrades.filter((name) => name !== upgradeName);

    onSelectionChange("upgrades", newUpgrades);
    try {
      posthog.capture(posthogEvents.config_option_selected, {
        ...buildPosthogContext(pathname),
        productId,
        optionType: "addon",
        optionName: upgradeName,
        applied: isApplied,
      });
    } catch {}
  };

  const handleInstallationSelect = (name) => {
    onSelectionChange("installation", name);
  };

  const hasSizes =
    product?.sizes && Array.isArray(product.sizes) && product.sizes.length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl md:text-4xl font-light text-[#4E7302] mb-2 font-archivo">
          Choose Available Options
        </h2>
      </div>

      <Tabs
        defaultValue={isSingleWoodModel ? "size" : "wood"}
        className="w-full"
      >
        <TabsList className="mb-24 sm:mb-0 w-full bg-gray-200 rounded-lg p-1 grid grid-cols-2 sm:grid-cols-6 gap-2">
          {!isSingleWoodModel && (
            <TabsTrigger
              value="wood"
              className="data-[state=active]:bg-[#4E7302]/80 data-[state=active]:text-white rounded-md font-archivo w-full text-center whitespace-normal break-words leading-tight"
            >
              Wood Style
            </TabsTrigger>
          )}
          {hasSizes && (
            <TabsTrigger
              value="size"
              className="data-[state=active]:bg-[#4E7302]/80 data-[state=active]:text-white rounded-md font-archivo w-full text-center whitespace-normal break-words leading-tight"
            >
              Size
            </TabsTrigger>
          )}
          <TabsTrigger
            value="heater"
            className="data-[state=active]:bg-[#4E7302]/80 data-[state=active]:text-white rounded-md font-archivo w-full text-center whitespace-normal break-words leading-tight"
          >
            Heater
          </TabsTrigger>
          <TabsTrigger
            value="addons"
            className="bg-gray-100 sm:bg-transparent data-[state=active]:bg-[#4E7302]/80 data-[state=active]:text-white rounded-md font-archivo w-full text-center whitespace-normal break-words leading-tight"
          >
            Add-ons
          </TabsTrigger>
          <TabsTrigger
            value="specs"
            className="bg-gray-100 sm:bg-transparent data-[state=active]:bg-[#4E7302]/80 data-[state=active]:text-white rounded-md font-archivo w-full text-center whitespace-normal break-words leading-tight"
          >
            Specs & Dimensions
          </TabsTrigger>
          <TabsTrigger
            value="installation"
            className="bg-gray-100 sm:bg-transparent data-[state=active]:bg-[#4E7302]/80 data-[state=active]:text-white rounded-md font-archivo w-full text-center whitespace-normal break-words leading-tight"
          >
            Installation
          </TabsTrigger>
        </TabsList>

        {/* Size Tab Content */}
        {hasSizes && (
          <TabsContent value="size" className="mt-6">
            <div className="grid grid-cols-2 gap-4">
              {product.sizes.map((size) => {
                const isSelected = selectedSize === size.key;
                const priceForWood =
                  selectedWoodType && size.priceByWood
                    ? size.priceByWood[selectedWoodType]
                    : null;
                return (
                  <button
                    key={size.key}
                    onClick={() =>
                      handleSizeSelect(size.key, size.label || size.key)
                    }
                    className={`relative p-4 border-2 rounded-lg transition-all ${
                      isSelected
                        ? "border-[#4E7302] bg-green-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-2 z-10 right-2 bg-[#4E7302] text-white rounded-full p-1">
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 w-full text-left">
                      {size.image && (
                        <div className="relative w-full h-32 sm:w-32 sm:h-24 rounded overflow-hidden sm:flex-shrink-0 mb-2 sm:mb-0">
                          <Image
                            src={size.image}
                            alt={size.label || size.key}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 50vw, 200px"
                            priority
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm mb-1 font-archivo">
                          {size.label || size.key}
                        </h3>
                        <p className="text-xs text-gray-600 font-archivo">
                          {priceForWood
                            ? `$${priceForWood.toLocaleString()}`
                            : selectedWoodType
                              ? "No price for selected wood"
                              : isSingleWoodModel
                                ? "Prices shown for Knotty Cedar"
                                : "Select wood to see price"}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            {!selectedWoodType && !isBarrel && (
              <p className="text-xs text-gray-500 mt-2 font-archivo">
                Tip: Select a wood type to view size-specific pricing.
              </p>
            )}
          </TabsContent>
        )}

        {/* Wood Style Tab */}
        {!isBarrel && (
          <TabsContent value="wood" className="mt-6">
            {product.wood_type && Object.keys(product.wood_type).length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(product.wood_type).map(([name, option]) => (
                  <button
                    key={name}
                    onClick={() => handleWoodSelect(name, option?.price || 0)}
                    className={`relative p-4 border-2 rounded-lg transition-all ${
                      selectedWoodType === name
                        ? "border-[#4E7302] bg-green-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {selectedWoodType === name && (
                      <div className="absolute top-2 z-10 right-2 bg-[#4E7302] text-white rounded-full p-1">
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 w-full text-left">
                      {option.image && (
                        <div className="relative w-full h-32 sm:w-32 sm:h-24 rounded overflow-hidden sm:flex-shrink-0 mb-2 sm:mb-0">
                          <Image
                            src={option.image}
                            alt={name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 50vw, 200px"
                            priority
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm mb-1 font-archivo">
                          {name}
                        </h3>
                        {!hasSizes &&
                          typeof option?.price === "number" &&
                          option.price > 0 && (
                            <p className="text-xs text-gray-600 font-archivo">
                              ${option.price.toLocaleString()}
                            </p>
                          )}
                        {option.power && (
                          <p className="text-xs text-gray-500 mt-1 font-archivo">
                            {option.power}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8 font-archivo">
                No wood type options available
              </p>
            )}
          </TabsContent>
        )}

        {/* Heater Tab */}
        <TabsContent value="heater" className="mt-6">
          {product.stove_type && Object.keys(product.stove_type).length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(product.stove_type).map(([name, option]) => (
                <button
                  key={name}
                  onClick={() => handleStoveSelect(name, option?.price || 0)}
                  className={`relative p-4 border-2 rounded-lg transition-all ${
                    selectedStove === name
                      ? "border-[#4E7302] bg-green-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {selectedStove === name && (
                    <div className="absolute top-2 z-10 right-2 bg-[#4E7302] text-white rounded-full p-1">
                      <Check className="w-4 h-4" />
                    </div>
                  )}
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 w-full text-left">
                    {option.image && (
                      <div className="relative w-full h-32 sm:w-32 sm:h-24 rounded overflow-hidden sm:flex-shrink-0 mb-2 sm:mb-0">
                        <Image
                          src={option.image}
                          alt={name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 50vw, 200px"
                          priority
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm mb-1 font-archivo">
                        {name}
                      </h3>
                      <p className="text-xs text-gray-600 font-archivo">
                        ${option.price?.toLocaleString() || 0}
                      </p>
                      {option.power && (
                        <p className="text-xs text-gray-500 mt-1 font-archivo">
                          {option.power}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8 font-archivo">
              No heater options available
            </p>
          )}
          <div className="mt-4 p-3 rounded-md bg-amber-50 border border-amber-200">
            <p className="text-[13px] leading-relaxed text-amber-900 font-archivo">
              Please note: Electric heaters require a certified electrician to
              hardwire the unit directly into your electrical panel.
            </p>
          </div>
        </TabsContent>

        {/* Add-ons Tab */}
        <TabsContent value="addons" className="mt-6">
          {product.additional_upgrades &&
          product.additional_upgrades.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {product.additional_upgrades.map((upgrade) => (
                <button
                  key={upgrade.name}
                  onClick={() => handleUpgradeToggle(upgrade.name)}
                  className={`relative p-4 border-2 rounded-lg transition-all ${
                    selectedUpgrades.includes(upgrade.name)
                      ? "border-[#4E7302] bg-green-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {selectedUpgrades.includes(upgrade.name) && (
                    <div className="absolute top-2 z-10 right-2 bg-[#4E7302] text-white rounded-full p-1">
                      <Check className="w-4 h-4" />
                    </div>
                  )}
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 w-full text-left">
                    {upgrade.image && (
                      <div className="relative w-full h-32 sm:w-32 sm:h-24 rounded overflow-hidden sm:flex-shrink-0 mb-2 sm:mb-0">
                        <Image
                          src={upgrade.image}
                          alt={upgrade.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 50vw, 200px"
                          priority
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm mb-1 font-archivo">
                        {upgrade.name}
                      </h3>
                      <p className="text-xs text-gray-600 font-archivo">
                        ${upgrade.price?.toLocaleString() || 0}
                      </p>
                      {upgrade.power && (
                        <p className="text-xs text-gray-500 mt-1 font-archivo">
                          {upgrade.power}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8 font-archivo">
              No additional upgrades available
            </p>
          )}
        </TabsContent>

        {/* Specs & Dimensions Tab */}
        <TabsContent value="specs" className="mt-6">
          <div className="space-y-6">
            {product.dimensions && (
              <div>
                <h3 className="font-semibold mb-3 font-archivo">Dimensions</h3>
                {product.dimensions.width ||
                product.dimensions.depth ||
                product.dimensions.height ? (
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    {typeof product.dimensions.width !== "undefined" && (
                      <p className="font-archivo">
                        <span className="font-medium">Width:</span>{" "}
                        {product.dimensions.width}{" "}
                        {product.dimensions.unit || ""}
                      </p>
                    )}
                    {typeof product.dimensions.depth !== "undefined" && (
                      <p className="font-archivo">
                        <span className="font-medium">Depth:</span>{" "}
                        {product.dimensions.depth}{" "}
                        {product.dimensions.unit || ""}
                      </p>
                    )}
                    {typeof product.dimensions.height !== "undefined" && (
                      <p className="font-archivo">
                        <span className="font-medium">Height:</span>{" "}
                        {product.dimensions.height}{" "}
                        {product.dimensions.unit || ""}
                      </p>
                    )}
                    {(product.dimensions.HeatingOption ||
                      product.dimensions["Heating Option"]) && (
                      <p className="font-archivo">
                        <span className="font-medium">Heating Options:</span>{" "}
                        {product.dimensions.HeatingOption ||
                          product.dimensions["Heating Option"]}
                      </p>
                    )}
                    {product.dimensions.type && (
                      <p className="text-sm text-gray-600 font-archivo">
                        ({product.dimensions.type})
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    {Object.entries(product.dimensions).map(([key, value]) => (
                      <p key={key} className="font-archivo">
                        <span className="font-medium">{key}:</span>{" "}
                        {typeof value === "string" || typeof value === "number"
                          ? value
                          : Array.isArray(value)
                            ? value.join(", ")
                            : JSON.stringify(value)}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}
            {product.features && product.features.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3 font-archivo">Features</h3>
                <ul className="space-y-2">
                  {product.features.map((feature, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-gray-700 font-archivo"
                    >
                      <span className="text-[#4E7302] mt-1">•</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Installation Tab */}
        <TabsContent value="installation" className="mt-6">
          {product.installation &&
          Object.keys(product.installation).length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(product.installation).map(([name, option]) => (
                <button
                  key={name}
                  onClick={() => handleInstallationSelect(name)}
                  className={`relative p-4 border-2 rounded-lg transition-all ${
                    selectedInstallation === name
                      ? "border-[#4E7302] bg-green-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {selectedInstallation === name && (
                    <div className="absolute top-2 z-10 right-2 bg-[#4E7302] text-white rounded-full p-1">
                      <Check className="w-4 h-4" />
                    </div>
                  )}
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 w-full text-left">
                    {option.image && (
                      <div className="relative w-full h-32 sm:w-32 sm:h-24 rounded overflow-hidden sm:flex-shrink-0 mb-2 sm:mb-0">
                        <Image
                          src={option.image}
                          alt={name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 50vw, 200px"
                          priority
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm mb-1 font-archivo">
                        {name}
                      </h3>
                      <p className="text-xs text-gray-600 font-archivo">
                        ${option.price?.toLocaleString() || 0}
                      </p>
                      {option.power && (
                        <p className="text-xs text-gray-500 mt-1 font-archivo">
                          {option.power}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8 font-archivo">
              No installation options available
            </p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProductConfigurator;
