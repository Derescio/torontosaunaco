/** @jest-environment node */
import { buildReport } from "./report.mjs";

const dp = (stem, group, optionId, label, price, kind = "addon", product = "P") => ({
  id: `${stem}:${group}:${optionId}`,
  product,
  group,
  label,
  price,
  kind,
});

const cubeDesign = {
  file: "SaunaPureCube552.dc.html",
  stem: "SaunaPureCube552",
  name: "The Pure Cube 552",
  category: "Outdoor saunas",
  route: "/saunas/pure-cube-552",
  points: [
    dp("SaunaPureCube552", "size", "s552", "Pure Cube 552", 11884, "base"),
    dp("SaunaPureCube552", "wood", "clear", "Clear Western Red Cedar", 4500),
    dp("SaunaPureCube552", "panels", "mirror", "Mirrored Glass", 750),
    dp("SaunaPureCube552", "panels", "semi", "Semi-privacy side panels", 600),
  ],
};

const cubeDoc = {
  _id: "p1",
  name: "The Pure Cube 552",
  price: 11884,
  wood_type: { "Clear Cedar (Upgrade)": { price: 4500 } },
  stove_type: { "Narvi 16 Wood Burning Heater": { price: 4200 } },
  additional_upgrades: [{ name: "Mirrored Front Glass", price: 800 }],
  updatedAt: "2026-10-21T05:42:31.952Z",
};

const empty = { products: [], heaters: [], accessories: [] };
const none = { products: {}, options: {} };
const build = (designProducts, catalogue, overrides = none) =>
  buildReport({ designProducts, catalogue: { ...empty, ...catalogue }, overrides, now: "2026-11-24T12:00:00.000Z" });

test("pure cube: same prices counted, differences listed, one-sided rows on both sides", () => {
  const r = build([cubeDesign], { products: [cubeDoc] });
  expect(r.generatedAt).toBe("2026-11-24T12:00:00.000Z");
  expect(r.websiteAsOf).toBe("2026-10-21T05:42:31.952Z");
  const [section] = r.sections;
  expect(section.category).toBe("Outdoor saunas");
  const [prod] = section.products;
  expect(prod.matchedTo).toEqual(["The Pure Cube 552"]);
  expect(prod.sameCount).toBe(2);
  expect(prod.rows).toEqual([
    { id: "SaunaPureCube552:panels:mirror", group: "panels", label: "Mirrored Glass", websiteLabel: "Mirrored Front Glass", website: 800, design: 750, outcome: "differs" },
    { id: "SaunaPureCube552:panels:semi", group: "panels", label: "Semi-privacy side panels", websiteLabel: null, website: null, design: 600, outcome: "design-only" },
    { id: "db:p1:stove_type.Narvi 16 Wood Burning Heater", group: null, label: "Narvi 16 Wood Burning Heater", websiteLabel: "Narvi 16 Wood Burning Heater", website: 4200, design: null, outcome: "website-only" },
  ]);
  expect(r.totals).toEqual({ same: 2, differs: 1, "on-request": 0, "design-only": 1, "website-only": 1 });
});

test("pairing is one-to-one: the better design option wins, the other is design-only", () => {
  const design = {
    ...cubeDesign,
    points: [dp("S", "g", "a", "Mirrored glass panel", 700), dp("S", "g", "b", "Mirrored Front Glass", 750)],
  };
  const doc = { _id: "p1", name: "The Pure Cube 552", additional_upgrades: [{ name: "Mirrored Front Glass", price: 750 }] };
  const [prod] = build([design], { products: [doc] }).sections[0].products;
  expect(prod.sameCount).toBe(1);
  expect(prod.rows.map((r) => [r.id, r.outcome])).toEqual([["S:g:a", "design-only"]]);
});

test("sizes pair with the same size only", () => {
  const design = {
    ...cubeDesign,
    name: "Barrel Sauna",
    points: [dp("SaunaBarrel", "size", "s4", "7' × 4'", 8499, "base"), dp("SaunaBarrel", "size", "s6", "7' × 6'", 9100, "base")],
  };
  const doc = {
    _id: "b1",
    name: "Barrel Sauna",
    sizes: [
      { key: "7x4", label: "7’ x 4’", priceByWood: { "Knotty Cedar": 8500 } },
      { key: "7x6", label: "7’ x 6’", priceByWood: { "Knotty Cedar": 9100 } },
    ],
  };
  const [prod] = build([design], { products: [doc] }).sections[0].products;
  expect(prod.sameCount).toBe(1);
  expect(prod.rows).toEqual([
    { id: "SaunaBarrel:size:s4", group: "size", label: "7' × 4'", websiteLabel: "7’ x 4’ Knotty Cedar", website: 8500, design: 8499, outcome: "differs" },
  ]);
});

