/** @jest-environment node */
import { loadPageMap } from "./pagemap.mjs";
import { extractPage } from "./page.mjs";

const pageMap = loadPageMap(
  "Design file,Live address,Page title (SEO),Search description (SEO),Index,Photos on page\n" +
    'About.dc.html,/about,About Us | TSC,"Customer first, always.",,12\n' +
    "Main.dc.html,/,Home | TSC,Home desc,,65\n" +
    "Contact.dc.html,/contact,Contact | TSC,Contact desc,,1\n",
);

function page({
  title = "About Us | TSC",
  description = "Customer first, always.",
  canonical = "https://www.thetorontosaunaco.com/about",
  ogType = "website",
  body = "<p>Hello</p>",
  script = `var D = {"next": "Contact.dc.html"};`,
} = {}) {
  return `<!doctype html><html><head><title>${title}</title>
<meta name="description" content="${description}">
<link rel="canonical" href="${canonical}">
<meta property="og:type" content="${ogType}">
</head><body><x-dc><helmet></helmet><div>
<!-- Header --><header><p>Nav</p></header>
<!-- Hero --><section>${body}</section>
<!-- Footer --><footer><p>Foot</p></footer>
</div>
<script type="text/x-dc" data-dc-script>class Component extends DCLogic { constructor(p) { super(p); ${script} } }</script>
</x-dc></body></html>`;
}

test("a clean page has no warnings and the documented shape", () => {
  const out = extractPage({ fileName: "About.dc.html", html: page(), pageMap });
  expect(Object.keys(out)).toEqual(["file", "route", "pageMap", "head", "data", "sections", "warnings"]);
  expect(out.file).toBe("About.dc.html");
  expect(out.route).toBe("/about");
  expect(out.pageMap).toEqual(pageMap.get("About.dc.html"));
  expect(out.head.title).toBe("About Us | TSC");
  expect(out.data).toEqual({ D: { next: "/contact" } });
  expect(out.sections).toEqual([{ name: "Hero", blocks: [{ type: "paragraph", html: "Hello", text: "Hello" }] }]);
  expect(out.warnings).toEqual([]);
});

test("no page-map row", () => {
  const out = extractPage({ fileName: "Stray.dc.html", html: page(), pageMap });
  expect(out.route).toBeNull();
  expect(out.pageMap).toBeNull();
  expect(out.warnings).toEqual(["no page-map row"]);
});

test("title and description differences", () => {
  const out = extractPage({ fileName: "About.dc.html", html: page({ title: "Other", description: "Else" }), pageMap });
  expect(out.warnings).toEqual([
    'title differs from page-map: "Other" vs "About Us | TSC"',
    'description differs from page-map: "Else" vs "Customer first, always."',
  ]);
});

test("canonical path vs route, trailing slash ignored", () => {
  expect(
    extractPage({ fileName: "About.dc.html", html: page({ canonical: "https://www.thetorontosaunaco.com/about/" }), pageMap }).warnings,
  ).toEqual([]);
  expect(
    extractPage({ fileName: "About.dc.html", html: page({ canonical: "https://www.thetorontosaunaco.com/about-us" }), pageMap }).warnings,
  ).toEqual(["canonical path /about-us differs from route /about"]);
});

test("og:type must be website", () => {
  expect(extractPage({ fileName: "About.dc.html", html: page({ ogType: "product" }), pageMap }).warnings).toEqual([
    'og:type is "product", expected "website"',
  ]);
});

test("Leisurecraft is flagged in head, data and sections, once each, except on the homepage", () => {
  const html = page({
    title: "About Us | TSC",
    body: "<p>Built by LEISURECRAFT</p><p>Leisurecraft again</p>",
    script: `var D = {"brand": "Leisurecraft"};`,
  }).replace("<head>", '<head><meta property="og:title" content="Leisurecraft saunas">');
  expect(extractPage({ fileName: "About.dc.html", html, pageMap }).warnings).toEqual([
    "mentions Leisurecraft in head",
    "mentions Leisurecraft in data",
    "mentions Leisurecraft in section Hero",
  ]);
  const home = html
    .replace("About Us | TSC", "Home | TSC")
    .replace("Customer first, always.", "Home desc")
    .replace("/about", "/");
  expect(extractPage({ fileName: "Main.dc.html", html: home, pageMap }).warnings).toEqual([]);
});

test("missing <x-dc> throws", () => {
  expect(() => extractPage({ fileName: "About.dc.html", html: "<html><body></body></html>", pageMap })).toThrow(/x-dc/);
});
