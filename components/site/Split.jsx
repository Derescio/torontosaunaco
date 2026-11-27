import SiteImage from "./SiteImage";
import { cn } from "../../lib/site/cn";

// Photo and content side by side on desktop, stacked below. Literal aspect classes so Tailwind generates them.
const ASPECT = { "4/5": "aspect-[4/5]", "3/2": "aspect-[3/2]", "4/3": "aspect-[4/3]" };

export function Photo({ image, aspect = "4/5", priority = false, sizes = "(min-width: 998px) 50vw, 100vw", className }) {
  return (
    <figure className={cn("relative overflow-hidden rounded-card", ASPECT[aspect], className)}>
      <SiteImage src={image.src} alt={image.alt} fill sizes={sizes} priority={priority} className="object-cover" />
    </figure>
  );
}

export default function Split({ image, imageSide = "left", dark = false, aspect = "4/5", priority = false, children, className }) {
  return (
    <div className={cn("grid items-center gap-10 desktop:grid-cols-2 desktop:gap-16", dark && "text-cream", className)}>
      <Photo image={image} aspect={aspect} priority={priority} className={imageSide === "right" ? "desktop:order-2" : undefined} />
      <div className="flex flex-col gap-5">{children}</div>
    </div>
  );
}
