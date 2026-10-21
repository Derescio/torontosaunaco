"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Contact from "@/components/Contact";
import { heaterSpecRows } from "@/lib/catalog/heaterSpecs";

function defaultOptionsFor(heater) {
  const options = heater?.options ?? {};
  return {
    stones: Array.isArray(options.stones)
      ? options.stones.find((s) => s.isDefault) || null
      : null,
    controls: Array.isArray(options.controls)
      ? options.controls.find((c) => c.isDefault) || null
      : null,
    safetyRailing: Array.isArray(options.safetyRailing)
      ? options.safetyRailing.find((r) => r.isDefault) || null
      : null,
  };
}

function variantsFor(data) {
  const listed = Array.isArray(data?.variants) ? data.variants : [];
  const variants = listed.length > 0 ? listed : [data];
  if (!variants.some((variant) => String(variant._id) === String(data._id))) {
    return [data, ...variants];
  }
  return variants;
}

function variantMatchesSlug(variant, slug) {
  return variant.slug === slug || String(variant._id) === String(slug);
}

const HeaterDetails = () => {
  const [heater, setHeater] = useState(null);
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOptions, setSelectedOptions] = useState({
    stones: null,
    controls: null,
    safetyRailing: null,
  });
  const [selectedImage, setSelectedImage] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [showContact, setShowContact] = useState(false);
  const variantsRef = useRef([]);
  const params = useParams();

  const showVariant = useCallback((data, siblingVariants) => {
    const options = defaultOptionsFor(data);
    let total = data.basePrice;
    if (options.stones) total += options.stones.price;
    if (options.controls) total += options.controls.price;
    if (options.safetyRailing) total += options.safetyRailing.price;

    variantsRef.current = siblingVariants;
    setVariants(siblingVariants);
    setHeater(data);
    setSelectedImage(0);
    setSelectedOptions(options);
    setTotalPrice(total);
  }, []);

  useEffect(() => {
    const slug = String(params.slug ?? "");
    const cached = variantsRef.current.find((variant) =>
      variantMatchesSlug(variant, slug)
    );

    if (cached) {
      showVariant(cached, variantsRef.current);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    const fetchHeater = async () => {
      try {
        const response = await fetch(`/api/heaters/${slug}`);
        if (!response.ok) throw new Error("Failed to fetch heater");
        const data = await response.json();
        if (cancelled) return;
        showVariant(data, variantsFor(data));
      } catch (error) {
        console.error("Error fetching heater:", error);
        if (!cancelled) setHeater(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchHeater();

    return () => {
      cancelled = true;
    };
  }, [params.slug, showVariant]);

  useEffect(() => {
    if (heater) {
      let total = heater.basePrice;
      if (selectedOptions.stones) total += selectedOptions.stones.price;
      if (selectedOptions.controls) total += selectedOptions.controls.price;
      if (selectedOptions.safetyRailing)
        total += selectedOptions.safetyRailing.price;
      setTotalPrice(total);
    }
  }, [selectedOptions, heater]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  if (!heater)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Heater not found
      </div>
    );
  const options = heater.options ?? {};
  const hasOptions = ["stones", "controls", "safetyRailing"].some(
    (key) => Array.isArray(options[key]) && options[key].length > 0,
  );
  const seriesName =
    typeof heater.series === "string" ? heater.series.trim() : "";
  const imageIndex = heater.images?.[selectedImage] ? selectedImage : 0;
  const specRows = heaterSpecRows(heater);

  const selectPower = (variant) => {
    const slug = variant.slug ?? variant._id;
    if (!slug || String(variant._id) === String(heater._id)) return;
    showVariant(variant, variants);
    const nextUrl = `/heaters/${slug}`;
    if (window.location.pathname !== nextUrl) {
      window.history.replaceState(window.history.state, "", nextUrl);
    }
  };
  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="lg:grid lg:grid-cols-2 lg:gap-x-8 lg:items-start">
          {/* Image gallery */}
          <div className="relative">
            {heater.images?.length > 0 && (
              <div className="relative flex flex-col items-center space-y-4">
                {/* Main Image */}
                {heater.images?.length > 0 && (
                  <div className="w-full max-w-[400px] aspect-square mx-auto rounded-lg overflow-hidden flex items-center justify-center bg-gray-100 relative">
                    <Image
                      key={heater.images[imageIndex].url}
                      src={heater.images[imageIndex].url}
                      alt={heater.images[imageIndex].alt}
                      className="w-full h-full object-cover"
                      fill
                      sizes="(max-width: 640px) 100vw, 400px"
                      priority={true}
                    />
                  </div>
                )}

                {/* Thumbnail Gallery */}
                {heater.images?.length > 1 && (
                  <div className="grid grid-cols-4 gap-1 w-full max-w-[400px]">
                    {heater.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`relative aspect-square rounded-lg overflow-hidden ${
                          imageIndex === index
                            ? "ring-2 ring-indigo-500"
                            : "ring-1 ring-gray-200"
                        }`}
                      >
                        <Image
                          src={image.url}
                          alt={image.alt}
                          className={`w-full h-full object-center object-cover ${
                            imageIndex === index
                              ? "opacity-100"
                              : "opacity-75 hover:opacity-100"
                          }`}
                          width={150}
                          height={150}
                          priority
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Product info */}
          <div className="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0">
            <h1 className="text-3xl font-bold mb-4  text-black font-playfair">
              {seriesName || heater.name}
            </h1>
            {variants.length > 1 && (
              <div className="flex flex-wrap gap-2" role="group" aria-label="Power">
                {variants.map((variant) => {
                  const active = String(variant._id) === String(heater._id);
                  return (
                    <button
                      key={variant._id ?? variant.power}
                      type="button"
                      aria-pressed={active}
                      onClick={() => selectPower(variant)}
                      className={`px-3 py-2 rounded-lg border text-sm transition-all ${
                        active
                          ? "border-black bg-black text-white"
                          : "border-gray-300 bg-white text-black hover:bg-black hover:text-white"
                      }`}
                    >
                      {variant.power} kW
                    </button>
                  );
                })}
              </div>
            )}
            <div className="mt-3">
              <h2 className="sr-only">Product information</h2>
              <p className="text-2xl text-gray-900">
                {/* Starting from ${heater.basePrice} */}${heater.basePrice}
              </p>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900">Description</h3>
              <div className="mt-4 space-y-4 text-gray-950">
                {(() => {
                  const textArray = Array.isArray(heater.description)
                    ? heater.description.join(" ")
                    : heater.description;

                  // Split by sentence-ending period followed by a space or line break
                  const sentences =
                    textArray.match(/[^.!?]+[.!?]+[\])'"`’”]*\s*/g) || [];

                  // Group sentences into paragraphs of 3
                  const paragraphs = [];
                  for (let i = 0; i < sentences.length; i += 3) {
                    const chunk = sentences
                      .slice(i, i + 3)
                      .join(" ")
                      .trim();
                    if (chunk) paragraphs.push(chunk);
                  }

                  return paragraphs.map((para, index) => (
                    <p key={index} className="text-base leading-relaxed">
                      {para}
                    </p>
                  ));
                })()}
              </div>
            </div>

            {specRows.length > 0 && (
              <div className="mt-8 border-t border-gray-200 pt-8">
                <h3 className="text-lg font-medium text-black">Specifications</h3>
                <dl className="mt-4 divide-y divide-gray-200">
                  {specRows.map((row) => (
                    <div
                      key={row.label}
                      className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-[9rem_1fr] sm:gap-4"
                    >
                      <dt className="text-sm font-medium text-black">{row.label}</dt>
                      <dd className="text-sm text-gray-900">
                        {Array.isArray(row.value) ? (
                          <div className="space-y-1">
                            {row.value.map((line) => (
                              <p key={line}>{line}</p>
                            ))}
                          </div>
                        ) : (
                          row.value
                        )}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {hasOptions && (
            <div className="mt-8 border-t border-gray-200 pt-8">
              <h3 className="text-lg font-medium text-gray-900">
                Customize Your Heater
              </h3>

              {/* Stones Selection */}
              {Array.isArray(heater.options?.stones) &&
                heater.options.stones.length > 0 && (
                  <div className="mt-4">
                    <label className="text-sm font-medium text-gray-700">
                      Stones
                    </label>
                    <div className="mt-4 space-y-3">
                      {heater.options.stones.map((stone) => {
                        const isSelected =
                          selectedOptions.stones?.type === stone.type;
                        return (
                          <label
                            key={stone.type}
                            className={`block cursor-pointer border rounded-xl p-4 transition-all duration-150 ${
                              isSelected
                                ? "border-indigo-600 bg-indigo-50"
                                : "border-gray-300 hover:border-indigo-400"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <input
                                  type="radio"
                                  name="stones"
                                  checked={isSelected}
                                  onChange={() =>
                                    setSelectedOptions({
                                      ...selectedOptions,
                                      stones: stone,
                                    })
                                  }
                                  className="h-5 w-5 text-indigo-600 focus:ring-indigo-500"
                                />
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    {stone.type}
                                  </p>
                                  <p className="text-sm text-gray-950">
                                    {stone.description}
                                  </p>
                                </div>
                              </div>
                              <div className="text-sm text-gray-700 text-right">
                                <p>${stone.price}</p>
                                <p>
                                  {stone.weight.metric} kg (
                                  {stone.weight.imperial} lb)
                                </p>
                              </div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

              {/* Controls Selection */}
              {Array.isArray(heater.options?.controls) &&
                heater.options.controls.length > 0 && (
                  <div className="mt-6">
                    <label className="text-sm font-medium text-gray-700">
                      Controls
                    </label>
                    <div className="mt-4 space-y-3">
                      {heater.options.controls.map((control) => {
                        const isSelected =
                          selectedOptions.controls?.type === control.type;
                        return (
                          <label
                            key={control.type}
                            className={`block cursor-pointer border rounded-xl p-4 transition-all duration-150 ${
                              isSelected
                                ? "border-indigo-600 bg-indigo-50"
                                : "border-gray-300 hover:border-indigo-400"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <input
                                  type="radio"
                                  name="controls"
                                  checked={isSelected}
                                  onChange={() =>
                                    setSelectedOptions({
                                      ...selectedOptions,
                                      controls: control,
                                    })
                                  }
                                  className="h-5 w-5 text-indigo-600 focus:ring-indigo-500"
                                />
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    {control.type}
                                  </p>
                                  <p className="text-sm text-gray-950">
                                    {control.description}
                                  </p>
                                </div>
                              </div>
                              <div className="text-sm text-gray-700 text-right">
                                <p>${control.price}</p>
                              </div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

              {/* Safety Railing Selection */}
              {Array.isArray(heater.options?.safetyRailing) &&
                heater.options.safetyRailing.length > 0 && (
                  <div className="mt-6">
                    <label className="text-sm font-medium text-gray-700">
                      Safety Railing
                    </label>
                    <div className="mt-4 space-y-3">
                      {heater.options.safetyRailing.map((railing) => {
                        const isSelected =
                          selectedOptions.safetyRailing?.type === railing.type;
                        return (
                          <label
                            key={railing.type}
                            className={`block cursor-pointer border rounded-xl p-4 transition-all duration-150 ${
                              isSelected
                                ? "border-indigo-600 bg-indigo-50"
                                : "border-gray-300 hover:border-indigo-400"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <input
                                  type="radio"
                                  name="safetyRailing"
                                  checked={isSelected}
                                  onChange={() =>
                                    setSelectedOptions({
                                      ...selectedOptions,
                                      safetyRailing: railing,
                                    })
                                  }
                                  className="h-5 w-5 text-indigo-600 focus:ring-indigo-500"
                                />
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    {railing.type}
                                  </p>
                                  <p className="text-sm text-gray-950">
                                    {railing.description}
                                  </p>
                                </div>
                              </div>
                              <div className="text-sm text-gray-700 text-right">
                                <p>${railing.price}</p>
                              </div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
            </div>
            )}

            {/* Total Price */}
            <div className="mt-8 border-t border-gray-200 pt-8">
              <div className="flex items-center justify-between">
                <h3 className="text-md font-md text-gray-900 ">
                  Estimated Total*
                </h3>
                <p className="text-2xl font-bold text-gray-900">
                  ${totalPrice}
                </p>
              </div>
              <div className="mt-6 text-xs italic text-gray-500 text-center">
                To make an order, click below and send the information
              </div>
              <Link href="/quote">
                <button
                  type="button"
                  className="mt-8 w-full bg-black border border-transparent rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-white hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowContact((v) => !v);
                  }}
                >
                  {showContact ? "Hide Contact Form" : "Order Now"}
                </button>
              </Link>
            </div>
            {showContact && (
              <div className="mt-6 transition-all duration-300">
                <Contact />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeaterDetails;
