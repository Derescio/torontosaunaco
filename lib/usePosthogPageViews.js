"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import posthog from "posthog-js";

export function usePosthogPageView() {
  const pathname = usePathname();

  useEffect(() => {
    posthog.capture("$pageview");
  }, [pathname]);
}
