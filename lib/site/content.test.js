import About from "../../content/redesign/About.json";
import { section, pick, pickAll } from "./content";

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

  it("throws with the type, index and place for a missing block", () => {
    expect(() => pick(section(About, "Approach"), "quote", 1)).toThrow(/quote #1.*About\.dc\.html › Approach/);
  });
});
