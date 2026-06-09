"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { captureFirstTouchAttribution } from "@/assets/utils/marketingAttribution";

export default function AttributionCapture() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    captureFirstTouchAttribution();
  }, [pathname, searchParams]);

  return null;
}
