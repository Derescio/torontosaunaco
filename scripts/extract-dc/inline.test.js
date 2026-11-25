/** @jest-environment node */
import { parse } from "node-html-parser";
import { loadPageMap } from "./pagemap.mjs";
import { inlineHtml, htmlToText } from "./inline.mjs";

const pageMap = loadPageMap(
  "Design file,Live address,Page title (SEO),Search description (SEO),Index,Photos on page\n" +
    "Contact.dc.html,/contact,Contact,Desc,,1\n",
);
const ctx = { pageMap, warn: () => {} };
const p = (s) => parse(`<x>${s}</x>`, { comment: true }).firstChild;

test("italic+bold span → em/strong; italic span → em", () => {
  expect(inlineHtml(p(`Customer first. <span style="font-style: italic; font-weight: 700">Every time.</span>`), ctx)).toBe(
    "Customer first. <em><strong>Every time.</strong></em>",
  );
  expect(inlineHtml(p(`Compare <span style="font-style: italic">plunges</span>`), ctx)).toBe("Compare <em>plunges</em>");
});

test("bold tags and weights; other spans unwrap", () => {
  expect(inlineHtml(p(`<span style="color:red">a</span> <b>b</b> <span style="font-weight: 600">c</span> <span style="font-weight:500">d</span>`), ctx)).toBe(
    "a <strong>b</strong> <strong>c</strong> d",
  );
});

test("entities decode to characters; < and & re-escaped", () => {
  expect(inlineHtml(p(`66&quot; &times; 66&quot; &amp; Co &lt;3`), ctx)).toBe(`66" × 66" &amp; Co &lt;3`);
  expect(htmlToText(`66" × 66" &amp; Co &lt;3`)).toBe(`66" × 66" & Co <3`);
});

test("links mapped, br kept, whitespace collapsed, svg dropped", () => {
  expect(inlineHtml(p(`Call  <a href="Contact.dc.html#visit" style="x">us</a><br>\n now<svg><text>x</text></svg>`), ctx)).toBe(
    `Call <a href="/contact#visit">us</a><br>now`,
  );
});

test("spaces inside emphasis move outside it", () => {
  expect(inlineHtml(p(`a<em> b </em>c`), ctx)).toBe("a <em>b</em> c");
});

test("a block-displayed span inside inline copy is kept apart by a space", () => {
  expect(inlineHtml(p(`Compare<span style="display: block">plunges</span>`), ctx)).toBe("Compare plunges");
});

test("a horizontal margin standing in for a space becomes a space", () => {
  expect(inlineHtml(p(`<span style="font-style: italic; margin-right: 10px">Indoor saunas, too.</span>Ready-made kits.`), ctx)).toBe(
    "<em>Indoor saunas, too.</em> Ready-made kits.",
  );
  expect(inlineHtml(p(`From<span style="margin-left: 0">x</span>`), ctx)).toBe("Fromx");
});

test("template holes survive", () => {
  expect(inlineHtml(p(`From {{it.price}} <a href="{{it.href}}">{{it.n}}</a>`), ctx)).toBe(
    `From {{it.price}} <a href="{{it.href}}">{{it.n}}</a>`,
  );
});

test("unmapped design link warns and is kept", () => {
  const warn = jest.fn();
  expect(inlineHtml(p(`<a href="Nope.dc.html">x</a>`), { pageMap, warn })).toBe(`<a href="Nope.dc.html">x</a>`);
  expect(warn).toHaveBeenCalledWith("unmapped link: Nope.dc.html");
});

test("htmlToText turns br into a newline and strips tags", () => {
  expect(htmlToText(`a <em>b</em><br><a href="/x">c</a>`)).toBe("a b\nc");
});
