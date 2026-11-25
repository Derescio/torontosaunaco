/** @jest-environment node */
import { tokens, similarity, parseMoney, samePrice } from "./text.mjs";

test("sizes become one token", () => {
  expect(tokens("7' × 6'")).toEqual(["7x6"]);
  expect(tokens("7’ x 6’ Knotty Cedar")).toEqual(["7x6", "knotty", "cedar"]);
  expect(tokens("7x10")).toEqual(["7x10"]);
  expect(similarity("7' × 4'", "7’ x 6’ Knotty Cedar")).toBe(0);
});

test("power becomes one token", () => {
  expect(tokens("Apex 12 kW (208V 3-phase)")).toEqual(["apex", "12kw", "208v", "3phase"]);
  expect(tokens("Homecraft Apex Mini 7.5kW")).toEqual(["homecraft", "apex", "mini", "7.5kw"]);
});

test("volumes become one token", () => {
  expect(tokens("Meldos Natural Sauna Oil (2.5 L)")).toEqual(["meldo", "natural", "oil", "2.5l"]);
  expect(tokens("Meldos Natural Sauna Oil 250ml")).toEqual(["meldo", "natural", "oil", "250ml"]);
});

test("stop words, w/ and stems", () => {
  expect(tokens("The Luna Sauna w/Porch")).toEqual(["luna", "porch"]);
  expect(tokens("Delivery + Installation")).toEqual(["delivery", "install"]);
  expect(tokens("Supply_Install")).toEqual(["install"]);
});

test("hyphens join next to digits but split words", () => {
  expect(tokens("Two half-moon front windows")).toEqual(["two", "half", "moon", "front", "window"]);
  expect(tokens("3-phase")).toEqual(["3phase"]);
  expect(similarity("Two half-moon front windows", "Half Moon Front Wall Window")).toBeCloseTo(0.8, 2);
});

test("installation names pair with the website's install options", () => {
  expect(similarity("Delivery + Installation", "Supply_Install")).toBeGreaterThanOrEqual(0.6);
  expect(similarity("Delivery + Installation", "Professional Install")).toBeGreaterThanOrEqual(0.6);
});

test("similarity", () => {
  expect(similarity("Clear Western Red Cedar", "Clear Cedar (Upgrade)")).toBeCloseTo(0.667, 2);
  expect(similarity("Mirrored Glass", "Mirrored Front Glass")).toBeCloseTo(0.8, 2);
  expect(similarity("", "x")).toBe(0);
});

test.each([
  [82, 82],
  ["$82.00", 82],
  ["$1,082.50", 1082.5],
  [null, null],
  [undefined, null],
  ["Call", null],
  [NaN, null],
])("parseMoney(%p)", (v, out) => {
  expect(parseMoney(v)).toBe(out);
});

test("samePrice is to the cent", () => {
  expect(samePrice(111.6, 111.6000001)).toBe(true);
  expect(samePrice(111.6, 111.61)).toBe(false);
});
