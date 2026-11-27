import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { applyEmailSafety, isProduction } from "@/lib/env/safety";
import { syncSubmissionToHubSpot } from "@/lib/hubspot/syncSubmission";
import { createQuoteAttributionSubmission } from "@/lib/marketing/submissions";
import { validate, leadEmail, newRef } from "@/lib/site/contactForm";

// Contact form for the new site (/contact). Spec: docs/superpowers/specs/2026-11-26-contact-design.md
// Team mail only in production: applyEmailSafety() sends everything else to STAGING_EMAIL_TO (or nothing).

export const TEAM_RECIPIENTS = ["sales@thetorontosaunaco.com", "tjallen@thetorontosaunaco.com"];
const REF = /^TSC-\d{6}$/;
// Reply-To only ever holds one plain address (no lists, names or brackets), so replying can't fan out to others.
const SINGLE_ADDRESS = /^[^\s@,;<>"']+@[^\s@,;<>"']+\.[^\s@,;<>"']+$/;

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ errors: { form: "invalid" } }, { status: 400 });
  }
  if (!body || typeof body !== "object") return NextResponse.json({ errors: { form: "invalid" } }, { status: 400 });

  // Honeypot: people never see this field, so treat a filled one as done without sending.
  if (typeof body.hp === "string" && body.hp.trim()) {
    console.warn("site contact: honeypot filled; not sent");
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const { ok, errors, clean } = validate(body);
  if (!ok) return NextResponse.json({ errors }, { status: 400 });

  const ref = typeof body.ref === "string" && REF.test(body.ref) ? body.ref : newRef();
  const { subject, text, html } = leadEmail(clean, ref);

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PWD },
    });
    const mail = {
      from: process.env.MAIL_USER,
      to: TEAM_RECIPIENTS,
      replyTo: SINGLE_ADDRESS.test(clean.email) ? clean.email : undefined,
      subject,
      text,
      html,
    };
    await transporter.sendMail(applyEmailSafety(mail));
  } catch (error) {
    console.error("site contact: send failed:", error?.message ?? error);
    return NextResponse.json({ error: "send_failed" }, { status: 500 });
  }

  const contact = { name: clean.name, email: clean.email, phone: clean.phone, postalcode: clean.city, message: clean.msg };

  // Staging and preview leads must not create contacts in the live HubSpot.
  if (isProduction()) {
    try {
      await syncSubmissionToHubSpot({ ...contact, subject, formType: "site_contact" });
    } catch (error) {
      console.error("site contact: HubSpot sync failed after send:", error?.message ?? error);
    }
  }

  try {
    await createQuoteAttributionSubmission({
      submissionId: typeof body.submissionId === "string" && body.submissionId ? body.submissionId : ref,
      formId: "site_contact",
      formType: "site_contact",
      subject,
      contact,
      attribution: body.attribution && typeof body.attribution === "object" ? body.attribution : {},
      sourcePath: typeof body.sourcePath === "string" ? body.sourcePath.slice(0, 200) : "/contact",
      emailSent: true,
    });
  } catch (error) {
    console.error("site contact: attribution save failed after send:", error?.message ?? error);
  }

  return NextResponse.json({ ok: true, ref }, { status: 200 });
}
