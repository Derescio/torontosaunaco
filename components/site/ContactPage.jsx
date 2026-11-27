import Contact from "../../content/redesign/Contact.json";
import { section, pick, pickAll } from "../../lib/site/content";
import { cn } from "../../lib/site/cn";
import { Block, Html, INLINE_LINKS } from "./Blocks";
import Breadcrumb from "./Breadcrumb";
import SectionHeader from "./SectionHeader";
import ContactForm from "./ContactForm";

// /contact, from Contact.dc.html. Server component: it reads the design JSON and hands the form only the copy it
// needs (never the JSON's `data`, which holds the team recipients).

const CONTAINER = "mx-auto max-w-site px-5 desktop:px-8";

function walk(blocks, visit) {
  for (const block of Array.isArray(blocks) ? blocks : []) {
    visit(block);
    walk(block.blocks, visit);
  }
}

function findAll(blocks, test) {
  const out = [];
  walk(blocks, (b) => test(b) && out.push(b));
  return out;
}

function need(value, what) {
  if (value === undefined || value === null) throw new Error(`ContactPage: ${Contact.file}: missing ${what}`);
  return value;
}

/** The form's copy from the design JSON: per-mode titles, intro, field labels, thank-you lines. */
export function contactCopy() {
  const blocks = section(Contact, "Contact");
  const ifBlock = (value) => need(findAll(blocks, (b) => b.type === "if" && b.value === value)[0], `if ${value}`);
  const firstText = (b) => need(findAll(b.blocks, (x) => x.type === "text")[0], `text in ${b.value}`).html;
  const form = need(findAll(blocks, (b) => b.type === "form")[0], "form");
  const label = (id) => need(findAll(form.blocks, (b) => b.type === "field" && b.id === id)[0], `field ${id}`).label;
  const done = ifBlock("{{lfDone}}");
  const doneTexts = done.blocks.filter((b) => b.type === "text");
  return {
    titles: { quote: firstText(ifBlock("{{lfQuote}}")), visit: firstText(ifBlock("{{lfVisit}}")), question: firstText(ifBlock("{{lfAsk}}")) },
    intro: need(form.blocks.find((b) => b.type === "text"), "form intro").html,
    labels: {
      reason: label("c-reason"),
      name: label("c-name"),
      phone: label("c-phone"),
      email: label("c-email"),
      city: label("c-city"),
      type: label("c-type"),
      when: label("c-when"),
      time: label("c-time"),
    },
    thanks: { title: need(doneTexts[0], "thank-you title").html, body: need(doneTexts[1], "thank-you text").html },
    again: need(done.blocks.find((b) => b.type === "link"), "send another link").text,
  };
}

export default function ContactPage({ fallbackEmail = null }) {
  const blocks = section(Contact, "Contact");
  const lines = pickAll(blocks, "text").slice(1, 4); // Call or text, Email, Showroom
  const note = pick(blocks, "text", 4);
  return (
    <section className="bg-linen">
      <div className={cn(CONTAINER, "grid items-start gap-14 py-16 desktop:grid-cols-2 desktop:gap-24 desktop:py-28")}>
        <aside className="flex flex-col gap-6">
          <Breadcrumb items={pick(blocks, "breadcrumb").items} />
          <SectionHeader
            as="h1"
            eyebrow={pick(blocks, "text")}
            heading={pick(blocks, "heading")}
            lead={pick(blocks, "paragraph")}
          />
          <div className="flex flex-col gap-4 border-t border-line-strong pt-8">
            {lines.map((line, i) => (
              <Html key={i} as="p" html={line.html} className={cn("text-lead text-ink [&_strong]:font-semibold", INLINE_LINKS, "[&_a]:font-normal")} />
            ))}
            <Block block={{ ...note, type: "paragraph" }} className="text-small" />
          </div>
        </aside>
        <ContactForm copy={contactCopy()} fallbackEmail={fallbackEmail} />
      </div>
    </section>
  );
}
