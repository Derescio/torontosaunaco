import { STAGES, UPDATED, STATUS_LABELS } from "./progress";
import { isSiteRoute } from "./routes";

const items = STAGES.flatMap((stage) => stage.items);

describe("progress data", () => {
  it("has the six stages in build order", () => {
    expect(STAGES.map((s) => s.title)).toEqual([
      "Look and feel",
      "Information pages",
      "Products",
      "Quote requests",
      "Search and final checks",
      "Launch",
    ]);
  });

  it("uses only known statuses", () => {
    for (const item of items) expect(Object.keys(STATUS_LABELS)).toContain(item.status);
  });

  it("links every finished page, and only to pages on the new site", () => {
    for (const item of items.filter((i) => i.href)) expect(isSiteRoute(item.href)).toBe(true);
    for (const item of items.filter((i) => i.status === "done" && i.page)) expect(item.href).toBeDefined();
  });

  it("never links a page that isn't finished", () => {
    expect(items.filter((i) => i.href && i.status !== "done")).toEqual([]);
  });

  it("has a readable update date", () => {
    expect(UPDATED).toMatch(/^\d{1,2} [A-Z][a-z]+ \d{4}$/);
  });
});
