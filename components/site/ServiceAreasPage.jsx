import ServiceAreas from "../../content/redesign/ServiceAreas.json";
import { section, pick, pickAll } from "../../lib/site/content";
import { cn } from "../../lib/site/cn";
import { Block } from "./Blocks";
import Breadcrumb from "./Breadcrumb";
import SectionHeader from "./SectionHeader";
import CityCard from "./CityCard";

// /service-areas, from ServiceAreas.dc.html. All copy comes from content/redesign/ServiceAreas.json.

const CONTAINER = "mx-auto max-w-site px-5 desktop:px-8";

export default function ServiceAreasPage() {
  const hero = section(ServiceAreas, "Section 1");
  const list = section(ServiceAreas, "Section 2");
  const cards = pickAll(list, "card");
  if (cards.length !== 17) throw new Error(`content: expected 17 city cards, found ${cards.length} in ${list.where}`);

  return (
    <>
      <section className="bg-linen">
        <div className={cn(CONTAINER, "flex flex-col gap-5 py-14 desktop:py-20")}>
          <Breadcrumb items={pick(hero, "breadcrumb").items} />
          <SectionHeader as="h1" eyebrow={pick(hero, "text")} heading={pick(hero, "heading", 0, { level: 1 })} lead={pick(hero, "paragraph")} />
        </div>
      </section>

      <section className={cn(CONTAINER, "flex flex-col gap-10 py-16 desktop:py-20")}>
        <ul className="grid gap-5 desktop:grid-cols-4">
          {cards.map((card) => (
            <li key={card.href}>
              <CityCard card={card} />
            </li>
          ))}
        </ul>
        <Block block={pick(list, "paragraph")} />
      </section>
    </>
  );
}
