"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import posthog from "posthog-js";

export default function PosthogPageView() {
  const pathname = usePathname();

  useEffect(() => {
    posthog.capture("$pageview");
  }, [pathname]);

  return null; // nothing rendered
}
