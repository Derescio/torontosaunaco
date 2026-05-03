export function getPageType(pathname = "") {
  if (pathname === "/") return "home";
  if (pathname.startsWith("/quote")) return "quote";
  if (pathname.startsWith("/blog")) return "blog";
  if (
    pathname.startsWith("/saunas") ||
    pathname.startsWith("/heaters") ||
    pathname.startsWith("/showers") ||
    pathname.startsWith("/hot-tub") ||
    pathname.startsWith("/cold-plunge")
  ) {
    return "product";
  }
  if (pathname.startsWith("/service-areas")) return "service_area";
  return "other";
}

export function getLocationTag(pathname = "") {
  const lowered = pathname.toLowerCase();
  if (lowered.includes("toronto")) return "toronto";
  if (lowered.includes("whistler")) return "whistler";
  return "unknown";
}

export function getSourceTag() {
  if (typeof window === "undefined") return "unknown";

  const params = new URLSearchParams(window.location.search);
  const utmSource = params.get("utm_source");
  if (utmSource) return utmSource;

  if (!document.referrer) return "direct";

  try {
    const ref = new URL(document.referrer);
    if (ref.host === window.location.host) return "internal";
    return "referral";
  } catch {
    return "referral";
  }
}

export function buildPosthogContext(pathname = "") {
  const page = pathname || (typeof window !== "undefined" ? window.location.pathname : "");
  return {
    page,
    page_type: getPageType(page),
    location: getLocationTag(page),
    source: getSourceTag(),
  };
}

export function getEstimatedValueBucket(value) {
  if (typeof value !== "number" || Number.isNaN(value)) return "unknown";
  if (value < 5000) return "under_5k";
  if (value < 10000) return "5k_to_10k";
  if (value < 20000) return "10k_to_20k";
  if (value < 40000) return "20k_to_40k";
  return "40k_plus";
}
