import {
  getInteriorFinishLabel,
  getProjectTypeLabel,
} from "../customBuilds/quoteDetails.js";

export function splitName(fullName) {
  const trimmed = (fullName || "").trim();
  if (!trimmed) {
    return { firstname: "", lastname: "" };
  }

  const spaceIndex = trimmed.indexOf(" ");
  if (spaceIndex === -1) {
    return { firstname: trimmed, lastname: "" };
  }

  return {
    firstname: trimmed.slice(0, spaceIndex),
    lastname: trimmed.slice(spaceIndex + 1).trim(),
  };
}

function resolveFormType(data) {
  if (data.formType) return data.formType;
  if (data.isCartQuote) return "cart_quote";
  if (data.isConsultation) return "consultation";
  if (data.isCustomBuild) return "custom_build";
  return "general_contact";
}

function appendAttributionLines(lines, attribution = {}) {
  const entries = [
    ["UTM Source", attribution.utm_source],
    ["UTM Medium", attribution.utm_medium],
    ["UTM Campaign", attribution.utm_campaign],
    ["UTM Term", attribution.utm_term],
    ["UTM Content", attribution.utm_content],
    ["Google Click ID", attribution.gclid],
    ["Facebook Click ID", attribution.fbclid],
    ["Microsoft Click ID", attribution.msclkid],
    ["TikTok Click ID", attribution.ttclid],
  ];

  for (const [label, value] of entries) {
    if (value) {
      lines.push(`${label}: ${value}`);
    }
  }
}

function appendCartLines(lines, data) {
  if (!data.isCartQuote || !Array.isArray(data.cartItems)) {
    return;
  }

  lines.push("", "Cart items:");
  for (const item of data.cartItems) {
    const lineTotal = Number(item.price || 0) * Number(item.qty || 1);
    lines.push(
      `- ${item.name} x${item.qty} — $${lineTotal.toLocaleString("en-CA")}`
    );
  }

  if (data.cartSummary) {
    lines.push(
      "",
      `Quote total: $${Number(data.cartSummary.total || 0).toLocaleString("en-CA")}`
    );
  }
}

export function buildSubmissionSummary(data) {
  const lines = [
    `Form type: ${resolveFormType(data)}`,
    data.formId ? `Form ID: ${data.formId}` : null,
    data.sourcePath ? `Source page: ${data.sourcePath}` : null,
    data.submissionId ? `Submission ID: ${data.submissionId}` : null,
    data.subject ? `Subject: ${data.subject}` : null,
    data.message ? `Message:\n${data.message}` : null,
  ].filter(Boolean);

  if (data.isConsultation) {
    const consultationLines = [
      "",
      "Consultation details:",
      data.preferredDate ? `Preferred date: ${data.preferredDate}` : null,
      data.preferredTime ? `Preferred time: ${data.preferredTime}` : null,
      data.saunaType ? `Sauna type: ${data.saunaType}` : null,
      data.budgetRange ? `Budget: ${data.budgetRange}` : null,
      data.contactMethod ? `Contact method: ${data.contactMethod}` : null,
    ].filter(Boolean);
    lines.push(...consultationLines);
  }

  if (data.isCustomBuild || data.formType === "custom_build") {
    const customBuildLines = [
      "",
      "Custom build details:",
      data.projectType
        ? `Project type: ${getProjectTypeLabel(data.projectType)}`
        : null,
      data.interiorFinish
        ? `Interior finish: ${getInteriorFinishLabel(data.interiorFinish)}`
        : null,
      data.lengthFt ? `Length: ${data.lengthFt} ft` : null,
      data.widthFt ? `Width: ${data.widthFt} ft` : null,
      data.heightFt ? `Ceiling height: ${data.heightFt} ft` : null,
      data.address ? `Address: ${data.address}` : null,
      data.notes?.trim() ? `Notes: ${data.notes.trim()}` : null,
    ].filter(Boolean);
    lines.push(...customBuildLines);
  }

  appendAttributionLines(lines, data.attribution);
  appendCartLines(lines, data);

  return lines.join("\n");
}

export function buildContactProperties(data) {
  const { firstname, lastname } = splitName(data.name);
  const formType = resolveFormType(data);
  const summary = buildSubmissionSummary(data);

  const core = {
    email: data.email?.trim(),
    firstname,
    lastname,
  };

  if (data.phone) core.phone = data.phone;
  if (data.postalcode) core.zip = data.postalcode;
  if (data.address) core.address = data.address;
  if (data.city) core.city = data.city;
  if (data.province) core.state = data.province;

  const lifecycleStage = process.env.HUBSPOT_LIFECYCLE_STAGE;
  if (lifecycleStage) {
    core.lifecyclestage = lifecycleStage;
  }

  const custom = {
    website_last_submission: summary,
    website_form_type: formType,
  };

  if (data.formId) custom.website_form_id = data.formId;
  if (data.sourcePath) custom.website_source_path = data.sourcePath;
  if (data.submissionId) custom.website_submission_id = data.submissionId;
  if (data.subject) custom.website_last_subject = data.subject;
  if (data.message) custom.website_last_message = data.message;

  const attribution = data.attribution || {};
  if (attribution.utm_source) custom.utm_source = attribution.utm_source;
  if (attribution.utm_medium) custom.utm_medium = attribution.utm_medium;
  if (attribution.utm_campaign) custom.utm_campaign = attribution.utm_campaign;
  if (attribution.gclid) custom.gclid = attribution.gclid;
  if (attribution.fbclid) custom.fbclid = attribution.fbclid;
  if (attribution.msclkid) custom.msclkid = attribution.msclkid;

  if (data.isCartQuote && data.cartSummary?.total != null) {
    custom.website_quote_total = String(data.cartSummary.total);
  }

  return {
    core,
    custom,
    all: { ...core, ...custom },
    summary,
  };
}
