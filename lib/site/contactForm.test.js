import Contact from "../../content/redesign/Contact.json";
import {
  REASONS,
  TYPES,
  TIMES,
  CONTACT_COPY,
  modeOf,
  defaultReason,
  validate,
  escapeHtml,
  leadRows,
  leadEmail,
  newRef,
} from "./contactForm";

const base = { reason: "Get a quote", name: "Ann Lee", email: "ann@example.com" };

describe("contact form lists and modes", () => {
  it("uses the design's lists", () => {
    expect(REASONS).toEqual(Contact.data.lfReasons);
    expect(TYPES).toEqual(Contact.data.lfTypes);
    expect(TIMES).toEqual(Contact.data.lfTimes);
  });

  it("doesn't pull the design JSON (and its team addresses) into the browser bundle", () => {
    const source = require("fs").readFileSync(require("path").join(__dirname, "contactForm.js"), "utf8");
    expect(source).not.toMatch(/import .*Contact\.json/);
    expect(source).not.toContain("tjallen");
  });

  it("maps each reason to a mode", () => {
    expect(REASONS.map(modeOf)).toEqual(["quote", "visit", "question"]);
  });

  it.each([
    ["#visit", "Book a showroom visit"],
    ["?visit=1", "Book a showroom visit"],
    ["#Question", "Ask a question"],
    ["", "Get a quote"],
    ["?msg=I%20want%20to%20visit", "Get a quote"],
    ["?msg=a%20question", "Get a quote"],
    ["#visit?msg=hi", "Book a showroom visit"],
    ["?visit=1&msg=hi", "Book a showroom visit"],
  ])("preselects from %j", (where, reason) => {
    expect(defaultReason(where)).toBe(reason);
  });
});

describe("validate", () => {
  it("needs a name", () => {
    expect(validate({ ...base, name: "  " }).errors.name).toBe(CONTACT_COPY.nameError);
  });

  it("needs an email or a 10-digit phone", () => {
    expect(validate({ ...base, email: "", phone: "416-555-12" }).errors.reach).toBe(CONTACT_COPY.reachError);
    expect(validate({ ...base, email: "", phone: "(416) 555-1234" }).ok).toBe(true);
    expect(validate({ ...base, email: "a@b.co" }).ok).toBe(true);
    expect(validate({ ...base, email: "not-an-email" }).errors.reach).toBe(CONTACT_COPY.reachError);
  });

  it("only accepts the design's reasons, types and times", () => {
    expect(validate({ ...base, reason: "Buy a yacht" }).errors.reason).toBeDefined();
    expect(validate({ ...base, type: "A yacht" }).errors.type).toBeDefined();
    expect(validate({ ...base, time: "Next decade" }).errors.time).toBeDefined();
    expect(validate({ ...base, type: TYPES[1], time: TIMES[2] }).ok).toBe(true);
  });

  it("trims, caps and drops unknown keys", () => {
    const { clean } = validate({ ...base, name: `  ${"x".repeat(300)}  `, msg: "m".repeat(6000), admin: true });
    expect(clean.name).toHaveLength(200);
    expect(clean.msg).toHaveLength(5000);
    expect(clean).not.toHaveProperty("admin");
  });
});

describe("lead email", () => {
  it("escapes HTML", () => {
    expect(escapeHtml(`<a href="x">'&'</a>`)).toBe("&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;");
  });

  it("builds the design's rows for each mode", () => {
    const visit = validate({ ...base, reason: "Book a showroom visit", when: "Sat am", type: TYPES[0], msg: "Hi" }).clean;
    const labels = leadRows(visit, "TSC-000001").map(([label]) => label);
    expect(labels).toEqual(["Request", "Reference", "Name", "Email", "Preferred days and times", "Interested in", "Notes", "Sent from"]);
    const quote = validate({ ...base, type: TYPES[0], time: TIMES[0], msg: "Big yard" }).clean;
    expect(leadRows(quote, "TSC-000001").map(([l]) => l)).toContain("Install timeline");
    expect(leadRows(quote, "TSC-000001").at(-1)).toEqual(["Sent from", "Contact page"]);
  });

  it("makes a subject like the design and escapes the HTML body", () => {
    const { clean } = validate({ ...base, name: "<b>x</b>" });
    const mail = leadEmail(clean, "TSC-123456");
    expect(mail.subject).toBe("Get a quote from <b>x</b> (TSC-123456)");
    expect(mail.html).toContain("&lt;b&gt;x&lt;/b&gt;");
    expect(mail.html).not.toContain("<b>x</b>");
    expect(mail.text).toContain("Name: <b>x</b>");
  });

  it("makes a TSC reference from the clock", () => {
    expect(newRef(1795740735123)).toBe("TSC-735123");
  });
});
