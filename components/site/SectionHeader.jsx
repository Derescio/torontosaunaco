import { Block, Html } from "./Blocks";
import { cn } from "../../lib/site/cn";

// Eyebrow + heading (+ lead) used at the top of most content sections.
const SIZE = { h1: "text-display-xl", h2: "text-display-md" };

export default function SectionHeader({ eyebrow, heading, lead, dark = false, as = "h2", className }) {
  const level = as === "h1" ? 1 : 2;
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {eyebrow && <Html html={eyebrow.html} className={cn("text-eyebrow uppercase [&_strong]:font-semibold", dark ? "text-tan-light" : "text-walnut")} />}
      <Block block={{ ...heading, level }} className={cn(SIZE[as], "font-medium", dark && "text-cream")} />
      {lead && <Block block={lead} className={cn("max-w-2xl text-lead", dark && "text-sand-200")} />}
    </div>
  );
}
