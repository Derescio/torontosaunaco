/** @jest-environment node */
import { buildSeo, FALLBACK_OG_IMAGE, SITE } from "./seo";

const NOW = new Date("2026-11-25T12:00:00Z");

function entry({ og = {}, jsonLd = [], index = "", canonical = `${SITE}/cold-plunges/arctic` } = {}) {
  return {
    head: {
      title: "The Arctic Plunge Tub | Cold Plunge | The Toronto Sauna Co.",
      description: "Arctic description",
      canonical,
      og: { site_name: "The Toronto Sauna Co.", type: "product", title: "OG title", description: "OG desc", url: canonical, image: `${SITE}/_blob/abc`, ...og },
      twitter: { card: "summary_large_image" },
      jsonLd,
    },
    pageMap: { route: "/cold-plunges/arctic", title: "The Arctic Plunge Tub | Cold Plunge | The Toronto Sauna Co.", description: "Arctic description", index },
  };
}

const product = (offers = { "@type": "Offer", priceCurrency: "CAD", price: "9999.00", url: `${SITE}/cold-plunges/arctic`, seller: { "@id": `${SITE}/#business` } }) => ({
  "@context": "https://schema.org",
  "@type": "Product",
  name: "Arctic Plunge Tub",
  image: [`${SITE}/_blob/abc`, `${SITE}/_blob/mapped`],
  offers,
});

describe("buildSeo metadata", () => {
  it("always sets OpenGraph type website", () => {
    expect(buildSeo(entry(), { now: NOW }).metadata.openGraph.type).toBe("website");
  });

  it("copies title, description and canonical", () => {
    const { metadata } = buildSeo(entry(), { now: NOW });
    expect(metadata.title).toBe("The Arctic Plunge Tub | Cold Plunge | The Toronto Sauna Co.");
    expect(metadata.description).toBe("Arctic description");
    expect(metadata.alternates).toEqual({ canonical: `${SITE}/cold-plunges/arctic` });
    expect(metadata.openGraph).toMatchObject({ siteName: "The Toronto Sauna Co.", url: `${SITE}/cold-plunges/arctic`, locale: "en_CA" });
    expect(metadata.twitter).toMatchObject({ card: "summary_large_image", title: "OG title" });
  });

  it("marks noindex pages from the page map and leaves others alone", () => {
    expect(buildSeo(entry({ index: "noindex" }), { now: NOW }).metadata.robots).toEqual({ index: false, follow: true });
    expect(buildSeo(entry(), { now: NOW }).metadata).not.toHaveProperty("robots");
  });

  it("rewrites wrong domains to www.thetorontosaunaco.com", () => {
    const { metadata, jsonLd } = buildSeo(
      entry({ canonical: "https://thetorontosaunaco.com/about", jsonLd: [{ "@type": "WebPage", url: "https://www.torontosaunaco.com/about" }] }),
      { now: NOW }
    );
    expect(metadata.alternates.canonical).toBe(`${SITE}/about`);
    expect(jsonLd[0].url).toBe(`${SITE}/about`);
  });

  it("uses a mapped og image, else the fallback", () => {
    const mapped = buildSeo(entry(), { imageMap: { abc: "https://res.cloudinary.com/x/arctic.jpg" }, now: NOW }).metadata;
    expect(mapped.openGraph.images).toEqual([{ url: "https://res.cloudinary.com/x/arctic.jpg" }]);
    expect(mapped.twitter.images).toEqual(["https://res.cloudinary.com/x/arctic.jpg"]);
    expect(buildSeo(entry(), { now: NOW }).metadata.openGraph.images).toEqual([{ url: FALLBACK_OG_IMAGE }]);
  });
});

