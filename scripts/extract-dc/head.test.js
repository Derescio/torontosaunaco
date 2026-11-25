/** @jest-environment node */
import { parse } from "node-html-parser";
import { extractHead } from "./head.mjs";

const page = (head) => parse(`<!doctype html><html><head>${head}</head><body></body></html>`, { comment: true });

const FULL = `
<title>Saunas &amp; Plunges | The Toronto Sauna Co.</title>
<meta name="description" data-seo="1" content="Cedar saunas &amp; plunges.">
<link rel="canonical" href="https://www.thetorontosaunaco.com/about">
<meta property="og:site_name" content="The Toronto Sauna Co.">
<meta property="og:type" content="website">
<meta property="og:title" content="OG title">
<meta property="og:description" content="OG desc">
<meta property="og:url" content="https://www.thetorontosaunaco.com/about">
<meta property="og:image" content="https://www.thetorontosaunaco.com/_blob/abc">
<meta name="twitter:card" content="summary_large_image">
<script type="application/ld+json">{"@context": "https://schema.org", "@type": "AboutPage", "name": "A &amp; B"}</script>
<script type="application/ld+json">{"@context": broken</script>
<script src="./_runtime/react.js"></script>`;

test("extractHead reads title, description, canonical, og, twitter", () => {
  const head = extractHead(page(FULL), () => {});
  expect(head.title).toBe("Saunas & Plunges | The Toronto Sauna Co.");
  expect(head.description).toBe("Cedar saunas & plunges.");
  expect(head.canonical).toBe("https://www.thetorontosaunaco.com/about");
  expect(head.og).toEqual({
    site_name: "The Toronto Sauna Co.",
    type: "website",
    title: "OG title",
    description: "OG desc",
    url: "https://www.thetorontosaunaco.com/about",
    image: "https://www.thetorontosaunaco.com/_blob/abc",
  });
  expect(head.twitter).toEqual({ card: "summary_large_image" });
});

test("extractHead parses JSON-LD verbatim and warns on invalid blocks", () => {
  const warn = jest.fn();
  const head = extractHead(page(FULL), warn);
  expect(head.jsonLd).toEqual([{ "@context": "https://schema.org", "@type": "AboutPage", name: "A &amp; B" }]);
  expect(warn).toHaveBeenCalledTimes(1);
  expect(warn.mock.calls[0][0]).toMatch(/^invalid JSON-LD: /);
});

test("extractHead returns nulls and [] for a bare head", () => {
  expect(extractHead(page(""), () => {})).toEqual({
    title: null,
    description: null,
    canonical: null,
    og: { site_name: null, type: null, title: null, description: null, url: null, image: null },
    twitter: { card: null },
    jsonLd: [],
  });
});
