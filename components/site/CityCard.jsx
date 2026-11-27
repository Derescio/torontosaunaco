import Link from "next/link";
import { Html } from "./Blocks";

// A hub card from a design card block: [region, city name, neighbourhoods, link text], linking to the city page.
export default function CityCard({ card }) {
  const [region, name, neighbourhoods, linkText] = card.blocks;
  return (
    <article className="flex h-full flex-col gap-2 rounded-card border border-line bg-white p-6">
      <Html html={region.html} className="text-caption uppercase tracking-[0.14em] text-taupe-500" />
      <Html as="h2" html={name.html} className="font-display text-heading font-medium text-ink [&_strong]:font-medium" />
      <Html as="p" html={neighbourhoods.html} className="flex-1 text-small text-taupe-700" />
      <Link href={card.href} className="mt-2 self-start text-small font-semibold text-ink underline underline-offset-4 hover:text-walnut">
        <Html html={linkText.html} className="[&_strong]:font-semibold" />
      </Link>
    </article>
  );
}
