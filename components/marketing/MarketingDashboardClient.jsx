"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MarketingDashboardTab from "./MarketingDashboardTab";
import MarketingPresetsTab from "./MarketingPresetsTab";
import { formatRelativeTime, formatSubmissionTime, presetToForm } from "./marketing-ui";

const VALID_TABS = ["dashboard", "presets"];

export default function MarketingDashboardClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const activeTab = VALID_TABS.includes(tabParam) ? tabParam : "dashboard";

  const [dashboard, setDashboard] = useState(null);
  const [forms, setForms] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [savingPlatform, setSavingPlatform] = useState("");
  const [copiedKey, setCopiedKey] = useState("");
  const [gtmLoaded, setGtmLoaded] = useState(false);

  const setActiveTab = useCallback(
    (tab) => {
      const params = new URLSearchParams(searchParams.toString());
      if (tab === "dashboard") {
        params.delete("tab");
      } else {
        params.set("tab", tab);
      }
      const query = params.toString();
      router.replace(query ? `/marketing?${query}` : "/marketing", { scroll: false });
    },
    [router, searchParams]
  );

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/marketing/dashboard");
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to load marketing dashboard");
      }
      setDashboard(data);
      const nextForms = {};
      for (const preset of data.presets || []) {
        nextForms[preset.platform] = presetToForm(preset);
      }
      setForms(nextForms);
    } catch (err) {
      setError(err.message || "Failed to load marketing dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    setGtmLoaded(
      Array.isArray(window.dataLayer) && window.dataLayer.length > 0
    );
  }, [refresh]);

  const trackingSteps = useMemo(() => {
    const steps = dashboard?.trackingSteps || {};
    return [
      { label: "Quote Form", success: steps.quoteForm },
      { label: "Form Submitted", success: steps.formSubmitted },
      { label: "Thank You Page", success: steps.thankYouPage },
      { label: "GTM Trigger Fired", success: steps.gtmTriggerFired },
      { label: "Conversion Sent", success: steps.conversionSent },
    ];
  }, [dashboard]);

  const allOperational = trackingSteps.every((step) => step.success);
  const lastSubmission = dashboard?.lastSubmission || null;
  const submissions = dashboard?.submissions || [];
  const lastTestLabel =
    formatRelativeTime(dashboard?.lastActivityAt) || "No tests yet";
  const lastSubmissionLabel = formatSubmissionTime(
    lastSubmission?.events?.submittedAt || lastSubmission?.createdAt
  );

  const handleFormChange = (platform, field, value) => {
    setForms((current) => ({
      ...current,
      [platform]: {
        ...current[platform],
        [field]: value,
      },
    }));
    setSaveMessage("");
  };

  const handleSavePlatform = async (platform) => {
    setSavingPlatform(platform);
    setSaveMessage("");
    try {
      const res = await fetch(`/api/marketing/platforms/${platform}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(forms[platform] || {}),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save platform preset");
      }
      setSaveMessage(`${data.preset?.label || platform} preset saved.`);
      await refresh();
    } catch (err) {
      setSaveMessage(err.message || "Failed to save platform preset");
    } finally {
      setSavingPlatform("");
    }
  };

  const handleCopy = async (value, key) => {
    if (!value) return;
    const text =
      value.startsWith("/") && typeof window !== "undefined"
        ? `${window.location.origin}${value}`
        : value;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(""), 2000);
    } catch {
      // ignore clipboard failures
    }
  };

  const gtmChecks = [
    {
      label: "Container Loaded",
      success: gtmLoaded,
    },
    {
      label: "Quote Submit Event",
      success: Boolean(lastSubmission?.events?.submittedAt),
    },
    {
      label: "Thank You Event",
      success: Boolean(lastSubmission?.events?.thankYouViewedAt),
    },
    {
      label: "Google Ads Conversion",
      success: Boolean(
        lastSubmission?.events?.submittedAt && lastSubmission?.attribution?.gclid
      ),
    },
    {
      label: "Facebook Pixel",
      success: Boolean(
        lastSubmission?.events?.thankYouViewedAt &&
          lastSubmission?.detectedPlatform === "facebook"
      ),
    },
    {
      label: "Instagram Pixel",
      success: Boolean(
        lastSubmission?.events?.thankYouViewedAt &&
          lastSubmission?.detectedPlatform === "instagram"
      ),
    },
  ];

  if (loading && !dashboard) {
    return (
      <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-8 text-center text-gray-600">
        Loading marketing dashboard...
      </section>
    );
  }

  if (error && !dashboard) {
    return (
      <section className="mt-6 rounded-2xl border border-red-200 bg-white p-8 text-center">
        <p className="text-red-600">{error}</p>
        <button
          type="button"
          onClick={refresh}
          className="mt-4 rounded-md border border-gray-300 px-4 py-2 text-sm"
        >
          Retry
        </button>
      </section>
    );
  }

  const platformStatusMap = Object.fromEntries(
    (dashboard?.platformStatus || []).map((item) => [item.platform, item])
  );

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
      <TabsList className="grid h-auto w-full max-w-md grid-cols-2 gap-1 rounded-lg bg-gray-200 p-1">
        <TabsTrigger
          value="dashboard"
          className="flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm"
        >
          {!allOperational && (
            <span
              className="h-2 w-2 shrink-0 rounded-full bg-amber-500"
              aria-label="Tracking incomplete"
            />
          )}
          {allOperational && (
            <span
              className="h-2 w-2 shrink-0 rounded-full bg-emerald-500"
              aria-label="All systems operational"
            />
          )}
          Dashboard
        </TabsTrigger>
        <TabsTrigger
          value="presets"
          className="rounded-md px-4 py-2 text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm"
        >
          Presets
        </TabsTrigger>
      </TabsList>

      <TabsContent value="dashboard" className="mt-6">
        <MarketingDashboardTab
          dashboard={dashboard}
          trackingSteps={trackingSteps}
          allOperational={allOperational}
          lastTestLabel={lastTestLabel}
          lastSubmissionLabel={lastSubmissionLabel}
          lastSubmission={lastSubmission}
          submissions={submissions}
          gtmChecks={gtmChecks}
          platformStatusMap={platformStatusMap}
          onRefresh={refresh}
          loading={loading}
        />
      </TabsContent>

      <TabsContent value="presets" className="mt-6">
        <MarketingPresetsTab
          presets={dashboard?.presets || []}
          forms={forms}
          platformStatusMap={platformStatusMap}
          savingPlatform={savingPlatform}
          saveMessage={saveMessage}
          copiedKey={copiedKey}
          onFormChange={handleFormChange}
          onSave={handleSavePlatform}
          onCopy={handleCopy}
        />
      </TabsContent>
    </Tabs>
  );
}
