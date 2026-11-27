import { Html } from "./Blocks";

// "01 / title / text" columns. Items hold design blocks: { number, title, text }.
export default function NumberedPoints({ items }) {
  return (
    <ol className="grid gap-8 desktop:grid-cols-4 desktop:gap-6">
      {items.map((item, i) => (
        <li key={i} className="flex flex-col gap-2 border-t border-ink pt-5">
          <Html html={item.number.html} className="text-eyebrow text-walnut [&_strong]:font-semibold" />
          <Html html={item.title.html} className="font-display text-title [&_strong]:font-medium" />
          <Html as="p" html={item.text.html} className="text-small text-taupe-700" />
        </li>
      ))}
    </ol>
  );
}
