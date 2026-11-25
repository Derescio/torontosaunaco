/** @jest-environment node */
import { loadPageMap } from "./pagemap.mjs";
import { mapHref, mapDataLinks } from "./links.mjs";

const pageMap = loadPageMap(
  "Design file,Live address,Page title (SEO),Search description (SEO),Index,Photos on page\n" +
    "Main.dc.html,/,Home,Desc,,1\n" +
    "Contact.dc.html,/contact,Contact,Desc,,1\n",
);

test.each([
  ["Main.dc.html", "/", false],
  ["Contact.dc.html#visit", "/contact#visit", false],
  ["Contact.dc.html?x=1", "/contact?x=1", false],
  ["tel:+14374296623", "tel:+14374296623", false],
  ["https://example.com/a", "https://example.com/a", false],
  ["{{it.href}}", "{{it.href}}", false],
  ["#faq", "#faq", false],
  ["Nope.dc.html", "Nope.dc.html", true],
])("mapHref(%s)", (input, href, unmapped) => {
  expect(mapHref(input, pageMap)).toEqual({ href, unmapped });
});

test("mapDataLinks maps nested strings, warns on unmapped files, leaves assets alone", () => {
  const warn = jest.fn();
  const input = { related: [["View", "Contact.dc.html"]], img: "./assets/a.jpg", x: "Nope.dc.html", n: 3 };
  const out = mapDataLinks(input, pageMap, warn);
  expect(out).toEqual({ related: [["View", "/contact"]], img: "./assets/a.jpg", x: "Nope.dc.html", n: 3 });
  expect(warn).toHaveBeenCalledWith("unmapped link: Nope.dc.html");
  expect(input.related[0][1]).toBe("Contact.dc.html");
});

test("mapDataLinks does not touch prose that mentions a .dc.html file", () => {
  const warn = jest.fn();
  expect(mapDataLinks({ d: "See Contact.dc.html for more" }, pageMap, warn)).toEqual({ d: "See Contact.dc.html for more" });
  expect(warn).not.toHaveBeenCalled();
});
