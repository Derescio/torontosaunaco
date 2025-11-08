"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { fetchProduct } from "@/assets/utils/request";
import Spinner from "@/components/Spinner";
import toast from "react-hot-toast";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Check } from "lucide-react";

const SaunaPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  // Selection states
  const [selectedWoodType, setSelectedWoodType] = useState(null);
  const [selectedStove, setSelectedStove] = useState(null);
  const [selectedUpgrades, setSelectedUpgrades] = useState([]);
  const [selectedInstallation, setSelectedInstallation] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      try {
        const data = await fetchProduct(id);
        setProduct(data);
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.message === "Email sent successfully!") {
        toast.success("Email sent successfully!", { duration: 2700 });
      } else {
        toast.error("Error sending email. Please try again later.", {
          duration: 2700,
        });
      }
      setLoading(false);
    } catch (error) {
      console.error("Error sending emails:", error);
      setLoading(false);
    }
  };

  // Calculate total price
  const calculateTotal = () => {
    let total = product?.baseCost || product?.price || 0;
    if (selectedWoodType && product?.wood_type) {
      const woodOption = product.wood_type[selectedWoodType];
      if (woodOption?.price) total += woodOption.price;
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
    if (product?.delivery?.cost && !product?.delivery?.included) {
      total += product.delivery.cost;
    }
    return total;
  };

  const toggleUpgrade = (upgradeName) => {
    setSelectedUpgrades((prev) =>
      prev.includes(upgradeName)
        ? prev.filter((name) => name !== upgradeName)
        : [...prev, upgradeName]
    );
  };

  if (!product && !loading) {
    return <p className="text-center">Product not found</p>;
  }

  const totalPrice = product ? calculateTotal() : 0;
  const basePrice = product?.baseCost || product?.price || 0;

  return (
    mounted && (
      <div className="min-h-screen bg-white">
        {loading && <Spinner loading={loading} />}
        {!loading && product && (
          <>
            {/* Hero Section with Breadcrumbs */}
            <section className=" drop-shadow-xl md:drop-shadow-2xl shadow-[#4E7302]/80 relative h-[400px] md:h-[500px] lg:h-[600px] flex items-center justify-center overflow-hidden">
              {/* Background Image */}
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
                  {product.description?.substring(0, 106)}.
                </p>
              </div>
            </section>

            {/* Main Content Section */}
            <section className="py-12 md:py-16">
              <div className="container mx-auto px-4 max-w-7xl">
                <div className="grid md:grid-cols-2 gap-8 lg:gap-12 mb-12">
                  {/* Image Gallery */}
                  <div className="space-y-4">
                    {/* Main Image */}
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

                    {/* Thumbnail Images */}
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

                  {/* Product Price, Title and Description Section */}

                  <div className="mt-12 mb-12">
                    <h2 className="text-2xl md:text-3xl font-light text-[#4E7302] mb-6 font-archivo">
                      {product.name} Starting from ${basePrice.toLocaleString()}
                      {basePrice !== totalPrice && (
                        <span className="text-gray-600 text-lg ml-2"></span>
                      )}
                    </h2>
                    <div className="prose max-w-none text-gray-700 leading-relaxed font-archivo">
                      <p className="text-base md:text-lg leading-relaxed whitespace-pre-line break-words">
                        {product.description}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Product Info & Options */}
                  <div>
                    <h2 className="text-3xl md:text-4xl font-light text-[#4E7302] mb-2 font-archivo">
                      Choose Available Options
                    </h2>
                    <p className="text-xl text-gray-600 font-archivo">
                      {/* ${basePrice.toLocaleString()} */}
                      {/* {basePrice !== totalPrice && (
                        <span className="text-gray-400 ml-2">
                          {product.name}
                        </span>
                      )} */}
                    </p>
                  </div>

                  {/* Tabs Section */}
                  <Tabs defaultValue="wood" className="w-full">
                    <TabsList className="mb-24 sm:mb-0 w-full bg-gray-200 rounded-lg p-1 grid grid-cols-2 sm:grid-cols-5 gap-2">
                      <TabsTrigger
                        value="wood"
                        className="data-[state=active]:bg-[#4E7302]/80  data-[state=active]:text-white rounded-md font-archivo w-full text-center whitespace-normal break-words leading-tight"
                      >
                        Wood Style
                      </TabsTrigger>
                      <TabsTrigger
                        value="heater"
                        className="data-[state=active]:bg-[#4E7302]/80  data-[state=active]:text-white rounded-md font-archivo w-full text-center whitespace-normal break-words leading-tight"
                      >
                        Heater
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

                    {/* Wood Style Tab */}
                    <TabsContent value="wood" className="mt-6">
                      {product.wood_type &&
                      Object.keys(product.wood_type).length > 0 ? (
                        <div className="grid grid-cols-2 gap-4">
                          {Object.entries(product.wood_type).map(
                            ([name, option]) => (
                              <button
                                key={name}
                                onClick={() => setSelectedWoodType(name)}
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
                          No wood type options available
                        </p>
                      )}
                    </TabsContent>

                    {/* Heater Tab */}
                    <TabsContent value="heater" className="mt-6">
                      {product.stove_type &&
                      Object.keys(product.stove_type).length > 0 ? (
                        <div className="grid grid-cols-2 gap-4">
                          {Object.entries(product.stove_type).map(
                            ([name, option]) => (
                              <button
                                key={name}
                                onClick={() => setSelectedStove(name)}
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
                            )
                          )}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-8 font-archivo">
                          No heater options available
                        </p>
                      )}

                      {/* Heater disclaimer */}
                      <div className="mt-4 p-3 rounded-md bg-amber-50 border border-amber-200">
                        <p className="text-[13px] leading-relaxed text-amber-900 font-archivo">
                          Please note: Electric heaters require a certified
                          electrician to hardwire the unit directly into your
                          electrical panel.
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
                            <h3 className="font-semibold mb-3 font-archivo">
                              Dimensions
                            </h3>
                            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                              <p className="font-archivo">
                                <span className="font-medium">Width:</span>{" "}
                                {product.dimensions.width}{" "}
                                {product.dimensions.unit}
                              </p>
                              <p className="font-archivo">
                                <span className="font-medium">Depth:</span>{" "}
                                {product.dimensions.depth}{" "}
                                {product.dimensions.unit}
                              </p>
                              <p className="font-archivo">
                                <span className="font-medium">Height:</span>{" "}
                                {product.dimensions.height}{" "}
                                {product.dimensions.unit}
                              </p>
                              <p className="text-sm text-gray-600 font-archivo">
                                ({product.dimensions.type})
                              </p>
                            </div>
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

                    {/* Installation Tab */}
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
                          No installation options available
                        </p>
                      )}
                    </TabsContent>
                  </Tabs>

                  {/* Selection Summary */}
                  {(selectedWoodType ||
                    selectedStove ||
                    selectedUpgrades.length > 0 ||
                    selectedInstallation) && (
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
                            <span className="font-semibold">
                              {selectedStove}
                            </span>
                            {product.stove_type[selectedStove]?.wifi &&
                              " with Wifi Controller"}
                          </p>
                        )}
                        {selectedWoodType && (
                          <p>
                            Wood Type:{" "}
                            <span className="font-semibold">
                              {selectedWoodType}
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
                        <p className="mt-4 font-semibold text-lg">
                          See the total below
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Total Price */}
                  <div className="bg-[#4E7302]/80 backdrop-blur-sm text-white p-6 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-light font-archivo">
                        Total(Including Delivery)
                      </span>
                      <span className="text-2xl font-medium font-archivo">
                        ${totalPrice.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Contact Form Section */}
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

            {/* OLD CODE PRESERVED FOR REFERENCE - Commented out below */}
            {/* 
            ============================================
            OLD PRODUCT PAGE CODE - KEPT FOR REFERENCE
            ============================================
            
            <PureCube1_ID id={id} />
            
            <section className="">
              <div className="container m-auto py-10 px-6">
                <div className="grid grid-cols-1 md:grid-cols-70/30 w-full gap-6">
                  <SaunaDetails product={product} />
                  
                  <aside className="space-y-4">    
                    {loading && <Spinner loading={loading} /> }  
                    <ShareButtons product={product} />
                    
                    <div className="bg-white p-6 rounded-lg shadow-md">
                      <h3 className="text-xl font-bold mb-2">Need More Information ?</h3>
                      <p className="mb-4">Get in touch with us, send us an email.</p>
                      <form onSubmit={sendEmails}>
                        // ... old form code ...
              </form>
            </div>
          </aside>
        </div>
      </div>
    </section>
            */}
          </>
        )}
      </div>
    )
  );
};

export default SaunaPage;
