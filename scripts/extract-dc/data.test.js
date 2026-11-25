/** @jest-environment node */
import { extractData } from "./data.mjs";

test("finds var, bare assignment in a var list, and method returns", () => {
  const s = `class C { constructor() { var D = {"a": 1}; var self = this, E = {"b": [1, "x}"]}; } fdData() { return [{"n": "y"}]; } }`;
  expect(extractData(s)).toEqual({ D: { a: 1 }, E: { b: [1, "x}"] }, fdData: [{ n: "y" }] });
});

test("skips non-JSON, empty and nested literals", () => {
  const s = `this.state = { chip: 'All' }; var errs = {}; var D = {"inner": {"k": 1}}; inner = 2;`;
  expect(extractData(s)).toEqual({ D: { inner: { k: 1 } } });
});

test("suffixes repeated names", () => {
  expect(extractData(`var d = {"a":1}; var d = {"b":2};`)).toEqual({ d: { a: 1 }, d_2: { b: 2 } });
});

test("drops a repeat with identical contents", () => {
  expect(extractData(`var D = {"a":[1]}; var self = this, D = {"a":[1]};`)).toEqual({ D: { a: [1] } });
});

test("handles escaped quotes and single-quoted strings containing brackets", () => {
  const s = `var q = 'a]}'; var D = {"say": "he said \\"}\\" ok", "n": [1]};`;
  expect(extractData(s)).toEqual({ D: { say: 'he said "}" ok', n: [1] } });
});

test("unparseable script warns and returns nothing", () => {
  const warn = jest.fn();
  expect(extractData(`var D = {"a": [1, 2`, warn)).toEqual({});
  expect(warn.mock.calls[0][0]).toMatch(/^script did not parse: /);
});

test("plain JS literals: unquoted keys, single quotes, negatives, template strings", () => {
  const s = "var items = [{ sku: 'X1', price: '$82.00', n: -1, t: `plain` }]; var electric = [{ name: \"Revive\", from: 1905 }];";
  expect(extractData(s)).toEqual({
    items: [{ sku: "X1", price: "$82.00", n: -1, t: "plain" }],
    electric: [{ name: "Revive", from: 1905 }],
  });
});

test("array arguments take the name of the property the call is assigned to", () => {
  const s = `renderVals() { var L = this.state; return { lf: L, lfReasons: opt(['Get a quote', 'Ask a question'], L.reason) }; }`;
  expect(extractData(`class C { ${s} }`)).toEqual({ lfReasons: ["Get a quote", "Ask a question"] });
});

test("unnamed calls and option objects passed to calls are not data", () => {
  const s = `x() { track(['a', 'b']); this.setState({ open: { a: 1 } }); var t = n.toLocaleString('en-CA', { style: 'currency' }); }`;
  expect(extractData(`class C { ${s} }`)).toEqual({});
});

test("a literal at the head of a method chain takes the variable's name", () => {
  const s = `var items = [{ sku: 'A' }].concat(lighting.map(function (l) { return { sku: l.sku }; })).concat([{ sku: 'B' }]);`;
  expect(extractData(s)).toEqual({ items: [{ sku: "A" }], items_2: [{ sku: "B" }] });
});

test("literals that reference variables are logic, not data", () => {
  expect(extractData(`var x = { name: d.name }; var y = [a, 'b']; var z = { t: \`\${n} items\` };`)).toEqual({});
});
