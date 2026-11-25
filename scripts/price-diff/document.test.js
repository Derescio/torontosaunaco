/** @jest-environment node */
import { unzipSync, strFromU8 } from "fflate";
import { renderDocument, money } from "./document.mjs";

const report = {
  generatedAt: "2026-11-24T12:00:00.000Z",
  websiteAsOf: "2026-10-21T05:42:31.952Z",
  totals: { same: 2, differs: 1, "on-request": 1, "design-only": 1, "website-only": 1 },
  sections: [
    {
      category: "Outdoor saunas",
      products: [
        {
          name: "The Pure Cube 552",
          file: "SaunaPureCube552.dc.html",
          matchedTo: ["The Pure Cube 552"],
          sameCount: 2,
          rows: [
            { id: "SaunaPureCube552:panels:mirror", group: "Front panels", label: "Mirrored Glass", websiteLabel: "Mirrored Front Glass", website: 11884, design: 111.6, outcome: "differs" },
            { id: "SaunaPureCube552:wood:clear", group: "Wood", label: "Clear cedar", websiteLabel: "Clear Cedar (Upgrade)", website: 4500, design: null, outcome: "on-request" },
            { id: "SaunaPureCube552:panels:semi", group: "Front panels", label: "Semi-privacy", websiteLabel: null, website: null, design: 600, outcome: "design-only" },
            { id: "db:p1:stove_type.Narvi 16", group: null, label: "Narvi 16", websiteLabel: "Narvi 16", website: 4200, design: null, outcome: "website-only" },
          ],
        },
      ],
    },
  ],
  designOnly: [{ name: "The Avalon Sauna", file: "SaunaAvalon.dc.html", basePrice: 15890 }],
  websiteOnly: [{ name: "The Cascade Tub 3'x7'", collection: "products", basePrice: 7674 }],
};

test("money formats whole dollars and cents", () => {
  expect(money(11884)).toBe("$11,884");
  expect(money(111.6)).toBe("$111.60");
  expect(money(null)).toBeNull();
});

test("renders a Word document with the product table, decisions and appendix", async () => {
  const buf = await renderDocument(report);
  expect(buf.subarray(0, 2).toString()).toBe("PK");
  const xml = strFromU8(unzipSync(new Uint8Array(buf))["word/document.xml"]);
  for (const text of [
    "Price check: new design vs website",
    "The Pure Cube 552",
    "Matched to: The Pure Cube 552",
    "2 prices already match",
    "$11,884",
    "$111.60",
    "On request",
    "Not offered",
    "Website: Mirrored Front Glass",
    "SaunaPureCube552:panels:mirror",
    "☐ Keep website",
    "Prices that already match are not listed.",
    "New in the design (not on the website)",
    "The Avalon Sauna",
    "On the website but not in the new design",
    "The Cascade Tub 3&apos;x7&apos;",
  ]) {
    expect(xml).toContain(text);
  }
});
