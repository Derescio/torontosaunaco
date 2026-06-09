const CLICK_ID_KEYS = ["gclid", "fbclid", "msclkid", "ttclid", "wbraid", "gbraid"];
const GOOGLE_ADS_KEYS = ["gad_source", "gad_campaignid"];
const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
];
const ATTRIBUTION_KEYS = [...UTM_KEYS, ...CLICK_ID_KEYS, ...GOOGLE_ADS_KEYS];
const FIRST_TOUCH_STORAGE_KEY = "ts_first_touch_attribution";

const METADATA_KEYS = ["firstTouchAt", "firstTouchPath", "firstTouchUrl"];

export function readClickIdsFromSearch(searchParams) {
  if (!searchParams) return {};
  const payload = {};
  for (const key of [...CLICK_ID_KEYS, ...GOOGLE_ADS_KEYS]) {
    const value = searchParams.get(key);
    if (value) payload[key] = value;
  }
  return payload;
}

export function readUtmsFromSearch(searchParams) {
  if (!searchParams) return {};
  const payload = {};
  for (const key of UTM_KEYS) {
    const value = searchParams.get(key);
    if (value) payload[key] = value;
  }
  return payload;
}

export function readAttributionFromLocation() {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  return {
    ...readUtmsFromSearch(params),
    ...readClickIdsFromSearch(params),
  };
}

function readStoredFirstTouchRaw() {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(FIRST_TOUCH_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeStoredFirstTouchRaw(value) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(FIRST_TOUCH_STORAGE_KEY, JSON.stringify(value));
  } catch {
    // ignore storage failures (private mode / blocked storage)
  }
}

export function getStoredFirstTouchAttribution() {
  const stored = readStoredFirstTouchRaw();
  const attribution = {};
  for (const key of ATTRIBUTION_KEYS) {
    if (stored[key]) attribution[key] = stored[key];
  }
  return attribution;
}

export function captureFirstTouchAttribution() {
  if (typeof window === "undefined") return getStoredFirstTouchAttribution();

  const fromUrl = readAttributionFromLocation();
  if (Object.keys(fromUrl).length === 0) {
    return getStoredFirstTouchAttribution();
  }

  const stored = readStoredFirstTouchRaw();
  const next = { ...stored };
  let addedNewValue = false;

  for (const [key, value] of Object.entries(fromUrl)) {
    if (!next[key]) {
      next[key] = value;
      addedNewValue = true;
    }
  }

  if (!next.firstTouchAt && addedNewValue) {
    next.firstTouchAt = new Date().toISOString();
    next.firstTouchPath = window.location.pathname;
    next.firstTouchUrl = window.location.href;
  }

  if (addedNewValue) {
    writeStoredFirstTouchRaw(next);
  }

  return getStoredFirstTouchAttribution();
}

export function getAttributionForSubmission() {
  const stored = getStoredFirstTouchAttribution();
  const fromUrl = readAttributionFromLocation();
  const merged = {};

  for (const key of ATTRIBUTION_KEYS) {
    const value = stored[key] || fromUrl[key];
    if (value) merged[key] = value;
  }

  return merged;
}

export function buildQuoteSubmissionId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `quote_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export function pushDataLayerEvent(eventName, payload = {}) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: eventName,
    ...payload,
  });
}
