"use client";
import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import {
  removeFromCart,
  updateCartItemQuantity,
  clearCart,
  hydrateCart,
} from "@/redux/slices/cartSlice";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import { Send, Trash2, Minus, Plus, ShoppingBag } from "lucide-react";

// Feature flag for checkout - set to true when ready for e-commerce
const ENABLE_CHECKOUT = false;

const CartPage = () => {
  const dispatch = useDispatch();
  const { cartItems } = useSelector((state) => state.cart);
  const [suBtotal, setSubTotal] = useState(0);
  const [shippingCost, setShippingCost] = useState(0);
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // Quote form state
  const [quoteForm, setQuoteForm] = useState({
    name: "",
    email: "",
    phone: "",
    postalcode: "",
    address: "",
    city: "",
    province: "",
    message: "",
  });

  const calculateShippingCost = (subTotal) => {
    switch (true) {
      case subTotal > 5000:
        setShippingCost(200);
        break;
      case subTotal > 1000:
        setShippingCost(50);
        break;
      case subTotal > 500:
        setShippingCost(10);
        break;
      default:
        setShippingCost(0);
    }
  };

  useEffect(() => {
    dispatch(hydrateCart());
  }, [dispatch]);

  useEffect(() => {
    if (!cartItems) {
      setSubTotal(0);
      return;
    }
    const total = cartItems.reduce((acc, item) => {
      return acc + Number(item.price) * Number(item.qty);
    }, 0);
    setSubTotal(total);
    calculateShippingCost(total);
  }, [cartItems]);

  const AddDecimals = (num) => {
    return (Math.round(num * 100) / 100).toFixed(2);
  };

  const tax = AddDecimals((suBtotal + shippingCost) * 0.13);
  const totalCost = AddDecimals(suBtotal + shippingCost + parseFloat(tax));

  const handleItemIncrement = (id) => {
    const item = cartItems.find((item) => item.id === id);
    if (item) {
      dispatch(updateCartItemQuantity({ id, qty: item.qty + 1 }));
    }
  };

  const handleItemDecrement = (id) => {
    const item = cartItems.find((item) => item.id === id);
    if (item && item.qty > 1) {
      dispatch(updateCartItemQuantity({ id, qty: item.qty - 1 }));
    }
  };

  const handleEmptyCart = () => {
    dispatch(clearCart());
  };

  const handleItemDelete = (id) => {
    dispatch(removeFromCart(id));
  };

  // Hidden checkout handler - preserved for future use
  const handleBuyNow = () => {
    router.push("/precheckout");
  };

  const handleQuoteFormChange = (e) => {
    const { name, value } = e.target;
    setQuoteForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleRequestQuote = async (e) => {
    e.preventDefault();

    if (!cartItems || cartItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...quoteForm,
          subject: `Quote Request - ${cartItems.length} item(s)`,
          isCartQuote: true,
          cartItems: cartItems.map((item) => ({
            name: item.name,
            price: item.price,
            qty: item.qty,
            image: item.image,
            configuration: item.configuration,
            selectedOptions: item.selectedOptions,
          })),
          cartSummary: {
            subtotal: suBtotal,
            shipping: shippingCost,
            tax: parseFloat(tax),
            total: parseFloat(totalCost),
          },
        }),
      });

      const data = await res.json();

      if (data.message === "Email sent successfully!") {
        toast.success(
          "Quote request sent successfully! We will contact you shortly.",
          { duration: 4000 }
        );
        setQuoteForm({
          name: "",
          email: "",
          phone: "",
          postalcode: "",
          address: "",
          city: "",
          province: "",
          message: "",
        });
        setShowQuoteForm(false);
        // Optionally clear cart after successful quote
        // dispatch(clearCart());
      } else {
        toast.error("Error sending quote request. Please try again.", {
          duration: 3000,
        });
      }
    } catch (error) {
      console.error("Error sending quote:", error);
      toast.error("Error sending quote request. Please try again.", {
        duration: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Render configuration details for a cart item
   */
  const renderConfiguration = (item) => {
    const config = item.configuration;
    if (!config) {
      // Fallback to legacy selectedOptions
      if (item.selectedOptions) {
        return Object.entries(item.selectedOptions)
          .filter(([, option]) => option !== null)
          .map(([key, option]) => (
            <p key={key} className="text-sm text-gray-600">
              <span className="capitalize">{key}:</span> {option?.type}
              {option?.price > 0 && ` (+$${option.price.toLocaleString()})`}
            </p>
          ));
      }
      return null;
    }

    const details = [];

    if (config.size) {
      details.push(
        <p key="size" className="text-sm text-gray-600">
          Size: {config.size.label || config.size.key}
        </p>
      );
    }

    if (config.woodType) {
      details.push(
        <p key="wood" className="text-sm text-gray-600">
          Wood: {config.woodType.name}
        </p>
      );
    }

    if (config.stove) {
      details.push(
        <p key="stove" className="text-sm text-gray-600">
          Heater: {config.stove.name}
          {config.stove.wifi && " (WiFi)"}
        </p>
      );
    }

    if (config.installation) {
      details.push(
        <p key="installation" className="text-sm text-gray-600">
          Installation: {config.installation.name}
        </p>
      );
    }

    if (config.delivery) {
      details.push(
        <p key="delivery" className="text-sm text-gray-600">
          Delivery:{" "}
          {config.delivery.included
            ? "Included"
            : `$${config.delivery.cost.toLocaleString()}`}
        </p>
      );
    }

    if (config.upgrades && config.upgrades.length > 0) {
      details.push(
        <p key="upgrades" className="text-sm text-gray-600">
          Add-ons: {config.upgrades.map((u) => u.name).join(", ")}
        </p>
      );
    }

    return details;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="font-sans max-w-6xl mx-auto p-4 md:p-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          {/* <ShoppingBag className="w-8 h-8 text-[#4E7302]" /> */}
          <h1 className="text-3xl font-bold text-gray-800 font-archivo">
            Sauna Request Details
          </h1>
          {/* <Link href="/">
            <button className="text-gray-500 hover:text-gray-700 transition-colors">
              <Home className="w-5 h-5" />
            </button>
          </Link> */}
        </div>
        <div className="text-gray-500 text-lg mb-4 font-archivo">
          <p className="max-w-7xl mx-auto text-center">
            Review your selections below and submit your details. A member of
            our team will contact you shortly to have a conversation and discuss
            next steps. No payment required at this stage. Thanks for your
            interest!
          </p>
        </div>

        {cartItems && cartItems.length > 0 ? (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100"
                >
                  {/* Image */}
                  <div className="w-24 h-24 md:w-32 md:h-32 shrink-0 rounded-lg overflow-hidden bg-gray-100">
                    {item.image && (
                      <Image
                        src={item.image}
                        width={128}
                        height={128}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-semibold text-gray-800 font-archivo">
                        {item.name}
                      </h3>
                      <button
                        onClick={() => handleItemDelete(item.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors p-1"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Configuration */}
                    <div className="mt-2 space-y-1">
                      {renderConfiguration(item)}
                    </div>

                    {/* Quantity and Price */}
                    <div className="mt-auto pt-4 flex items-center justify-between">
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 bg-gray-100 rounded-lg">
                        <button
                          onClick={() => handleItemDecrement(item.id)}
                          className="p-2 hover:bg-gray-200 rounded-l-lg transition-colors"
                          disabled={item.qty <= 1}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="px-4 font-semibold">{item.qty}</span>
                        <button
                          onClick={() => handleItemIncrement(item.id)}
                          className="p-2 hover:bg-gray-200 rounded-r-lg transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Price */}
                      <p className="text-xl font-bold text-[#4E7302]">
                        ${(item.price * item.qty).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Empty Cart Button */}
              <button
                onClick={handleEmptyCart}
                className="text-red-500 hover:text-red-600 text-sm font-medium flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Empty Cart
              </button>
            </div>

            {/* Summary & Quote Form */}
            <div className="space-y-6">
              {/* Order Summary */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-800 mb-4 font-archivo">
                  Order Summary
                </h2>
                <ul className="text-gray-700 space-y-3">
                  <li className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-semibold">
                      ${suBtotal.toLocaleString()}
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span>Estimated Shipping</span>
                    <span className="font-semibold">
                      ${shippingCost.toLocaleString()}
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span>Tax (13% HST)</span>
                    <span className="font-semibold">${tax}</span>
                  </li>
                  <hr className="border-gray-200 my-2" />
                  <li className="flex justify-between text-lg font-semibold">
                    <span>Estimated Total*</span>
                    <span className="text-[#4E7302]">${totalCost}</span>
                  </li>
                </ul>

                {/* Request Quote Button */}
                <button
                  onClick={() => setShowQuoteForm(true)}
                  className="w-full mt-6 bg-black/90 hover:bg-[#3d5a02] text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  Send Quote Request
                </button>

                {/* Checkout Button - Hidden by feature flag */}
                {ENABLE_CHECKOUT && (
                  <>
                    <div className="text-center my-3 text-gray-400 text-sm">
                      or
                    </div>
                    <button
                      onClick={handleBuyNow}
                      className="w-full bg-gray-800 hover:bg-gray-900 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                    >
                      Proceed to Checkout
                    </button>
                  </>
                )}

                <Link href="/saunas">
                  <button className="w-full mt-3 bg-transparent hover:bg-gray-100 text-gray-700 font-medium py-2 px-6 rounded-lg border border-gray-300 transition-colors">
                    Continue Shopping
                  </button>
                </Link>
              </div>

              {/* Quote Form Modal/Inline */}
              {showQuoteForm && (
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <h2 className="text-xl font-bold text-gray-800 mb-4 font-archivo">
                    Your Contact Information
                  </h2>
                  <p className="text-gray-600 text-sm mb-4">
                    Fill in your details and we&apos;ll send you a personalized
                    quote.
                  </p>
                  <form onSubmit={handleRequestQuote} className="space-y-4">
                    <div>
                      <label
                        htmlFor="quote-name"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Name *
                      </label>
                      <input
                        type="text"
                        id="quote-name"
                        name="name"
                        value={quoteForm.name}
                        onChange={handleQuoteFormChange}
                        required
                        placeholder="Your full name"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4E7302] focus:border-transparent outline-none"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="quote-email"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Email *
                      </label>
                      <input
                        type="email"
                        id="quote-email"
                        name="email"
                        value={quoteForm.email}
                        onChange={handleQuoteFormChange}
                        required
                        placeholder="your@email.com"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4E7302] focus:border-transparent outline-none"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="quote-phone"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Phone *
                      </label>
                      <input
                        type="tel"
                        id="quote-phone"
                        name="phone"
                        value={quoteForm.phone}
                        onChange={handleQuoteFormChange}
                        required
                        placeholder="(xxx) xxx-xxxx"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4E7302] focus:border-transparent outline-none"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="quote-postalcode"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Postal Code *
                      </label>
                      <input
                        type="text"
                        id="quote-postalcode"
                        name="postalcode"
                        value={quoteForm.postalcode}
                        onChange={handleQuoteFormChange}
                        required
                        placeholder="A1A 1A1"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4E7302] focus:border-transparent outline-none"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="quote-address"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Address *
                      </label>
                      <input
                        type="text"
                        id="quote-address"
                        name="address"
                        value={quoteForm.address}
                        onChange={handleQuoteFormChange}
                        required
                        placeholder="123 Main St"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4E7302] focus:border-transparent outline-none"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="quote-city"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        City *
                      </label>
                      <input
                        type="text"
                        id="quote-city"
                        name="city"
                        value={quoteForm.city}
                        onChange={handleQuoteFormChange}
                        required
                        placeholder="Toronto"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4E7302] focus:border-transparent outline-none"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="quote-province"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Province *
                      </label>
                      <input
                        type="text"
                        id="quote-province"
                        name="province"
                        value={quoteForm.province}
                        onChange={handleQuoteFormChange}
                        required
                        placeholder="ON"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4E7302] focus:border-transparent outline-none"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="quote-message"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Additional Notes
                      </label>
                      <textarea
                        id="quote-message"
                        name="message"
                        value={quoteForm.message}
                        onChange={handleQuoteFormChange}
                        rows="3"
                        placeholder="Any questions or special requirements?"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4E7302] focus:border-transparent outline-none resize-none"
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setShowQuoteForm(false)}
                        className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 bg-[#4E7302] hover:bg-[#3d5a02] text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {isSubmitting ? "Sending..." : "Submit"}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Empty Cart State */
          <div className="text-center py-20">
            <ShoppingBag className="w-20 h-20 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">
              Your cart is empty
            </h2>
            <p className="text-gray-500 mb-8">
              Looks like you haven&apos;t added any saunas yet.
            </p>
            <Link href="/saunas">
              <button className="bg-[#4E7302] hover:bg-[#3d5a02] text-white font-semibold py-3 px-8 rounded-lg transition-colors">
                Browse Saunas
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
