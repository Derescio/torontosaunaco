/** @jest-environment node */
import Finder from "../../content/redesign/SaunaFinder.json";
import { findSaunas, ft, money, linkProductPages } from "./saunaFinder";
import { designFinder } from "./saunaFinder.reference";

const DATA = Finder.data.fdData;
const names = (r) => r.results.map((x) => x.name);
const byName = (r, n) => r.results.find((x) => x.name === n);

describe("ft and money", () => {
  it("formats feet and inches like the design", () => {
    expect(ft(10)).toBe("10′");
    expect(ft(5.9166)).toBe("5′ 11″");
    expect(ft(7.999)).toBe("8′");
  });

  it("formats prices in Canadian dollars", () => {
    expect(money(11884)).toBe("$11,884");
  });
});

describe("findSaunas, 10 × 8 ft outdoor", () => {
  const r = findSaunas(DATA, { mode: "out", width: "10", depth: "8" });

  it("lists the design's 15 saunas in order", () => {
    expect(names(r)).toEqual([
      "The Pure Cube 552",
      "The Neptune Mini",
      "Pure Cube 672",
      "The Hudson",
      "The Studio Six Mini",
      "The Neptune",
      "Pure Cube Trinity",
      "Pure Cube 572",
      "Pure Cube 582 with Shower",
      "Pure Cube 582",
      "Pure Cube 772",
      "The Studio Six Max",
      "The Orion",
      "The Harmony Barrel Sauna",
      "The MiniPOD Sauna",
    ]);
  });

  it("badges best sellers, fits, close fits and value picks", () => {
    expect(r.results.slice(0, 6).every((x) => x.badge === "Best seller · fits")).toBe(true);
    expect(byName(r, "The Studio Six Max").badge).toBe("Fits");
    expect(byName(r, "The Orion").badge).toBe("Close fit");
    expect(byName(r, "The Orion").detail).toMatch(/ · within a foot of your space$/);
    expect(byName(r, "The Harmony Barrel Sauna").badge).toBe("Value pick");
    expect(byName(r, "The MiniPOD Sauna").badge).toBe("Value pick");
  });

  it("summarises like the design", () => {
    expect(r.ready).toBe(true);
    expect(r.summary).toBe("15 outdoor saunas fit or come close to your 10′ × 8′ space (1 close).");
  });
});

describe("findSaunas rules", () => {
  it("turns the sauna either way", () => {
    expect(names(findSaunas(DATA, { width: 6, depth: 8 }))).toEqual(names(findSaunas(DATA, { width: 8, depth: 6 })));
  });

  it("lists fitting sizes and a From price for multi-size saunas", () => {
    const only = DATA.filter((m) => m.n === "Barrel Sauna");
    const barrel = byName(findSaunas(only, { width: 12, depth: 12 }), "Barrel Sauna");
    expect(barrel.detail.startsWith("Fits: 7' × 4'")).toBe(true);
    expect(barrel.price.startsWith("From $")).toBe(true);
  });

  it("adds a single-size sauna's note", () => {
    expect(byName(findSaunas(DATA, { width: 10, depth: 8 }), "Pure Cube Trinity").detail).toContain("· Corner design");
  });

  it("filters by seats", () => {
    const r = findSaunas(DATA, { width: 20, depth: 20, people: 6 });
    expect(r.results.length).toBeGreaterThan(0);
    for (const x of r.results) expect(Number(x.seats.replace("Seats up to ", ""))).toBeGreaterThanOrEqual(6);
  });

  it("checks the ceiling indoors, with 2 inches of slack for close fits", () => {
    const r = findSaunas(DATA, { mode: "in", width: 8, depth: 8, ceiling: "7.2" });
    expect(byName(r, "Pure Cube Indoor 552").badge).toBe("Fits");
    expect(byName(r, "The Element Nook").badge).toBe("Close fit");
    expect(findSaunas(DATA, { mode: "in", width: 8, depth: 8, ceiling: 6 }).results).toEqual([]);
  });

  it("ignores the ceiling outdoors", () => {
    expect(findSaunas(DATA, { mode: "out", width: 10, depth: 8, ceiling: "5" })).toEqual(findSaunas(DATA, { mode: "out", width: 10, depth: 8 }));
  });

  it.each(["", "0", "-3", "abc", undefined])("is not ready for width %p", (width) => {
    expect(findSaunas(DATA, { width, depth: 8 })).toMatchObject({ ready: false, results: [], summary: "" });
  });

  it("accepts decimals and huge spaces without NaN", () => {
    expect(findSaunas(DATA, { width: "8.5", depth: "8" }).ready).toBe(true);
    const r = findSaunas(DATA, { width: "1000", depth: "1000" });
    const core = DATA.filter((m) => m.k === "out" && m.c).length;
    expect(r.results.filter((x) => x.badge !== "Value pick").length).toBe(core);
    expect(JSON.stringify(r)).not.toMatch(/NaN/);
  });

  it("builds the quote lines", () => {
    expect(findSaunas(DATA, { mode: "in", width: 6, depth: 7, ceiling: 8, people: 4 }).quoteLines).toEqual([
      "Hi, I'd like a quote for a sauna.",
      "Where: indoor",
      "Space: 6′ x 7′",
      "Ceiling: 8′",
      "People: 4+",
    ]);
  });
});

describe("findSaunas matches the design's own logic", () => {
  const SIZES = [3, 5, 6.5, 8, 10, 12, 20];
  const cases = [];
  for (const mode of ["out", "in"])
    for (const w of SIZES)
      for (const d of SIZES)
        for (const h of ["", 6, 7.5])
          for (const ppl of [0, 2, 4, 6, 8]) cases.push({ mode, w, d, h, ppl });

  it(`agrees on all ${cases.length} cases`, () => {
    for (const c of cases) {
      const ours = findSaunas(DATA, { mode: c.mode, width: c.w, depth: c.d, ceiling: c.h, people: c.ppl });
      const theirs = designFinder(DATA, c);
      const view = (x) => [x.name ?? x.n, x.badge, x.detail, x.seats, x.price];
      expect({ c, results: ours.results.map(view), summary: ours.summary, lines: ours.quoteLines }).toEqual({
        c,
        results: theirs.res.map(view),
        summary: theirs.summary,
        lines: theirs.lines,
      });
    }
  });
});

describe("linkProductPages", () => {
  const paths = new Set(DATA.map((m) => m.href).filter((h) => !["/saunas/pure-cube-772", "/saunas/ct-mini-pod"].includes(h)));

  it("sends saunas without a product page to the contact form, naming the model", () => {
    const linked = linkProductPages(DATA, paths);
    const cube = linked.find((m) => m.n === "Pure Cube 772");
    expect(cube.href.startsWith("/contact?msg=")).toBe(true);
    expect(new URLSearchParams(cube.href.split("?")[1]).get("msg")).toBe("Hi, I'd like a quote for the Pure Cube 772.");
    expect(linked.find((m) => m.n === "The Neptune").href).toBe("/saunas/neptune");
    expect(linked).toHaveLength(DATA.length);
  });

  it("keeps the design's links when the catalogue is unknown or empty", () => {
    expect(linkProductPages(DATA, null)).toBe(DATA);
    expect(linkProductPages(DATA, new Set())).toBe(DATA);
  });

  it("keeps every result link unique", () => {
    const hrefs = findSaunas(linkProductPages(DATA, paths), { width: 30, depth: 30 }).results.map((r) => r.href);
    expect(new Set(hrefs).size).toBe(hrefs.length);
  });
});
