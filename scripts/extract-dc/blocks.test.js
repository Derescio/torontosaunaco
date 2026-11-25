/** @jest-environment node */
import { parse } from "node-html-parser";
import { loadPageMap } from "./pagemap.mjs";
import { blocksFrom, extractSections } from "./blocks.mjs";

const pageMap = loadPageMap(
  "Design file,Live address,Page title (SEO),Search description (SEO),Index,Photos on page\n" +
    "Main.dc.html,/,Home,Desc,,1\n" +
    "Contact.dc.html,/contact,Contact,Desc,,1\n" +
    "SaunasCube.dc.html,/saunas/cube,Cube,Desc,,1\n",
);
const ctx = { pageMap, warn: () => {} };
const el = (html) => parse(html.trim(), { comment: true }).firstChild;

test("hero: breadcrumb, eyebrow, heading, paragraph, image", () => {
  const html = `<section><div><nav aria-label="Breadcrumb"><a href="Main.dc.html">Home</a> / About Us</nav>
    <span style="text-transform:uppercase">About us</span><h1>Customer first. <span style="font-style:italic">Every time.</span></h1>
    <p>Helps homeowners.</p></div><div><img src="./assets/a.jpg" alt="Sauna"></div></section>`;
  expect(blocksFrom(el(html), ctx)).toEqual([
    { type: "breadcrumb", items: [{ text: "Home", href: "/" }, { text: "About Us" }] },
    { type: "text", html: "About us", text: "About us" },
    { type: "heading", level: 1, html: "Customer first. <em>Every time.</em>", text: "Customer first. Every time." },
    { type: "paragraph", html: "Helps homeowners.", text: "Helps homeowners." },
    { type: "image", src: "./assets/a.jpg", alt: "Sauna" },
  ]);
});

test("card anchor keeps image, heading and paragraph", () => {
  const html = `<a class="pcard" href="SaunasCube.dc.html"><div><img src="./assets/c.jpg" alt="Cube"></div><h3>Cube Saunas</h3><p>Glass fronts.</p></a>`;
  expect(blocksFrom(el(html), ctx)).toEqual([
    {
      type: "card",
      href: "/saunas/cube",
      blocks: [
        { type: "image", src: "./assets/c.jpg", alt: "Cube" },
        { type: "heading", level: 3, html: "Cube Saunas", text: "Cube Saunas" },
        { type: "paragraph", html: "Glass fronts.", text: "Glass fronts." },
      ],
    },
  ]);
});

test("button-styled anchor, pill anchor, plain link and button", () => {
  const html = `<div><a class="hbtn btn-dark" href="Contact.dc.html">Request a Quote</a>
    <a href="Contact.dc.html#visit" style="border-radius: 999px">Visit</a>
    <a class="navlink" href="Main.dc.html">Home</a>
    <button type="button" onClick="{{galNext}}" aria-label="Next photo">›</button></div>`;
  expect(blocksFrom(el(html), ctx)).toEqual([
    { type: "link", html: "Request a Quote", text: "Request a Quote", href: "/contact", variant: "button" },
    { type: "link", html: "Visit", text: "Visit", href: "/contact#visit", variant: "button" },
    { type: "link", html: "Home", text: "Home", href: "/", variant: "link" },
    { type: "link", html: "›", text: "›", href: null, variant: "button", label: "Next photo" },
  ]);
});

test("text around a link stays one text block", () => {
  const html = `<div><span>Prefer to talk? Call <a href="tel:+14374296623">(437) 429-6623</a>.</span></div>`;
  expect(blocksFrom(el(html), ctx)).toEqual([
    {
      type: "text",
      html: 'Prefer to talk? Call <a href="tel:+14374296623">(437) 429-6623</a>.',
      text: "Prefer to talk? Call (437) 429-6623.",
    },
  ]);
});

