import { notFound } from "next/navigation";
import Button from "../../components/site/Button";
import { isProduction } from "../../lib/env/safety";

const tokens = require("../../lib/site/tokens.js");

// Review page for the redesign tokens. Staging and previews only.
export const metadata = {
  title: "Style guide",
  robots: { index: false, follow: false },
};

const DISPLAY_STEPS = new Set(["display-xl", "display-lg", "display-md", "display-sm", "heading", "title"]);

const VARIANTS = ["dark", "walnut", "outline-walnut", "light", "outline-light"];
const ON_DARK = new Set(["light", "outline-light"]);
const SIZES = ["sm", "md", "lg"];

// Literal class names so Tailwind's content scan generates them.
const SWATCH = {
  ink: "bg-ink", "ink-soft": "bg-ink-soft", "ink-deep": "bg-ink-deep", charcoal: "bg-charcoal",
  "taupe-700": "bg-taupe-700", "taupe-500": "bg-taupe-500", "sand-100": "bg-sand-100", "sand-200": "bg-sand-200",
  "sand-300": "bg-sand-300", "sand-400": "bg-sand-400", line: "bg-line", "line-strong": "bg-line-strong",
  "line-dark": "bg-line-dark", linen: "bg-linen", cream: "bg-cream", putty: "bg-putty", walnut: "bg-walnut",
  tan: "bg-tan", "tan-light": "bg-tan-light", gold: "bg-gold", rust: "bg-rust",
};
const TYPE = {
  "display-xl": "text-display-xl", "display-lg": "text-display-lg", "display-md": "text-display-md",
  "display-sm": "text-display-sm", heading: "text-heading", title: "text-title", lead: "text-lead",
  body: "text-body", small: "text-small", caption: "text-caption", eyebrow: "text-eyebrow uppercase",
};

function Section({ id, title, children }) {
  return (
    <section aria-labelledby={id} className="border-t border-line py-12">
      <h2 id={id} className="mb-8 font-body text-eyebrow uppercase text-taupe-500">
        {title}
      </h2>
      {children}
    </section>
  );
}

function ButtonGrid({ variants }) {
  return variants.map((variant) => (
    <div key={variant} className="flex flex-wrap items-center gap-4">
      <span className="w-32 font-body text-caption">{variant}</span>
      {SIZES.map((size) => (
        <Button key={size} variant={variant} size={size}>
          Book a visit · {size}
        </Button>
      ))}
    </div>
  ));
}

export default function StyleGuidePage() {
  if (isProduction()) notFound();

  return (
    <div className="bg-white font-body text-ink">
      <div className="mx-auto max-w-site px-5 py-16 md:px-8">
        <p className="text-eyebrow uppercase text-walnut">Redesign · staging only</p>
        <h1 className="mt-4 font-display text-display-lg">Style guide</h1>
        <p className="mt-4 max-w-2xl text-lead text-taupe-700">
          Every token and button variant for the new site. Values live in lib/site/tokens.js.
        </p>

        <Section id="colours" title="Colours">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {Object.entries(tokens.colors).map(([name, value]) => (
              <div key={name} className="overflow-hidden rounded-lg border border-line">
                <div className={`h-20 ${SWATCH[name]}`} />
                <div className="p-3">
                  <p className="text-small font-semibold">{name}</p>
                  <p className="text-caption text-taupe-500">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section id="type" title="Type">
          <div className="space-y-8">
            {Object.entries(tokens.fontSize).map(([name, [size]]) => (
              <div key={name} className="grid gap-2 md:grid-cols-[12rem_1fr] md:items-baseline">
                <div>
                  <p className="text-small font-semibold">{`text-${name}`}</p>
                  <p className="text-caption text-taupe-500">{size}</p>
                </div>
                <p className={`${TYPE[name]} ${DISPLAY_STEPS.has(name) ? "font-display" : "font-body"}`}>
                  Handcrafted cedar saunas, delivered across Ontario
                </p>
              </div>
            ))}
            <p className="font-display text-display-sm italic">Cormorant Garamond italic</p>
          </div>
        </Section>

        <Section id="corners" title="Corners and shadows">
          <div className="flex flex-wrap gap-6">
            {[
              ["rounded", "rounded"],
              ["rounded-lg", "rounded-lg"],
              ["rounded-card", "rounded-card"],
              ["rounded-full", "rounded-full"],
            ].map(([label, cls]) => (
              <div key={label} className={`flex h-24 w-32 items-end bg-putty p-3 text-caption ${cls}`}>
                {label}
              </div>
            ))}
            <div className="flex h-24 w-40 items-end rounded-lg bg-white p-3 text-caption shadow-menu">shadow-menu</div>
            <div className="flex h-24 w-40 items-end rounded-lg bg-white p-3 text-caption shadow-chip">shadow-chip</div>
          </div>
        </Section>

        <Section id="buttons" title="Buttons">
          <div className="space-y-4">
            <ButtonGrid variants={VARIANTS.filter((v) => !ON_DARK.has(v))} />
          </div>
          <div className="mt-6 space-y-4 rounded-card bg-ink p-6 text-sand-100">
            <ButtonGrid variants={VARIANTS.filter((v) => ON_DARK.has(v))} />
          </div>
        </Section>
      </div>
    </div>
  );
}
