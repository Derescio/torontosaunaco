import {
  applyHeaterToStoveType,
  getHeaterFamily,
  getHeaterPowerKw,
  stoveOptionMatchesHeater,
} from "./heaterStoveLink.js";

const drop9 = {
  _id: "heater-drop-9",
  name: "HUUM DROP Electric Sauna Heater 9 kW",
  model: "DROP-9",
  power: 9,
  basePrice: 2450,
};

const kip8 = {
  _id: "heater-kip-8",
  name: "Harvia KIP 8 kW Electric Sauna Heater",
  model: "KIP-8",
  power: 8,
  basePrice: 1550,
};

const revive9 = {
  _id: "heater-hc-9",
  name: "Homecraft Revive 9 kW w/Wifi ",
  slug: "homecraft-revive-9-kw-w-wifi",
  model: "HC-9",
  power: 9,
  basePrice: 3300,
};

const hiveMini = {
  _id: "heater-hive-mini",
  name: "HUUM HIVE Mini Electric Sauna Heater 10.5 kW",
  model: "DROP-10.5",
  power: 10.5,
  basePrice: 3925,
};

const narvi20 = {
  _id: "heater-narvi-20",
  name: "Narvi NC 20 Wood-Burning Sauna Stove",
  model: "NC-20",
  power: 0,
  basePrice: 3400,
};

describe("getHeaterFamily", () => {
  it("maps product labels and catalog names onto the same family", () => {
    expect(getHeaterFamily("Huum Drop 9kW with Remote")).toBe("huum-drop");
    expect(getHeaterFamily(drop9.name)).toBe("huum-drop");
    expect(getHeaterFamily("Harvia Kip 8kW + Wifi Controller")).toBe("harvia-kip");
    expect(getHeaterFamily("Homecraft Revive 9kw w/ Wifi")).toBe("homecraft-revive");
    expect(getHeaterFamily("Huum Hive Mini 10.5kW with Remote")).toBe(
      "huum-hive-mini"
    );
    expect(getHeaterFamily("Penguin Cold Therapy Chiller w/ Filter Kit")).toBeNull();
  });
});

describe("getHeaterPowerKw", () => {
  it("reads kW from labels, models, and numeric power", () => {
    expect(getHeaterPowerKw("Huum Drop 9kW with Remote")).toBe(9);
    expect(getHeaterPowerKw(" Huum Drop Heater - 6KW WIFI CONTROL")).toBe(6);
    expect(getHeaterPowerKw(0, "NC-20")).toBe(20);
    expect(getHeaterPowerKw(kip8.power, kip8.model)).toBe(8);
    expect(
      getHeaterPowerKw(6, "HUUM DROP Electric Sauna Heater 7.5 kW")
    ).toBe(7.5);
  });
});

describe("stoveOptionMatchesHeater", () => {
  it("links variant product names to the canonical heater", () => {
    expect(
      stoveOptionMatchesHeater("Huum Drop 9kW with Remote", { price: 3457 }, drop9)
    ).toBe(true);
    expect(
      stoveOptionMatchesHeater(
        "Huum Drop 9kW with Remote + Wifi Controller",
        { price: 3950 },
        drop9
      )
    ).toBe(true);
    expect(
      stoveOptionMatchesHeater("Huum Drop WIFI (7.5kw)", { price: 2950 }, {
        _id: "heater-drop-75",
        name: "HUUM DROP Electric Sauna Heater 7.5 kW",
        model: "DROP-7.5",
        power: 6,
        basePrice: 2350,
      })
    ).toBe(true);
    expect(
      stoveOptionMatchesHeater("Homecraft Revive 9kw w/ Wifi", { price: 3300 }, revive9)
    ).toBe(true);
    expect(
      stoveOptionMatchesHeater(
        "Huum Hive Mini 10.5kW with Remote",
        { price: 4925 },
        hiveMini
      )
    ).toBe(true);
    expect(
      stoveOptionMatchesHeater("Narvi 20 Wood Burning Heater", { price: 4350 }, narvi20)
    ).toBe(true);
  });

  it("does not link different power ratings or chillers", () => {
    expect(
      stoveOptionMatchesHeater("Huum Drop Local Control (7.5kw)", { price: 2800 }, drop9)
    ).toBe(false);
    expect(
      stoveOptionMatchesHeater("Harvia KIP (6Kw) ", { price: 1500 }, kip8)
    ).toBe(false);
    expect(
      stoveOptionMatchesHeater("HomeCraft Revive", { price: 1650 }, revive9)
    ).toBe(false);
    expect(
      stoveOptionMatchesHeater(
        "Penguin Cold Therapy Chiller w/ Filter Kit",
        { price: 3100 },
        drop9
      )
    ).toBe(false);
  });
});

describe("applyHeaterToStoveType", () => {
  it("stores heaterId and updates an exact copied price", () => {
    const result = applyHeaterToStoveType(
      { "Harvia Kip 8kW": { price: 1550, image: "harvia.jpg" } },
      { ...kip8, basePrice: 1600 },
      kip8
    );

    expect(result.changed).toBe(true);
    expect(result.matchedKeys).toEqual(["Harvia Kip 8kW"]);
    expect(result.stoveType["Harvia Kip 8kW"]).toMatchObject({
      heaterId: "heater-kip-8",
      priceOffset: 0,
      price: 1600,
      image: "harvia.jpg",
    });
  });

  it("keeps bundle extras by applying the heater price delta", () => {
    const result = applyHeaterToStoveType(
      {
        "Huum Drop 9kW with Remote": { price: 3457 },
        "Designer B Electric Heater (6kw)": { price: 1800 },
      },
      { ...drop9, basePrice: 2550 },
      drop9
    );

    expect(result.stoveType["Huum Drop 9kW with Remote"]).toMatchObject({
      heaterId: "heater-drop-9",
      priceOffset: 1007,
      price: 3557,
    });
    expect(result.stoveType["Designer B Electric Heater (6kw)"]).toEqual({
      price: 1800,
    });
  });

  it("renames an exact heater name key and ignores options linked to another heater", () => {
    const result = applyHeaterToStoveType(
      {
        "Harvia KIP 8 kW Electric Sauna Heater": { price: 1550 },
        "Huum Drop 9kW with Remote": {
          price: 3457,
          heaterId: "some-other-heater",
        },
      },
      { ...kip8, name: "Harvia KIP 8kW" },
      kip8
    );

    expect(result.stoveType["Harvia KIP 8kW"]).toMatchObject({
      heaterId: "heater-kip-8",
      price: 1550,
    });
    expect(result.stoveType["Harvia KIP 8 kW Electric Sauna Heater"]).toBeUndefined();
    expect(result.stoveType["Huum Drop 9kW with Remote"].heaterId).toBe(
      "some-other-heater"
    );
  });
});
