import { Html } from "./Blocks";

// Numbered steps (Wellness ritual). Items hold design blocks: { number, title, text }.
export default function Steps({ items }) {
  return (
    <ol className="flex flex-col">
      {items.map((item, i) => (
        <li key={i} className="grid grid-cols-[56px_1fr] gap-x-4 border-t border-line py-5">
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
