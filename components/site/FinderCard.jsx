import Link from "next/link";
import SiteImage from "./SiteImage";
import { cn } from "../../lib/site/cn";

// One Sauna Finder result (lib/site/saunaFinder.js): product shot on white, badge, name, footprint, seats, price.
export default function FinderCard({ result }) {
  const strong = result.good && !result.badge.startsWith("Value pick");
  return (
    <Link
      href={result.href}
      className="group flex h-full flex-col overflow-hidden rounded-card border border-line bg-white transition-colors hover:border-line-strong"
    >
      <div className="relative aspect-square bg-white">
        <SiteImage
          src={result.img}
          alt={result.alt}
          fill
          sizes="(min-width: 998px) 25vw, 100vw"
          className="object-contain p-4 transition-transform group-hover:scale-[1.02]"
        />
        <span
          className={cn(
            "absolute left-3 top-3 rounded-full px-2.5 py-1 text-caption font-semibold uppercase tracking-caps",
            strong ? "bg-ink text-white" : "bg-sand-100 text-walnut"
          )}
        >
          {result.badge}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-1 border-t border-line p-5">
        <span className="font-display text-title text-ink">{result.name}</span>
        <span className="text-small text-taupe-500">{result.detail}</span>
        <span className="text-small text-taupe-500">{result.seats}</span>
        <span className="mt-2 text-body font-semibold text-ink">{result.price}</span>
      </div>
    </Link>
  );
}
