import Link from "next/link";
import { urlFor } from "@/lib/sanity";
import SiteImage from "./SiteImage";
import SanityImage from "./SanityImage";
import { cn } from "../../lib/site/cn";

// A blog card (featured or grid) from lib/site/blog.js `toCard`. Design photos come from Cloudinary, other posts'
// photos from Sanity's CDN; posts without a photo get a plain linen block.

/** Width and height from a Sanity image reference ("image-<id>-<w>x<h>-<ext>"). */
export function sanityDims(source) {
  const m = String(source?.asset?._ref ?? "").match(/-(\d+)x(\d+)-[a-z]+$/);
  return m ? { width: Number(m[1]), height: Number(m[2]) } : null;
}

export function CardPhoto({ image, sizes, priority = false, className }) {
  const box = cn("relative aspect-[3/2] overflow-hidden rounded-card bg-linen", className);
  if (!image) return <div className={box} />;
  if (image.kind === "design") {
    return (
      <figure className={box}>
        <SiteImage src={image.src} alt={image.alt} fill sizes={sizes} priority={priority} className="object-cover" />
      </figure>
    );
  }
  return (
    <figure className={box}>
      <SanityImage src={urlFor(image.source).url()} alt={image.alt} fill sizes={sizes} priority={priority} className="object-cover" />
    </figure>
  );
}

const metaLine = (card, featured) => [featured && "Latest", card.category, card.date].filter(Boolean).join(" · ");

export default function PostCard({ card, featured = false, priority = false }) {
  const Title = featured ? "h2" : "h3";
  const text = (
    <div className={cn("flex flex-col", featured ? "gap-4" : "gap-2.5")}>
      {metaLine(card, featured) && (
        <p className="text-caption font-semibold uppercase tracking-caps text-walnut">{metaLine(card, featured)}</p>
      )}
      <Title className={cn("font-display font-medium text-ink", featured ? "text-display-sm" : "text-title")}>
        <Link href={card.href} className="hover:text-walnut">
          {card.title}
        </Link>
      </Title>
      {card.summary && <p className={cn("text-taupe-700", featured ? "text-body" : "text-small")}>{card.summary}</p>}
      <Link href={card.href} className="text-small font-semibold text-ink underline underline-offset-4 hover:text-walnut">
        Read the article<span className="sr-only">: {card.title}</span>
      </Link>
    </div>
  );
  if (featured) {
    return (
      <article className="grid items-center gap-8 desktop:grid-cols-2 desktop:gap-12">
        <CardPhoto image={card.image} sizes="(min-width: 998px) 50vw, 100vw" priority={priority} />
        {text}
      </article>
    );
  }
  return (
    <article className="flex flex-col gap-4">
      <CardPhoto image={card.image} sizes="(min-width: 998px) 25vw, (min-width: 520px) 50vw, 100vw" priority={priority} />
      {text}
    </article>
  );
}
