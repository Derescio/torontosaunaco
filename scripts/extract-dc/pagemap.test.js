/** @jest-environment node */
import { parseCsv, loadPageMap } from "./pagemap.mjs";

const HEADER = "Design file,Live address,Page title (SEO),Search description (SEO),Index,Photos on page";

test("parseCsv handles quoted commas, escaped quotes and CRLF", () => {
  expect(parseCsv('a,"b, c","say ""hi"""\r\n1,2,3\r\n')).toEqual([
    ["a", "b, c", 'say "hi"'],
    ["1", "2", "3"],
  ]);
});

test("parseCsv keeps newlines inside quoted fields", () => {
  expect(parseCsv('a,"line1\nline2"\n')).toEqual([["a", "line1\nline2"]]);
});

test("loadPageMap keys rows by design file", () => {
  const m = loadPageMap(`${HEADER}\nAbout.dc.html,/about,"About Us | X","Desc, with comma",,12\n`);
  expect(m.get("About.dc.html")).toEqual({
    route: "/about",
    title: "About Us | X",
    description: "Desc, with comma",
    index: "",
    photos: 12,
  });
  expect(m.size).toBe(1);
});
