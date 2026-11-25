/** @jest-environment node */
import { fetchProducts } from "@/assets/utils/request";
import sitemap from "./sitemap";

jest.mock("@/assets/utils/request", () => ({ fetchProducts: jest.fn() }));
jest.mock("@/config/db", () => jest.fn(async () => {}));
jest.mock("@/models/Heaters", () => ({ find: () => ({ lean: async () => [] }) }));

const SITE = "https://www.thetorontosaunaco.com";

describe("sitemap product URLs", () => {
  beforeEach(() => {
    fetchProducts.mockResolvedValue([
      { _id: "6917e50d3f05f33c3f08ca61", type: "Cold Plunge", slug: "glacier" },
      { _id: "6917e4d53f05f33c3f08ca5d", type: "Indoor", slug: "indoor/pure-cube-552" },
      { _id: "691273a0fffa32247e8079f5", type: "Barrel" },
      { _id: "668af06648215c199c423a66", type: "Hot Tub", slug: "the-cascade-tub-3-x7" },
    ]);
  });

  it("lists slug URLs, falling back to the ID URL with no slug or no new page", async () => {
    const urls = (await sitemap()).map((e) => e.url);
    expect(urls).toEqual(
      expect.arrayContaining([
        `${SITE}/cold-plunges/glacier`,
        `${SITE}/saunas/indoor/pure-cube-552`,
        `${SITE}/saunas/691273a0fffa32247e8079f5`,
        `${SITE}/saunas/668af06648215c199c423a66`,
      ])
    );
  });

  it("lists no ID URL for a product that has a slug page", async () => {
    const urls = (await sitemap()).map((e) => e.url);
    expect(urls.some((u) => u.includes("6917e50d3f05f33c3f08ca61"))).toBe(false);
    expect(urls.some((u) => u.includes("6917e4d53f05f33c3f08ca5d"))).toBe(false);
  });
});
