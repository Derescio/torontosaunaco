// Sauna Finder fit rules, ported from the design (SaunaFinder.dc.html, fdVals). Pure: the catalogue is passed in, so a
// MongoDB-built catalogue in the same shape can replace the design's later (Phase 3).
// Catalogue item: { n, href, img, k: "out" | "in", note, c (core), b (best seller), s: [{ l, w, d, h, p, seats }] },
// sizes in inches. Inputs are in feet.

const NEAR = 15; // a "close fit" is within this many inches
const CEILING_SLACK = 2; // inches of ceiling a close fit may lack

export function money(n) {
  return `$${Math.round(n).toLocaleString("en-CA")}`;
}

export function ft(feet) {
  let whole = Math.floor(feet);
  let inches = Math.round((feet - whole) * 12);
  if (inches === 12) {
    whole += 1;
    inches = 0;
  }
  return inches ? `${whole}′ ${inches}″` : `${whole}′`;
}

const positive = (v) => {
  const n = parseFloat(v);
  return n > 0 ? n : 0;
};

function matchItem(item, { sw, sd, sh, people, core }) {
  const ok = [];
  const close = [];
  for (const z of Array.isArray(item.s) ? item.s : []) {
    if (people && z.seats < people) continue;
    const fits = (slack) => (sw >= z.w + slack && sd >= z.d + slack) || (sw >= z.d + slack && sd >= z.w + slack);
    const ceilingOk = !sh || sh >= z.h;
    const ceilingNear = !sh || sh >= z.h - CEILING_SLACK;
    if (fits(0) && ceilingOk) ok.push(z);
    else if (fits(-NEAR) && ceilingNear) close.push(z);
  }
  const good = ok.length > 0;
  const use = good ? ok : close;
  if (!use.length) return null;

  const multi = item.s.length > 1;
  const lowest = Math.min(...use.map((z) => z.p));
  const smallest = [...use].sort((a, b) => a.w * a.d - b.w * b.d)[0];
  const sizes = multi
    ? `${good ? "Fits: " : "Close: "}${use.map((z) => z.l).join(", ")}`
    : `Footprint about ${ft(smallest.w / 12)} × ${ft(smallest.d / 12)}${item.note ? ` · ${item.note}` : ""}`;

  return {
    name: item.n,
    href: item.href,
    img: item.img,
    alt: `${item.n}, The Toronto Sauna Co.`,
    detail: `${sizes}${good ? "" : " · within a foot of your space"}`,
    seats: `Seats up to ${Math.max(...use.map((z) => z.seats))}`,
    price: `${multi ? "From " : ""}${money(lowest)}`,
    badge: good ? "Fits" : "Close fit",
    good,
    core,
    best: Boolean(item.b),
    lowest,
  };
}

export function findSaunas(catalogue, { mode = "out", width, depth, ceiling, people = 0 } = {}) {
  const W = positive(width);
  const D = positive(depth);
  const H = positive(ceiling);
  const ready = W > 0 && D > 0;
  const indoor = mode === "in";
  const where = indoor ? "indoor" : "outdoor";

  let results = [];
  if (ready) {
    const ctx = { sw: W * 12, sd: D * 12, sh: indoor && H > 0 ? H * 12 : 0, people: Number(people) || 0 };
    const matched = (Array.isArray(catalogue) ? catalogue : [])
      .filter((item) => item.k === mode)
      .map((item) => matchItem(item, { ...ctx, core: indoor || Boolean(item.c) }))
      .filter(Boolean);

    const fitsFirst = (a, b) => (a.good === b.good ? 0 : a.good ? -1 : 1);
    const core = matched
      .filter((r) => r.core)
      .sort((a, b) => fitsFirst(a, b) || (a.best === b.best ? 0 : a.best ? -1 : 1) || a.lowest - b.lowest);
    const value = matched
      .filter((r) => !r.core)
      .sort((a, b) => fitsFirst(a, b) || a.lowest - b.lowest)
      .slice(0, core.length ? 2 : 4)
      .map((r) => ({ ...r, badge: r.good ? "Value pick" : "Value pick · close fit" }));
    results = [...core.map((r) => (r.best && r.good ? { ...r, badge: "Best seller · fits" } : r)), ...value].map(
      ({ core: _c, best: _b, lowest: _l, ...r }) => r
    );
  }

  const close = results.filter((r) => !r.good).length;
  const one = results.length === 1;
  const summary = results.length
    ? `${results.length} ${where} sauna${one ? " fits" : "s fit"} or come${one ? "s" : ""} close to your ${ft(W)} × ${ft(D)} space${
        close ? ` (${close} close)` : ""
      }.`
    : "";

  const quoteLines = ["Hi, I'd like a quote for a sauna.", `Where: ${where}`];
  if (ready) quoteLines.push(`Space: ${ft(W)} x ${ft(D)}`);
  if (indoor && H > 0) quoteLines.push(`Ceiling: ${ft(H)}`);
  if (people) quoteLines.push(`People: ${people}+`);

  return { ready, results, summary, quoteLines };
}

/**
 * Catalogue items whose product page doesn't exist (their href isn't in `paths`, the site's product URLs) link to the
 * contact form with the model named, instead of to a 404. With no catalogue (null or empty: the database couldn't be
 * read) the design's links are kept.
 */
export function linkProductPages(catalogue, paths) {
  if (!(paths instanceof Set) || paths.size === 0) return catalogue;
  return catalogue.map((item) =>
    paths.has(item.href)
      ? item
      : { ...item, href: `/contact?${new URLSearchParams({ msg: `Hi, I'd like a quote for the ${item.n.replace(/^The /, "")}.` })}` }
  );
}
