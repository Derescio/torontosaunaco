/** @jest-environment node */
import { designProducts } from "./design.mjs";

const sauna = {
  file: "SaunaPureCube552.dc.html",
  route: "/saunas/pure-cube-552",
  data: {
    D: {
      name: "The Pure Cube 552",
      steps: [
        {
          id: "design",
          groups: [
            { id: "size", title: "Choose your size", base: true, options: [{ id: "s552", label: "Pure Cube 552", price: 11884 }] },
            {
              id: "wood",
              title: "Choose your wood type",
              options: [
                { id: "knotty", label: "Knotty", price: 0 },
                { id: "clear", label: "Clear Western Red Cedar", price: 4500 },
                { id: "roof", label: "Black metal roof", price: null },
              ],
            },
          ],
        },
        { id: "heat", groups: [{ id: "heater", title: "Heater", options: [{ id: "none", label: "No heater", price: 0, none: true }] }] },
      ],
    },
  },
};

const heater = {
  file: "HeaterApex208.dc.html",
  route: "/sauna-heaters/homecraft-apex-208v",
  data: {
    d: {
      name: "Homecraft Apex (208V / 3 Phase)",
      steps: [
        { id: "heater", title: "Heater size", options: [{ id: "kw1", label: "Apex 12 kW (208V 3-phase)", price: 3010 }] },
        { id: "control", title: "Controls", options: [{ id: "c1", label: "TKE2-3 control", price: 450 }, { id: "c0", label: "None", price: 0 }] },
      ],
    },
  },
};

const accessories = {
  file: "Accessories.dc.html",
  route: "/accessories",
  data: {
    items: [{ sku: "BL01", name: "Wooden Sauna Bucket & Ladle", price: "$82.00" }],
    items_2: [{ name: "Soapstone Steam Stone", price: "$1,082.50" }],
    packages: [{ sku: "APAC01", name: "Starter", fullName: "Starter Sauna Accessory Package", price: "$111.60" }],
    lighting: [{ sku: "L1", name: "Sade 43", price: "Call" }],
    finishes: [],
  },
};

test("sauna page: base group, add-ons, on-request, skips none and zero add-ons", () => {
  const [p] = designProducts([sauna]);
  expect(p).toMatchObject({ file: "SaunaPureCube552.dc.html", stem: "SaunaPureCube552", name: "The Pure Cube 552", category: "Outdoor saunas" });
  expect(p.points).toEqual([
    { id: "SaunaPureCube552:size:s552", product: "The Pure Cube 552", group: "Choose your size", label: "Pure Cube 552", price: 11884, kind: "base" },
    { id: "SaunaPureCube552:wood:clear", product: "The Pure Cube 552", group: "Choose your wood type", label: "Clear Western Red Cedar", price: 4500, kind: "addon" },
    { id: "SaunaPureCube552:wood:roof", product: "The Pure Cube 552", group: "Choose your wood type", label: "Black metal roof", price: null, kind: "addon" },
  ]);
});

test("heater page: first step is base", () => {
  const [p] = designProducts([heater]);
  expect(p.category).toBe("Heaters");
  expect(p.points).toEqual([
    { id: "HeaterApex208:heater:kw1", product: "Homecraft Apex (208V / 3 Phase)", group: "Heater size", label: "Apex 12 kW (208V 3-phase)", price: 3010, kind: "base" },
    { id: "HeaterApex208:control:c1", product: "Homecraft Apex (208V / 3 Phase)", group: "Controls", label: "TKE2-3 control", price: 450, kind: "addon" },
  ]);
});

test("accessories catalogue: price strings, full names, unparseable → on request", () => {
  const [p] = designProducts([accessories]);
  expect(p).toMatchObject({ name: "Accessories catalogue", category: "Accessories" });
  expect(p.points).toEqual([
    { id: "Accessories:items:BL01", product: "Accessories catalogue", group: "Accessories", label: "Wooden Sauna Bucket & Ladle", price: 82, kind: "base" },
    { id: "Accessories:items_2:soapstone-steam-stone", product: "Accessories catalogue", group: "Accessories", label: "Soapstone Steam Stone", price: 1082.5, kind: "base" },
    { id: "Accessories:packages:APAC01", product: "Accessories catalogue", group: "Packages", label: "Starter Sauna Accessory Package", price: 111.6, kind: "base" },
    { id: "Accessories:lighting:L1", product: "Accessories catalogue", group: "Lighting", label: "Sade 43", price: null, kind: "base" },
  ]);
});

test.each([
  ["/cold-plunges/arctic", "Cold plunges"],
  ["/outdoor-showers/sunlight", "Outdoor showers"],
  ["/saunas/indoor/kits/pure-cube-550", "Indoor saunas"],
  ["/saunas/element-loft", "Indoor saunas"],
  ["/saunas/barrel-sauna", "Outdoor saunas"],
])("category for %s", (route, category) => {
  expect(designProducts([{ ...sauna, route }])[0].category).toBe(category);
});

test("non-product pages are ignored", () => {
  expect(designProducts([{ file: "About.dc.html", route: "/about", data: {} }, { file: "SaunasCube.dc.html", route: "/saunas/cube", data: { D: { items: [] } } }])).toEqual([]);
});
