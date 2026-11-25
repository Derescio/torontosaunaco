/** @jest-environment node */
import seo from "@/content/seo.json";
import { pageSeo, SITE } from "./seo";

const routes = Object.keys(seo.routes);
const BUSINESS = /Store|LocalBusiness|HomeAndConstructionBusiness/;

function nodes(jsonLd) {
  const out = [];
  const walk = (v) => {
    if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === "object") {
      out.push(v);
      Object.values(v).forEach(walk);
    }
  };
  walk(jsonLd);
  return out;
}

describe("pageSeo over every design route", () => {
  it("has all 108 routes", () => {
    expect(routes).toHaveLength(108);
  });

  it.each(routes)("%s follows the site rules", (route) => {
    const result = pageSeo(route);
    const { metadata, jsonLd } = result;
    const row = seo.routes[route].pageMap;

    expect(metadata.openGraph.type).toBe("website");
    expect(metadata.alternates.canonical).toBe(route === "/" ? `${SITE}/` : `${SITE}${route}`);
    expect(metadata.title).toBe(row.title);
    expect(metadata.description).toBe(row.description);

    const text = JSON.stringify(result);
    expect(text).not.toContain("_blob");
    expect(text).not.toMatch(/\/\/thetorontosaunaco\.com|\/\/(www\.)?torontosaunaco\.com/);

    for (const n of nodes(jsonLd)) {
      if (BUSINESS.test([].concat(n["@type"] ?? []).join(" ")) && n.address) {
        expect(n.address.addressLocality).toBe("Schomberg");
      }
      // No catalogue price without one from MongoDB; a Service offer is the $1,750 install rule (CLAUDE.md).
      if ([].concat(n["@type"] ?? []).includes("Service")) {
        if (n.offers) expect(n.offers).toMatchObject({ price: "1750.00", priceCurrency: "CAD" });
      } else {
        expect(n).not.toHaveProperty("offers");
      }
    }
  });

  it("only /cart is noindex", () => {
    expect(routes.filter((r) => pageSeo(r).metadata.robots)).toEqual(["/cart"]);
  });

  it("ignores a trailing slash and returns null for unknown routes", () => {
    expect(pageSeo("/about/")).toEqual(pageSeo("/about"));
    expect(pageSeo("/nope")).toBeNull();
    expect(pageSeo("/")).not.toBeNull();
  });
});