test("faq skips the decorative plus", () => {
  const html = `<details><summary>What do I need?<span class="plus" aria-hidden="true">+</span></summary><p>A bucket.</p></details>`;
  expect(blocksFrom(el(html), ctx)).toEqual([
    { type: "faq", html: "What do I need?", text: "What do I need?", blocks: [{ type: "paragraph", html: "A bucket.", text: "A bucket." }] },
  ]);
});

test("figure with blockquote becomes a quote with cite; figure with img gets a caption", () => {
  const html = `<div><figure><span aria-label="5 out of 5 stars">★★★★★</span><blockquote>“Life-changing!”</blockquote>
    <figcaption><strong>Matthew</strong> · Google review</figcaption></figure>
    <figure><img src="./assets/f.jpg" alt="F"><figcaption>At dusk</figcaption></figure></div>`;
  expect(blocksFrom(el(html), ctx)).toEqual([
    { type: "text", html: "★★★★★", text: "★★★★★", label: "5 out of 5 stars" },
    { type: "quote", html: "“Life-changing!”", text: "“Life-changing!”", cite: "<strong>Matthew</strong> · Google review" },
    { type: "image", src: "./assets/f.jpg", alt: "F", caption: "At dusk" },
  ]);
});

test("table rows and lists", () => {
  const html = `<div><table><thead><tr><th>Output</th><th>Amps</th></tr></thead><tbody><tr><td>10 kW</td><td>27 A</td></tr></tbody></table>
    <ul><li>2 people</li><li><em>Clear</em> cedar</li></ul><ol><li>One</li></ol></div>`;
  expect(blocksFrom(el(html), ctx)).toEqual([
    { type: "table", rows: [["Output", "Amps"], ["10 kW", "27 A"]] },
    { type: "list", ordered: false, items: [{ html: "2 people", text: "2 people" }, { html: "<em>Clear</em> cedar", text: "Clear cedar" }] },
    { type: "list", ordered: true, items: [{ html: "One", text: "One" }] },
  ]);
});

test("spans laid out by a flex list item become separate blocks", () => {
  const html = `<ol><li style="display: flex; flex-direction: column"><span style="font-style: italic">01</span><span style="font-weight: 700">Consult</span><span>We talk.</span></li></ol>`;
  expect(blocksFrom(el(html), ctx)).toEqual([
    {
      type: "list",
      ordered: true,
      items: [
        {
          blocks: [
            { type: "text", html: "<em>01</em>", text: "01" },
            { type: "text", html: "<strong>Consult</strong>", text: "Consult" },
            { type: "text", html: "We talk.", text: "We talk." },
          ],
        },
      ],
    },
  ]);
});

test("a flex anchor of spans is a card", () => {
  const html = `<a href="Contact.dc.html" style="display: flex"><span style="display: flex; flex-direction: column"><strong>Will this fit?</strong><span>Check your space.</span></span><span>Try it →</span></a>`;
  expect(blocksFrom(el(html), ctx)).toEqual([
    {
      type: "card",
      href: "/contact",
      blocks: [
        { type: "text", html: "<strong>Will this fit?</strong>", text: "Will this fit?" },
        { type: "text", html: "Check your space.", text: "Check your space." },
        { type: "text", html: "Try it →", text: "Try it →" },
      ],
    },
  ]);
});

test("definition lists become term/detail pairs, through div rows and sc-for", () => {
  const html = `<div><dl><div><dt>Subtotal <span>before HST</span></dt><dd class="serif">{{subtotalText}}</dd></div>
    <div><dt>HST (13%)</dt><dd>{{hstText}}</dd></div></dl>
    <dl><sc-for list="{{specs}}" as="s"><div><dt>{{s.k}}</dt><dd>{{s.v}}</dd></div></sc-for></dl></div>`;
  const pair = (t, d) => ({ term: { html: t, text: t }, details: { html: d, text: d } });
  expect(blocksFrom(el(html), ctx)).toEqual([
    { type: "definitions", items: [pair("Subtotal before HST", "{{subtotalText}}"), pair("HST (13%)", "{{hstText}}")] },
    { type: "definitions", items: [{ type: "repeat", list: "{{specs}}", as: "s", items: [pair("{{s.k}}", "{{s.v}}")] }] },
  ]);
});

