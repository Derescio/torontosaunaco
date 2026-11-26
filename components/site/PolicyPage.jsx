import { Fragment } from "react";
import Link from "next/link";
import { Block, Html, INLINE_LINKS } from "./Blocks";
import { policyParts } from "../../lib/site/policy";
import { cn } from "../../lib/site/cn";

// Shared layout for the five policy pages (Policy*.dc.html). All copy comes from the page's extracted JSON.

const CONTAINER = "mx-auto max-w-site px-5 desktop:px-8";
const TAB = "inline-flex min-h-11 items-center rounded-full border border-ink px-5 text-small font-semibold";

function Breadcrumb({ items }) {
  return (
    <nav aria-label="Breadcrumb" className="text-caption text-taupe-500">
      {items.map((item, i) => (
        <Fragment key={i}>
          {i > 0 && " / "}
          {item.href ? (
            <Link href={item.href} className="underline hover:text-walnut">
              {item.text}
            </Link>
          ) : (
            <span aria-current={i === items.length - 1 ? "page" : undefined}>{item.text}</span>
          )}
        </Fragment>
      ))}
    </nav>
  );
}

function PolicyTabs({ tabs }) {
  return (
    <nav aria-label="Other policies" className="mt-2 flex flex-wrap gap-2.5">
      {tabs.map((tab) =>
        tab.href ? (
          <Link key={tab.label} href={tab.href} className={cn(TAB, "text-ink transition-colors hover:bg-ink hover:text-white")}>
            {tab.label}
          </Link>
        ) : (
          <span key={tab.label} aria-current="page" className={cn(TAB, "bg-ink text-white")}>
            {tab.label}
          </span>
        )
      )}
    </nav>
  );
}

function Glance({ label, items }) {
  return (
    <div className="mt-2 rounded-card border border-t-[3px] border-line-dark border-t-tan bg-gradient-to-b from-charcoal to-ink px-6 py-6">
      <span className="text-eyebrow uppercase text-tan-light">{label}</span>
      <Block
        block={{ type: "definitions", items }}
        className="mt-3 text-small [&>div]:border-b [&>div]:border-line-dark [&_dd]:text-cream [&_dt]:text-sand-300"
      />
    </div>
  );
}

export default function PolicyPage({ page }) {
  const p = policyParts(page);
  const [call, email] = p.cta.links;
  return (
    <>
      <section className="bg-linen">
        <div className={cn(CONTAINER, "flex flex-col gap-5 pb-14 pt-16 desktop:pt-20")}>
          <Breadcrumb items={p.breadcrumb} />
          <span className="text-eyebrow uppercase text-walnut">{p.eyebrow}</span>
          <Block block={p.title} />
          <Html as="p" html={p.contact.html} className={cn("max-w-3xl text-lead text-taupe-700", INLINE_LINKS)} />
          <PolicyTabs tabs={p.tabs} />
          <span className="text-caption text-taupe-500">{p.updated}</span>
        </div>
      </section>

      <section className="border-t border-line bg-white">
        <div className={cn(CONTAINER, "grid items-start gap-14 py-16 desktop:grid-cols-2 desktop:pb-24")}>
          {/* Pinned on desktop so the summary stays beside long sections (owner, 2026-11-26; the design doesn't pin). */}
          <div className="flex flex-col gap-4 desktop:sticky desktop:top-8">
            <Block block={p.intro} className="text-lead" />
            <Glance label={p.glance.label} items={p.glance.items} />
          </div>
          <div className="flex flex-col gap-6">
            {p.groups.map((group, i) => (
              <section key={i} className="flex flex-col gap-2.5 border-t border-line pt-6">
                <Block block={group.heading} />
                {group.blocks.map((block, j) => (
                  <Block key={j} block={block} />
                ))}
              </section>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-ink text-cream">
        <div className={cn(CONTAINER, "flex flex-wrap items-center justify-between gap-6 py-16")}>
          <div className="flex max-w-2xl flex-col gap-2">
            <Block block={p.cta.heading} />
            <Html as="p" html={p.cta.text.html} className="text-lead text-sand-300" />
          </div>
          <div className="flex flex-wrap gap-3">
            {call && <Block block={call} variant="tan" />}
            {email && <Block block={email} variant="outline-light" />}
          </div>
        </div>
      </section>
    </>
  );
}
