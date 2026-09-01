export const PROJECT_TYPES = [
  { value: "residential", label: "Residential" },
  { value: "commercial", label: "Commercial" },
];

export const INTERIOR_FINISH_OPTIONS = [
  { value: "clear", label: "Premium Clear Red Cedar" },
  { value: "knotty", label: "Knotty Red Cedar" },
];

function labelFor(options, value) {
  const match = options.find((option) => option.value === value);
  return match?.label || value || "Not provided";
}

function formatDimension(value) {
  if (value === null || value === undefined || value === "") {
    return "Not provided";
  }
  return `${value} ft`;
}

export function buildCustomBuildMessage({
  projectType,
  interiorFinish,
  lengthFt,
  widthFt,
  heightFt,
  notes,
} = {}) {
  const lines = [
    "Custom sauna room quote request",
    `Project type: ${labelFor(PROJECT_TYPES, projectType)}`,
    `Interior finish: ${labelFor(INTERIOR_FINISH_OPTIONS, interiorFinish)}`,
    `Length: ${formatDimension(lengthFt)}`,
    `Width: ${formatDimension(widthFt)}`,
    `Ceiling height: ${formatDimension(heightFt)}`,
  ];

  const trimmedNotes = notes?.trim();
  if (trimmedNotes) {
    lines.push("", "Notes:", trimmedNotes);
  }

  return lines.join("\n");
}

export function getProjectTypeLabel(value) {
  return labelFor(PROJECT_TYPES, value);
}

export function getInteriorFinishLabel(value) {
  return labelFor(INTERIOR_FINISH_OPTIONS, value);
}

export function isCustomBuildProjectType(value) {
  return PROJECT_TYPES.some((option) => option.value === value);
}

export function buildCustomBuildEmailHtml({
  name,
  email,
  phone,
  address,
  projectType,
  interiorFinish,
  lengthFt,
  widthFt,
  heightFt,
  notes,
} = {}) {
  const projectLabel = getProjectTypeLabel(projectType);
  const finishLabel = getInteriorFinishLabel(interiorFinish);
  const trimmedNotes = notes?.trim();

  return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 2px solid #f0f0f0; padding-bottom: 10px;">New Custom Sauna Room Quote</h2>
          
          <div style="background-color: #f9f9f9; padding: 15px; margin: 15px 0; border-radius: 5px;">
            <h3 style="color: #444; margin-top: 0;">Contact Information</h3>
            <p><strong>Name:</strong> ${name || "Not provided"}</p>
            <p><strong>Email:</strong> ${email || "Not provided"}</p>
            ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ""}
            ${address ? `<p><strong>Address:</strong> ${address}</p>` : ""}
          </div>

          <div style="background-color: #f9f9f9; padding: 15px; margin: 15px 0; border-radius: 5px;">
            <h3 style="color: #444; margin-top: 0;">Project Details</h3>
            <p><strong>Project Type:</strong> ${projectLabel}</p>
            <p><strong>Interior Finish:</strong> ${finishLabel}</p>
            <p><strong>Length:</strong> ${formatDimension(lengthFt)}</p>
            <p><strong>Width:</strong> ${formatDimension(widthFt)}</p>
            <p><strong>Ceiling Height:</strong> ${formatDimension(heightFt)}</p>
          </div>

          <div style="background-color: #f9f9f9; padding: 15px; margin: 15px 0; border-radius: 5px;">
            <h3 style="color: #444; margin-top: 0;">Additional Notes</h3>
            <p style="white-space: pre-wrap;">${trimmedNotes || "None"}</p>
          </div>
        </div>
      `;
}
