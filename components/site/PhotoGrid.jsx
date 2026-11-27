import SiteImage from "./SiteImage";
import { cn } from "../../lib/site/cn";

// "strip": three equal photos. "gallery": the design's 11-photo mosaic (Wellness.dc.html .wg), placed by named
// areas so each breakpoint gets the design's own order with no gaps. Literal classes so Tailwind generates them.
const GALLERY_AREAS = "abcdefghijk".split("").map((a) => `[grid-area:${a}]`);
const GALLERY_GRID =
  "grid grid-cols-2 auto-rows-[200px] gap-4 [grid-template-areas:'a_c'_'a_c'_'b_d'_'g_f'_'g_f'_'e_h'_'j_j'_'i_k'] " +
  "desktop:grid-cols-4 desktop:auto-rows-[230px] desktop:[grid-template-areas:'a_b_c_d'_'a_e_c_f'_'g_h_i_f'_'g_j_j_k']";
// Tailwind scans source text, so the generated area classes are spelled out once here:
// [grid-area:a] [grid-area:b] [grid-area:c] [grid-area:d] [grid-area:e] [grid-area:f] [grid-area:g] [grid-area:h]
// [grid-area:i] [grid-area:j] [grid-area:k]

export default function PhotoGrid({ images, layout = "strip", className }) {
  if (layout === "gallery") {
    if (images.length !== GALLERY_AREAS.length) throw new Error(`PhotoGrid: the gallery needs 11 photos, got ${images.length}`);
    return (
      <div className={cn(GALLERY_GRID, className)}>
        {images.map((image, i) => (
          <figure key={i} className={cn("relative overflow-hidden rounded-card", GALLERY_AREAS[i])}>
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
