/** @jest-environment node */
import { idRedirects } from "./idRedirects";

const permanent = (source, destination) => ({ source, destination, permanent: true });

describe("idRedirects", () => {
  it("sends every old ID URL of a product to its slug URL", () => {
    expect(
      idRedirects([
        { _id: "6917e4d53f05f33c3f08ca5d", type: "Indoor", slug: "indoor/pure-cube-552" },
        { _id: "668af06648215c199c421a66", type: "Cold Plunge", slug: "arctic" },
        { _id: "668af06648215c199c424b79", type: "Outdoor Shower", slug: "sunlight" },
      ])
    ).toEqual([
      permanent("/saunas/6917e4d53f05f33c3f08ca5d", "/saunas/indoor/pure-cube-552"),
      permanent("/saunas/668af06648215c199c421a66", "/cold-plunges/arctic"),
      permanent("/cold-plunge/668af06648215c199c421a66", "/cold-plunges/arctic"),
      permanent("/saunas/668af06648215c199c424b79", "/outdoor-showers/sunlight"),
      permanent("/showers/668af06648215c199c424b79", "/outdoor-showers/sunlight"),
    ]);
  });

  it("skips products with no slug, hot tubs, and anything that isn't an array", () => {
    expect(idRedirects([{ _id: "691273a0fffa32247e8079f5", type: "Barrel" }, { _id: "668af06648215c199c423a66", type: "Hot Tub", slug: "tub" }])).toEqual([]);
    expect(idRedirects(null)).toEqual([]);
  });

  it("accepts ObjectId-like _id values", () => {
    const _id = { toString: () => "668af06648215c199c406a5f" };
    expect(idRedirects([{ _id, type: "Pure Cube", slug: "pure-cube-552" }])).toEqual([
      permanent("/saunas/668af06648215c199c406a5f", "/saunas/pure-cube-552"),
    ]);
  });
});
