/** @jest-environment node */
import { saunaMetadata, saunaJsonLd } from "./saunaPage";

jest.mock("@/components/sauna", () => ({ SaunaProductClient: () => null }));

const ID = "6917e4d53f05f33c3f08ca5d";

describe("sauna page SEO", () => {
  it("uses the slug URL as canonical and JSON-LD url once the product has a slug", () => {
    const product = { _id: ID, name: "Indoor Sauna - 550", type: "Indoor", slug: "indoor/pure-cube-552" };
    const url = "https://www.thetorontosaunaco.com/saunas/indoor/pure-cube-552";
    const meta = saunaMetadata(product);
    expect(meta.alternates.canonical).toBe(url);
    expect(meta.openGraph.url).toBe(url);
    expect(meta.openGraph.type).toBe("website");
    expect(saunaJsonLd(product).url).toBe(url);
    expect(saunaJsonLd(product).sku).toBe(ID);
  });

  it("falls back to the ID URL when there is no slug yet", () => {
    const product = { _id: ID, name: "Barrel Sauna", type: "Barrel" };
    expect(saunaMetadata(product).alternates.canonical).toBe(`https://www.thetorontosaunaco.com/saunas/${ID}`);
  });

  it("keeps a hot tub on its ID URL", () => {
    const product = { _id: ID, name: "Tub", type: "Hot Tub", slug: "tub" };
    expect(saunaMetadata(product).alternates.canonical).toBe(`https://www.thetorontosaunaco.com/saunas/${ID}`);
  });
});
