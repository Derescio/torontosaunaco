import { MARKETING_PLATFORMS } from "@/models/MarketingPlatformPreset";

export const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
];

export const CLICK_ID_KEYS = [
  "gclid",
  "fbclid",
  "msclkid",
  "ttclid",
  "wbraid",
  "gbraid",
];

export const GOOGLE_ADS_KEYS = ["gad_source", "gad_campaignid"];

export const ATTRIBUTION_KEYS = [
  ...UTM_KEYS,
  ...CLICK_ID_KEYS,
  ...GOOGLE_ADS_KEYS,
];

export const PLATFORM_DEFAULTS = {
  google: {
    platform: "google",
    label: "Google Ads",
    utm_source: "google",
    utm_medium: "cpc",
    utm_campaign: "",
    clickIdKey: "gclid",
    clickIdValue: "",
  },
  facebook: {
    platform: "facebook",
    label: "Facebook Ads",
    utm_source: "facebook",
    utm_medium: "cpc",
    utm_campaign: "",
    clickIdKey: "fbclid",
    clickIdValue: "",
  },
  instagram: {
    platform: "instagram",
    label: "Instagram Ads",
    utm_source: "instagram",
    utm_medium: "cpc",
    utm_campaign: "",
    clickIdKey: "fbclid",
    clickIdValue: "",
  },
  microsoft: {
    platform: "microsoft",
    label: "Microsoft Ads",
    utm_source: "microsoft",
    utm_medium: "cpc",
    utm_campaign: "",
    clickIdKey: "msclkid",
    clickIdValue: "",
  },
};

export function normalizeAttribution(raw = {}) {
  const attribution = {};
  for (const key of ATTRIBUTION_KEYS) {
    const value = raw[key];
    if (value) attribution[key] = String(value).trim();
  }
  return attribution;
}

export function detectPlatform(attribution = {}) {
  const utmSource = (attribution.utm_source || "").toLowerCase();

  if (attribution.gclid || attribution.gbraid || attribution.gad_source) {
    return "google";
  }
  if (utmSource === "instagram") return "instagram";
  if (attribution.fbclid || utmSource === "facebook") return "facebook";
  if (attribution.msclkid || utmSource === "microsoft") return "microsoft";

  return "unknown";
}

export function matchPresetPlatform(attribution = {}, presets = []) {
  const detected = detectPlatform(attribution);
  if (detected !== "unknown") {
    const exact = presets.find((preset) => preset.platform === detected);
    if (exact) return exact.platform;
  }

  for (const preset of presets) {
    const utmMatch = UTM_KEYS.every((key) => {
      const expected = preset[key];
      if (!expected) return true;
      return attribution[key] === expected;
    });

    const clickMatch =
      !preset.clickIdKey ||
      !preset.clickIdValue ||
      attribution[preset.clickIdKey] === preset.clickIdValue;

    if (utmMatch && clickMatch) {
      return preset.platform;
    }
  }

  return "";
}

export function buildQuoteTestUrl(preset = {}) {
  const params = new URLSearchParams();
  for (const key of UTM_KEYS) {
    if (preset[key]) params.set(key, preset[key]);
  }
  if (preset.clickIdKey && preset.clickIdValue) {
    params.set(preset.clickIdKey, preset.clickIdValue);
  }
  const query = params.toString();
  return query ? `/quote?${query}` : "/quote";
}

export function isPlatformCapturedToday(platform, submissions = []) {
  const today = new Date();
  return submissions.some((submission) => {
    if (submission.detectedPlatform !== platform) return false;
    const seenAt =
      submission.events?.thankYouViewedAt || submission.events?.submittedAt;
    if (!seenAt) return false;
    const date = new Date(seenAt);
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  });
}

export function isValidPlatform(platform) {
  return MARKETING_PLATFORMS.includes(platform);
}
