import { Html } from "./Blocks";
import { cn } from "../../lib/site/cn";

// Numbered steps. Items hold design blocks: { number, title, text }.
// layout "list" (Wellness ritual): stacked rows. layout "row" (city pages): four columns on desktop, stacked below.
export default function Steps({ items, layout = "list" }) {
  const row = layout === "row";
  return (
    <ol className={cn("flex flex-col", row && "gap-8 desktop:grid desktop:grid-cols-4 desktop:gap-8")}>
      {items.map((item, i) => (
        <li
          key={i}
          className={cn(row ? "flex flex-col gap-2 border-t border-line pt-5" : "grid grid-cols-[56px_1fr] gap-x-4 border-t border-line py-5")}
        >
          <Html html={item.number.html} className="font-display text-heading text-walnut [&_strong]:font-medium" />
          <div className="flex flex-col gap-1.5">
            <Html html={item.title.html} className="font-display text-title [&_strong]:font-medium" />
            <Html as="p" html={item.text.html} className="text-small text-taupe-700" />
          </div>
        </li>
      ))}
    </ol>
  );
}
