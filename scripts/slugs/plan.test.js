/** @jest-environment node */
import { planSlugs } from "./plan.mjs";

const design = (file, route, category, name = file) => ({ file, route, category, name, points: [] });
const doc = (_id, name, extra = {}) => ({ _id, name, ...extra });
const bySlugOf = (rows, id) => rows.find((r) => r.id === id);

const indoor552 = design("SaunaIndoorPureCube552.dc.html", "/saunas/indoor/pure-cube-552", "Indoor saunas");
const outdoor552 = design("SaunaPureCube552.dc.html", "/saunas/pure-cube-552", "Outdoor saunas");
const arctic = design("PlungeArctic.dc.html", "/cold-plunges/arctic", "Cold plunges");

const base = { products: [], accessories: [], overrides: { products: {} }, primary: {} };

describe("planSlugs", () => {
  it("gives a matched product its design route below the category root", () => {
    const { rows, errors } = planSlugs({
      ...base,
      designProducts: [indoor552, outdoor552],
      products: [doc("a", "Indoor Sauna - 550"), doc("b", "The Pure Cube 552")],
      overrides: { products: { "SaunaIndoorPureCube552.dc.html": ["a"], "SaunaPureCube552.dc.html": ["b"] } },
    });
    expect(errors).toEqual([]);
    expect(bySlugOf(rows, "a")).toEqual({ collection: "products", id: "a", name: "Indoor Sauna - 550", slug: "indoor/pure-cube-552", source: "design" });
    expect(bySlugOf(rows, "b").slug).toBe("pure-cube-552");
  });

  it("uses primary.json when a page matches several products; the rest fall back to their names", () => {
    const { rows, errors } = planSlugs({
      ...base,
      designProducts: [arctic],
      products: [doc("test", "The Arctic Plunge Tub - Clear Red Cedar test"), doc("knotty", "The Arctic Plunge Tub - Knotty Red Cedar")],
      overrides: { products: { "PlungeArctic.dc.html": ["test", "knotty"] } },
      primary: { "PlungeArctic.dc.html": "knotty" },
    });
    expect(errors).toEqual([]);
    expect(bySlugOf(rows, "knotty")).toMatchObject({ slug: "arctic", source: "design" });
    expect(bySlugOf(rows, "test")).toMatchObject({ slug: "the-arctic-plunge-tub-clear-red-cedar-test", source: "name" });
  });

  it("reports a page that matches several products with no primary pick", () => {
    const { errors } = planSlugs({
      ...base,
      designProducts: [arctic],
      products: [doc("test", "Arctic A"), doc("knotty", "Arctic B")],
      overrides: { products: { "PlungeArctic.dc.html": ["test", "knotty"] } },
    });
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain("PlungeArctic.dc.html");
    expect(errors[0]).toContain("knotty");
  });

  it("reports a primary pick that isn't among the matches", () => {
    const { errors } = planSlugs({
      ...base,
      designProducts: [arctic],
      products: [doc("test", "Arctic A"), doc("knotty", "Arctic B")],
      overrides: { products: { "PlungeArctic.dc.html": ["test", "knotty"] } },
      primary: { "PlungeArctic.dc.html": "other" },
    });
    expect(errors).toHaveLength(1);
  });

  it("falls back to the name for products with no design page", () => {
    const { rows } = planSlugs({ ...base, designProducts: [], products: [doc("tub", "The Cascade Tub 3'x7'", { type: "Hot Tub" })] });
    expect(bySlugOf(rows, "tub")).toMatchObject({ slug: "the-cascade-tub-3-x7", source: "name" });
  });

  it("numbers accessories that share a name", () => {
    const { rows } = planSlugs({
      ...base,
      designProducts: [],
      accessories: [doc("p1", "Supreme Sauna Accessory Package"), doc("p2", "Supreme Sauna Accessory Package")],
    });
    expect(rows.map((r) => [r.collection, r.slug])).toEqual([
      ["accessories", "supreme-sauna-accessory-package"],
      ["accessories", "supreme-sauna-accessory-package-1"],
    ]);
  });

  it("keeps a slug the document already has, even when the design says otherwise", () => {
    const { rows } = planSlugs({
      ...base,
      designProducts: [arctic],
      products: [doc("knotty", "Arctic", { slug: "custom" })],
      overrides: { products: { "PlungeArctic.dc.html": ["knotty"] } },
    });
    expect(rows).toEqual([{ collection: "products", id: "knotty", name: "Arctic", slug: "custom", source: "existing" }]);
  });

  it("assigns design slugs before name fallbacks, so a fallback that collides gets -1", () => {
    const { rows } = planSlugs({
      ...base,
      designProducts: [design("ShowerSunlight.dc.html", "/outdoor-showers/sunlight", "Outdoor showers")],
      products: [doc("other", "Sunlight"), doc("real", "Sunlight Outdoor Shower")],
      overrides: { products: { "ShowerSunlight.dc.html": ["real"] } },
    });
    expect(bySlugOf(rows, "real").slug).toBe("sunlight");
    expect(bySlugOf(rows, "other").slug).toBe("sunlight-1");
  });

  it("reports two documents that already share a slug", () => {
    const { errors } = planSlugs({ ...base, designProducts: [], products: [doc("a", "A", { slug: "same" }), doc("b", "B", { slug: "same" })] });
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain("same");
  });

  it("reports one product matched by two design pages", () => {
    const { errors } = planSlugs({
      ...base,
      designProducts: [outdoor552, design("SaunaPureCube552b.dc.html", "/saunas/pure-cube-552b", "Outdoor saunas")],
      products: [doc("b", "The Pure Cube 552")],
      overrides: { products: { "SaunaPureCube552.dc.html": ["b"], "SaunaPureCube552b.dc.html": ["b"] } },
    });
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain("b");
  });

  it("ignores heater and accessory design pages", () => {
    const { rows } = planSlugs({
      ...base,
      designProducts: [design("HeaterRevive.dc.html", "/sauna-heaters/revive", "Heaters"), design("Accessories.dc.html", "/accessories", "Accessories")],
      products: [doc("p", "Homecraft Revive")],
      overrides: { products: { "HeaterRevive.dc.html": ["p"] } },
    });
    expect(bySlugOf(rows, "p")).toMatchObject({ slug: "homecraft-revive", source: "name" });
  });
});
