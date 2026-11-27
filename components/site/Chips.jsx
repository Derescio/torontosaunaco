import Link from "next/link";
import { Html } from "./Blocks";
import { cn } from "../../lib/site/cn";

// Pill tags: plain `items` (list items' { html }) or `links` (design link blocks).
const PILL = "inline-flex items-center rounded-full border border-line-strong px-4 py-1.5 text-small text-ink";

export default function Chips({ items, links, className }) {
  if (Array.isArray(links)) {
    return (
      <ul className={cn("flex flex-wrap gap-2", className)}>
        {links.map((link, i) => (
          <li key={i}>
            <Link href={link.href} className={cn(PILL, "transition-colors hover:border-walnut hover:text-walnut")}>
              <Html html={link.html} />
            </Link>
          </li>
        ))}
      </ul>
    );
  }
  return (
    <ul className={cn("flex flex-wrap gap-2", className)}>
      {(Array.isArray(items) ? items : []).map((item, i) => (
        <Html key={i} as="li" html={item.html} className={PILL} />
      ))}
    </ul>
  );
}
