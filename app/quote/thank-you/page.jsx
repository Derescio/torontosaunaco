"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import posthog from "posthog-js";
import { posthogEvents } from "@/assets/utils/posthogEvents";
import { buildPosthogContext } from "@/assets/utils/posthogContext";
import { pushDataLayerEvent } from "@/assets/utils/marketingAttribution";

export default function QuoteThankYouPage() {
  const searchParams = useSearchParams();
  const submissionId = searchParams.get("submission") || "";

  useEffect(() => {
    const dedupeKey = submissionId
      ? `quote_thank_you_${submissionId}`
      : "quote_thank_you_generic";

    if (window.sessionStorage.getItem(dedupeKey)) {
      return;
    }
    window.sessionStorage.setItem(dedupeKey, "1");

    const fireThankYouEvents = async (attribution = {}) => {
      toast.success("Your quote request was submitted successfully.");

      try {
        posthog.capture(posthogEvents.quote_thank_you_viewed, {
          ...buildPosthogContext("/quote/thank-you"),
          form_id: "quote-contact-form",
          submission_id: submissionId || undefined,
          step: "thank_you_page_view",
          ...attribution,
        });
      } catch {}

      pushDataLayerEvent("quote_thank_you_viewed", {
        submission_id: submissionId || undefined,
        ...attribution,
      });
    };

    if (!submissionId) {
      fireThankYouEvents();
      return;
    }

    fetch(`/api/marketing/submissions/${encodeURIComponent(submissionId)}/thank-you`, {
      method: "POST",
    })
      .then((res) => res.json())
      .then((data) => {
        const attribution = data?.submission?.attribution || {};
        return fireThankYouEvents(attribution);
      })
      .catch(() => fireThankYouEvents());
  }, [submissionId]);

  return (
    <main className="mx-auto max-w-3xl px-4 py-16 text-center">
      <h1 className="text-4xl font-semibold text-gray-900">Thank You</h1>
      <p className="mt-4 text-lg text-gray-700">
        Your quote request has been submitted. Our team will reach out shortly.
      </p>
      <div className="mt-8">
        <Link href="/" className="rounded-md bg-black px-5 py-3 text-white">
          Return Home
        </Link>
      </div>
    </main>
  );
}
