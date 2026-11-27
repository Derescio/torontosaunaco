import Button from "./Button";
import { cn } from "../../lib/site/cn";

// Renders content blocks extracted from the design (content/redesign/*.json, npm run extract:dc).
// Block html is the extractor's sanitized inline markup (a, strong, em, br) from our own repo, never user input.

export const BLOCK_TYPES = ["paragraph", "heading", "text", "list", "definitions", "link", "quote"];

// The design sets one phrase per heading in <em><strong>: italic and bold.
const EMPHASIS = "[&_em]:italic [&_strong]:font-bold";

// Inline links inside running text.
export const INLINE_LINKS = "[&_a]:font-semibold [&_a]:text-ink [&_a]:underline [&_a:hover]:text-walnut";

export function Html({ html, as: Tag = "span", className, ...props }) {
  return <Tag className={className} {...props} dangerouslySetInnerHTML={{ __html: html }} />;
}

const HEADING = {
  1: "font-display text-display-xl font-medium",
  2: "font-display text-display-sm font-medium",
  3: "font-display text-heading font-semibold",
};

// `variant` picks the Button variant for button links (defaults to Button's own).
export function Block({ block, className, variant }) {
  switch (block?.type) {
    case "paragraph":
      return <Html as="p" html={block.html} className={cn("text-body text-taupe-700", INLINE_LINKS, className)} />;
    case "heading": {
      const level = Math.min(Math.max(Number(block.level) || 2, 1), 6);
      return <Html as={`h${level}`} html={block.html} className={cn(HEADING[level], EMPHASIS, className)} />;
    }
    case "quote":
      return (
        <blockquote className={cn("border-l-2 border-tan pl-6 font-display text-title italic text-ink", className)}>
          <Html html={block.html} />
        </blockquote>
      );
    case "text":
      return <Html html={block.html} className={className} />;
    case "list": {
      const Tag = block.ordered ? "ol" : "ul";
      const items = Array.isArray(block.items) ? block.items : [];
      return (
        <Tag
          className={cn(block.ordered ? "list-decimal" : "list-disc", "space-y-2 pl-6 text-body text-taupe-700", INLINE_LINKS, className)}
        >
          {items.map((item, i) => (
            <Html key={i} as="li" html={item.html} />
          ))}
        </Tag>
      );
    }
    case "definitions": {
      const items = Array.isArray(block.items) ? block.items : [];
      return (
        <dl className={className}>
          {items.map((item, i) => (
            <div key={i} className="flex justify-between gap-4 py-3">
              <Html as="dt" html={item.term?.html ?? ""} />
              <Html as="dd" html={item.details?.html ?? ""} className="text-right font-semibold" />
            </div>
          ))}
        </dl>
      );
    }
    case "link":
      if (block.variant === "button") {
        return (
          <Button href={block.href} variant={variant} size="lg" className={className}>
            <Html html={block.html} />
          </Button>
        );
      }
      return <Html as="a" href={block.href} html={block.html} className={cn(INLINE_LINKS, className)} />;
    default:
      return null;
  }
}

export default function Blocks({ blocks }) {
  return (Array.isArray(blocks) ? blocks : []).map((block, i) => <Block key={i} block={block} />);
}
