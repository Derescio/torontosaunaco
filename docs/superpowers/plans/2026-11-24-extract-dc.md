# Design-file extraction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `node scripts/extract-dc.mjs` turns the 107 `.dc.html` design pages into one JSON file each in `content/redesign/`.

**Architecture:** Pure ESM modules in `scripts/extract-dc/` (CSV, links, head, data, inline HTML, blocks, page), each tested
with small HTML fixtures beside it, plus a thin CLI `scripts/extract-dc.mjs` that does all file I/O. `node-html-parser`
parses the HTML; data objects come from `JSON.parse` on balanced literals found in the page script.

**Tech Stack:** Node 22 ESM (`.mjs`), `node-html-parser` 6.x, Jest 29 via babel-jest.

**Spec:** `docs/superpowers/specs/2026-11-24-extract-dc-design.md`

## Global Constraints

- Copy is never reworded, trimmed or fixed: text comes out exactly as written; only whitespace is collapsed.
- Inline HTML keeps only `<em>`, `<strong>`, `<a href>`, `<br>`. Italic span → `<em>`; span with font-weight ≥ 600 → `<strong>`; other spans unwrapped.
- Every block has `type`; text-bearing blocks have both `html` and plain `text`.
- Unknown markup with text → a page `warning` naming the tag. Never dropped silently.
- `Piece-zsi1.dc.html` is skipped. Header and footer are left out of `sections`.
- Output is deterministic: files sorted, `JSON.stringify(x, null, 2) + "\n"`, key order fixed by construction.
- The CLI only reads the design folder and only writes `*.json` in `content/redesign/`.
- Exit 1 only for: missing folder or CSV, a page that fails to parse, two pages mapping to one route.
- Tests never read the design folder. Test files start with `/** @jest-environment node */`.

## Review Focus

1. **Entities and special characters** (`&amp;`, `×`, `¾`, `"`, `’`) must come out exactly as the browser shows them, and `<`/`&` in text must be escaped in `html` but not in `text`. Pinned in Task 3.
2. **`{{…}}` template holes** inside text, `href` and `src` must survive untouched. Not mapped as links, not warned about. Pinned in Tasks 1 and 3.
3. **Anchors that wrap a whole card** (image + heading + paragraph inside `<a>`) must keep every child, not flatten them into one link label. Pinned in Task 4.
4. **Links with a fragment or query** (`Contact.dc.html#visit`) map to `/contact#visit`; `Main.dc.html` maps to `/`. Pinned in Task 1.
5. **Script literals that look like JSON but aren't** (`this.state = { chip: 'All' }`, nested literals inside an already-parsed object) must not produce data entries or crash. Pinned in Task 2.

## Decisions made while planning (within the spec's latitude)

- The design wraps data-driven markup in `<sc-for list="{{items}}" as="it">` and `<sc-if value="{{x}}">` (about 2,000 uses).
  They become `repeat` and `if` blocks that hold their child blocks, so the template structure survives next to `data`.
- An `<a>` containing block-level children becomes a `card` block (`href` + child `blocks`). A `<button>` becomes
  `link` with `variant: "button"` and `href: null`.
- Labels, inputs and selects outside a `<form>` become `field` blocks.
- Empty data literals (`{}` / `[]`) are dropped as noise.

---

### Task 1: Jest `.mjs` support, CSV page map, link mapping

**Files:**
- Modify: `jest.config.js` (transform key `^.+\\.(js|jsx|ts|tsx)$` → `^.+\\.(m?js|jsx|ts|tsx)$`)
- Modify: `package.json` (add devDependency `node-html-parser` `^6.1.13`)
- Create: `scripts/extract-dc/pagemap.mjs`, `scripts/extract-dc/links.mjs`
- Test: `scripts/extract-dc/pagemap.test.js`, `scripts/extract-dc/links.test.js`

**Interfaces:**
- Produces: `parseCsv(text: string) => string[][]` (RFC-4180 quotes, `""` escape, CRLF/LF, trailing newline ignored).
- Produces: `loadPageMap(csvText: string) => Map<string, { route, title, description, index, photos: number }>`, keyed by design file name (`"About.dc.html"`). Columns: `Design file, Live address, Page title (SEO), Search description (SEO), Index, Photos on page`.
- Produces: `mapHref(href: string, pageMap) => { href: string, unmapped: boolean }`.
- Produces: `mapDataLinks(value: any, pageMap, warn: (msg) => void) => any`. Returns a deep copy with every string matching `/^[\w-]+\.dc\.html([#?].*)?$/` mapped.

