// Metadata and JSON-LD for article pages (/blog/<slug>), which have no design head to copy.
// OpenGraph type is "website" (CLAUDE.md); BlogPosting JSON-LD says it's an article.

import { urlFor } from "@/lib/sanity";
import { imageFor } from "../../components/site/SiteImage";
import { SITE, pageSeo } from "./seo";

const BRAND = "The Toronto Sauna Co.";

/** Absolute URL of a card's photo: Cloudinary for design photos, Sanity's CDN otherwise. */
export function cardImageUrl(card) {
  const image = card?.image;
  if (!image) return null;
  try {
    if (image.kind === "design") return imageFor(image.src).url;
    return image.url ?? urlFor(image.source).width(1200).url();
  } catch {
    return null;
  }
}

export function postSeo(post, card) {
  const url = `${SITE}/blog/${post.slug}`;
  const title = `${post.title} | ${BRAND}`;
  const description = post.description || card?.summary || pageSeo("/blog").metadata.description;
  const image = cardImageUrl(card);

  const metadata = {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      title,
      description,
      siteName: BRAND,
      ...(image && { images: [{ url: image }] }),
    },
    twitter: { card: "summary_large_image", title, description, ...(image && { images: [image] }) },
  };

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description,
      url,
      mainEntityOfPage: url,
      ...(post.publishedAt && { datePublished: post.publishedAt }),
      ...(image && { image: [image] }),
      publisher: { "@type": "Organization", name: BRAND, url: SITE },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
        { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE}/blog` },
        { "@type": "ListItem", position: 3, name: post.title, item: url },
      ],
    },
  ];

  return { metadata, jsonLd };
}
