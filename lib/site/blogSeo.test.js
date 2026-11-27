import { postSeo } from "./blogSeo";
import { pageSeo } from "./seo";

const post = { title: "Can saunas help with sleep?", slug: "sleep", publishedAt: "2026-08-27T15:00:00Z", description: "What the research says." };
const card = { slug: "sleep", summary: "Design summary", image: { kind: "sanity", url: "https://cdn.sanity.io/images/x/sleep.jpg" } };

describe("postSeo", () => {
  it("builds metadata with a website OpenGraph type and the canonical URL", () => {
    const { metadata } = postSeo(post, card);
    expect(metadata.title).toBe("Can saunas help with sleep? | The Toronto Sauna Co.");
    expect(metadata.description).toBe("What the research says.");
    expect(metadata.alternates.canonical).toBe("https://www.thetorontosaunaco.com/blog/sleep");
    expect(metadata.openGraph).toMatchObject({
      type: "website",
      url: "https://www.thetorontosaunaco.com/blog/sleep",
      siteName: "The Toronto Sauna Co.",
      images: [{ url: "https://cdn.sanity.io/images/x/sleep.jpg" }],
    });
    expect(metadata.twitter.card).toBe("summary_large_image");
  });

  it("falls back to the design summary, then the blog description", () => {
    expect(postSeo({ ...post, description: "" }, card).metadata.description).toBe("Design summary");
    expect(postSeo({ ...post, description: "" }, { ...card, summary: null }).metadata.description).toBe(pageSeo("/blog").metadata.description);
  });

  it("keeps the meta description short when Sanity's is a whole article", () => {
    const long = "Winter is hard on cedar. ".repeat(500);
    const { metadata, jsonLd } = postSeo({ ...post, description: long }, card);
    expect(metadata.description.length).toBeLessThanOrEqual(160);
    expect(jsonLd[0].description).toBe(metadata.description);
  });

  it("describes the article and its breadcrumb in JSON-LD", () => {
    const [article, crumbs] = postSeo(post, card).jsonLd;
    expect(article).toMatchObject({
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      datePublished: "2026-08-27T15:00:00Z",
      url: "https://www.thetorontosaunaco.com/blog/sleep",
      image: ["https://cdn.sanity.io/images/x/sleep.jpg"],
      publisher: { "@type": "Organization", name: "The Toronto Sauna Co." },
    });
    expect(crumbs["@type"]).toBe("BreadcrumbList");
    expect(crumbs.itemListElement.map((i) => i.name)).toEqual(["Home", "Blog", post.title]);
  });

  it("leaves out the image and date when the post has none", () => {
    const { metadata, jsonLd } = postSeo({ title: "Bare", slug: "bare" }, { slug: "bare", image: null });
    expect(metadata.openGraph.images).toBeUndefined();
    expect(jsonLd[0].image).toBeUndefined();
    expect(jsonLd[0].datePublished).toBeUndefined();
  });
});
