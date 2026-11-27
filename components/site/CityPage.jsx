import { section, pick, pickAll, groups } from "../../lib/site/content";
import { cn } from "../../lib/site/cn";
import { Block, Html } from "./Blocks";
import Breadcrumb from "./Breadcrumb";
import SectionHeader from "./SectionHeader";
import Split from "./Split";
import TrustStrip from "./TrustStrip";
import Chips from "./Chips";
import ProductCard from "./ProductCard";
import Steps from "./Steps";
import ReviewCard from "./ReviewCard";
import Faq from "./Faq";
import CtaBand from "./CtaBand";

// /service-areas/<city>, from City<Name>.dc.html. `page` is the city's content/redesign JSON (lib/site/cities.js).

const CONTAINER = "mx-auto max-w-site px-5 desktop:px-8";

function exactly(list, count, where) {
  if (list.length !== count) throw new Error(`content: expected ${count}, found ${list.length} in ${where}`);
  return list;
}

export default function CityPage({ page }) {
  const hero = section(page, "Hero");
  const trust = section(page, "Trust strip");
  const hoods = section(page, "Neighbourhoods");
  const local = section(page, "Local setting");
  const picks = section(page, "Picks");
  const how = section(page, "Process");
  const reviews = section(page, "Reviews");
  const faq = section(page, "FAQ");
  const nearby = section(page, "Nearby");
  const cta = section(page, "CTA");

  const heroLinks = exactly(pickAll(hero, "link"), 2, hero.where);
  const notes = groups(local, ["heading", "paragraph"], 3);
  const cards = exactly(pickAll(picks, "card"), 4, picks.where);
  const steps = exactly(pick(how, "list").items, 4, how.where).map(({ blocks }) => {
    const [number, title, text] = groups(blocks, ["text", "text", "text"], 1)[0];
    return { number, title, text };
  });
  const quotes = groups(reviews.slice(3), ["text", "quote"], 3);
  const questions = exactly(pickAll(faq, "faq"), 5, faq.where);
  const nearbyLinks = pickAll(nearby, "link");
  const allAreas = nearbyLinks.at(-1);

  return (
    <>
      <section className="bg-linen">
        <div className={cn(CONTAINER, "py-14 desktop:py-20")}>
          <Split image={pick(hero, "image")} imageSide="right" aspect="4/3" priority>
            <Breadcrumb items={pick(hero, "breadcrumb").items} />
            <SectionHeader as="h1" eyebrow={pick(hero, "text")} heading={pick(hero, "heading", 0, { level: 1 })} lead={pick(hero, "paragraph")} />
            <div className="flex flex-wrap gap-3">
              <Block block={heroLinks[0]} variant="dark" />
              <Block block={heroLinks[1]} variant="outline-walnut" />
            </div>
          </Split>
        </div>
      </section>

      <section className="border-b border-line">
        <div className={cn(CONTAINER, "py-8")}>
          <TrustStrip pairs={groups(trust, ["text", "text"], 4)} />
        </div>
      </section>

      <section className={cn(CONTAINER, "flex flex-col gap-12 py-16 desktop:py-24")}>
        <div className="flex max-w-3xl flex-col gap-5">
          <SectionHeader eyebrow={pick(hoods, "text")} heading={pick(hoods, "heading")} lead={pick(hoods, "paragraph")} />
          <div data-neighbourhoods>
            <Chips items={pick(hoods, "list").items} />
          </div>
        </div>
        <div className="grid gap-8 desktop:grid-cols-3">
          {notes.map(([heading, text], i) => (
            <div key={i} className="flex flex-col gap-3 border-t border-line-strong pt-5">
              <Block block={heading} className="font-display text-title font-medium" />
              <Block block={text} className="text-small" />
            </div>
          ))}
        </div>
      </section>

      <section className="bg-linen">
        <div className={cn(CONTAINER, "flex flex-col gap-10 py-16 desktop:py-24")}>
          <div className="flex flex-col gap-6 desktop:flex-row desktop:items-end desktop:justify-between">
            <SectionHeader eyebrow={pick(picks, "text")} heading={pick(picks, "heading")} lead={pick(picks, "paragraph")} />
            <Block block={pick(picks, "link")} variant="outline-walnut" className="self-start desktop:self-end" />
          </div>
          <ul className="grid gap-8 desktop:grid-cols-4 desktop:gap-5">
            {cards.map((card) => (
              <li key={card.href}>
                <ProductCard card={card} />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className={cn(CONTAINER, "flex flex-col gap-10 py-16 desktop:py-24")}>
        <SectionHeader eyebrow={pick(how, "text")} heading={pick(how, "heading")} />
        <Steps items={steps} layout="row" />
        <div className="flex flex-wrap gap-3">
          {pickAll(how, "link").map((link, i) => (
            <Block key={i} block={link} variant="outline-walnut" />
          ))}
        </div>
      </section>

      <section className="bg-linen">
        <div className={cn(CONTAINER, "flex flex-col gap-10 py-16 desktop:py-24")}>
          <div className="flex flex-col gap-6 desktop:flex-row desktop:items-end desktop:justify-between">
            <SectionHeader eyebrow={pick(reviews, "text")} heading={pick(reviews, "heading")} />
            <Block block={pick(reviews, "link")} variant="outline-walnut" className="self-start desktop:self-end" />
          </div>
          <ul className="grid gap-5 desktop:grid-cols-3">
            {quotes.map(([stars, quote], i) => (
              <li key={i}>
                <ReviewCard stars={stars} quote={quote} />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className={cn(CONTAINER, "py-16 desktop:py-24")}>
        <div className="mx-auto flex max-w-3xl flex-col gap-8">
          <SectionHeader eyebrow={pick(faq, "text")} heading={pick(faq, "heading")} />
          <Faq items={questions} />
        </div>
      </section>

      <section className="border-t border-line">
        <nav aria-label="Nearby service areas" className={cn(CONTAINER, "flex flex-wrap items-center gap-4 py-8")}>
          <Html html={pick(nearby, "text").html} className="text-small text-ink [&_strong]:font-semibold" />
          <Chips links={nearbyLinks.slice(0, -1)} />
          <Block block={{ ...allAreas, variant: "link" }} className="text-small" />
        </nav>
      </section>

      <CtaBand heading={pick(cta, "heading")} text={pick(cta, "paragraph")} links={pickAll(cta, "link")} />
    </>
  );
}