test("heater page matches every kW record of its series and pairs by kW", () => {
  const design = {
    file: "HeaterApex208.dc.html",
    stem: "HeaterApex208",
    name: "Homecraft Apex (208V / 3 Phase)",
    category: "Heaters",
    route: "/sauna-heaters/apex-208",
    points: [dp("HeaterApex208", "heater", "kw1", "Apex 12 kW (208V 3-phase)", 3010, "base")],
  };
  const heaters = [10, 12, 15].map((kw, i) => ({ _id: `h${i}`, name: "Homecraft Apex", power: kw, basePrice: [3720, 4782, 4982][i] }));
  const r = build([design], { heaters: [...heaters, { _id: "x", name: "Harvia KIP 8 kW Electric Sauna Heater", power: 8, basePrice: 1850 }] });
  const [prod] = r.sections[0].products;
  expect(prod.matchedTo).toEqual(["Homecraft Apex"]);
  expect(prod.rows[0]).toEqual({
    id: "HeaterApex208:heater:kw1",
    group: "heater",
    label: "Apex 12 kW (208V 3-phase)",
    websiteLabel: "Homecraft Apex 12 kW",
    website: 4782,
    design: 3010,
    outcome: "differs",
  });
  expect(r.websiteOnly).toEqual([{ name: "Harvia KIP 8 kW Electric Sauna Heater", collection: "heaters", basePrice: 1850 }]);
});

test("design price on request against a website price", () => {
  const design = { ...cubeDesign, points: [dp("S", "wood", "clear", "Clear Western Red Cedar", null)] };
  const [prod] = build([design], { products: [cubeDoc] }).sections[0].products;
  expect(prod.rows[0]).toMatchObject({ id: "S:wood:clear", website: 4500, design: null, outcome: "on-request" });
});

test("unpaired configurator add-ons fall back to the heater and accessory catalogues", () => {
  const design = { ...cubeDesign, points: [dp("S", "acc", "bucket", "Wooden Bucket & Ladle", 82)] };
  const r = build([design], { products: [{ _id: "p1", name: "The Pure Cube 552" }], accessories: [{ _id: "a1", name: "Wooden Bucket w/Ladle", price: 100 }] });
  expect(r.sections[0].products[0].rows).toEqual([
    { id: "S:acc:bucket", group: "acc", label: "Wooden Bucket & Ladle", websiteLabel: "Wooden Bucket w/Ladle", website: 100, design: 82, outcome: "differs" },
  ]);
});

test("overrides: one page to two documents, and a forced option pair", () => {
  const design = {
    file: "PlungeArctic.dc.html",
    stem: "PlungeArctic",
    name: "The Arctic Plunge Tub",
    category: "Cold plunges",
    route: "/cold-plunges/arctic",
    points: [
      dp("PlungeArctic", "wood", "wd_knotty", "Knotty Red Cedar", 2974, "base"),
      dp("PlungeArctic", "chiller", "ch_penguin", "Penguin Chiller with Filter Kit", 3085),
    ],
  };
  const docs = [
    { _id: "k", name: "The Arctic Plunge Tub - Knotty Red Cedar", price: 4150, stove_type: { "Penguin Cold Therapy Chiller w/ Filter Kit": { price: 3100 } } },
    { _id: "c", name: "The Arctic Plunge Tub - Clear Red Cedar test", price: 4590 },
  ];
  const overrides = {
    products: { "PlungeArctic.dc.html": ["k", "c"] },
    options: { "PlungeArctic:chiller:ch_penguin": "db:k:stove_type.Penguin Cold Therapy Chiller w/ Filter Kit" },
  };
  const [prod] = build([design], { products: docs }, overrides).sections[0].products;
  expect(prod.matchedTo).toEqual(["The Arctic Plunge Tub - Knotty Red Cedar", "The Arctic Plunge Tub - Clear Red Cedar test"]);
  expect(prod.rows.map((r) => [r.id, r.outcome, r.website])).toEqual([
    ["PlungeArctic:wood:wd_knotty", "differs", 4150],
    ["PlungeArctic:chiller:ch_penguin", "differs", 3100],
    ["db:c:price", "website-only", 4590],
  ]);
});

test("a product override of null makes a page new in the design; unmatched docs are website-only", () => {
  const r = build([cubeDesign], { products: [cubeDoc, { _id: "t", name: "The Cascade Tub 3'x7'", price: 7674 }] }, { products: { "SaunaPureCube552.dc.html": null }, options: {} });
  expect(r.sections).toEqual([]);
  expect(r.designOnly).toEqual([{ name: "The Pure Cube 552", file: "SaunaPureCube552.dc.html", basePrice: 11884 }]);
  expect(r.websiteOnly).toEqual([
    { name: "The Cascade Tub 3'x7'", collection: "products", basePrice: 7674 },
    { name: "The Pure Cube 552", collection: "products", basePrice: 11884 },
  ]);
});

test("sections in the fixed order, products by name", () => {
  const mk = (name, category) => ({ ...cubeDesign, file: `${name}.dc.html`, stem: name, name, category, points: [] });
  const r = build(
    [mk("Zeta", "Outdoor saunas"), mk("Alpha", "Outdoor saunas"), mk("Polar", "Cold plunges"), mk("Loft", "Indoor saunas")],
    { products: ["Zeta", "Alpha", "Polar", "Loft"].map((n, i) => ({ _id: `d${i}`, name: n, price: 1 })) },
  );
  expect(r.sections.map((s) => [s.category, s.products.map((p) => p.name)])).toEqual([
    ["Outdoor saunas", ["Alpha", "Zeta"]],
    ["Indoor saunas", ["Loft"]],
    ["Cold plunges", ["Polar"]],
  ]);
});
