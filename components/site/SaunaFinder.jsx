"use client";

import { useState } from "react";
import { findSaunas } from "../../lib/site/saunaFinder";
import { cn } from "../../lib/site/cn";
import { Html } from "./Blocks";
import Button from "./Button";
import FinderCard from "./FinderCard";

// The Sauna Finder (SaunaFinder.dc.html). Rules live in lib/site/saunaFinder.js; this holds the inputs and renders.
// `catalogue` is the design's fdData (owner, 2026-11-27); `copy` comes from lib/site/finderCopy.js.

const MODES = [
  ["out", "Outdoor"],
  ["in", "Indoor"],
];
const PEOPLE = [
  [0, "Any"],
  [2, "2+"],
  [4, "4+"],
  [6, "6+"],
  [8, "8+"],
];
const CUSTOM = {
  in: { label: "Explore custom indoor saunas", href: "/saunas/indoor/custom" },
  out: { label: "Talk to us about a custom build", href: "/contact" },
};

const INPUT =
  // Same field style as ContactForm.
  "min-h-11 w-full rounded-md border border-sand-400 bg-white px-3.5 py-3 text-body text-ink placeholder:text-taupe-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-walnut";

function Chip({ pressed, onClick, children }) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={cn(
        "inline-flex min-h-11 items-center rounded-full border border-ink px-4 text-small font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-walnut focus-visible:ring-offset-2",
        pressed ? "bg-ink text-white" : "bg-white text-ink hover:bg-linen"
      )}
    >
      {children}
    </button>
  );
}

function Field({ id, field, value, onChange }) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-small font-medium text-ink">
        {field.label}
      </label>
      <input
        id={id}
        type="number"
        inputMode="decimal"
        min="0"
        step="any"
        placeholder={field.placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={INPUT}
      />
    </div>
  );
}

export default function SaunaFinder({ catalogue, copy }) {
  const [mode, setMode] = useState("out");
  const [width, setWidth] = useState("");
  const [depth, setDepth] = useState("");
  const [ceiling, setCeiling] = useState("");
  const [people, setPeople] = useState(0);

  const { ready, results, summary, quoteLines } = findSaunas(catalogue, { mode, width, depth, ceiling, people });
  const custom = CUSTOM[mode];
  const quoteHref = `/contact?${new URLSearchParams({ msg: quoteLines.join("\n") })}`;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-6 rounded-card border border-line bg-white p-6 desktop:p-8">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Where will the sauna go?">
          {MODES.map(([key, label]) => (
            <Chip key={key} pressed={mode === key} onClick={() => setMode(key)}>
              {label}
            </Chip>
          ))}
        </div>
        <div className={cn("grid gap-5", mode === "in" ? "desktop:grid-cols-3" : "desktop:grid-cols-2")}>
          <Field id="finder-width" field={copy.widthField} value={width} onChange={setWidth} />
          <Field id="finder-depth" field={copy.depthField} value={depth} onChange={setDepth} />
          {mode === "in" && <Field id="finder-ceiling" field={copy.ceilingField} value={ceiling} onChange={setCeiling} />}
        </div>
        <div className="flex flex-col gap-3">
          <Html id="finder-people" html={copy.peopleLabel.html} className="text-small text-ink [&_strong]:font-medium" />
          <div className="flex flex-wrap gap-2" role="group" aria-labelledby="finder-people">
            {PEOPLE.map(([n, label]) => (
              <Chip key={n} pressed={people === n} onClick={() => setPeople(n)}>
                {label}
              </Chip>
            ))}
          </div>
        </div>
      </div>

      <div aria-live="polite" className="flex flex-col gap-6">
        {!ready && <Html as="p" html={copy.idle.html} className="text-body text-taupe-700" />}
        {ready && results.length > 0 && <p className="text-body font-medium text-ink">{summary}</p>}
        {ready && results.length === 0 && (
          <div className="flex flex-col gap-1">
            <Html as="p" html={copy.none[0].html} className="text-body text-ink [&_strong]:font-semibold" />
            <Html as="p" html={copy.none[1].html} className="text-body text-taupe-700" />
          </div>
        )}
      </div>

      {results.length > 0 && (
        <ul data-finder-results className="grid gap-5 desktop:grid-cols-4">
          {results.map((result) => (
            <li key={result.href}>
              <FinderCard result={result} />
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Button href={quoteHref} variant="dark" size="lg">
          {copy.quoteLabel}
        </Button>
        <Button href={custom.href} variant="outline-walnut" size="lg">
          {custom.label}
        </Button>
        <Html as="p" html={copy.footnote.html} className="text-caption text-taupe-500 desktop:ml-2 desktop:max-w-md" />
      </div>
    </div>
  );
}
