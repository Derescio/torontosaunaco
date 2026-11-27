import { cn } from "../../lib/site/cn";
import Breadcrumb from "./Breadcrumb";
import PostCard, { CardPhoto } from "./PostCard";
import PortableBody from "./PortableBody";
import { BlogCta } from "./BlogIndex";

// An article page (/blog/<slug>). No design exists for it; it's built from the site's own pieces (owner, 2026-11-26).

const CONTAINER = "mx-auto max-w-site px-5 desktop:px-8";

export default function BlogPost({ post, card, related = [] }) {
  const meta = [card?.category, card?.date].filter(Boolean).join(" · ");
  return (
    <>
      <section className="bg-linen">
        <div className={cn(CONTAINER, "flex max-w-site flex-col gap-5 pb-12 pt-14 desktop:pb-16 desktop:pt-20")}>
          <Breadcrumb items={[{ text: "Home", href: "/" }, { text: "Blog", href: "/blog" }, { text: post.title }]} />
          {meta && <p className="text-eyebrow uppercase text-walnut">{meta}</p>}
          <h1 className="max-w-4xl font-display text-display-md font-medium text-ink">{post.title}</h1>
        </div>
      </section>

      <div className={cn(CONTAINER, "flex flex-col gap-12 py-12 desktop:py-16")}>
        {card?.image && <CardPhoto image={card.image} sizes="(min-width: 1384px) 1320px, 100vw" priority className="aspect-[16/9]" />}
        <article className="mx-auto flex w-full max-w-prose flex-col gap-5">
          <PortableBody value={post.content} />
        </article>
      </div>

      {related.length > 0 && (
        <section className="border-t border-line">
          <div className={cn(CONTAINER, "flex flex-col gap-10 py-16 desktop:py-20")}>
            <h2 className="font-display text-display-sm font-medium text-ink">More guides</h2>
            <div className="grid grid-cols-1 gap-x-6 gap-y-12 min-[520px]:grid-cols-2 desktop:grid-cols-3">
              {related.map((r) => (
                <PostCard key={r.slug} card={r} />
              ))}
            </div>
          </div>
        </section>
      )}

      <BlogCta />
    </>
  );
}
