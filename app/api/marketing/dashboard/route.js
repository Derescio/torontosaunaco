import connectDB from "@/config/db";
import QuoteAttributionSubmission from "@/models/QuoteAttributionSubmission";
import { isPlatformCapturedToday } from "@/lib/marketing/attribution";
import { jsonResponse, requireMarketingAccess } from "@/lib/marketing/auth";
import { ensureMarketingPlatformPresets } from "@/lib/marketing/presets";
import { buildQuoteTestUrl } from "@/lib/marketing/attribution";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const access = await requireMarketingAccess();
    if (access.error) return access.error;

    await connectDB();
    const presets = await ensureMarketingPlatformPresets();

    const submissions = await QuoteAttributionSubmission.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const lastSubmission = submissions[0] || null;
    const lastActivityAt =
      lastSubmission?.events?.thankYouViewedAt ||
      lastSubmission?.events?.submittedAt ||
      lastSubmission?.createdAt ||
      null;

    const platformStatus = presets.map((preset) => ({
      platform: preset.platform,
      label: preset.label,
      capturedToday: isPlatformCapturedToday(preset.platform, submissions),
      hasPresetValues: Boolean(
        preset.utm_source ||
          preset.utm_medium ||
          preset.utm_campaign ||
          preset.clickIdValue
      ),
      testUrl: buildQuoteTestUrl(preset),
    }));

    const trackingSteps = {
      quoteForm: true,
      formSubmitted: Boolean(lastSubmission?.events?.submittedAt),
      thankYouPage: Boolean(lastSubmission?.events?.thankYouViewedAt),
      gtmTriggerFired: Boolean(
        lastSubmission?.events?.submittedAt || lastSubmission?.events?.thankYouViewedAt
      ),
      conversionSent: Boolean(
        lastSubmission?.events?.submittedAt &&
          lastSubmission?.events?.thankYouViewedAt
      ),
    };

    return jsonResponse({
      presets,
      submissions,
      lastSubmission,
      lastActivityAt,
      platformStatus,
      trackingSteps,
    });
  } catch (error) {
    console.error("Marketing dashboard error:", error);
    return jsonResponse({ error: "Failed to load marketing dashboard" }, 500);
  }
}
