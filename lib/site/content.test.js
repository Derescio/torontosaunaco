import About from "../../content/redesign/About.json";
import { section, pick, pickAll, groups } from "./content";

describe("content lookup", () => {
  it("finds a section's blocks by name", () => {
    const blocks = section(About, "Approach");
    expect(pick(blocks, "heading").html).toContain("the customer.");
    expect(pick(blocks, "paragraph", 1).text).toMatch(/^We listen first/);
  });

  it("filters headings by level", () => {
    expect(pick(section(About, "About hero"), "heading", 0, { level: 1 }).text).toBe("Customer first. Every time.");
    expect(pickAll(section(About, "About hero"), "heading", { level: 2 })).toEqual([]);
  });

  it("lists every block of a type", () => {
    expect(pickAll(section(About, "Photo strip"), "image")).toHaveLength(3);
  });

  it("throws with the file and name for a missing section", () => {
    expect(() => section(About, "Nope")).toThrow(/About\.dc\.html.*Nope/);
  });

  describe("groups", () => {
    const t = (text) => ({ type: "text", html: text, text });
    const p = (text) => ({ type: "paragraph", html: text, text });

    it("splits blocks into fixed-shape groups", () => {
      expect(groups([t("01"), t("A"), p("a"), t("02"), t("B"), p("b")], ["text", "text", "paragraph"], 2)).toEqual([
        [t("01"), t("A"), p("a")],
        [t("02"), t("B"), p("b")],
      ]);
    });

    it("throws when the count is off", () => {
      expect(() => groups([t("01"), t("A"), p("a")], ["text", "text", "paragraph"], 2)).toThrow(/expected 2 groups of text, text, paragraph/);
    });

    it("throws when a block has the wrong type", () => {
      expect(() => groups([t("01"), p("A"), p("a")], ["text", "text", "paragraph"], 1)).toThrow(/group 1.*paragraph.*text/);
    });

    it("splits About's numbered points into four", () => {
      const blocks = section(About, "What you can count on").slice(2);
      expect(groups(blocks, ["text", "text", "paragraph"], 4).map((g) => g[1].text)).toEqual([
        "Fast response",
        "Customer first",
        "Solutions, not obstacles",
        "Support that lasts",
      ]);
    });
  });

  it("throws with the type, index and place for a missing block", () => {
    expect(() => pick(section(About, "Approach"), "quote", 1)).toThrow(/quote #1.*About\.dc\.html › Approach/);
  });
});
