/** @jest-environment node */
import { productPoints, heaterPoints, accessoryPoints, newestUpdate } from "./website.mjs";

const cube = {
  _id: "p1",
  name: "The Pure Cube 552",
  price: 11884,
  baseCost: 11884,
  wood_type: { "Knotty Cedar": { price: 0 }, "Clear Cedar (Upgrade)": { price: 4500 } },
  stove_type: { "Harvia Kip 8kW": { price: 1550, heaterId: "h1", priceOffset: -300 } },
  wifi_controller: { price: 575 },
  additional_upgrades: [{ name: "Mirrored Front Glass", price: 750 }, { name: "No Windows", price: 0 }],
  delivery: { cost: 450, included: false },
  installation: { DIY: { price: 0 }, "Professional Install": { price: 1750 } },
};

const p = (path, label, price, kind, product = "The Pure Cube 552", id = "p1") => ({ id: `db:${id}:${path}`, product, group: null, label, price, kind });

test("product: base, wood, stoves, wifi, upgrades, delivery, installation; zero add-ons skipped", () => {
  expect(productPoints(cube)).toEqual([
    p("price", "The Pure Cube 552", 11884, "base"),
    p("wood_type.Clear Cedar (Upgrade)", "Clear Cedar (Upgrade)", 4500, "addon"),
    p("stove_type.Harvia Kip 8kW", "Harvia Kip 8kW", 1550, "addon"),
    p("installation.Professional Install", "Professional Install", 1750, "addon"),
    p("additional_upgrades.Mirrored Front Glass", "Mirrored Front Glass", 750, "addon"),
    p("wifi_controller", "Wi-Fi controller", 575, "addon"),
    p("delivery", "Delivery", 450, "addon"),
  ]);
});

test("barrel: sizes by wood are base points; baseCost only when no price and no sizes", () => {
  const barrel = { _id: "b1", name: "Barrel Sauna", baseCost: 8500, sizes: [{ key: "7x6", label: "7’ x 6’", priceByWood: { "Knotty Cedar": 9100 } }] };
  expect(productPoints(barrel)).toEqual([p("sizes.7x6.Knotty Cedar", "7’ x 6’ Knotty Cedar", 9100, "base", "Barrel Sauna", "b1")]);
  expect(productPoints({ _id: "c1", name: "X", baseCost: 500 })).toEqual([p("baseCost", "X", 500, "base", "X", "c1")]);
});

test("array forms, empty objects and trimmed keys", () => {
  const doc = {
    _id: "x1",
    name: "Harmony Sauna",
    price: 7600,
    wood_type: {},
    stove_type: { " Huum Drop Heater - 6KW LOCAL CONTROL": { price: 2810 } },
    installation: [{ type: "Supply_Install", price: 1750 }],
  };
  expect(productPoints(doc)).toEqual([
    p("price", "Harmony Sauna", 7600, "base", "Harmony Sauna", "x1"),
    p("stove_type.Huum Drop Heater - 6KW LOCAL CONTROL", "Huum Drop Heater - 6KW LOCAL CONTROL", 2810, "addon", "Harmony Sauna", "x1"),
    p("installation.Supply_Install", "Supply_Install", 1750, "addon", "Harmony Sauna", "x1"),
  ]);
});

test("heater: base labelled with power; priced options are add-ons", () => {
  const h = { _id: "h1", name: "Homecraft Apex Mini", power: 7.5, basePrice: 2975, options: { stones: [{ type: "Box of stones", price: 60 }, { type: "None" }] } };
  expect(heaterPoints(h)).toEqual([
    p("basePrice", "Homecraft Apex Mini 7.5 kW", 2975, "base", "Homecraft Apex Mini", "h1"),
    p("options.stones.Box of stones", "Box of stones", 60, "addon", "Homecraft Apex Mini", "h1"),
  ]);
});

test("accessory: price is the base point", () => {
  expect(accessoryPoints({ _id: "a1", name: "Wooden Bucket w/Ladle", price: 100 })).toEqual([
    p("price", "Wooden Bucket w/Ladle", 100, "base", "Wooden Bucket w/Ladle", "a1"),
  ]);
});

test("newestUpdate", () => {
  expect(newestUpdate([{ updatedAt: new Date("2026-10-21T05:42:31Z") }, { updatedAt: "2026-11-02T00:00:00.000Z" }, {}])).toBe("2026-11-02T00:00:00.000Z");
  expect(newestUpdate([])).toBeNull();
});
