"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import posthog from "posthog-js";
import { posthogEvents } from "@/assets/utils/posthogEvents";
import { buildPosthogContext } from "@/assets/utils/posthogContext";
import {
  buildQuoteSubmissionId,
  getAttributionForSubmission,
  pushDataLayerEvent,
} from "@/assets/utils/marketingAttribution";
import {
  INTERIOR_FINISH_OPTIONS,
  PROJECT_TYPES,
  buildCustomBuildMessage,
  isCustomBuildProjectType,
} from "@/lib/customBuilds/quoteDetails";

const FORM_ID = "custom-builds-quote-form";
const inputClassName =
  "w-full rounded-sm border border-[#2C2620] bg-[#0E0C0A] px-4 py-3 text-sm text-[#F3EFE7] outline-none transition-colors placeholder:text-[#A89C8E]/70 focus:border-[#D9A97D]";
const sectionLabelClassName =
  "mb-3 block text-xs font-semibold uppercase tracking-[0.1em] text-[#D9A97D]";
const fieldLabelClassName = "mb-2 block text-xs tracking-wide text-[#A89C8E]";

const CustomBuildsQuoteForm = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [projectType, setProjectType] = useState("residential");
  const hasTrackedFormStart = useRef(false);
  const hasSubmittedForm = useRef(false);
  const hasTrackedAbandoned = useRef(false);
  const lastFieldFocused = useRef("unknown");

  useEffect(() => {
    const typeFromUrl = searchParams.get("type");
    if (isCustomBuildProjectType(typeFromUrl)) {
      setProjectType(typeFromUrl);
    }
  }, [searchParams]);

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
          form_id: FORM_ID,
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

    try {
      posthog.capture(posthogEvents.quote_form_started, {
        ...buildPosthogContext(pathname),
        form_id: FORM_ID,
      });
    } catch (error) {
      console.error("Error capturing quote form started event:", error);
    }
  };

  const sendQuote = async (event) => {
    event.preventDefault();
    setLoading(true);
    hasSubmittedForm.current = true;

    const form = event.target;
    const attribution = getAttributionForSubmission();
    const submissionId = buildQuoteSubmissionId();
    const interiorFinish = form.interiorFinish.value;
    const lengthFt = form.lengthFt.value;
    const widthFt = form.widthFt.value;
    const heightFt = form.heightFt.value;
    const notes = form.notes.value;
    const message = buildCustomBuildMessage({
      projectType,
      interiorFinish,
      lengthFt,
      widthFt,
      heightFt,
      notes,
    });
    const projectLabel =
      PROJECT_TYPES.find((option) => option.value === projectType)?.label ||
      "Custom";

    const formData = {
      submissionId,
      name: form.name.value,
      email: form.email.value,
      phone: form.phone.value,
      address: form.address.value,
      message,
      subject: `Custom Build Quote - ${projectLabel}`,
      isCustomBuild: true,
      formType: "custom_build",
      formId: FORM_ID,
      sourcePath: pathname,
      attribution,
      projectType,
      interiorFinish,
      lengthFt,
      widthFt,
      heightFt,
      notes,
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
            form_id: FORM_ID,
            submission_id: submissionId,
            estimated_value_bucket: "unknown",
            subject: formData.subject,
            ...attribution,
          });
        } catch {}

        pushDataLayerEvent("quote_submitted", {
          submission_id: submissionId,
          form_id: FORM_ID,
          form_type: "custom_build",
          subject: formData.subject,
          ...attribution,
        });

        router.replace(
          `/quote/thank-you?submission=${encodeURIComponent(submissionId)}`
        );
        return;
      }

      try {
        posthog.capture(posthogEvents.quote_field_error, {
          ...buildPosthogContext(pathname),
          form_id: FORM_ID,
          step: "submit",
          error_type: "api_response_error",
        });
      } catch {}
      toast.error("Error sending email. Please try again later.");
    } catch (error) {
      try {
        posthog.capture(posthogEvents.quote_field_error, {
          ...buildPosthogContext(pathname),
          form_id: FORM_ID,
          step: "submit",
          error_type: "network_or_server_error",
        });
      } catch {}
      console.error("Error sending custom build quote:", error);
      toast.error("Error sending email. Please try again later.");
    }
    setLoading(false);
  };

  return (
    <>
      {loading && (
        <div className="fixed top-0 left-0 z-50 flex h-full w-full flex-col items-center justify-center bg-black/50 px-6 text-center">
          <div className="h-16 w-16 animate-spin rounded-full border-t-2 border-b-2 border-white" />
          <p className="mt-6 max-w-sm text-base font-medium text-white">
            Sending your request...
          </p>
        </div>
      )}

      <form
        className="space-y-5"
        onSubmit={sendQuote}
        onFocusCapture={handleFormStart}
        onInputCapture={handleFormStart}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="custom-build-name" className={fieldLabelClassName}>
              Name
            </label>
            <input
              type="text"
              placeholder="Your name"
              id="custom-build-name"
              name="name"
              autoComplete="name"
              required
              className={inputClassName}
            />
          </div>
          <div>
            <label htmlFor="custom-build-email" className={fieldLabelClassName}>
              Email
            </label>
            <input
              type="email"
              placeholder="you@email.com"
              id="custom-build-email"
              name="email"
              autoComplete="email"
              required
              className={inputClassName}
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="custom-build-phone" className={fieldLabelClassName}>
              Phone
            </label>
            <input
              type="tel"
              placeholder="(___) ___-____"
              id="custom-build-phone"
              name="phone"
              autoComplete="tel"
              required
              className={inputClassName}
            />
          </div>
          <div>
            <label htmlFor="custom-build-address" className={fieldLabelClassName}>
              Full Address
            </label>
            <input
              type="text"
              placeholder="Street, City, Province, Postal Code"
              id="custom-build-address"
              name="address"
              autoComplete="street-address"
              required
              className={inputClassName}
            />
          </div>
        </div>

        <div>
          <label htmlFor="custom-build-finish" className={sectionLabelClassName}>
            Interior Finish
          </label>
          <select
            id="custom-build-finish"
            name="interiorFinish"
            required
            defaultValue=""
            className={inputClassName}
          >
            <option value="" disabled className="bg-[#0E0C0A] text-[#F3EFE7]">
              Select a wood grade
            </option>
            {INTERIOR_FINISH_OPTIONS.map((option) => (
              <option
                key={option.value}
                value={option.value}
                className="bg-[#0E0C0A] text-[#F3EFE7]"
              >
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <p className={sectionLabelClassName}>Project Type</p>
          <div className="grid grid-cols-2 gap-3">
            {PROJECT_TYPES.map((option) => {
              const isActive = projectType === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setProjectType(option.value)}
                  className={`rounded-sm border px-4 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? "border-[#D9A97D] bg-[#D9A97D]/10 text-[#D9A97D]"
                      : "border-[#2C2620] bg-transparent text-[#A89C8E] hover:border-[#D9A97D]"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className={sectionLabelClassName}>Room Dimensions</p>
          <div className="grid gap-4 md:grid-cols-3">
            <label className="block">
              <span className="mb-2 flex items-center justify-between text-xs tracking-wide text-[#A89C8E]">
                Length <span className="text-[#A89C8E]/60">ft</span>
              </span>
              <input
                type="number"
                min="0"
                step="0.1"
                placeholder="0"
                id="custom-build-length"
                name="lengthFt"
                required
                className={inputClassName}
              />
            </label>
            <label className="block">
              <span className="mb-2 flex items-center justify-between text-xs tracking-wide text-[#A89C8E]">
                Width <span className="text-[#A89C8E]/60">ft</span>
              </span>
              <input
                type="number"
                min="0"
                step="0.1"
                placeholder="0"
                id="custom-build-width"
                name="widthFt"
                required
                className={inputClassName}
              />
            </label>
            <label className="block">
              <span className="mb-2 flex items-center justify-between text-xs tracking-wide text-[#A89C8E]">
                Ceiling Height <span className="text-[#A89C8E]/60">ft</span>
              </span>
              <input
                type="number"
                min="0"
                step="0.1"
                placeholder="0"
                id="custom-build-height"
                name="heightFt"
                className={inputClassName}
              />
            </label>
          </div>
        </div>

        <div>
          <label htmlFor="custom-build-notes" className={fieldLabelClassName}>
            Anything else we should know?
          </label>
          <textarea
            placeholder="Existing space, timeline, number of people, etc."
            rows="4"
            id="custom-build-notes"
            name="notes"
            className={`${inputClassName} min-h-[70px] resize-y`}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-sm bg-[#D9A97D] px-6 py-3.5 text-sm font-semibold text-[#0E0C0A] transition-colors hover:bg-[#e8bd97] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Sending..." : "Request My Quote"}
        </button>
      </form>
    </>
  );
};

export default CustomBuildsQuoteForm;
