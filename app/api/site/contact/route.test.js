/** @jest-environment node */
import nodemailer from "nodemailer";
import { syncSubmissionToHubSpot } from "@/lib/hubspot/syncSubmission";
import { createQuoteAttributionSubmission } from "@/lib/marketing/submissions";
import { POST, TEAM_RECIPIENTS } from "./route";

jest.mock("nodemailer", () => ({ createTransport: jest.fn() }));
jest.mock("@/lib/hubspot/syncSubmission", () => ({ syncSubmissionToHubSpot: jest.fn() }));
jest.mock("@/lib/marketing/submissions", () => ({ createQuoteAttributionSubmission: jest.fn() }));

const ENV = { ...process.env };
let sendMail;

beforeEach(() => {
  sendMail = jest.fn().mockResolvedValue({ messageId: "1" });
  nodemailer.createTransport.mockReturnValue({ sendMail });
  syncSubmissionToHubSpot.mockResolvedValue(undefined);
  createQuoteAttributionSubmission.mockResolvedValue(undefined);
  process.env = { ...ENV, VERCEL_ENV: "preview", STAGING_EMAIL_TO: "dev@example.com", MAIL_USER: "site@example.com" };
});
afterAll(() => {
  process.env = ENV;
});

const quote = {
  reason: "Get a quote",
  name: "Ann Lee",
  email: "ann@example.com",
  phone: "",
  type: "An outdoor sauna",
  time: "As soon as possible",
  msg: "Big yard",
  ref: "TSC-123456",
  submissionId: "sub-1",
  attribution: { utm_source: "google" },
  sourcePath: "/contact",
};
const post = (body) =>
  POST(new Request("http://localhost/api/site/contact", { method: "POST", body: typeof body === "string" ? body : JSON.stringify(body) }));
const recipientsOf = (mail) => [mail.to, mail.cc, mail.bcc].flat().filter(Boolean).join(",");

describe("POST /api/site/contact", () => {
  it("sends to the design's two team addresses in production", async () => {
    expect(TEAM_RECIPIENTS).toEqual(["sales@thetorontosaunaco.com", "tjallen@thetorontosaunaco.com"]);
    process.env.VERCEL_ENV = "production";
    const res = await post(quote);
    expect(res.status).toBe(200);
    expect(sendMail.mock.calls[0][0].to).toEqual(TEAM_RECIPIENTS);
    expect(syncSubmissionToHubSpot).toHaveBeenCalledTimes(1);
  });

  it("before cutover (preview) sends only to STAGING_EMAIL_TO and never to the team", async () => {
    const res = await post(quote);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, ref: "TSC-123456" });
    expect(sendMail).toHaveBeenCalledTimes(1);
    const mail = sendMail.mock.calls[0][0];
    expect(mail.to).toBe("dev@example.com");
    expect(recipientsOf(mail)).not.toMatch(/thetorontosaunaco\.com/);
    expect(mail.subject).toBe("[STAGING] Get a quote from Ann Lee (TSC-123456)");
    expect(mail.replyTo).toBe("ann@example.com");
    expect(syncSubmissionToHubSpot).not.toHaveBeenCalled();
    expect(createQuoteAttributionSubmission).toHaveBeenCalledWith(
      expect.objectContaining({ formType: "site_contact", submissionId: "sub-1", sourcePath: "/contact", emailSent: true })
    );
  });

  it("treats a missing VERCEL_ENV (local) like staging", async () => {
    delete process.env.VERCEL_ENV;
    await post(quote);
    expect(sendMail.mock.calls[0][0].to).toBe("dev@example.com");
  });

  it("sends nothing outside production when STAGING_EMAIL_TO is unset", async () => {
    delete process.env.STAGING_EMAIL_TO;
    const res = await post(quote);
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: "send_failed" });
    expect(sendMail).not.toHaveBeenCalled();
  });

  it("escapes what the visitor typed", async () => {
    await post({ ...quote, msg: '<a href="https://evil.example">click</a>' });
    const { html } = sendMail.mock.calls[0][0];
    expect(html).toContain("&lt;a href=&quot;https://evil.example&quot;&gt;");
    expect(html).not.toContain('<a href="https://evil.example">');
  });

  it("treats a filled honeypot as done, sends nothing, and logs it so lost leads can be spotted", async () => {
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    const res = await post({ ...quote, hp: "spam co" });
    expect(res.status).toBe(200);
    expect(sendMail).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("honeypot"));
    warn.mockRestore();
  });

  it("only sets Reply-To to a single plain address", async () => {
    await post({ ...quote, phone: "416 555 1234", email: "a@x.com, sales@thetorontosaunaco.com" });
    expect(sendMail.mock.calls[0][0].replyTo).toBeUndefined();
    sendMail.mockClear();
    await post({ ...quote, phone: "416 555 1234", email: "Ann <ann@example.com>" });
    expect(sendMail.mock.calls[0][0].replyTo).toBeUndefined();
    sendMail.mockClear();
    await post(quote);
    expect(sendMail.mock.calls[0][0].replyTo).toBe("ann@example.com");
  });

  it("rejects invalid input with the field errors", async () => {
    const res = await post({ ...quote, name: "" });
    expect(res.status).toBe(400);
    expect((await res.json()).errors.name).toBe("Please enter your name.");
    expect(sendMail).not.toHaveBeenCalled();
  });

  it("rejects a body that isn't JSON", async () => {
    expect((await post("not json")).status).toBe(400);
  });

  it("makes its own reference when the one sent isn't valid", async () => {
    const res = await post({ ...quote, ref: "<script>" });
    expect((await res.json()).ref).toMatch(/^TSC-\d{6}$/);
  });

  it("answers 500 when the mail transport fails", async () => {
    sendMail.mockRejectedValue(new Error("smtp down"));
    expect((await post(quote)).status).toBe(500);
  });

  it("still answers 200 when HubSpot and attribution fail after sending", async () => {
    process.env.VERCEL_ENV = "production";
    syncSubmissionToHubSpot.mockRejectedValue(new Error("hubspot"));
    createQuoteAttributionSubmission.mockRejectedValue(new Error("db"));
    expect((await post(quote)).status).toBe(200);
  });
});
