// app/providers.js
"use client";
import { PostHogProvider } from "@posthog/react";
import posthog from "posthog-js";
import { useEffect } from "react";

export function PHProvider({ children }) {
  useEffect(() => {
    if (typeof window !== "undefined" && !posthog.__loaded) {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
        person_profiles: "identified_only",
        capture_pageview: false,
        // advanced_disable_decide: true,
      })
      posthog.__loaded = true
    }
  }, [])

  return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}
