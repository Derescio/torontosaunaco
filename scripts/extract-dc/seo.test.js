/** @jest-environment node */
import { buildSeoIndex } from "./seo.mjs";

const page = (route, title) => ({
  file: `${title}.dc.html`,
  route,
  head: { title },
  pageMap: { route, title },
  data: { big: true },
  sections: [{ blocks: [] }],
  warnings: [],
});

describe("buildSeoIndex", () => {
  it("keeps only head and page-map row per route, sorted, skipping pages without a route", () => {
    const index = buildSeoIndex([page("/zeta", "Z"), page(null, "Stray"), page("/about", "A")]);
    expect(Object.keys(index.routes)).toEqual(["/about", "/zeta"]);
    expect(index.routes["/about"]).toEqual({ head: { title: "A" }, pageMap: { route: "/about", title: "A" } });
  });
});
