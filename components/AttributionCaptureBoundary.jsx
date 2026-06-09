"use client";

import { Suspense } from "react";
import AttributionCapture from "@/components/AttributionCapture";

export default function AttributionCaptureBoundary() {
  return (
    <Suspense fallback={null}>
      <AttributionCapture />
    </Suspense>
  );
}
