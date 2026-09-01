import {
  buildCustomBuildEmailHtml,
  buildCustomBuildMessage,
  getInteriorFinishLabel,
  getProjectTypeLabel,
  isCustomBuildProjectType,
} from "./quoteDetails.js";

describe("buildCustomBuildMessage", () => {
  it("formats a complete custom build request", () => {
    const message = buildCustomBuildMessage({
      projectType: "residential",
      interiorFinish: "clear",
      lengthFt: "8",
      widthFt: "6",
      heightFt: "7",
      notes: "Basement corner near the gym.",
    });

    expect(message).toContain("Custom sauna room quote request");
    expect(message).toContain("Project type: Residential");
    expect(message).toContain("Interior finish: Premium Clear Red Cedar");
    expect(message).toContain("Length: 8 ft");
    expect(message).toContain("Width: 6 ft");
    expect(message).toContain("Ceiling height: 7 ft");
    expect(message).toContain("Basement corner near the gym.");
  });

  it("uses placeholders when dimensions are missing", () => {
    const message = buildCustomBuildMessage({
      projectType: "commercial",
      interiorFinish: "knotty",
    });

    expect(message).toContain("Project type: Commercial");
    expect(message).toContain("Length: Not provided");
    expect(message).toContain("Width: Not provided");
    expect(message).not.toContain("Notes:");
  });
});

describe("buildCustomBuildEmailHtml", () => {
  it("includes contact details and the new quote parameters", () => {
    const html = buildCustomBuildEmailHtml({
      name: "Jane Doe",
      email: "jane@example.com",
      phone: "4165550100",
      address: "12 King St, Toronto, ON",
      projectType: "residential",
      interiorFinish: "clear",
      lengthFt: "8",
      widthFt: "6",
      heightFt: "7",
      notes: "Basement corner near the gym.",
    });

    expect(html).toContain("New Custom Sauna Room Quote");
    expect(html).toContain("Jane Doe");
    expect(html).toContain("12 King St, Toronto, ON");
    expect(html).toContain("Residential");
    expect(html).toContain("Premium Clear Red Cedar");
    expect(html).toContain("8 ft");
    expect(html).toContain("6 ft");
    expect(html).toContain("7 ft");
    expect(html).toContain("Basement corner near the gym.");
  });
});

describe("custom build option helpers", () => {
  it("maps known values to labels", () => {
    expect(getProjectTypeLabel("commercial")).toBe("Commercial");
    expect(getInteriorFinishLabel("knotty")).toBe("Knotty Red Cedar");
  });

  it("accepts only known project types", () => {
    expect(isCustomBuildProjectType("residential")).toBe(true);
    expect(isCustomBuildProjectType("commercial")).toBe(true);
    expect(isCustomBuildProjectType("kit")).toBe(false);
  });
});
