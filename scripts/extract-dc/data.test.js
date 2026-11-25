/** @jest-environment node */
import { extractData } from "./data.mjs";

test("finds var, bare assignment in a var list, and method returns", () => {
  const s = `var D = {"a": 1}; var self = this, E = {"b": [1, "x}"]}; fdData() { return [{"n": "y"}]; }`;
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

test("unbalanced literal does not throw", () => {
  expect(extractData(`var D = {"a": [1, 2`)).toEqual({});
});
