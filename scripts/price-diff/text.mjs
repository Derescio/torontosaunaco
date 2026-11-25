// Text helpers for pairing design and website prices: label tokens, similarity, money parsing.

// "supply"/"professional" qualify install options ("Supply_Install", "Professional Install") without naming them.
const STOP = new Set(["the", "a", "and", "sauna", "saunas", "with", "package", "upgrade", "standard", "supply", "professional"]);

function stem(word) {
  if (word.endsWith("ation") && word.length > 6) return word.slice(0, -5);
  if (word.endsWith("s") && word.length > 3 && !/\d/.test(word)) return word.slice(0, -1);
  return word;
}

/** Normalised tokens of a label. Sizes ("7' × 6'") and power ("7.5 kW") each become a single token. */
export function tokens(label) {
  let s = String(label ?? "").toLowerCase();
  s = s.replace(/[’′‘]/g, "'").replace(/×/g, "x").replace(/\bw\//g, " with ");
  s = s.replace(/(\d+)\s*'?\s*x\s*(\d+)\s*'?/g, " $1x$2 ");
  s = s.replace(/(\d+(?:\.\d+)?)\s*kw\b/g, " $1kw ");
  // "3-phase" is one token; "half-moon" is two words, so it matches "Half Moon".
  s = s.replace(/(\d)-([a-z0-9])|([a-z0-9])-(\d)/g, "$1$3$2$4");
  return s
    .split(/[^a-z0-9.]+/)
    .map((t) => (/^\d+(\.\d+)?kw$/.test(t) ? t : t.replace(/\./g, "")))
    .filter((t) => t && !STOP.has(t))
    .map(stem);
}

/** Dice coefficient on token sets, 0–1. */
export function similarity(a, b) {
  const x = new Set(tokens(a));
  const y = new Set(tokens(b));
  if (!x.size || !y.size) return 0;
  let shared = 0;
  for (const t of x) if (y.has(t)) shared++;
  return (2 * shared) / (x.size + y.size);
}

/** A price as a number, or null when it isn't one ("Call", null, NaN). */
export function parseMoney(v) {
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  if (typeof v !== "string") return null;
  const m = /^\s*\$?\s*([\d,]+(?:\.\d+)?)\s*$/.exec(v);
  return m ? Number(m[1].replace(/,/g, "")) : null;
}

export const samePrice = (a, b) => Math.abs(a - b) < 0.005;