- [ ] **Step 1: Write failing tests**

```js
// pagemap.test.js
test("parseCsv handles quoted commas, escaped quotes and CRLF", () => {
  expect(parseCsv('a,"b, c","say ""hi"""\r\n1,2,3\r\n')).toEqual([["a", "b, c", 'say "hi"'], ["1", "2", "3"]]);
});
test("loadPageMap keys rows by design file", () => {
  const m = loadPageMap('Design file,Live address,Page title (SEO),Search description (SEO),Index,Photos on page\nAbout.dc.html,/about,"About Us | X","Desc, with comma",,12\n');
  expect(m.get("About.dc.html")).toEqual({ route: "/about", title: "About Us | X", description: "Desc, with comma", index: "", photos: 12 });
});
// links.test.js  (pageMap built with loadPageMap from rows Main→/, Contact→/contact)
test.each([
  ["Main.dc.html", "/", false],
  ["Contact.dc.html#visit", "/contact#visit", false],
  ["Contact.dc.html?x=1", "/contact?x=1", false],
  ["tel:+14374296623", "tel:+14374296623", false],
  ["https://example.com/a", "https://example.com/a", false],
  ["{{it.href}}", "{{it.href}}", false],
  ["#faq", "#faq", false],
  ["Nope.dc.html", "Nope.dc.html", true],
])("mapHref(%s)", (input, href, unmapped) => expect(mapHref(input, pageMap)).toEqual({ href, unmapped }));
test("mapDataLinks maps nested strings, warns once per unmapped file, leaves assets alone", () => {
  const warn = jest.fn();
  const out = mapDataLinks({ related: [["View", "Contact.dc.html"]], img: "./assets/a.jpg", x: "Nope.dc.html" }, pageMap, warn);
  expect(out).toEqual({ related: [["View", "/contact"]], img: "./assets/a.jpg", x: "Nope.dc.html" });
  expect(warn).toHaveBeenCalledWith("unmapped link: Nope.dc.html");
});
```

- [ ] **Step 2: Run** `npx jest scripts/extract-dc --coverage=false`. Expected: FAIL (modules not found).
- [ ] **Step 3: Install** `npm i -D node-html-parser@^6.1.13`; edit the `jest.config.js` transform key; implement both modules.
- [ ] **Step 4: Run** `npx jest scripts/extract-dc --coverage=false`. Expected: PASS. Then `npm test` and confirm the only failure is the pre-existing `__tests__/getServerSession.test.js`.
- [ ] **Step 5: Commit** `feat(redesign): page map and link mapping for the extractor`

### Task 2: Head and data extraction

**Files:**
- Create: `scripts/extract-dc/head.mjs`, `scripts/extract-dc/data.mjs`
- Test: `scripts/extract-dc/head.test.js`, `scripts/extract-dc/data.test.js`

**Interfaces:**
- Produces: `extractHead(root: HTMLElement, warn) => { title, description, canonical, og: {site_name,type,title,description,url,image}, twitter: {card}, jsonLd: object[] }`. Root comes from `parse(html, { comment: true })`. Missing values → `null`; `jsonLd` → `[]` when there are none; JSON-LD that won't parse → `warn("invalid JSON-LD: <first 60 chars>")` and skip.
- Produces: `extractData(scriptText: string) => Record<string, any>`.

Algorithm for `extractData`: scan for `(\b[A-Za-z_$][\w$]*)\s*=\s*([\[{])` and `(\b[A-Za-z_$][\w$]*)\s*\([^)]*\)\s*\{\s*return\s*([\[{])`. From each opening bracket, find the matching close bracket, skipping over `"…"`/`'…'` strings with escapes. Then `JSON.parse` the slice. Skip matches that start inside an already-accepted literal. Drop parse failures and empty `{}`/`[]`. A repeated name gets the key `name_2`, `name_3`, ….

- [ ] **Step 1: Write failing tests**

