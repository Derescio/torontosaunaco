import { Html } from "./Blocks";
import { cn } from "../../lib/site/cn";

// Figures with labels. "inline": a row of small stats; "cards": research cards with text and source.
// Items hold design blocks: { figure, label, text?, source? }.
export default function StatGrid({ items, variant = "inline", className }) {
  if (variant === "cards") {
    return (
      <ul className={cn("grid grid-cols-[repeat(auto-fit,minmax(min(100%,360px),1fr))] gap-4", className)}>
        {items.map((item, i) => (
          <li key={i} className="flex flex-col gap-3 rounded-card bg-white p-7">
            <Html html={item.figure.html} className="font-display text-display-sm [&_strong]:font-medium" />
            <Html html={item.label.html} className="text-body font-semibold" />
            {item.text && <Html as="p" html={item.text.html} className="text-small text-taupe-700" />}
            {item.source && <Html html={item.source.html} className="mt-auto text-caption uppercase tracking-caps text-taupe-500" />}
          </li>
        ))}
      </ul>
    );
  }
  return (
    <ul className={cn("flex flex-wrap gap-x-10 gap-y-6 border-t border-line pt-6", className)}>
      {items.map((item, i) => (
        <li key={i} className="flex flex-col gap-1">
          <Html html={item.figure.html} className="font-display text-heading [&_strong]:font-medium" />
          <Html html={item.label.html} className="text-caption text-taupe-500" />
        </li>
      ))}
    </ul>
  );
}
