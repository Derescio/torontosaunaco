"use client";

import Image from "next/image";

// Cloudinary resizes and picks the format, so Vercel's image optimisation isn't used (cost rules).
export function cloudinaryLoader({ src, width, quality }) {
  return src.replace("/upload/", `/upload/f_auto,q_${quality ?? "auto"},w_${width}/`);
}

export default function CloudinaryImage(props) {
  return <Image loader={cloudinaryLoader} {...props} />;
}
