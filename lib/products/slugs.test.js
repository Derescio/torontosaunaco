/** @jest-environment node */
import { kindOf, productPath, slugFromRoute } from "./slugs";

describe("kindOf", () => {
  it("reads plunges, showers and hot tubs from type", () => {
    expect(kindOf({ type: "Cold Plunge" })).toBe("cold-plunge");
    expect(kindOf({ type: "Outdoor Shower" })).toBe("shower");
    expect(kindOf({ type: "Hot Tub" })).toBe("hot-tub");
  });

  it("treats every other type as a sauna", () => {
    expect(kindOf({ type: "Indoor" })).toBe("sauna");
    expect(kindOf({ type: "Pure Cube" })).toBe("sauna");
    expect(kindOf({})).toBe("sauna");
  });
});

describe("productPath", () => {
  it("prefixes the slug with its category root", () => {
    expect(productPath({ type: "Indoor", slug: "indoor/pure-cube-552" })).toBe("/saunas/indoor/pure-cube-552");
    expect(productPath({ type: "Cold Plunge", slug: "arctic" })).toBe("/cold-plunges/arctic");
    expect(productPath({ type: "Outdoor Shower", slug: "sunlight" })).toBe("/outdoor-showers/sunlight");
  });

  it("has no path for hot tubs or products without a slug", () => {
    expect(productPath({ type: "Hot Tub", slug: "x" })).toBeNull();
    expect(productPath({ type: "Barrel" })).toBeNull();
    expect(productPath(null)).toBeNull();
  });
});

describe("slugFromRoute", () => {
  it("strips the category root", () => {
    expect(slugFromRoute("/saunas/indoor/pure-cube-552")).toBe("indoor/pure-cube-552");
    expect(slugFromRoute("/cold-plunges/arctic")).toBe("arctic");
    expect(slugFromRoute("/outdoor-showers/rainbow-barrel")).toBe("rainbow-barrel");
  });

  it("returns null for roots and other routes", () => {
    expect(slugFromRoute("/saunas")).toBeNull();
    expect(slugFromRoute("/saunas/")).toBeNull();
    expect(slugFromRoute("/sauna-heaters/revive")).toBeNull();
  });
});
