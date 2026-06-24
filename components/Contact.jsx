"use client";
import { useState, useEffect, useRef } from "react";
import { FaInstagram } from "react-icons/fa";
import toast from "react-hot-toast";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import posthog from "posthog-js";
import { posthogEvents } from "@/assets/utils/posthogEvents";
import { buildPosthogContext } from "@/assets/utils/posthogContext";
import {
  buildQuoteSubmissionId,
  getAttributionForSubmission,
  pushDataLayerEvent,
} from "@/assets/utils/marketingAttribution";

const Contact = ({ defaultSubject = "" }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [subject, setSubject] = useState(defaultSubject);
  const hasTrackedFormStart = useRef(false);
  const hasSubmittedForm = useRef(false);
  const hasTrackedAbandoned = useRef(false);
  const lastFieldFocused = useRef("unknown");

  const isQuotePage = pathname === "/quote";

  const getFormIdByPath = () => {
    if (isQuotePage) return "quote-contact-form";
    if (pathname === "/") return "home-contact-form";
    if (pathname?.startsWith("/heaters/")) return "heater-contact-form";
    return "contact-form";
  };

  // Update subject when defaultSubject prop changes
  useEffect(() => {
    setSubject(defaultSubject);
  }, [defaultSubject]);

  useEffect(() => {
    return () => {
      if (
        hasTrackedAbandoned.current ||
        !hasTrackedFormStart.current ||
        hasSubmittedForm.current
      ) {
        return;
      }

      hasTrackedAbandoned.current = true;
      try {
        posthog.capture(posthogEvents.quote_abandoned, {
          ...buildPosthogContext(pathname),
          form_id: getFormIdByPath(),
          step: lastFieldFocused.current,
          reason: "unmount_before_submit",
        });
      } catch {}
    };
  }, [pathname]);

  const handleFormStart = (event) => {
    if (event?.target?.name) {
      lastFieldFocused.current = event.target.name;
    }
    if (hasTrackedFormStart.current) return;
    hasTrackedFormStart.current = true;

    const eventPayload = {
      ...buildPosthogContext(pathname),
      form_id: getFormIdByPath(),
    };

    try {
      posthog.capture(posthogEvents.quote_form_started, eventPayload);
    } catch (e) {
      console.error("Error capturing quote form started event:", e);
    }
  };

  const sendEmails = async (e) => {
    e.preventDefault();
    setLoading(true);
    hasSubmittedForm.current = true;

    const attribution = getAttributionForSubmission();
    const submissionId = buildQuoteSubmissionId();

    const formData = {
      submissionId,
      name: e.target.name.value,
      email: e.target.email.value,
      phone: e.target.phone?.value || "",
      postalcode: e.target.postalcode?.value || "",
      message: e.target.message.value,
      subject: subject || e.target.subject.value,
      isConsultation: false,
      attribution,
      sourcePath: pathname,
      formId: getFormIdByPath(),
      formType: isQuotePage ? "quote" : "general_contact",
    };

    try {
      const res = await fetch("/api/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const dataResponse = await res.json();
      if (dataResponse.message === "Email sent successfully!") {
        try {
          posthog.capture(posthogEvents.quote_form_submitted, {
            ...buildPosthogContext(pathname),
            form_id: getFormIdByPath(),
            submission_id: submissionId,
            estimated_value_bucket: "unknown",
            subject: subject || e.target.subject.value,
            ...attribution,
          });
        } catch {}

        pushDataLayerEvent("quote_submitted", {
          submission_id: submissionId,
          form_id: getFormIdByPath(),
          form_type: isQuotePage ? "quote" : "general_contact",
          subject: subject || e.target.subject.value,
          ...attribution,
        });

        router.replace(
          `/quote/thank-you?submission=${encodeURIComponent(submissionId)}`
        );
        return;
      } else {
        try {
          posthog.capture(posthogEvents.quote_field_error, {
            ...buildPosthogContext(pathname),
            form_id: getFormIdByPath(),
            step: "submit",
            error_type: "api_response_error",
          });
        } catch {}
        toast.error("Error sending email. Please try again later.");
      }
    } catch (error) {
      try {
        posthog.capture(posthogEvents.quote_field_error, {
          ...buildPosthogContext(pathname),
          form_id: getFormIdByPath(),
          step: "submit",
          error_type: "network_or_server_error",
        });
      } catch {}
      console.error("Error sending emails:", error);
      toast.error("Error sending email. Please try again later.");
    }
    setLoading(false);
  };

  return (
    <div className="mb-12  mt-0.5 relative min-h-[600px]">
      {loading && (
        <div className="fixed top-0 left-0 z-50 flex h-full w-full flex-col items-center justify-center bg-black/50 px-6 text-center">
          <div className="h-16 w-16 animate-spin rounded-full border-t-2 border-b-2 border-white" />
          <p className="mt-6 max-w-sm text-base font-medium text-white">
            Sending your request...
          </p>
        </div>
      )}

      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/Studio_Side.JPG"
          alt="Sauna Studio Background"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/60"></div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {/* Left Column - Company Info */}
            <div className="bg-white/95 backdrop-blur-sm rounded-xl p-8 shadow-xl">
              <h1 className="text-gray-800 text-3xl font-light mb-4 text-center font-archivo">
                Contact Us
              </h1>
              <p className="text-sm text-gray-600 mt-4 leading-relaxed text-center font-archivo">
                Toronto Sauna Co is always within reach to help you with your
                questions or thoughts. Reach out to us on Instagram or send us
                an email. We wold love to help you with your sauna needs.
              </p>
              {/* <div className="mt-8">
                <Link
                  href="/consultation"
                  className="inline-block bg-black text-white px-6 py-3 rounded-xl hover:bg-[#f9bd63] transition-colors"
                >
                  Book a Consultation →
                </Link>
              </div> */}
              <div className="mt-6 flex items-center justify-center gap-3">
                <h2 className="text-gray-800 text-base font-medium font-archivo">
                  Socials:
                </h2>
                <a
                  href="https://www.instagram.com/thetorontosaunaco/"
                  alt="Instagram Link"
                  aria-label="Instagram Link"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#e6e6e6cf] h-10 w-10 rounded-full flex items-center justify-center shrink-0 hover:bg-[#f9bd63] transition-colors cursor-pointer"
                >
                  <FaInstagram className="text-gray-700" />
                </a>
              </div>
              {/* Add the Image from the background in this area */}
              <div className="relative h-64 md:h-72 overflow-hidden mt-2 rounded-lg">
                <Image
                  src="/images/Studio_Max.JPG"
                  alt="Sauna Studio Background"
                  fill
                  className="object-cover"
                  priority
                  sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                />
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <h2 className="text-white text-2xl font-medium font-archivo">
                    Toronto Sauna Co.
                  </h2>
                </div>
              </div>
            </div>

            {/* Right Column - Contact Form */}
            <div className="bg-white/95 backdrop-blur-sm rounded-xl p-8 shadow-xl">
              <form
                className="space-y-4"
                onSubmit={sendEmails}
                onFocusCapture={handleFormStart}
                onInputCapture={handleFormStart}
              >
                <input
                  type="text"
                  placeholder="Name"
                  id="name"
                  name="name"
                  autoComplete="name"
                  required
                  className="w-full text-gray-800 rounded-lg py-3 px-4 border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-[#4E7302] focus:border-transparent transition-all bg-white"
                />
                <input
                  type="email"
                  placeholder="Email"
                  id="email"
                  name="email"
                  autoComplete="email"
                  required
                  className="w-full text-gray-800 rounded-lg py-3 px-4 border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-[#4E7302] focus:border-transparent transition-all bg-white"
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  id="phone"
                  name="phone"
                  autoComplete="tel"
                  required
                  className="w-full text-gray-800 rounded-lg py-3 px-4 border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-[#4E7302] focus:border-transparent transition-all bg-white"
                />
                <input
                  type="text"
                  placeholder="Postal Code"
                  id="postalcode"
                  name="postalcode"
                  autoComplete="postal-code"
                  required
                  className="w-full text-gray-800 rounded-lg py-3 px-4 border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-[#4E7302] focus:border-transparent transition-all bg-white"
                />
                <input
                  type="text"
                  placeholder="Subject"
                  id="subject"
                  name="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  className="w-full text-gray-800 rounded-lg py-3 px-4 border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-[#4E7302] focus:border-transparent transition-all bg-white"
                />
                <textarea
                  placeholder="Message"
                  rows="6"
                  id="message"
                  name="message"
                  required
                  className="w-full text-gray-800 rounded-lg py-3 px-4 border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-[#4E7302] focus:border-transparent transition-all resize-none bg-white"
                ></textarea>
                <button
                  type="submit"
                  disabled={loading}
                  className="text-white bg-black hover:bg-[#4E7302] rounded-xl text-sm px-6 py-3 w-full !mt-6 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-md hover:shadow-lg"
                >
                  {loading ? "Sending..." : "Send Message"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
