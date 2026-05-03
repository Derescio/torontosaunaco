"use client";
import { useRef, useState } from "react";
import toast from "react-hot-toast";
import posthog from "posthog-js";
import { usePathname } from "next/navigation";
import { posthogEvents } from "@/assets/utils/posthogEvents";

/**
 * ProductContactForm - Contact form for product inquiries
 * @param {Object} props
 * @param {Object} props.product - Product data
 * @param {number} props.totalPrice - Current total price
 * @param {string} props.selectedInstallation - Selected installation option
 */
const ProductContactForm = ({ product, totalPrice, selectedInstallation }) => {
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();
  const hasTrackedFormStart = useRef(false);

  const handleFormStart = () => {
    if (hasTrackedFormStart.current) return;
    hasTrackedFormStart.current = true;

    try {
      posthog.capture(posthogEvents.quote_form_started, {
        page: pathname || window.location.pathname,
        form_id: "sauna-product-contact-form",
        productId: product?._id,
      });
    } catch {}
  };

  const sendEmails = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = {
      name: e.target.name.value,
      email: e.target.email.value,
      phone: e.target.phone.value,
      postalcode: e.target.postalcode.value,
      message: e.target.message.value,
      subject: product?.name || "Product Inquiry",
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
        e.target.reset();
        try {
          posthog.capture(posthogEvents.quote_form_submitted, {
            productId: product?._id,
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
            productId: product?._id,
            installation: selectedInstallation || "unset",
          });
        } catch {}
      }
    } catch (error) {
      console.error("Error sending emails:", error);
      toast.error("Error sending email. Please try again later.", {
        duration: 2700,
      });
      try {
        posthog.captureException(error, {
          productId: product?._id,
          installation: selectedInstallation || "unset",
        });
      } catch {}
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 p-8 rounded-xl">
      <h2 className="text-2xl font-semibold text-gray-900 mb-2 font-archivo">
        Need More Information?
      </h2>
      <p className="text-gray-600 mb-6 font-archivo">
        Get in touch with us, send us an email.
      </p>
      <form
        onSubmit={sendEmails}
        onFocusCapture={handleFormStart}
        onInputCapture={handleFormStart}
        className="space-y-4"
      >
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
            disabled={loading}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4E7302] focus:border-transparent outline-none font-archivo disabled:opacity-50"
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
            disabled={loading}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4E7302] focus:border-transparent outline-none font-archivo disabled:opacity-50"
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
            disabled={loading}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4E7302] focus:border-transparent outline-none font-archivo disabled:opacity-50"
          />
        </div>
        <div>
          <label
            htmlFor="postalcode"
            className="block text-sm font-medium text-gray-700 mb-2 font-archivo"
          >
            Postal Code
          </label>
          <input
            type="text"
            id="postalcode"
            name="postalcode"
            required
            placeholder="Enter your postal code"
            disabled={loading}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4E7302] focus:border-transparent outline-none font-archivo disabled:opacity-50"
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
            disabled={loading}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4E7302] focus:border-transparent outline-none resize-none font-archivo disabled:opacity-50"
          ></textarea>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#4E7302]/80 hover:bg-[#4E7302]/90 text-white font-semibold py-3 px-6 rounded-lg transition-colors font-archivo disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Sending..." : "Send Message"}
        </button>
      </form>
    </div>
  );
};

export default ProductContactForm;