test("address is ordinary text with its line breaks", () => {
  const warn = jest.fn();
  expect(blocksFrom(el(`<div><address>17380 Highway 27<br>Schomberg, ON</address></div>`), { ...ctx, warn })).toEqual([
    { type: "text", html: "17380 Highway 27<br>Schomberg, ON", text: "17380 Highway 27\nSchomberg, ON" },
  ]);
  expect(warn).not.toHaveBeenCalled();
});

test("form keeps its copy and pairs labels with controls", () => {
  const html = `<form><span>Get your quote.</span>
    <div><label for="c-reason">How can we help?</label><select id="c-reason"><sc-for list="{{lfReasons}}" as="o"><option value="{{o.v}}">{{o.v}}</option></sc-for></select></div>
    <div><label for="c-name">Name *</label><input id="c-name" type="text"></div>
    <sc-if value="{{lfNameErr}}"><p role="alert">Please enter your name.</p></sc-if>
    <textarea placeholder="Anything else?"></textarea>
    <button type="submit">Send request</button></form>`;
  expect(blocksFrom(el(html), ctx)).toEqual([
    {
      type: "form",
      blocks: [
        { type: "text", html: "Get your quote.", text: "Get your quote." },
        { type: "field", label: "How can we help?", id: "c-reason", control: "select", options: ["{{o.v}}"] },
        { type: "field", label: "Name *", id: "c-name", control: "input", inputType: "text" },
        { type: "if", value: "{{lfNameErr}}", blocks: [{ type: "paragraph", html: "Please enter your name.", text: "Please enter your name." }] },
        { type: "field", label: null, id: null, control: "textarea", placeholder: "Anything else?" },
        { type: "link", html: "Send request", text: "Send request", href: null, variant: "button" },
      ],
    },
  ]);
});

test("sc-for and sc-if become repeat and if", () => {
  const html = `<div><sc-for list="{{items}}" as="it"><p>{{it.n}}</p></sc-for><sc-if value="{{x}}"><p>Hi</p></sc-if></div>`;
  expect(blocksFrom(el(html), ctx)).toEqual([
    { type: "repeat", list: "{{items}}", as: "it", blocks: [{ type: "paragraph", html: "{{it.n}}", text: "{{it.n}}" }] },
    { type: "if", value: "{{x}}", blocks: [{ type: "paragraph", html: "Hi", text: "Hi" }] },
  ]);
});

test("unknown tag with text warns and keeps the text", () => {
  const warn = jest.fn();
  expect(blocksFrom(el(`<div><marquee>Sale</marquee></div>`), { ...ctx, section: "Hero", warn })).toEqual([
    { type: "text", html: "Sale", text: "Sale" },
  ]);
  expect(warn).toHaveBeenCalledWith("unhandled <marquee> in Hero: Sale");
});

test("extractSections names by comment, skips header/footer, numbers unnamed", () => {
  const root = parse(
    `<html><body><x-dc><helmet><style>a{}</style></helmet><div>
      <!-- Header --><header><p>Nav</p></header>
      <!-- Hero --><section><p>A</p></section>
      <section><p>B</p></section>
      <!-- Empty --><section><svg></svg></section>
      <!-- Footer --><footer><p>Foot</p></footer>
    </div></x-dc></body></html>`,
    { comment: true },
  );
  expect(extractSections(root, ctx)).toEqual([
    { name: "Hero", blocks: [{ type: "paragraph", html: "A", text: "A" }] },
    { name: "Section 1", blocks: [{ type: "paragraph", html: "B", text: "B" }] },
  ]);
});
