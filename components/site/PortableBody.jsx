import Link from "next/link";
import { PortableText } from "@portabletext/react";
import { urlFor } from "@/lib/sanity";
import SanityImage from "./SanityImage";
import { sanityDims } from "./PostCard";

// Sanity article body (Portable Text) in the new site's typography. Internal links use next/link; external links open
// in a new tab with rel="noopener noreferrer"; images come resized from Sanity's CDN.

const SITE_HOST = /^https?:\/\/(www\.)?(the)?torontosaunaco\.com/i;

function LinkMark({ value, children }) {
  const href = typeof value?.href === "string" ? value.href.trim() : "";
  if (!href) return <>{children}</>;
  const internal = href.startsWith("/") || SITE_HOST.test(href);
  const cls = "font-semibold text-ink underline underline-offset-2 hover:text-walnut";
  if (internal) {
    return (
      <Link href={href.replace(SITE_HOST, "") || "/"} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
      {children}
    </a>
  );
}

function BodyImage({ value }) {
  if (!value?.asset) return null;
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

const components = {
  block: {
    normal: ({ children }) => <p className="text-body text-taupe-700">{children}</p>,
    h2: ({ children }) => <h2 className="mt-6 font-display text-heading font-semibold text-ink">{children}</h2>,
    h3: ({ children }) => <h3 className="mt-4 font-display text-title font-semibold text-ink">{children}</h3>,
    h4: ({ children }) => <h4 className="mt-2 text-body font-semibold text-ink">{children}</h4>,
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
