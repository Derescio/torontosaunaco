import { Html } from "./Blocks";

// A customer review: stars (with an accessible label), the quote, and its citation.
export default function ReviewCard({ stars, quote }) {
  return (
    <figure className="flex h-full flex-col gap-4 rounded-card border border-line bg-white p-6">
      <Html html={stars.html} role="img" aria-label={stars.label} className="text-small tracking-[0.2em] text-gold" />
      <blockquote className="flex-1 text-body text-ink">
        <Html as="p" html={quote.html} />
      </blockquote>
      {quote.cite && (
        <footer>
          <Html html={quote.cite} className="text-caption text-taupe-500 [&_strong]:font-semibold [&_strong]:text-ink" />
        </footer>
      )}
    </figure>
  );
}
