import { groupHeatersBySeries } from "./groupHeatersBySeries.js";

describe("groupHeatersBySeries", () => {
  const apex9 = {
    _id: "apex-9",
    name: "Homecraft Apex Mini 9 kW",
    series: "Homecraft Apex Mini",
    power: 9,
    basePrice: 3050,
  };
  const apex6 = {
    _id: "apex-6",
    name: "Homecraft Apex Mini 6 kW",
    series: "Homecraft Apex Mini",
    power: 6,
    basePrice: 2950,
  };
  const apex75 = {
    _id: "apex-75",
    name: "Homecraft Apex Mini 7.5 kW",
    series: "  Homecraft Apex Mini  ",
    power: 7.5,
    basePrice: 2975,
  };
  const revive = {
    _id: "revive-9",
    name: "Homecraft Revive 9 kW",
    series: "Homecraft Revive",
    power: 9,
    basePrice: 3300,
  };
  const kip = {
    _id: "kip-8",
    name: "Harvia KIP 8 kW",
    power: 8,
    basePrice: 1550,
  };
  const blankSeries = {
    _id: "blank",
    name: "Standalone Heater",
    series: "   ",
    power: 6,
    basePrice: 1000,
  };

  it("groups the same series and uses the lowest kW as the representative", () => {
    const groups = groupHeatersBySeries([apex9, kip, apex6, apex75, revive]);
    const apex = groups.find((group) => group.series === "Homecraft Apex Mini");

    expect(apex.variants.map((variant) => variant.power)).toEqual([6, 7.5, 9]);
    expect(apex.representative).toBe(apex6);
    expect(groups.find((group) => group.series === "Homecraft Revive").variants).toEqual([
      revive,
    ]);
  });

  it("keeps heaters with a blank series as their own cards", () => {
    const groups = groupHeatersBySeries([kip, blankSeries]);

    expect(groups).toEqual([
      { series: null, variants: [kip], representative: kip },
      { series: null, variants: [blankSeries], representative: blankSeries },
    ]);
  });

  it("keeps the first-seen series order", () => {
    const groups = groupHeatersBySeries([revive, apex9, apex6]);

    expect(groups.map((group) => group.series)).toEqual([
      "Homecraft Revive",
      "Homecraft Apex Mini",
    ]);
  });
});
