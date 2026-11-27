import Wellness from "../../content/redesign/Wellness.json";
import { section, pick, pickAll } from "../../lib/site/content";
import { cn } from "../../lib/site/cn";
import { Block, Html } from "./Blocks";
import Breadcrumb from "./Breadcrumb";
import SectionHeader from "./SectionHeader";
import Split, { Photo } from "./Split";
import StatGrid from "./StatGrid";
import PhotoGrid from "./PhotoGrid";
import Steps from "./Steps";
import CtaBand from "./CtaBand";
import SiteImage from "./SiteImage";

// /wellness, from Wellness.dc.html. All copy comes from content/redesign/Wellness.json.
// The extractor drops section ids, so the two anchor targets the hero links to are set here.

const CONTAINER = "mx-auto max-w-site px-5 desktop:px-8";

const pairs = (blocks) => {
  const out = [];
  for (let i = 0; i + 1 < blocks.length; i += 2) out.push([blocks[i], blocks[i + 1]]);
  return out;
};

export default function WellnessPage() {
  const hero = section(Wellness, "Wellness hero");
  const tradition = section(Wellness, "Finnish tradition");
  const research = section(Wellness, "Research");
  const gallery = section(Wellness, "Inspiration gallery");
  const lifestyle = section(Wellness, "Lifestyle");
  const ritual = section(Wellness, "Ritual");
  const safety = section(Wellness, "Safety");
  const cta = section(Wellness, "Section 1");
  const sources = section(Wellness, "Sources");

  const heroImage = pick(hero, "image");
  const [heroPrimary, heroSecondary] = pickAll(hero, "link");

  const stats = pairs(pickAll(tradition, "text").slice(1)).map(([figure, label]) => ({ figure, label }));

  // After eyebrow, heading and lead: figure, label, text, source per card; the last paragraph is the footnote.
  const cardBlocks = research.slice(3, -1);
  const cards = [];
  for (let i = 0; i + 3 < cardBlocks.length; i += 4) {
    const [figure, label, text, source] = cardBlocks.slice(i, i + 4);
    cards.push({ figure, label, text, source });
  }
  const footnote = research.at(-1);
  if (cards.length !== 6 || footnote.type !== "paragraph") throw new Error(`content: ${research.where}: expected 6 research cards and a footnote`);

  const lifestyleItems = pairs(pickAll(lifestyle, "text").slice(1));
  const steps = pick(ritual, "list").items.map(({ blocks: [number, title, text] }) => ({ number, title, text }));

  return (
    <>
      <section className="relative overflow-hidden bg-ink text-cream">
        <div className="absolute inset-0 opacity-55">
          <SiteImage src={heroImage.src} alt={heroImage.alt} fill priority sizes="100vw" className="object-cover object-[50%_45%]" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-ink-deep/90 via-ink-deep/55 to-ink-deep/15" />
        <div className={cn(CONTAINER, "relative flex flex-col gap-6 py-24 desktop:py-32")}>
          <Breadcrumb items={pick(hero, "breadcrumb").items} dark />
          <SectionHeader
            as="h1"
            dark
            eyebrow={pick(hero, "text")}
            heading={pick(hero, "heading", 0, { level: 1 })}
            lead={pick(hero, "paragraph")}
          />
          <div className="flex flex-wrap gap-3">
            <Block block={heroPrimary} variant="tan" />
            <Block block={heroSecondary} variant="outline-light" />
          </div>
        </div>
      </section>

      <section className={cn(CONTAINER, "py-20 desktop:py-28")}>
        <Split image={pick(tradition, "image")} imageSide="right">
          <SectionHeader eyebrow={pick(tradition, "text")} heading={pick(tradition, "heading")} />
          {pickAll(tradition, "paragraph").map((p, i) => (
            <Block key={i} block={p} />
          ))}
          <StatGrid items={stats} />
        </Split>
      </section>

      <section id="research" className="bg-linen">
        <div className={cn(CONTAINER, "flex flex-col gap-10 py-20 desktop:py-28")}>
          <SectionHeader eyebrow={pick(research, "text")} heading={pick(research, "heading")} lead={pick(research, "paragraph")} />
          <StatGrid items={cards} variant="cards" />
          <Block block={footnote} className="text-caption text-taupe-500" />
        </div>
      </section>

      <section className={cn(CONTAINER, "flex flex-col gap-9 py-20 desktop:py-28")}>
        <div className="flex flex-col gap-5 desktop:flex-row desktop:items-end desktop:justify-between">
          <SectionHeader eyebrow={pick(gallery, "text")} heading={pick(gallery, "heading")} className="max-w-2xl" />
          <Block block={pick(gallery, "paragraph")} className="max-w-md text-lead" />
        </div>
        <PhotoGrid images={pickAll(gallery, "image")} layout="gallery" />
      </section>

      <section className="bg-ink text-cream">
        <div className={cn(CONTAINER, "grid gap-12 py-20 desktop:grid-cols-2 desktop:py-28")}>
          <div className="flex flex-col gap-6">
            <SectionHeader dark eyebrow={pick(lifestyle, "text")} heading={pick(lifestyle, "heading")} />
            <Block block={pick(lifestyle, "paragraph")} className="text-sand-200" />
            <Photo image={pick(lifestyle, "image")} aspect="3/2" />
          </div>
          <ul className="flex flex-col">
            {lifestyleItems.map(([title, text], i) => (
              <li key={i} className="flex flex-col gap-1.5 border-t border-line-dark py-5">
                <Html html={title.html} className="font-display text-title [&_strong]:font-medium" />
                <Html as="p" html={text.html} className="text-small text-sand-300" />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="ritual" className={cn(CONTAINER, "grid gap-12 py-20 desktop:grid-cols-2 desktop:py-28")}>
        <div className="flex flex-col gap-6">
          <SectionHeader eyebrow={pick(ritual, "text")} heading={pick(ritual, "heading")} lead={pick(ritual, "paragraph")} />
          <Photo image={pick(ritual, "image")} aspect="4/3" />
        </div>
        <Steps items={steps} />
      </section>

      <section className="bg-linen">
        <div className={cn(CONTAINER, "grid gap-10 py-20 desktop:grid-cols-2 desktop:py-24")}>
          <SectionHeader eyebrow={pick(safety, "text")} heading={pick(safety, "heading")} />
          <Block block={pick(safety, "list")} />
        </div>
      </section>

      <CtaBand heading={pick(cta, "heading")} text={pick(cta, "paragraph")} links={pickAll(cta, "link")} />

      <section className={cn(CONTAINER, "flex flex-col gap-4 py-14")}>
        <Block block={pick(sources, "heading")} className="text-title" />
        <Block block={pick(sources, "list")} className="text-caption" />
        <Block block={pick(sources, "paragraph")} className="text-caption text-taupe-500" />
      </section>
    </>
  );
}
