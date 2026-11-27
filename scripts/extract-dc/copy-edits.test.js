/** @jest-environment node */
import { COPY_EDITS, applyCopyEdits, unusedEdits } from "./copy-edits.mjs";

const OLD = "Schomberg (King Township)";

describe("copy edits", () => {
  it("first rule is the owner's Schomberg rule", () => {
    expect(COPY_EDITS[0]).toMatchObject({ find: OLD, replace: "Schomberg" });
    expect(COPY_EDITS[0].why).toMatch(/Schomberg/);
  });

  it("replaces in nested strings and counts each occurrence", () => {
    const counts = new Map();
    const out = applyCopyEdits(
      { a: `at ${OLD}, ON`, b: [{ html: `x ${OLD}` }], n: 3, t: true, z: null },
      undefined,
      counts
    );
    expect(out).toEqual({ a: "at Schomberg, ON", b: [{ html: "x Schomberg" }], n: 3, t: true, z: null });
    expect(counts.get(OLD)).toBe(2);
  });

  it("does not mutate the input", () => {
    const input = { a: [`in ${OLD}`] };
    applyCopyEdits(input);
    expect(input.a[0]).toBe(`in ${OLD}`);
  });

  it("reports rules that matched nothing", () => {
    expect(unusedEdits(new Map())).toEqual(COPY_EDITS);
    const counts = new Map();
    applyCopyEdits({ a: OLD }, undefined, counts);
    expect(unusedEdits(counts)).toEqual([]);
  });

  it("accepts a custom rule list", () => {
    const edits = [{ find: "a", replace: "b", why: "test" }];
    expect(applyCopyEdits(["banana"], edits)).toEqual(["bbnbnb"]);
  });
});
