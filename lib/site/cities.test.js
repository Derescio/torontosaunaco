/** @jest-environment node */
import fs from "fs";
import path from "path";
import ServiceAreas from "../../content/redesign/ServiceAreas.json";
import { CITIES, getCity } from "./cities";

const DIR = path.join(process.cwd(), "content", "redesign");
const cityFiles = fs.readdirSync(DIR).filter((f) => /^City.*\.json$/.test(f));

describe("CITIES", () => {
  it("has one entry per City*.json file", () => {
    expect(cityFiles).toHaveLength(17);
    expect(CITIES).toHaveLength(cityFiles.length);
    const routes = CITIES.map((c) => c.route);
    for (const f of cityFiles) {
      const { route } = JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8"));
      expect(routes).toContain(route);
    }
  });

  it("derives the slug from the route", () => {
    for (const city of CITIES) expect(city.route).toBe(`/service-areas/${city.slug}`);
    expect(getCity("aurora").page.file).toBe("CityAurora.dc.html");
    expect(getCity("niagara-on-the-lake")).toBeDefined();
  });

  it("follows the hub's card order", () => {
    const hrefs = ServiceAreas.sections[1].blocks.filter((b) => b.type === "card").map((b) => b.href);
    expect(CITIES.map((c) => c.route)).toEqual(hrefs);
  });

  it("returns undefined for unknown slugs", () => {
    expect(getCity("ottawa")).toBeUndefined();
    expect(getCity("Toronto")).toBeUndefined();
    expect(getCity(undefined)).toBeUndefined();
    expect(getCity("constructor")).toBeUndefined();
  });
});
