import connectDB from "@/config/db";
import QuoteAttributionSubmission from "@/models/QuoteAttributionSubmission";
import {
  detectPlatform,
  matchPresetPlatform,
  normalizeAttribution,
} from "@/lib/marketing/attribution";
import { ensureMarketingPlatformPresets } from "@/lib/marketing/presets";

export async function createQuoteAttributionSubmission({
  submissionId,
  formId = "",
  formType = "quote",
  subject = "",
  contact = {},
  attribution = {},
  sourcePath = "",
  emailSent = true,
}) {
  if (!submissionId) return null;

  await connectDB();
  const presets = await ensureMarketingPlatformPresets();
  const normalizedAttribution = normalizeAttribution(attribution);
  const detectedPlatform = detectPlatform(normalizedAttribution);
  const matchedPresetPlatform = matchPresetPlatform(
    normalizedAttribution,
    presets
  );

  const submission = await QuoteAttributionSubmission.findOneAndUpdate(
    { submissionId },
    {
      $set: {
        submissionId,
        formId,
        formType,
        subject,
        contact: {
          name: contact.name || "",
          email: contact.email || "",
          phone: contact.phone || "",
          postalcode: contact.postalcode || "",
          message: contact.message || "",
        },
        attribution: normalizedAttribution,
        detectedPlatform,
        matchedPresetPlatform: matchedPresetPlatform || null,
        sourcePath,
        emailSent,
        "events.submittedAt": new Date(),
      },
    },
    { upsert: true, new: true }
  ).lean();

  return submission;
}
