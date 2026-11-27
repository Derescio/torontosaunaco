import Link from "next/link";
import { PortableText } from "@portabletext/react";
import { urlFor } from "@/lib/sanity";
import SanityImage from "./SanityImage";
import { sanityDims } from "./PostCard";
import { isSanityImage } from "../../lib/site/blog";

// Sanity article body (Portable Text) in the new site's typography.
// - Headings: the page has its own h1, so body h1s render as h2s, and h5/h6 as h4s.
// - Links: our own domain becomes an internal link (path, query and hash kept); other http(s) links open in a new tab
//   with rel="noopener noreferrer"; mailto/tel links stay as they are; anything else (e.g. javascript:) renders as text.
// - Images come resized from Sanity's CDN; an unreadable reference is skipped.

const OWN_HOSTS = new Set(["thetorontosaunaco.com", "www.thetorontosaunaco.com", "torontosaunaco.com", "www.torontosaunaco.com"]);
const LINK = "font-semibold text-ink underline underline-offset-2 hover:text-walnut";

/** { kind: "internal" | "external" | "contact", href } for a safe link, or null. */
export function resolveLink(raw) {
  const href = typeof raw === "string" ? raw.trim() : "";
  if (!href) return null;
  if (href.startsWith("/") && !href.startsWith("//")) return { kind: "internal", href };
  let url;
  try {
    url = new URL(href);
  } catch {
    return null;
  }
  if (url.protocol === "mailto:" || url.protocol === "tel:") return { kind: "contact", href };
  if (url.protocol !== "http:" && url.protocol !== "https:") return null;
  if (OWN_HOSTS.has(url.hostname.toLowerCase())) return { kind: "internal", href: `${url.pathname || "/"}${url.search}${url.hash}` };
  return { kind: "external", href: url.href };
}

function LinkMark({ value, children }) {
  const link = resolveLink(value?.href);
  if (!link) return <>{children}</>;
  if (link.kind === "internal") {
    return (
      <Link href={link.href} className={LINK}>
        {children}
      </Link>
    );
  }
  if (link.kind === "contact") {
    return (
      <a href={link.href} className={LINK}>
        {children}
      </a>
    );
  }
  return (
    <a href={link.href} target="_blank" rel="noopener noreferrer" className={LINK}>
      {children}
    </a>
  );
}

function BodyImage({ value }) {
  if (!isSanityImage(value)) return null;
  const dims = sanityDims(value) ?? { width: 1600, height: 900 };
  return (
    <figure className="my-2 overflow-hidden rounded-card">
      <SanityImage
        src={urlFor(value).url()}
        alt={value.alt ?? ""}
        width={dims.width}
        height={dims.height}
        sizes="(min-width: 998px) 720px, 100vw"
        className="h-auto w-full"
      />
    </figure>
  );
}

const H2 = ({ children }) => <h2 className="mt-6 font-display text-heading font-semibold text-ink">{children}</h2>;
const H3 = ({ children }) => <h3 className="mt-4 font-display text-title font-semibold text-ink">{children}</h3>;
const H4 = ({ children }) => <h4 className="mt-2 text-body font-semibold text-ink">{children}</h4>;

const components = {
  block: {
    normal: ({ children }) => <p className="text-body text-taupe-700">{children}</p>,
    h1: H2,
    h2: H2,
    h3: H3,
    h4: H4,
    h5: H4,
    h6: H4,
    blockquote: ({ children }) => (
      <blockquote className="border-l-[3px] border-tan pl-6 font-display text-title italic text-ink">{children}</blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => <ul className="list-disc space-y-2 pl-6 text-body text-taupe-700">{children}</ul>,
    number: ({ children }) => <ol className="list-decimal space-y-2 pl-6 text-body text-taupe-700">{children}</ol>,
  },
  marks: {
    link: LinkMark,
    strong: ({ children }) => <strong className="font-semibold text-ink">{children}</strong>,
    em: ({ children }) => <em className="italic">{children}</em>,
  },
  types: { image: BodyImage },
};

export default function PortableBody({ value }) {
  if (!Array.isArray(value) || !value.length) return null;
  return <PortableText value={value} components={components} />;
}
