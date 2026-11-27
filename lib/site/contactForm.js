// Contact form rules shared by the form (components/site/ContactForm.jsx) and the route (app/api/site/contact).
// Lists come from the design's data; copy that only exists inside the design script is copied verbatim from
// Contact.dc.html into CONTACT_COPY. Spec: docs/superpowers/specs/2026-11-26-contact-design.md

// The lists are written out (not imported from Contact.json) because this file ships to the browser and that JSON's
// `data` also holds the design's team recipients. contactForm.test.js checks they equal the JSON lists.
export const REASONS = ["Get a quote", "Book a showroom visit", "Ask a question"];
export const TYPES = [
  "An outdoor sauna",
  "A cold plunge",
  "An outdoor shower",
  "A custom sauna",
  "An indoor sauna room",
  "A heater or accessories",
  "Not sure yet",
];
export const TIMES = ["As soon as possible", "Within 3 months", "3 to 6 months", "Just researching"];

export const CONTACT_COPY = {
  // Verbatim from the design script (lfMsgLabel, lfBtn, errs).
  msgLabel: { quote: "Tell us about your space", visit: "Anything we should know before your visit?", question: "Your question" },
  button: { quote: "Request My Quote", visit: "Request a Visit", question: "Send Message" },
  nameError: "Please enter your name.",
  reachError: "Please enter an email or a 10-digit phone number so we can reach you.",
  // Not in the design (it has no wording for these states). Plain wording; the owner may change it.
  sending: "Sending…",
  sendFailed: "We couldn't send that. Please call (437) 429-6623 and we'll help right away.",
};

const MODES = { [REASONS[0]]: "quote", [REASONS[1]]: "visit", [REASONS[2]]: "question" };
export function modeOf(reason) {
  return MODES[reason] ?? "quote";
}

/** The design's lfDefaultReason: "visit" or "question" anywhere in the hash or query picks that mode. */
export function defaultReason(hashAndSearch = "") {
  const where = String(hashAndSearch).toLowerCase();
  if (where.includes("visit")) return REASONS[1];
  if (where.includes("question")) return REASONS[2];
  return REASONS[0];
}

const FIELDS = ["reason", "name", "phone", "email", "city", "type", "time", "when", "msg"];
const CAP = { msg: 5000 };
const EMAIL = /^\S+@\S+\.\S+$/;

export function validate(values = {}) {
  const clean = {};
  for (const key of FIELDS) {
    let v = typeof values[key] === "string" ? values[key].trim() : "";
    if (key !== "msg") v = v.replace(/[\r\n]+/g, " "); // single-line fields; keeps the subject one line
    clean[key] = v.slice(0, CAP[key] ?? 200);
  }
  const errors = {};
  if (!REASONS.includes(clean.reason)) errors.reason = "Please choose how we can help.";
  if (!clean.name) errors.name = CONTACT_COPY.nameError;
  if (!EMAIL.test(clean.email) && clean.phone.replace(/\D/g, "").length < 10) errors.reach = CONTACT_COPY.reachError;
  if (clean.type && !TYPES.includes(clean.type)) errors.type = "Please choose from the list.";
  if (clean.time && !TIMES.includes(clean.time)) errors.time = "Please choose from the list.";
  return { ok: Object.keys(errors).length === 0, errors, clean };
}

export function escapeHtml(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

/** The design's sendLead rows, in its order, empty values dropped. */
export function leadRows(clean, ref) {
  const mode = modeOf(clean.reason);
  const rows = [
    ["Request", clean.reason],
    ["Reference", ref],
    ["Name", clean.name],
    ["Phone", clean.phone],
    ["Email", clean.email],
    ["City or postal code", clean.city],
  ];
  if (mode === "quote") rows.push(["Interested in", clean.type], ["Install timeline", clean.time]);
  if (mode === "visit") rows.push(["Preferred days and times", clean.when], ["Interested in", clean.type]);
  rows.push([mode === "visit" ? "Notes" : mode === "quote" ? "About the space" : "Question", clean.msg], ["Sent from", "Contact page"]);
  return rows.filter(([, value]) => value !== "" && value != null);
}

export function leadEmail(clean, ref) {
  const rows = leadRows(clean, ref);
  const subject = `${clean.reason} from ${clean.name} (${ref})`;
  const text = rows.map(([label, value]) => `${label}: ${value}`).join("\n");
  const cells = rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:6px 12px 6px 0;color:#6B635B;vertical-align:top;white-space:nowrap">${escapeHtml(label)}</td>` +
        `<td style="padding:6px 0;white-space:pre-wrap">${escapeHtml(value)}</td></tr>`
    )
    .join("");
  const html =
    `<div style="font-family:Arial,sans-serif;font-size:14px;color:#1E1C1A">` +
    `<h2 style="font-size:18px;margin:0 0 12px">${escapeHtml(subject)}</h2>` +
    `<table style="border-collapse:collapse">${cells}</table></div>`;
  return { subject, text, html };
}

export function newRef(now = Date.now()) {
  return `TSC-${String(now).slice(-6)}`;
}
