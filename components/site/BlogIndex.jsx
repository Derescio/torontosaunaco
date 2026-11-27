import Blog from "../../content/redesign/Blog.json";
import { section, pick, pickAll } from "../../lib/site/content";
import { cn } from "../../lib/site/cn";
import Breadcrumb from "./Breadcrumb";
import SectionHeader from "./SectionHeader";
import PostCard from "./PostCard";
import CtaBand from "./CtaBand";

// /blog, from Blog.dc.html. Cards come from Sanity via lib/site/blog.js (newest first, the newest featured).

const CONTAINER = "mx-auto max-w-site px-5 desktop:px-8";

export function BlogCta() {
  const cta = section(Blog, "Section 1");
  return <CtaBand heading={pick(cta, "heading")} text={pick(cta, "paragraph")} links={pickAll(cta, "link")} />;
}

export default function BlogIndex({ cards = [] }) {
  const hero = section(Blog, "Blog hero");
  const [featured, ...rest] = Array.isArray(cards) ? cards : [];
  return (
    <>
      <section className="bg-linen">
        <div className={cn(CONTAINER, "flex flex-col gap-6 pb-16 pt-14 desktop:pb-20 desktop:pt-20")}>
          <Breadcrumb items={pick(hero, "breadcrumb").items} />
          <SectionHeader as="h1" eyebrow={pick(hero, "text")} heading={pick(hero, "heading")} lead={pick(hero, "paragraph")} />
        </div>
      </section>

      <section className={cn(CONTAINER, "flex flex-col gap-16 py-16 desktop:py-20")}>
        {featured && <PostCard card={featured} featured priority />}
        {rest.length > 0 && (
          <div className="grid grid-cols-1 gap-x-6 gap-y-12 min-[520px]:grid-cols-2 desktop:grid-cols-4">
            {rest.map((card) => (
              <PostCard key={card.slug} card={card} />
            ))}
          </div>
        )}
      </section>

      <BlogCta />
    </>
  );
}
