import { MAIN_NAV, HEADER_ACTIONS, CONTACT, FOOTER_COLUMNS, FOOTER_BRAND, COPYRIGHT, isActive } from "./nav";

const allLinks = () => [
  ...MAIN_NAV.flatMap((item) => [item, ...(item.children ?? [])]),
  ...Object.values(HEADER_ACTIONS),
  ...FOOTER_COLUMNS.flatMap((col) => col.links),
];

const byLabel = (label) => MAIN_NAV.find((item) => item.label === label);
const activeLabels = (pathname) => MAIN_NAV.filter((item) => isActive(item, pathname)).map((item) => item.label);

describe("nav data", () => {
  it("every href is root-relative, tel: or https:", () => {
    for (const link of allLinks()) expect(link.href).toMatch(/^(\/(?!\/)|tel:|https:\/\/)/);
    expect(CONTACT.tel).toBe("tel:+14374296623");
  });

  it("no label or description mentions Leisurecraft", () => {
    const text = JSON.stringify({ MAIN_NAV, HEADER_ACTIONS, CONTACT, FOOTER_COLUMNS, FOOTER_BRAND, COPYRIGHT });
    expect(text).not.toMatch(/leisurecraft/i);
  });

  it("main nav has the 7 labels in order", () => {
    expect(MAIN_NAV.map((item) => item.label)).toEqual([
      "Outdoor Saunas",
      "Plunge & Shower",
      "Indoor Saunas",
      "Heaters",
      "Accessories",
      "Wellness",
      "Contact",
    ]);
  });

  it("dropdowns have the design's children", () => {
    expect(byLabel("Outdoor Saunas").children.map((c) => c.href)).toEqual([
      "/saunas/best-sellers",
      "/saunas/cube",
      "/saunas/barrel",
      "/saunas/canadian-timber",
      "/saunas",
      "/saunas/luna",
    ]);
    expect(byLabel("Plunge & Shower").children.map((c) => c.href)).toEqual(["/cold-plunges", "/outdoor-showers"]);
    expect(byLabel("Indoor Saunas").children.map((c) => c.href)).toEqual(["/saunas/indoor/kits", "/saunas/indoor/custom"]);
    expect(byLabel("Indoor Saunas").children[0].description).toBe("Ready-made rooms in set sizes, from $8,070");
  });

  it("footer columns are Shop (8), Company (5), Policies (6)", () => {
    expect(FOOTER_COLUMNS.map((c) => [c.title, c.links.length])).toEqual([
      ["Shop", 8],
      ["Company", 5],
      ["Policies", 6],
    ]);
    expect(FOOTER_COLUMNS[0].links.find((l) => l.label === "Custom Saunas").href).toBe("/custom-builds");
  });
});

describe("isActive", () => {
  it.each([
    ["/saunas/cube", ["Outdoor Saunas"]],
    ["/saunas", ["Outdoor Saunas"]],
    ["/saunas/indoor/kits", ["Indoor Saunas"]],
    ["/saunas/indoor", ["Indoor Saunas"]],
    ["/saunas-guide", []],
    ["/outdoor-showers", ["Plunge & Shower"]],
    ["/sauna-heaters", ["Heaters"]],
    ["/", []],
    [null, []],
  ])("%s → %j", (pathname, expected) => {
    expect(activeLabels(pathname)).toEqual(expected);
  });
});
