import React from "react";
import PrintButton from "@/components/PrintButton";

const WarrantyPage = () => {
  const highlightCards = [
    { title: "Coverage", value: "1 year (residential)" },
    { title: "Region", value: "Canada (primary)" },
    { title: "Support", value: "Email + Phone" },
    // { title: "Response Time", value: "1–3 business days" },
  ];

  return (
    <div className="bg-white">
      {/* Hero / Title */}
      <section className="bg-slate-50 border-b">
        <div className="max-w-6xl mx-auto px-4 py-10 md:py-14">
          <h1 className="font-atkinson text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
            Warranty
          </h1>
          <p className="mt-3 text-base md:text-lg leading-7 text-gray-600 max-w-3xl">
            We stand behind the quality of our products. Below is a clear
            summary of what is covered and what is not.
          </p>
          <p className="mt-1 text-sm text-gray-500" aria-label="Last updated">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </section>

      {/* Highlights */}
      <section>
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {highlightCards.map((c) => (
              <div
                key={c.title}
                className="rounded-xl border bg-white p-5 shadow-sm"
              >
                <p className="text-sm text-gray-500">{c.title}</p>
                <p className="mt-1 text-lg font-semibold text-gray-900">
                  {c.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section>
        <div className="max-w-3xl mx-auto px-4 py-8 md:py-12 leading-7 text-gray-800">
          <h2 className="text-2xl font-semibold text-gray-900">
            Coverage Period
          </h2>
          <p className="mt-2">
            The Toronto Sauna Company warrants our saunas against defects in
            materials and workmanship under normal, residential use for{" "}
            <strong>one (1) year</strong> as applicable, from the date of
            receipt of the product by the original end-user purchaser.
          </p>

          <h2 className="mt-8 text-2xl font-semibold text-gray-900">
            What's Covered
          </h2>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>Manufacturing defects in materials and workmanship.</li>
            <li>
              Replacement or repair using new or refurbished parts at our
              discretion.
            </li>
            <li>Coverage applies to the original end-user purchaser only.</li>
          </ul>

          <h2 className="mt-8 text-2xl font-semibold text-gray-900">
            What's Not Covered
          </h2>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>Normal wear and tear, natural weather conditions.</li>
            <li>
              Damage resulting from misuse, negligence, improper installation,
              or alteration.
            </li>
            <li>
              Labor costs for third parties such as electricians or plumbers.
            </li>
          </ul>

          <h2 className="mt-8 text-2xl font-semibold text-gray-900">
            Required Maintenance
          </h2>
          <p className="mt-2">
            The following routine maintenance is required to keep your warranty
            valid. Failure to perform the required maintenance outlined in your
            assembly manual may void this warranty.
          </p>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>Tighten barrel bands as needed.</li>
            <li>
              Regular cleaning and, if applicable, staining or sealing of
              exterior wood.
            </li>
            <li>Follow your product's assembly and maintenance manual.</li>
          </ul>

          <h2 className="mt-8 text-2xl font-semibold text-gray-900">
            How Long Does Coverage Last?
          </h2>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>
              Warranty period: <strong>365 days</strong> from purchase date.
            </li>
            <li>
              A replacement part assumes the remaining warranty or{" "}
              <strong>365 days</strong>, whichever is longer.
            </li>
          </ul>

          {/* <h2 className="mt-8 text-2xl font-semibold text-gray-900">
            How to File a Claim
          </h2>
          <ol className="mt-2 list-decimal pl-5 space-y-1">
            <li>Gather your order number and proof of purchase.</li>
            <li>Take clear photos/videos of the issue and affected area.</li>
            <li>
              Describe the issue, when it started, and any troubleshooting
              already attempted.
            </li>
            <li>
              Contact us via{" "}
              <a
                className="underline text-blue-700 hover:text-blue-800"
                href="/quote"
              >
                our contact form
              </a>{" "}
              or email{" "}
              <a
                className="underline text-blue-700 hover:text-blue-800"
                href="mailto:info@thetorontosaunaco.com"
              >
                info@thetorontosaunaco.com
              </a>
              .
            </li>
          </ol> */}

          <h2 className="mt-8 text-2xl font-semibold text-gray-900">
            Limitations
          </h2>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>
              This warranty is non-transferable and applies to residential use
              only.
            </li>
            <li>
              manufacturer and associated retailers are not liable for any
              injury or damage caused by the product.
            </li>
          </ul>

          {/* Utilities */}
          <div className="mt-10 flex items-center gap-3">
            <PrintButton />
            {/* <a
              href="/pdf/warranty.pdf"
              target="_blank"
              className="inline-flex items-center rounded-lg bg-black text-white px-4 py-2 text-sm font-medium hover:bg-[#f6ba60] hover:text-black"
            >
              Download PDF
            </a> */}
          </div>
        </div>
      </section>
    </div>
  );
};

export default WarrantyPage;
