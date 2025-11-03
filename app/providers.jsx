// app/providers.js
"use client";
import { PostHogProvider } from "@posthog/react";
import posthog from "posthog-js";

if (typeof window !== "undefined" && !posthog.__loaded) {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com",
    capture_pageview: false, // we’ll trigger pageviews manually in _app or layouts
  });
  posthog.__loaded = true;
}

export function PHProvider({ children }) {
  return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}