```js
// head.test.js  (fixture: a <head> with title, description, canonical, og:*, twitter:card, one valid and one broken ld+json)
test("extractHead reads title, description, canonical, og, twitter", ...);   // assert exact strings, entities decoded ("&amp;" → "&")
test("extractHead parses JSON-LD and warns on invalid blocks", ...);         // jsonLd.length === 1; warn called with /^invalid JSON-LD/
test("extractHead returns nulls and [] for a bare head", ...);
// data.test.js
test("finds var, bare assignment in a var list, and method returns", () => {
  const s = `var D = {"a": 1}; var self = this, E = {"b": [1, "x}"]}; fdData() { return [{"n": "y"}]; }`;
  expect(extractData(s)).toEqual({ D: { a: 1 }, E: { b: [1, "x}"] }, fdData: [{ n: "y" }] });
});
test("skips non-JSON and empty literals and nested literals", () => {
  const s = `this.state = { chip: 'All' }; var errs = {}; var D = {"inner": {"k": 1}}; inner = 2;`;
  expect(extractData(s)).toEqual({ D: { inner: { k: 1 } } });
});
test("suffixes repeated names", () => {
  expect(extractData(`var d = {"a":1}; var d = {"b":2};`)).toEqual({ d: { a: 1 }, d_2: { b: 2 } });
});
```

- [ ] **Step 2: Run** `npx jest scripts/extract-dc/head scripts/extract-dc/data --coverage=false`. Expected: FAIL.
- [ ] **Step 3: Implement** both modules.
- [ ] **Step 4: Run** the same command. Expected: PASS.
- [ ] **Step 5: Commit** `feat(redesign): head and data extraction`

### Task 3: Inline HTML

**Files:**
- Create: `scripts/extract-dc/inline.mjs`
- Test: `scripts/extract-dc/inline.test.js`

**Interfaces:**
- Consumes: `mapHref` (Task 1).
- Produces: `inlineHtml(node: Node, ctx: { pageMap, warn }) => string` (children of `node`, reduced per Global Constraints, whitespace collapsed, trimmed; text escaped `&`→`&amp;`, `<`→`&lt;`, `>`→`&gt;`).
- Produces: `htmlToText(html: string) => string` (strip tags, `<br>` → `\n`, decode the three entities above).
- Italic = `font-style: italic` in `style`, or `em`/`i`. Bold = `font-weight` ≥ 600 or `bold` in `style`, or `strong`/`b`. Both → `<em><strong>…</strong></em>`. `svg`, `script` and `style` are skipped.

- [ ] **Step 1: Write failing tests**

```js
const p = (s) => parse(`<x>${s}</x>`, { comment: true }).firstChild;
test("italic span → em, bold span → strong, other spans unwrap", () => {
  expect(inlineHtml(p(`Customer first. <span style="font-style: italic; font-weight: 700">Every time.</span>`), ctx))
    .toBe("Customer first. <em><strong>Every time.</strong></em>");
  expect(inlineHtml(p(`<span style="color:red">a</span> <b>b</b>`), ctx)).toBe("a <strong>b</strong>");
});
test("entities decode to characters; < and & re-escaped", () => {
  expect(inlineHtml(p(`66&quot; &times; 66&quot; &amp; Co &lt;3`), ctx)).toBe(`66" × 66" &amp; Co &lt;3`);
  expect(htmlToText(`66" × 66" &amp; Co &lt;3`)).toBe(`66" × 66" & Co <3`);
});
test("links mapped, br kept, whitespace collapsed, svg dropped", () => {
  expect(inlineHtml(p(`Call  <a href="Contact.dc.html#visit" style="x">us</a><br>\n now<svg><text>x</text></svg>`), ctx))
    .toBe(`Call <a href="/contact#visit">us</a><br>now`);
});
test("template holes survive", () => {
  expect(inlineHtml(p(`From {{it.price}} <a href="{{it.href}}">{{it.n}}</a>`), ctx)).toBe(`From {{it.price}} <a href="{{it.href}}">{{it.n}}</a>`);
});
```

- [ ] **Step 2: Run** `npx jest scripts/extract-dc/inline --coverage=false`. Expected: FAIL.
- [ ] **Step 3: Implement** `inline.mjs`. Decode entities with `node-html-parser`'s decoded `.text` on text nodes.
- [ ] **Step 4: Run** the same command. Expected: PASS.
- [ ] **Step 5: Commit** `feat(redesign): inline HTML reduction for extracted copy`

### Task 4: Blocks and sections

**Files:**
- Create: `scripts/extract-dc/blocks.mjs`
- Test: `scripts/extract-dc/blocks.test.js`

