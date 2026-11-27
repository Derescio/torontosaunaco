import CloudinaryImage from "./CloudinaryImage";
import imageMap from "../../content/image-map.json";

// A design photo (src "./assets/<hash>.<ext>" from content/redesign/*.json), served from Cloudinary through
// content/image-map.json (npm run images:upload). The map stays on the server; only the URL and size reach the client.

export function imageFor(src) {
  const hash = String(src ?? "").match(/([0-9a-f]{32})\.(?:jpg|png|webp)$/)?.[1];
  const entry = hash && imageMap[hash];
  if (!entry) throw new Error(`SiteImage: no Cloudinary image for ${src} (run npm run images:upload)`);
  return { ...entry, hash };
}

export default function SiteImage({ src, alt, sizes, priority = false, fill = false, className }) {
  if (!sizes) throw new Error(`SiteImage: sizes is required (${src})`);
  const { url, width, height } = imageFor(src);
  const size = fill ? { fill: true } : { width, height };
  return <CloudinaryImage src={url} alt={alt ?? ""} sizes={sizes} priority={priority} className={className} {...size} />;
}
