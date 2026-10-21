import { heaterSpecRows } from "./heaterSpecs.js";

const clonedWarranty = {
  duration: 3,
  description: "3-year manufacturer warranty on electrical components",
};

describe("heaterSpecRows", () => {
  it("shows a round heater with two electrical lines and a real warranty", () => {
    const rows = heaterSpecRows({
      power: 15,
      specifications: {
        roomSize: { imperial_min: 550, imperial_max: 900 },
        stoneCapacity: { imperial_weight: 310, note: "10 boxes of rocks" },
        dimensions: {
          diameter: { imperial: 18 },
          height: { imperial: 36 },
          width: { imperial: 15 },
        },
        weight: { imperial: 55 },
        electrical: [
          "240V 1-phase, 80A breaker, hardwired",
          "208V 3-phase, 60A breaker, hardwired",
        ],
        clearance: "5.5 in",
      },
      warranty: { duration: 2, description: "2-year warranty" },
    });

    expect(rows).toEqual([
      { label: "Output", value: "15 kW" },
      { label: "Room size", value: "550–900 cu ft" },
      { label: "Stones", value: "310 lbs (10 boxes of rocks)" },
      { label: "Size", value: "18 in diameter × 36 in H; 55 lbs empty" },
      {
        label: "Electrical",
        value: [
          "240V 1-phase, 80A breaker, hardwired",
          "208V 3-phase, 60A breaker, hardwired",
        ],
      },
      { label: "Clearance", value: "5.5 in" },
      { label: "Warranty", value: "2 years" },
    ]);
  });

  it("uses width and height when depth is absent", () => {
    const rows = heaterSpecRows({
      power: 6,
      specifications: {
        dimensions: {
          width: { imperial: 14 },
          height: { imperial: 32 },
        },
        weight: { imperial: 35 },
      },
    });

    expect(rows.find((row) => row.label === "Size").value).toBe(
      "14 in W × 32 in H; 35 lbs empty"
    );
  });

  it("renders an open-ended room size and hides the cloned warranty", () => {
    const rows = heaterSpecRows({
      power: 10.5,
      specifications: {
        roomSize: { imperial_max: 566 },
        mounting: "floor-standing",
        controls: "Huum UKU controller (sold separately)",
      },
      warranty: clonedWarranty,
    });

    expect(rows.map((row) => row.label)).toEqual([
      "Output",
      "Room size",
      "Mounting",
      "Controls",
    ]);
    expect(rows.find((row) => row.label === "Room size").value).toBe(
      "up to 566 cu ft"
    );
  });

  it("falls back to cubic metres and millimetres for older records", () => {
    const rows = heaterSpecRows({
      power: 0,
      specifications: {
        roomSize: { min: 10, max: 21 },
        dimensions: {
          width: { metric: 390 },
          depth: { metric: 335 },
          height: { metric: 750 },
        },
      },
    });

    expect(rows).toEqual([
      { label: "Output", value: "Wood burning" },
      { label: "Room size", value: "10–21 m³" },
      { label: "Size", value: "390 × 335 × 750 mm" },
    ]);
  });
});