"use client";
import { useState, useEffect } from "react";

import Link from "next/link";
import Image from "next/image";
import { fetchProduct } from "@/assets/utils/request";
import Spinner from "@/components/Spinner";
import toast from "react-hot-toast";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Check } from "lucide-react";
import posthog from "posthog-js";
import { posthogEvents } from "@/assets/utils/posthogEvents";

const ColdPlungeClient = ({ id }) => {

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  // Selection states
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [selectedChiller, setSelectedChiller] = useState(null);
  const [selectedUpgrades, setSelectedUpgrades] = useState([]);
  const [selectedInstallation, setSelectedInstallation] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        const data = await fetchProduct(id);
        setProduct(data);
        try {
          posthog.capture(posthogEvents.product_viewed, {
            productId: data?._id || id,
            type: data?.type,
            name: data?.name,
          });
        } catch {}
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    if (product === null) {
      fetchData();
    }
    setMounted(true);
  }, [id, product]);

  const sendEmails = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = {
      name: e.target.name.value,
      email: e.target.email.value,
      phone: e.target.phone.value,
      message: e.target.message.value,
      subject: product.name,
    };
    try {
      const res = await fetch("/api/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.message === "Email sent successfully!") {
        toast.success("Email sent successfully!", { duration: 2700 });
        try {
          posthog.capture(posthogEvents.quote_form_submitted, {
            productId: product?._id || id,
            totalPrice,
            installation: selectedInstallation || "unset",
            deliveryApplied: selectedInstallation === "DIY",
          });
        } catch {}
      } else {
        toast.error("Error sending email. Please try again later.", {
          duration: 2700,
        });
        try {
          posthog.captureException(new Error(data?.message || "Quote failed"), {
            productId: product?._id || id,
            installation: selectedInstallation || "unset",
          });
        } catch {}
      }
      setLoading(false);
    } catch (error) {
      console.error("Error sending emails:", error);
      setLoading(false);
      try {
        posthog.captureException(error, {
          productId: product?._id || id,
          installation: selectedInstallation || "unset",
        });
      } catch {}
    }
  };

  // Pricing
  const hasSizes =
    product?.sizes && Array.isArray(product.sizes) && product.sizes.length > 0;

  const computeBasePrice = () => {
    if (hasSizes) {
      if (selectedSize && selectedMaterial) {
        const sizeObj = product.sizes.find((s) => s.key === selectedSize);
        const sizePrice =
          sizeObj?.priceByWood &&
          typeof sizeObj.priceByWood[selectedMaterial] === "number"
            ? sizeObj.priceByWood[selectedMaterial]
            : undefined;
        if (typeof sizePrice === "number") return sizePrice;
      }
    }
    return product?.baseCost || product?.price || 0;
  };

  const computeStartingFromPrice = () => {
    if (hasSizes) {
      let minPrice = Infinity;
      for (const size of product.sizes) {
        if (size?.priceByWood && typeof size.priceByWood === "object") {
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
    if (selectedMaterial && product?.wood_type) {
      const materialOption = product.wood_type[selectedMaterial];
      if (!hasSizes) {
        if (materialOption?.price) total += materialOption.price;
      }
    }
    if (selectedChiller && product?.stove_type) {
      const chillerOption = product.stove_type[selectedChiller];
      if (chillerOption?.price) total += chillerOption.price;
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

  const toggleUpgrade = (upgradeName) => {
    setSelectedUpgrades((prev) => {
      const applied = !prev.includes(upgradeName);
      const next = applied
        ? [...prev, upgradeName]
        : prev.filter((n) => n !== upgradeName);
      try {
        posthog.capture(posthogEvents.config_option_selected, {
          productId: product?._id || id,
          optionType: "addon",
          optionName: upgradeName,
          applied,
        });
      } catch {}
      return next;
    });
  };

  if (!product && !loading) {
    return <p className="text-center">Product not found</p>;
  }

  const totalPrice = product ? calculateTotal() : 0;
  const basePrice = computeBasePrice();
  const startingFromPrice = computeStartingFromPrice();
  const deliveryFee =
    selectedInstallation === "DIY" ? product?.delivery?.cost || 0 : 0;

  useEffect(() => {
    if (!product || !selectedInstallation) return;
    try {
      posthog.capture(posthogEvents.installation_selected, {
        productId: product?._id || id,
        installation: selectedInstallation,
      });
      posthog.capture(posthogEvents.delivery_applied, {
        productId: product?._id || id,
        applied: selectedInstallation === "DIY",
        cost: selectedInstallation === "DIY" ? product?.delivery?.cost || 0 : 0,
      });
    } catch {}
  }, [selectedInstallation]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!product) return;
    try {
      posthog.capture(posthogEvents.price_recalculated, {
        productId: product?._id || id,
        totalPrice,
        basePrice,
        numAddons: selectedUpgrades.length,
        installation: selectedInstallation || "unset",
      });
    } catch {}
  }, [totalPrice]); // eslint-disable-line react-hooks/exhaustive-deps

  const defaultTab = (() => {
    if (product?.wood_type && Object.keys(product.wood_type).length > 0)
      return "material";
    if (hasSizes) return "size";
    if (product?.stove_type && Object.keys(product.stove_type).length > 0)
      return "heater";
    if (product?.additional_upgrades && product.additional_upgrades.length > 0)
      return "addons";
    if (product?.dimensions) return "specs";
    if (product?.installation) return "installation";
    return "heater";
  })();

  return (
    mounted && (
      <div className="min-h-screen bg-white">
        {loading && <Spinner loading={loading} />}
        {!loading && product && (
          <>
            {(() => {
              const full = product?.description || "";
              product.__intro106 = full.slice(0, 109);
              product.__bodyFrom107 = full.slice(110);
              return null;
            })()}

            <section className=" drop-shadow-xl md:drop-shadow-2xl shadow-[#4E7302]/80 relative h-[400px] md:h-[500px] lg:h-[600px] flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 z-0">
                {product.images && product.images.length > 0 && (
                  <Image
                    src={product.images[1]}
                    alt={product.name}
                    fill
                    className="object-cover"
                    priority
                  />
                )}
              </div>
              <div className="absolute inset-0 z-10 bg-black/50"></div>

              <div className="absolute top-6 left-4 md:left-8 z-20">
                <nav className="flex items-center gap-2 text-white text-sm">
                  <Link
                    href="/cold-plunge"
                    className="hover:text-[#FFA726] transition-colors"
                  >
                    All Cold Plunges
                  </Link>
                  <span>/</span>
                  <span>{product.name}</span>
                </nav>
              </div>

              <div className="relative z-20 text-center px-4 max-w-5xl mx-auto">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-white mb-4 font-archivo tracking-wide">
                  {product.name}
                </h1>
                <p className="text-xl md:text-2xl text-gray-200 font-light font-archivo">
                  {product.__intro106}
                </p>
              </div>
            </section>

            <section className="py-12 md:py-16">
              <div className="container mx-auto px-4 max-w-7xl">
                <div className="grid md:grid-cols-2 gap-8 lg:gap-12 mb-12">
                  <div className="space-y-4">
                    <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-100">
                      {product.images && product.images.length > 0 && (
                        <Image
                          src={product.images[selectedImage]}
                          alt={product.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 50vw"
                          priority
                        />
                      )}
                    </div>
                    {product.images && product.images.length > 1 && (
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

                  <div className="mt-12 mb-12">
                    <h2 className="text-2xl md:text-3xl font-light text-[#4E7302] mb-6 font-archivo">
                      {/* {product.name} Starting from $ */}
                      {product.name}  $
                      {startingFromPrice.toLocaleString()}
                    </h2>
                    <div className="prose max-w-none text-gray-700 leading-relaxed font-archivo">
                      {product.__bodyFrom107 ? (
                        <p className="text-base md:text-lg leading-relaxed whitespace-pre-line break-words">
                          {product.__bodyFrom107}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h2 className="text-3xl md:text-4xl font-light text-[#4E7302] mb-2 font-archivo">
                      Choose Available Options
                    </h2>
                  </div>

                  <Tabs defaultValue={defaultTab} className="w-full">
                    <TabsList className="mb-24 sm:mb-0 w-full bg-gray-200 rounded-lg p-1 grid grid-cols-2 sm:grid-cols-6 gap-2">
                      {product?.wood_type &&
                        Object.keys(product.wood_type).length > 0 && (
                          <TabsTrigger
                            value="material"
                            className="data-[state=active]:bg-[#4E7302]/80  data-[state=active]:text-white rounded-md font-archivo w-full text-center whitespace-normal break-words leading-tight"
                          >
                            Material
                          </TabsTrigger>
                        )}
                      {hasSizes && (
                        <TabsTrigger
                          value="size"
                          className="data-[state=active]:bg-[#4E7302]/80  data-[state=active]:text-white rounded-md font-archivo w-full text-center whitespace-normal break-words leading-tight"
                        >
                          Size
                        </TabsTrigger>
                      )}
                      <TabsTrigger
                        value="heater"
                        className="data-[state=active]:bg-[#4E7302]/80  data-[state=active]:text-white rounded-md font-archivo w-full text-center whitespace-normal break-words leading-tight"
                      >
                        Chiller
                      </TabsTrigger>
                      <TabsTrigger
                        value="addons"
                        className="bg-gray-100 sm:bg-transparent data-[state=active]:bg-[#4E7302]/80  data-[state=active]:text-white rounded-md font-archivo w-full text-center whitespace-normal break-words leading-tight"
                      >
                        Add-ons
                      </TabsTrigger>
                      <TabsTrigger
                        value="specs"
                        className="bg-gray-100 sm:bg-transparent data-[state=active]:bg-[#4E7302]/80  data-[state=active]:text-white rounded-md font-archivo w-full text-center whitespace-normal break-words leading-tight"
                      >
                        Specs & Dimensions
                      </TabsTrigger>
                      <TabsTrigger
                        value="installation"
                        className="bg-gray-100 sm:bg-transparent data-[state=active]:bg-[#4E7302]/80  data-[state=active]:text-white rounded-md font-archivo w-full text-center whitespace-normal break-words leading-tight"
                      >
                        Installation
                      </TabsTrigger>
                    </TabsList>

                    {hasSizes && (
                      <TabsContent value="size" className="mt-6">
                        <div className="grid grid-cols-2 gap-4">
                          {product.sizes.map((size) => {
                            const isSelected = selectedSize === size.key;
                            const priceForMaterial =
                              selectedMaterial && size.priceByWood
                                ? size.priceByWood[selectedMaterial]
                                : null;
                            return (
                              <button
                                key={size.key}
                                onClick={() => {
                                  setSelectedSize(size.key);
                                  try {
                                    posthog.capture(
                                      posthogEvents.size_selected,
                                      {
                                        productId: product?._id || id,
                                        sizeKey: size.key,
                                        sizeLabel: size.label || size.key,
                                      }
                                    );
                                  } catch {}
                                }}
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
                                      {priceForMaterial
                                        ? `$${priceForMaterial.toLocaleString()}`
                                        : selectedMaterial
                                          ? "No price for selected material"
                                          : "Select material to see price"}
                                    </p>
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                        {!selectedMaterial && (
                          <p className="text-xs text-gray-500 mt-2 font-archivo">
                            Tip: Select a material to view size-specific
                            pricing.
                          </p>
                        )}
                      </TabsContent>
                    )}

                    {product?.wood_type &&
                      Object.keys(product.wood_type).length > 0 && (
                        <TabsContent value="material" className="mt-6">
                          <div className="grid grid-cols-2 gap-4">
                            {Object.entries(product.wood_type).map(
                              ([name, option]) => (
                                <button
                                  key={name}
                                  onClick={() => {
                                    setSelectedMaterial(name);
                                    try {
                                      posthog.capture(
                                        posthogEvents.config_option_selected,
                                        {
                                          productId: product?._id || id,
                                          optionType: "material",
                                          optionName: name,
                                          priceDelta: option?.price || 0,
                                        }
                                      );
                                    } catch {}
                                  }}
                                  className={`relative p-4 border-2 rounded-lg transition-all ${
                                    selectedMaterial === name
                                      ? "border-[#4E7302] bg-green-50"
                                      : "border-gray-200 hover:border-gray-300"
                                  }`}
                                >
                                  {selectedMaterial === name && (
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
                                    </div>
                                  </div>
                                </button>
                              )
                            )}
                          </div>
                        </TabsContent>
                      )}

                    <TabsContent value="heater" className="mt-6">
                      {product?.stove_type &&
                      Object.keys(product.stove_type).length > 0 ? (
                        <div className="grid grid-cols-2 gap-4">
                          {Object.entries(product.stove_type).map(
                            ([name, option]) => (
                              <button
                                key={name}
                                onClick={() => {
                                  setSelectedChiller(name);
                                  try {
                                    posthog.capture(
                                      posthogEvents.config_option_selected,
                                      {
                                        productId: product?._id || id,
                                        optionType: "chiller",
                                        optionName: name,
                                        priceDelta: option?.price || 0,
                                      }
                                    );
                                  } catch {}
                                }}
                                className={`relative p-4 border-2 rounded-lg transition-all ${
                                  selectedChiller === name
                                    ? "border-[#4E7302] bg-green-50"
                                    : "border-gray-200 hover:border-gray-300"
                                }`}
                              >
                                {selectedChiller === name && (
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
                            )
                          )}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-8 font-archivo">
                          No chiller options available
                        </p>
                      )}
                    </TabsContent>

                    <TabsContent value="addons" className="mt-6">
                      {product.additional_upgrades &&
                      product.additional_upgrades.length > 0 ? (
                        <div className="grid grid-cols-2 gap-4">
                          {product.additional_upgrades.map((upgrade) => (
                            <button
                              key={upgrade.name}
                              onClick={() => toggleUpgrade(upgrade.name)}
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

                    <TabsContent value="specs" className="mt-6">
                      <div className="space-y-6">
                        {product.dimensions && (
                          <div>
                            <h3 className="font-semibold mb-3 font-archivo">
                              Dimensions
                            </h3>
                            {product.dimensions.width ||
                            product.dimensions.depth ||
                            product.dimensions.height ? (
                              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                                {typeof product.dimensions.width !==
                                  "undefined" && (
                                  <p className="font-archivo">
                                    <span className="font-medium">Width:</span>{" "}
                                    {product.dimensions.width}{" "}
                                    {product.dimensions.unit || ""}
                                  </p>
                                )}
                                {typeof product.dimensions.depth !==
                                  "undefined" && (
                                  <p className="font-archivo">
                                    <span className="font-medium">Depth:</span>{" "}
                                    {product.dimensions.depth}{" "}
                                    {product.dimensions.unit || ""}
                                  </p>
                                )}
                                {typeof product.dimensions.height !==
                                  "undefined" && (
                                  <p className="font-archivo">
                                    <span className="font-medium">Height:</span>{" "}
                                    {product.dimensions.height}{" "}
                                    {product.dimensions.unit || ""}
                                  </p>
                                )}
                                {(product.dimensions.HeatingOption ||
                                  product.dimensions["Heating Option"]) && (
                                  <p className="font-archivo">
                                    <span className="font-medium">
                                      Cooling Options:
                                    </span>{" "}
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
                                {Object.entries(product.dimensions).map(
                                  ([key, value]) => (
                                    <p key={key} className="font-archivo">
                                      <span className="font-medium">
                                        {key}:
                                      </span>{" "}
                                      {typeof value === "string" ||
                                      typeof value === "number"
                                        ? value
                                        : Array.isArray(value)
                                          ? value.join(", ")
                                          : JSON.stringify(value)}
                                    </p>
                                  )
                                )}
                              </div>
                            )}
                          </div>
                        )}
                        {product.features && product.features.length > 0 && (
                          <div>
                            <h3 className="font-semibold mb-3 font-archivo">
                              Features
                            </h3>
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

                    <TabsContent value="installation" className="mt-6">
                      {product.installation &&
                      Object.keys(product.installation).length > 0 ? (
                        <div className="grid grid-cols-2 gap-4">
                          {Object.entries(product.installation).map(
                            ([name, option]) => (
                              <button
                                key={name}
                                onClick={() => setSelectedInstallation(name)}
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
                                  </div>
                                </div>
                              </button>
                            )
                          )}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-8 font-archivo">
                          No installation options available
                        </p>
                      )}
                    </TabsContent>
                  </Tabs>

                  {(selectedMaterial ||
                    selectedChiller ||
                    selectedUpgrades.length > 0 ||
                    selectedInstallation ||
                    selectedSize) && (
                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="text-[#4E7302] font-bold text-lg font-archivo">
                          THE TORONTO SAUNA CO.
                        </div>
                      </div>
                      <div className="space-y-2 text-sm font-archivo">
                        {selectedChiller && (
                          <p>
                            You Have Chosen:{" "}
                            <span className="font-semibold">
                              {selectedChiller}
                            </span>
                          </p>
                        )}
                        {selectedMaterial && (
                          <p>
                            Material:{" "}
                            <span className="font-semibold">
                              {selectedMaterial}
                            </span>
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
                            <span className="font-semibold">
                              {selectedInstallation}
                            </span>
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
                            Size:{" "}
                            <span className="font-semibold">
                              {selectedSize}
                            </span>
                          </p>
                        )}
                        <p className="mt-4 font-semibold text-lg">
                          See the total below
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="bg-[#4E7302]/80 backdrop-blur-sm text-white p-6 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-light font-archivo">
                        Total
                      </span>
                      <span className="text-2xl font-medium font-archivo">
                        ${totalPrice.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-8 rounded-xl">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2 font-archivo">
                    Need More Information?
                  </h2>
                  <p className="text-gray-600 mb-6 font-archivo">
                    Get in touch with us, send us an email.
                  </p>
                  <form onSubmit={sendEmails} className="space-y-4">
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-700 mb-2 font-archivo"
                      >
                        Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        placeholder="Enter your name"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4E7302] focus:border-transparent outline-none font-archivo"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 mb-2 font-archivo"
                      >
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        placeholder="Enter your email"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4E7302] focus:border-transparent outline-none font-archivo"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="phone"
                        className="block text-sm font-medium text-gray-700 mb-2 font-archivo"
                      >
                        Phone
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        placeholder="Enter your phone number"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4E7302] focus:border-transparent outline-none font-archivo"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="message"
                        className="block text-sm font-medium text-gray-700 mb-2 font-archivo"
                      >
                        Message
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        rows="6"
                        placeholder="Enter your message"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4E7302] focus:border-transparent outline-none resize-none font-archivo"
                      ></textarea>
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-[#4E7302]/80  hover:bg-[#4E7302]/90 text-white font-semibold py-3 px-6 rounded-lg transition-colors font-archivo"
                    >
                      Send Message
                    </button>
                  </form>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    )
  );
};

export default ColdPlungeClient;
