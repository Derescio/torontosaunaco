import {
  buildContactProperties,
  buildSubmissionSummary,
  splitName,
} from "./buildContactProperties.js";

describe("splitName", () => {
  it("splits full names on the first space", () => {
    expect(splitName("Jane Doe")).toEqual({
      firstname: "Jane",
      lastname: "Doe",
    });
  });

  it("uses the full string as firstname when no space exists", () => {
    expect(splitName("Prince")).toEqual({
      firstname: "Prince",
      lastname: "",
    });
  });
});

describe("buildSubmissionSummary", () => {
  it("includes form metadata and attribution", () => {
    const summary = buildSubmissionSummary({
      formType: "quote",
      formId: "home-contact-form",
      sourcePath: "/",
      submissionId: "sub_123",
      subject: "Sauna quote",
      message: "Interested in a barrel sauna",
      attribution: {
        utm_source: "google",
        gclid: "abc123",
      },
    });

    expect(summary).toContain("Form type: quote");
    expect(summary).toContain("Submission ID: sub_123");
    expect(summary).toContain("UTM Source: google");
    expect(summary).toContain("Google Click ID: abc123");
  });
});

describe("buildContactProperties", () => {
  it("maps standard and custom contact fields", () => {
    const { core, all } = buildContactProperties({
      name: "Jane Doe",
      email: "jane@example.com",
      phone: "4165550100",
      postalcode: "M5V 2T6",
      formType: "quote",
      formId: "quote-contact-form",
      sourcePath: "/quote",
      submissionId: "sub_123",
      subject: "Quote request",
      message: "Need pricing",
      attribution: {
        utm_source: "google",
      },
    });

    expect(core.email).toBe("jane@example.com");
    expect(core.firstname).toBe("Jane");
    expect(core.lastname).toBe("Doe");
    expect(all.website_form_type).toBe("quote");
    expect(all.website_submission_id).toBe("sub_123");
    expect(all.utm_source).toBe("google");
  });

  it("includes custom build details in the HubSpot summary", () => {
    const summary = buildSubmissionSummary({
      formType: "custom_build",
      isCustomBuild: true,
      formId: "custom-builds-quote-form",
      sourcePath: "/custom-builds",
      projectType: "residential",
      interiorFinish: "clear",
      lengthFt: "8",
      widthFt: "6",
      heightFt: "7",
      address: "123 King St, Toronto",
      notes: "Basement corner near the gym.",
      message: "Custom sauna room quote request",
    });

    expect(summary).toContain("Form type: custom_build");
    expect(summary).toContain("Project type: Residential");
    expect(summary).toContain("Interior finish: Premium Clear Red Cedar");
    expect(summary).toContain("Length: 8 ft");
    expect(summary).toContain("Address: 123 King St, Toronto");
    expect(summary).toContain("Notes: Basement corner near the gym.");
  });
});
