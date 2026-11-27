import SiteImage from "./SiteImage";
import { cn } from "../../lib/site/cn";

// "strip": three equal photos. "gallery": the design's 11-photo mosaic (Wellness), areas
// "a b c d / a e c f / g h i f / g j j k" on desktop, two columns below.
const GALLERY_SPANS = {
  0: "row-span-2", // a
  2: "row-span-2", // c
  5: "row-span-2", // f
  6: "row-span-2", // g
  9: "col-span-2", // j
};

export default function PhotoGrid({ images, layout = "strip", className }) {
  if (layout === "gallery") {
    return (
      <div className={cn("grid auto-rows-[200px] grid-cols-2 gap-4 desktop:auto-rows-[230px] desktop:grid-cols-4", className)}>
        {images.map((image, i) => (
          <figure key={i} className={cn("relative overflow-hidden rounded-card", GALLERY_SPANS[i])}>
            <SiteImage src={image.src} alt={image.alt} fill sizes="(min-width: 998px) 25vw, 50vw" className="object-cover" />
          </figure>
        ))}
      </div>
    );
  }
  return (
    <div className={cn("grid gap-4 desktop:grid-cols-3", className)}>
      {images.map((image, i) => (
        <figure key={i} className="relative aspect-[4/5] overflow-hidden rounded-card">
          <SiteImage src={image.src} alt={image.alt} fill sizes="(min-width: 998px) 33vw, 100vw" className="object-cover" />
        </figure>
      ))}
    </div>
  );
}
