"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import posthog from "posthog-js";
import { posthogEvents } from "@/assets/utils/posthogEvents";

function getScrollDepthPercent() {
  const doc = document.documentElement;
  const scrollTop = window.scrollY || doc.scrollTop || 0;
  const viewportHeight = window.innerHeight || doc.clientHeight || 0;
  const fullHeight = doc.scrollHeight || 0;
  const maxScrollable = Math.max(fullHeight - viewportHeight, 1);
  return Math.round((scrollTop / maxScrollable) * 100);
}

function inferCtaLocation(element) {
  if (element.closest("nav")) return "nav";
  if (element.closest("footer")) return "footer";
  if (element.closest("header")) return "header";
  return "content";
}

export default function PostHogFunnelSignals() {
  const pathname = usePathname();
  const hasSentEngaged = useRef(false);

  useEffect(() => {
    hasSentEngaged.current = false;
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => {
      if (hasSentEngaged.current) return;
      const depth = getScrollDepthPercent();
      if (depth < 50) return;

      hasSentEngaged.current = true;
      try {
        posthog.capture(posthogEvents.engaged, {
          page: pathname || window.location.pathname,
          scroll_depth: "50%",
          source: "scroll",
        });
      } catch {}
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  useEffect(() => {
    const handleClick = (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const link = target.closest("a[href]");
      if (!link) return;

      const href = link.getAttribute("href");
      if (!href || !href.startsWith("/quote")) return;

      const ctaText =
        link.textContent?.trim() || link.getAttribute("aria-label") || "quote_cta";

      try {
        posthog.capture(posthogEvents.cta_clicked, {
          page: pathname || window.location.pathname,
          cta_text: ctaText,
          cta_href: href,
          cta_location: inferCtaLocation(link),
        });
      } catch {}
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [pathname]);

  return null;
}