describe("buildSeo JSON-LD", () => {
  const store = (locality) => ({
    "@type": "Store",
    "@id": `${SITE}/#store`,
    name: "The Toronto Sauna Co.",
    address: { "@type": "PostalAddress", streetAddress: "17380 Highway 27", addressLocality: locality },
  });

  it("gives the business one @id and Schomberg, inside a @graph", () => {
    const { jsonLd } = buildSeo(entry({ jsonLd: [{ "@context": "https://schema.org", "@graph": [store("King")] }] }), { now: NOW });
    expect(jsonLd[0]["@graph"][0]["@id"]).toBe(`${SITE}/#business`);
    expect(jsonLd[0]["@graph"][0].address.addressLocality).toBe("Schomberg");
  });

  it("does the same for a top-level business node with a combined type", () => {
    const node = { ...store("King"), "@type": ["Store", "HomeAndConstructionBusiness"] };
    const { jsonLd } = buildSeo(entry({ jsonLd: [node] }), { now: NOW });
    expect(jsonLd[0]).toMatchObject({ "@id": `${SITE}/#business`, address: { addressLocality: "Schomberg" } });
  });

  it("replaces mapped design images and drops unmapped ones", () => {
    const { jsonLd } = buildSeo(entry({ jsonLd: [product()] }), { price: 2974, imageMap: { mapped: "https://res.cloudinary.com/x/a.jpg" }, now: NOW });
    expect(jsonLd[0].image).toEqual(["https://res.cloudinary.com/x/a.jpg"]);
    const single = buildSeo(entry({ jsonLd: [{ ...product(), image: `${SITE}/_blob/zzz` }] }), { price: 2974, now: NOW }).jsonLd[0];
    expect(single).not.toHaveProperty("image");
  });

  it("removes a Product that has no database price (a bare Product is an invalid rich result)", () => {
    const { jsonLd } = buildSeo(entry({ jsonLd: [product(), { "@type": "WebPage" }] }), { now: NOW });
    expect(jsonLd).toEqual([{ "@type": "WebPage" }]);
  });

  it("prices each listed product from its own URL; an unpriced item becomes a plain link", () => {
    const item = (slug) => ({
      "@type": "ListItem",
      item: { "@type": "Product", name: slug, url: `${SITE}/sauna-heaters/${slug}`, offers: { "@type": "Offer", price: "1.00", priceCurrency: "CAD" } },
    });
    const list = { "@type": "ItemList", itemListElement: [item("apex-208"), item("revive")] };
    const { jsonLd } = buildSeo(entry({ jsonLd: [list] }), { prices: { "/sauna-heaters/apex-208": 1905 }, now: NOW });
    const [first, second] = jsonLd[0].itemListElement;
    expect(first.item.offers.price).toBe("1905.00");
    expect(second.item).toBe(`${SITE}/sauna-heaters/revive`);
  });

  it("never applies the page's price to another product on the page", () => {
    const other = { "@type": "Product", name: "Other", url: `${SITE}/cold-plunges/glacier`, offers: { "@type": "Offer", price: "5.00" } };
    const { jsonLd } = buildSeo(entry({ jsonLd: [product(), other] }), { price: 2974, now: NOW });
    expect(jsonLd).toHaveLength(1);
    expect(jsonLd[0].offers.price).toBe("2974.00");
  });

  it("uses the database price, with availability and priceValidUntil a year out", () => {
    const { jsonLd } = buildSeo(entry({ jsonLd: [product()] }), { price: 2974, now: NOW });
    expect(jsonLd[0].offers).toMatchObject({
      price: "2974.00",
      priceCurrency: "CAD",
      availability: "https://schema.org/InStock",
      priceValidUntil: "2027-11-25",
      seller: { "@id": `${SITE}/#business` },
    });
  });

  it("drops offers on any node, e.g. a listing's AggregateOffer, when no price is passed", () => {
    const listing = { "@type": "ItemList", offers: { "@type": "AggregateOffer", priceCurrency: "CAD", lowPrice: "1905.00" } };
    expect(buildSeo(entry({ jsonLd: [listing] }), { now: NOW }).jsonLd[0]).not.toHaveProperty("offers");
  });

  it("sets an AggregateOffer's lowPrice from the database price", () => {
    const listing = { "@type": "ItemList", offers: { "@type": "AggregateOffer", priceCurrency: "CAD", lowPrice: "1905.00" } };
    const { offers } = buildSeo(entry({ jsonLd: [listing] }), { price: 1799, now: NOW }).jsonLd[0];
    expect(offers).toMatchObject({ "@type": "AggregateOffer", lowPrice: "1799.00", availability: "https://schema.org/InStock" });
    expect(offers).not.toHaveProperty("price");
  });

  it("removes design-only AggregateOffer fields that would contradict the database price", () => {
    const listing = { "@type": "ItemList", offers: { "@type": "AggregateOffer", lowPrice: "1905.00", highPrice: "9000.00", offerCount: 3 } };
    const { offers } = buildSeo(entry({ jsonLd: [listing] }), { price: 1799, now: NOW }).jsonLd[0];
    expect(offers).not.toHaveProperty("highPrice");
    expect(offers).not.toHaveProperty("offerCount");
  });

  it("treats a zero or non-numeric price as no price", () => {
    for (const price of [0, NaN, "2974"]) {
      expect(buildSeo(entry({ jsonLd: [product()] }), { price, now: NOW }).jsonLd).toEqual([]);
    }
  });

  it("never mutates the entry, so repeated calls agree", () => {
    const e = entry({ jsonLd: [product(), { "@graph": [store("King")] }] });
    const before = JSON.stringify(e);
    const a = buildSeo(e, { price: 10, now: NOW });
    const b = buildSeo(e, { price: 10, now: NOW });
    expect(a).toEqual(b);
    expect(JSON.stringify(e)).toBe(before);
  });
});
