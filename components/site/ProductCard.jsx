import Link from "next/link";
import { Html } from "./Blocks";
import { Photo } from "./Split";

// A recommended-sauna card from a design card block: [image, name, size, price]. The price is the design's (owner,
// 2026-11-26: these cards show the design prices, not MongoDB's).
export default function ProductCard({ card }) {
  const [image, name, size, price] = card.blocks;
  return (
    <Link href={card.href} className="group flex flex-col gap-3">
      <Photo image={image} aspect="4/3" sizes="(min-width: 998px) 25vw, 100vw" className="transition-opacity group-hover:opacity-90" />
      <div className="flex flex-col gap-1">
        <Html html={name.html} className="font-display text-title text-ink [&_strong]:font-medium" />
        <Html html={size.html} className="text-small text-taupe-500" />
        <Html html={price.html} className="text-body text-ink [&_strong]:font-semibold" />
      </div>
    </Link>
  );
}
