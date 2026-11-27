import { Block, Html } from "./Blocks";
import { cn } from "../../lib/site/cn";

// Dark closing band: heading, text and buttons (first tan, the rest outlined). Used by policy and content pages.
export default function CtaBand({ heading, text, links = [], className }) {
  return (
    <section className={cn("bg-ink text-cream", className)}>
      <div className="mx-auto flex max-w-site flex-wrap items-center justify-between gap-6 px-5 py-16 desktop:px-8">
        <div className="flex max-w-2xl flex-col gap-2">
          <Block block={{ ...heading, level: 2 }} />
          <Html as="p" html={text.html} className="text-lead text-sand-300" />
        </div>
        <div className="flex flex-wrap gap-3">
          {links.map((link, i) => (
            <Block key={i} block={link} variant={i === 0 ? "tan" : "outline-light"} />
          ))}
        </div>
      </div>
    </section>
  );
}
