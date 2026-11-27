import Blocks, { Html } from "./Blocks";

// Questions and answers as native <details>, so answers are in the HTML and open without JavaScript.
export default function Faq({ items }) {
  return (
    <div className="border-b border-line">
      {(Array.isArray(items) ? items : []).map((item, i) => (
        <details key={i} className="group border-t border-line">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-body font-medium text-ink [&::-webkit-details-marker]:hidden">
            <Html html={item.html} />
            <span aria-hidden="true" className="text-title text-taupe-500 transition-transform group-open:rotate-45">
              +
            </span>
          </summary>
          <div className="flex flex-col gap-3 pb-6">
            <Blocks blocks={item.blocks} />
          </div>
        </details>
      ))}
    </div>
  );
}
