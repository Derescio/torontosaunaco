"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import posthog from "posthog-js";
import { posthogEvents } from "@/assets/utils/posthogEvents";
import { buildPosthogContext } from "@/assets/utils/posthogContext";

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
  const maxDepthSeen = useRef(0);
  const interactionSeen = useRef(false);
  const routeStartMs = useRef(0);

  const fireEngaged = (trigger) => {
    if (hasSentEngaged.current) return;
    hasSentEngaged.current = true;

    const timeOnPageS = Math.round((Date.now() - routeStartMs.current) / 1000);
    const eventPayload = {
      ...buildPosthogContext(pathname),
      trigger,
      time_on_page_s: Math.max(timeOnPageS, 0),
      scroll_depth_pct: maxDepthSeen.current,
      interaction: interactionSeen.current,
    };

    try {
      posthog.capture(posthogEvents.engaged, eventPayload);
    } catch (e) {
      console.error("Error capturing engaged event:", e);
    }
  };

  useEffect(() => {
    hasSentEngaged.current = false;
    maxDepthSeen.current = 0;
    interactionSeen.current = false;
    routeStartMs.current = Date.now();
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => {
      const depth = getScrollDepthPercent();
      if (depth > maxDepthSeen.current) {
        maxDepthSeen.current = depth;
      }
      if (depth < 30) return;
      fireEngaged("scroll");
    };

    const handleInteraction = () => {
      interactionSeen.current = true;
      const timeOnPageS = Math.round(
        (Date.now() - routeStartMs.current) / 1000,
      );
      if (timeOnPageS >= 10) {
        fireEngaged("interaction_and_time");
      }
    };

    const timeThresholdTimer = window.setTimeout(() => {
      fireEngaged("time_on_page");
    }, 10000);

    window.addEventListener("scroll", handleScroll, { passive: true });
    document.addEventListener("click", handleInteraction, true);
    document.addEventListener("keydown", handleInteraction, true);

    return () => {
      window.clearTimeout(timeThresholdTimer);
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("click", handleInteraction, true);
      document.removeEventListener("keydown", handleInteraction, true);
    };
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
        link.textContent?.trim() ||
        link.getAttribute("aria-label") ||
        "quote_cta";

      try {
        posthog.capture(posthogEvents.cta_clicked, {
          ...buildPosthogContext(pathname),
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