**Interfaces:**
- Consumes: `inlineHtml`, `htmlToText` (Task 3), `mapHref` (Task 1).
- Produces: `blocksFrom(node: HTMLElement, ctx) => Block[]`.
- Produces: `extractSections(root: HTMLElement, ctx) => { name: string, blocks: Block[] }[]`. Wrapper = the one non-`helmet` element child of `<x-dc>`. Walk its children: a comment sets the name of the next element; elements with no preceding comment are named `Section <n>` (1-based count of unnamed sections). `header`/`footer` elements and the elements after a `Header`/`Footer` comment are skipped. Sections with no blocks are dropped.

Block shapes (all with `type`; `html` + `text` where marked ✱):

| Markup | Block |
|---|---|
| `h1`–`h6` | `heading` ✱ `level` |
| `p` | `paragraph` ✱ |
| leaf `span`/`div`/other container with text but no block-level descendants | `text` ✱ |
| `ul` / `ol` | `list` `ordered`, `items: [{html,text}]` |
| `a` without block children | `link` ✱ `href`, `variant` (`"button"` if class contains `btn`/`hbtn` or style has `border-radius: 999px`, else `"link"`) |
| `a` with block children | `card` `href`, `blocks` |
| `button` | `link` ✱ `href: null`, `variant: "button"` |
| `img` | `image` `src`, `alt` (`alt` `""` if missing) |
| `figure` | `image` + `caption` (html of `figcaption`) |
| `nav[aria-label=Breadcrumb]` | `breadcrumb` `items: [{text, href?}]`, splitting on the `/` separators |
| `details` | `faq` `question` ✱ (from `summary`), `blocks` |
| `blockquote` | `quote` ✱ `cite` (text of a `cite`/`footer` inside, else `null`) |
| `table` | `table` `rows: string[][]` (cell `html`) |
| `form` | `form` `fields: [{label, type, options?}]`, `submit` |
| `label`/`input`/`select`/`textarea` outside a form | `field` `label`, `type`, `options?` |
| `sc-for` | `repeat` `list`, `as`, `blocks` |
| `sc-if` | `if` `value`, `blocks` |
| other elements with block children | recurse (no block of their own); loose text nodes beside block children → `text` |
| anything else with text | `warn("unhandled <tag> in <section>: <first 40 chars>")` |

Block-level tags: `h1–h6 p ul ol li div section article aside figure img table details blockquote form nav header footer a button sc-for sc-if label input select textarea`.

- [ ] **Step 1: Write failing tests** (one per row group, plus sections)

```js
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
test("card anchor keeps image, heading and paragraph", ...);        // a > img + h3 + p → { type:"card", href:"/saunas/cube", blocks:[image, heading, paragraph] }
test("button-styled anchor and plain link", ...);                   // class="hbtn" → variant "button"; plain → "link"
test("faq, quote, table, list", ...);
test("form fields and loose field", ...);
test("sc-for and sc-if become repeat and if", () => {
  expect(blocksFrom(el(`<div><sc-for list="{{items}}" as="it"><p>{{it.n}}</p></sc-for><sc-if value="{{x}}"><p>Hi</p></sc-if></div>`), ctx)).toEqual([
    { type: "repeat", list: "{{items}}", as: "it", blocks: [{ type: "paragraph", html: "{{it.n}}", text: "{{it.n}}" }] },
    { type: "if", value: "{{x}}", blocks: [{ type: "paragraph", html: "Hi", text: "Hi" }] },
  ]);
});
test("unknown tag with text warns", ...);                           // <marquee>x</marquee> → warn /unhandled <marquee>/
test("extractSections names by comment, skips header/footer, numbers unnamed", () => {
  // <x-dc><helmet/><div><!-- Header --><header>..</header><!-- Hero --><section><p>A</p></section><section><p>B</p></section><!-- Footer --><footer>..</footer></div></x-dc>
  // → [{name:"Hero",...}, {name:"Section 1",...}]
});
```

- [ ] **Step 2: Run** `npx jest scripts/extract-dc/blocks --coverage=false`. Expected: FAIL.
- [ ] **Step 3: Implement** `blocks.mjs`.
- [ ] **Step 4: Run** the same command. Expected: PASS.
- [ ] **Step 5: Commit** `feat(redesign): copy blocks and sections for the extractor`

