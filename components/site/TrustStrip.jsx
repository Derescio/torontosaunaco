import { Html, INLINE_LINKS } from "./Blocks";
import { cn } from "../../lib/site/cn";

// Four title + detail pairs in a bordered band (city pages). Detail HTML keeps its inline links.
export default function TrustStrip({ pairs, className }) {
  return (
    <ul className={cn("grid gap-6 desktop:grid-cols-4 desktop:gap-8", className)}>
      {pairs.map(([title, detail], i) => (
        <li key={i} className="flex flex-col gap-1">
          <Html html={title.html} className="text-small font-semibold text-ink [&_strong]:font-semibold" />
          <Html as="p" html={detail.html} className={cn("text-small text-taupe-700", INLINE_LINKS)} />
        </li>
      ))}
    </ul>
  );
}
