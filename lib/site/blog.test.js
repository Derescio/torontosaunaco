import { client } from "@/lib/sanity";
import { DESIGN_CARDS, formatDate, toCard, getPosts, getPost, getCards, relatedCards } from "./blog";

jest.mock("@/lib/sanity", () => ({ client: { fetch: jest.fn() } }));

const COVERED = "how-long-does-an-outdoor-sauna-last";
const image = { _type: "image", asset: { _ref: "image-abc-1200x800-jpg", _type: "reference" } };
const post = (slug, extra = {}) => ({ title: `Title ${slug}`, slug, publishedAt: "2026-11-03T15:00:00Z", ...extra });

// jest.setup.js already silences console.error for the logged Sanity failures.
beforeEach(() => client.fetch.mockReset());

describe("design cards", () => {
  it("reads the design's 11 cards with their categories", () => {
    expect(DESIGN_CARDS.size).toBe(11);
    expect(DESIGN_CARDS.get(COVERED).category).toBe("Ownership");
    expect(DESIGN_CARDS.get("building-a-backyard-sauna-for-four-season-enjoyment").category).toBe("Planning");
    expect(DESIGN_CARDS.get(COVERED).image.src).toMatch(/^\.\/assets\/[0-9a-f]{32}\.jpg$/);
  });
});

describe("formatDate", () => {
  it("formats Sanity dates in Toronto time", () => {
    expect(formatDate("2026-11-18T15:00:00Z")).toBe("November 18, 2026");
    expect(formatDate(undefined)).toBeNull();
    expect(formatDate("nope")).toBeNull();
  });
});

describe("toCard", () => {
  it("uses the design's category, summary and photo for a covered post", () => {
    const card = toCard(post(COVERED, { titleimage: image, description: "Sanity summary" }));
    expect(card).toMatchObject({ slug: COVERED, href: `/blog/${COVERED}`, title: `Title ${COVERED}`, date: "November 3, 2026", category: "Ownership" });
    expect(card.summary).toMatch(/^What decides how many years/);
    expect(card.image.kind).toBe("design");
  });

  it("uses Sanity's photo and description for an uncovered post", () => {
    const card = toCard(post("new-post", { titleimage: image, description: "Sanity summary" }));
    expect(card).toMatchObject({ category: null, summary: "Sanity summary", image: { kind: "sanity", source: image, alt: "Title new-post" } });
  });

  it("trims a very long Sanity description to a short summary at a word boundary", () => {
    const long = `${"Winter is hard on cedar. ".repeat(500)}End.`;
    const { summary } = toCard(post("winter", { description: long }));
    expect(summary.length).toBeLessThanOrEqual(160);
    expect(summary).toMatch(/cedar\.…$|\w…$/);
    expect(summary.endsWith(" …")).toBe(false);
    expect(toCard(post("short", { description: "Short one." })).summary).toBe("Short one.");
  });

  it("copes with a post that has no photo, summary or date", () => {
    const card = toCard({ title: "Bare", slug: "bare" });
    expect(card).toMatchObject({ summary: null, image: null, date: null });
  });
});

describe("getCards", () => {
  it("lists Sanity posts in Sanity's order and ignores design cards Sanity no longer has", async () => {
    client.fetch.mockResolvedValue([post("newest"), post(COVERED)]);
    const { cards, fromDesign } = await getCards();
    expect(fromDesign).toBe(false);
    expect(cards.map((c) => c.slug)).toEqual(["newest", COVERED]);
  });

  it("falls back to the design's 11 cards when Sanity returns nothing", async () => {
    client.fetch.mockResolvedValue([]);
    const { cards, fromDesign } = await getCards();
    expect(fromDesign).toBe(true);
    expect(cards).toHaveLength(11);
    expect(cards[0]).toMatchObject({ slug: COVERED, category: "Ownership", date: "November 18, 2026" });
  });

  it("falls back when Sanity fails, without throwing", async () => {
    client.fetch.mockRejectedValue(new Error("down"));
    const { fromDesign } = await getCards();
    expect(fromDesign).toBe(true);
  });

  it("ignores a non-array answer", async () => {
    client.fetch.mockResolvedValue({ oops: true });
    expect(await getPosts()).toEqual([]);
  });
});

describe("getPost", () => {
  it("returns null only when the post really doesn't exist", async () => {
    client.fetch.mockResolvedValue(null);
    expect(await getPost("missing")).toBeNull();
  });

  it("throws when Sanity fails, so ISR keeps serving the last good page instead of caching a 404", async () => {
    client.fetch.mockRejectedValue(new Error("down"));
    await expect(getPost("any")).rejects.toThrow("down");
  });
});

describe("toCard with a malformed Sanity image", () => {
  it("drops an image whose asset reference can't be read, instead of crashing the page", () => {
    expect(toCard(post("bad", { titleimage: { asset: { _ref: "garbage" } } })).image).toBeNull();
  });
});

describe("relatedCards", () => {
  it("returns three others", () => {
    const cards = ["a", "b", "c", "d"].map((slug) => ({ slug }));
    expect(relatedCards(cards, "b").map((c) => c.slug)).toEqual(["a", "c", "d"]);
  });
});