### Task 5: Page assembly and checks

**Files:**
- Create: `scripts/extract-dc/page.mjs`
- Test: `scripts/extract-dc/page.test.js`

**Interfaces:**
- Consumes: everything above.
- Produces: `extractPage({ fileName: string, html: string, pageMap }) => { file, route, pageMap, head, data, sections, warnings: string[] }` (keys in that order; `route`/`pageMap` are `null` when the file has no CSV row). Throws when `<x-dc>` is missing (the CLI turns this into exit 1).

Checks, each a warning string:
- `no page-map row`
- `title differs from page-map: "<head>" vs "<csv>"`, and the same for `description`
- `canonical path <path> differs from route <route>` (compare `new URL(canonical).pathname`, trailing `/` stripped except root)
- `og:type is "<x>", expected "website"`
- `mentions Leisurecraft in <where>` (case-insensitive), searched in head, data and block text. Skipped entirely for `Main.dc.html`.

Warnings are de-duplicated and kept in first-seen order.

- [ ] **Step 1: Write failing tests**: a minimal full page fixture that passes all checks (`warnings: []`), then one test per check, each asserting the exact warning string.
- [ ] **Step 2: Run** `npx jest scripts/extract-dc/page --coverage=false`. Expected: FAIL.
- [ ] **Step 3: Implement** `page.mjs`.
- [ ] **Step 4: Run** `npx jest scripts/extract-dc --coverage=false`. Expected: all extractor tests PASS.
- [ ] **Step 5: Commit** `feat(redesign): page extraction with SEO and copy checks`

### Task 6: CLI, full run, docs

**Files:**
- Create: `scripts/extract-dc.mjs`, `content/redesign/*.json`, `content/redesign/index.json`
- Modify: `package.json` (script `"extract:dc": "node scripts/extract-dc.mjs"`), `docs/redesign.md`, `lib/site/progress.js`

**Interfaces:**
- Consumes: `loadPageMap`, `extractPage`.
- CLI: `node scripts/extract-dc.mjs [siteDir]`. siteDir = arg, else `DC_SITE_DIR`, else `path.join(os.homedir(), "Downloads", "TSC-REVAMP", "Site")`. CSV = `path.join(siteDir, "..", "Launch File", "page-map.csv")`.
- `index.json`: `{ "pages": { "<route>": { "file": "About.json", "warnings": 0 } }, "warnings": ["page-map row with no file: X.dc.html"] }`, with routes sorted.
- Exit 1 with a clear message, before writing anything, when: siteDir or the CSV is missing; `extractPage` throws (name the file); two pages map to the same route (name both).
- Before writing, delete `*.json` in `content/redesign/` (nothing else).
- Summary to stdout: `pages`, `sections`, `blocks`, `warnings`, then warning counts grouped by text up to the first `:`.

- [ ] **Step 1: Implement** the CLI. Run `npm run extract:dc`. Expected: 107 page files + `index.json`, exit 0.
- [ ] **Step 2: Determinism.** Run it again, then `git status --porcelain content/redesign`. Expected: no changes after the second run (commit the first run's output in Step 4).
- [ ] **Step 3: Triage warnings.** For each warning kind, open two example pages and decide whether it's a real design issue (keep it and list it in the PR) or an extractor gap (fix it with a new test in the owning task's test file). Repeat until no warnings are unexplained. Spot-check `About.json`, `SaunaPureCube552.json`, `SaunasCube.json`, `HeaterApex208.json` and `Main.json` against the pages in a browser (`python -m http.server 8765` in the Site folder).
- [ ] **Step 4: Commit output** `feat(redesign): extract design pages to content/redesign`
- [ ] **Step 5: Docs.** In `docs/redesign.md`, tick the extraction item and add one line on how to re-run it. In `lib/site/progress.js`, keep "Behind-the-scenes setup for the new pages" as `in-progress` (the price diff, slugs and SEO helper remain) and set `UPDATED`.
- [ ] **Step 6: Verify the definition of done.** Run `npm test`: the only failure allowed is the pre-existing `getServerSession` one. Run `npm run build`: it must pass. `npm run lint` is unconfigured (known), so say that in the PR. No routes change, so there are no screenshots or route checks.
- [ ] **Step 7: Commit, push, open the PR** into `redesign`, with the run summary and any remaining warnings, and wait for the owner to merge.
