/** @jest-environment node */
import Products from "@/models/Products";
import { resolveProductParam, staticSlugs } from "./resolve";

jest.mock("@/config/db", () => jest.fn(async () => {}));
jest.mock("@/models/Products", () => ({ findById: jest.fn(), findOne: jest.fn(), find: jest.fn() }));

const lean = (value) => ({ lean: async () => value });
const ID = "668af06648215c199c421a66";

beforeEach(() => {
  Products.findById.mockReturnValue(lean(null));
  Products.findOne.mockReturnValue(lean(null));
  Products.find.mockReturnValue(lean([]));
});

describe("resolveProductParam with an ObjectId", () => {
  it("redirects a product with a slug to its own family's URL, whatever route it came in on", async () => {
    Products.findById.mockReturnValue(lean({ _id: ID, type: "Cold Plunge", slug: "arctic" }));
    await expect(resolveProductParam(ID, "sauna")).resolves.toEqual({ redirectTo: "/cold-plunges/arctic" });
  });

  it("renders a product with no slug yet (production before the backfill)", async () => {
    Products.findById.mockReturnValue(lean({ _id: ID, type: "Barrel", name: "Barrel Sauna" }));
    await expect(resolveProductParam(ID, "sauna")).resolves.toEqual({ product: { _id: ID, type: "Barrel", name: "Barrel Sauna" } });
  });

  it("renders a hot tub even though it has a slug", async () => {
    Products.findById.mockReturnValue(lean({ _id: ID, type: "Hot Tub", slug: "the-cascade-tub-3-x7" }));
    await expect(resolveProductParam(ID, "sauna")).resolves.toHaveProperty("product");
  });

  it("returns null for an unknown ID", async () => {
    await expect(resolveProductParam(ID, "sauna")).resolves.toBeNull();
  });
});

describe("resolveProductParam with slugOnly (the new slug routes)", () => {
  it("never resolves an ObjectId, even one that would render on the old routes", async () => {
    Products.findById.mockReturnValue(lean({ _id: ID, type: "Hot Tub", slug: "the-cascade-tub-3-x7" }));
    await expect(resolveProductParam(ID, "cold-plunge", { slugOnly: true })).resolves.toBeNull();
    expect(Products.findById).not.toHaveBeenCalled();
  });

  it("still resolves a slug", async () => {
    Products.findOne.mockReturnValue(lean({ _id: ID, type: "Cold Plunge", slug: "arctic" }));
    await expect(resolveProductParam("arctic", "cold-plunge", { slugOnly: true })).resolves.toHaveProperty("product");
  });
});

describe("resolveProductParam with a slug", () => {
  it("looks up the lowercased slug and renders a product of the right family", async () => {
    Products.findOne.mockReturnValue(lean({ _id: ID, type: "Cold Plunge", slug: "arctic" }));
    await expect(resolveProductParam("Arctic", "cold-plunge")).resolves.toEqual({ product: { _id: ID, type: "Cold Plunge", slug: "arctic" } });
    expect(Products.findOne).toHaveBeenCalledWith({ slug: "arctic" });
  });

  it("returns null for a product of another family", async () => {
    Products.findOne.mockReturnValue(lean({ _id: ID, type: "Cold Plunge", slug: "arctic" }));
    await expect(resolveProductParam("arctic", "sauna")).resolves.toBeNull();
  });

  it("returns null when nothing has the slug", async () => {
    await expect(resolveProductParam("indoor/x", "sauna")).resolves.toBeNull();
  });

  it("returns null for an empty param without querying", async () => {
    await expect(resolveProductParam("", "sauna")).resolves.toBeNull();
    expect(Products.findOne).not.toHaveBeenCalled();
  });

  it("serializes ObjectIds and dates to plain JSON", async () => {
    Products.findOne.mockReturnValue(lean({ _id: { toJSON: () => ID }, type: "Barrel", slug: "barrel-sauna", updatedAt: new Date(0) }));
    const { product } = await resolveProductParam("barrel-sauna", "sauna");
    expect(product).toEqual({ _id: ID, type: "Barrel", slug: "barrel-sauna", updatedAt: "1970-01-01T00:00:00.000Z" });
  });
});

describe("staticSlugs", () => {
  beforeEach(() => {
    Products.find.mockReturnValue(
      lean([
        { type: "Indoor", slug: "indoor/pure-cube-552" },
        { type: "Pure Cube", slug: "pure-cube-552" },
        { type: "Cold Plunge", slug: "arctic" },
        { type: "Hot Tub", slug: "tub" },
      ])
    );
  });

  it("lists outdoor-path saunas without indoor/ slugs", async () => {
    await expect(staticSlugs("sauna", { indoor: false })).resolves.toEqual(["pure-cube-552"]);
  });

  it("lists indoor saunas with the folder removed", async () => {
    await expect(staticSlugs("sauna", { indoor: true })).resolves.toEqual(["pure-cube-552"]);
  });

  it("lists another family's slugs", async () => {
    await expect(staticSlugs("cold-plunge")).resolves.toEqual(["arctic"]);
  });
});
