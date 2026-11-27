"use client";

import Image from "next/image";

// Sanity's image CDN resizes and picks the format, so Vercel's image optimisation isn't used (cost rules).
// Callers pass a plain URL and size (worked out on the server), never the Sanity source object.
export function sanityLoader({ src, width, quality }) {
  return `${src}${src.includes("?") ? "&" : "?"}w=${width}&q=${quality ?? 75}&auto=format&fit=max`;
}

export default function SanityImage({ sizes, ...props }) {
  if (!sizes) throw new Error(`SanityImage: sizes is required (${props.src})`);
  return <Image loader={sanityLoader} sizes={sizes} {...props} />;
}
