import About from "../../content/redesign/About.json";
import { section, pick, pickAll, groups } from "../../lib/site/content";
import { cn } from "../../lib/site/cn";
import { Block, Html, INLINE_LINKS } from "./Blocks";
import Breadcrumb from "./Breadcrumb";
import SectionHeader from "./SectionHeader";
import Split from "./Split";
import NumberedPoints from "./NumberedPoints";
import PhotoGrid from "./PhotoGrid";
import CtaBand from "./CtaBand";

// /about, from About.dc.html. All copy comes from content/redesign/About.json.

const CONTAINER = "mx-auto max-w-site px-5 desktop:px-8";

export default function AboutPage() {
  const hero = section(About, "About hero");
  const approach = section(About, "Approach");
  const points = section(About, "What you can count on");
  const after = section(About, "Service after install");
  const showroom = section(About, "Showroom");
  const cta = section(About, "Section 1");

  // After the eyebrow and heading: four "01", title, paragraph groups.
  const items = groups(points.slice(2), ["text", "text", "paragraph"], 4).map(([number, title, text]) => ({ number, title, text }));

  return (
    <>
      <section className="bg-linen">
        <div className={cn(CONTAINER, "py-14 desktop:py-20")}>
          <Split image={pick(hero, "image")} imageSide="right" priority>
            <Breadcrumb items={pick(hero, "breadcrumb").items} />
            <SectionHeader
              as="h1"
              eyebrow={pick(hero, "text")}
              heading={pick(hero, "heading", 0, { level: 1 })}
              lead={pick(hero, "paragraph")}
            />
          </Split>
        </div>
      </section>

      <section className={cn(CONTAINER, "py-20 desktop:py-24")}>
        <div className="mx-auto flex max-w-3xl flex-col gap-5">
          <SectionHeader eyebrow={pick(approach, "text")} heading={pick(approach, "heading")} />
          {pickAll(approach, "paragraph").map((p, i) => (
            <Block key={i} block={p} />
          ))}
          <Block block={pick(approach, "quote")} className="mt-4" />
        </div>
      </section>

      <section className={cn(CONTAINER, "pb-20 desktop:pb-24")}>
        <PhotoGrid images={pickAll(section(About, "Photo strip"), "image")} layout="strip" />
      </section>

      <section className="border-t border-line">
        <div className={cn(CONTAINER, "flex flex-col gap-12 py-20 desktop:py-24")}>
          <SectionHeader eyebrow={pick(points, "text")} heading={pick(points, "heading")} />
          <NumberedPoints items={items} />
        </div>
      </section>

      <section className="bg-ink">
        <div className={cn(CONTAINER, "py-20 desktop:py-24")}>
          <Split image={pick(after, "image")} aspect="3/2" dark>
            <SectionHeader dark eyebrow={pick(after, "text")} heading={pick(after, "heading")} />
            {pickAll(after, "paragraph").map((p, i) => (
              <Block key={i} block={p} className="text-sand-200" />
            ))}
          </Split>
        </div>
      </section>

      <section className={cn(CONTAINER, "grid items-center gap-10 py-20 desktop:grid-cols-2 desktop:py-24")}>
        <div className="flex flex-col gap-5">
          <SectionHeader eyebrow={pick(showroom, "text")} heading={pick(showroom, "heading")} lead={pick(showroom, "paragraph")} />
        </div>
        <div className="flex flex-col items-start gap-3 rounded-card bg-linen p-8">
          {pickAll(showroom, "text")
            .slice(1)
            .map((line, i) => (
              <Html key={i} as="p" html={line.html} className={cn("text-small text-ink [&_strong]:font-semibold", INLINE_LINKS)} />
            ))}
          <Block block={pick(showroom, "link")} variant="dark" className="mt-3" />
        </div>
      </section>

      <CtaBand heading={pick(cta, "heading")} text={pick(cta, "paragraph")} links={pickAll(cta, "link")} />
    </>
  );
}
