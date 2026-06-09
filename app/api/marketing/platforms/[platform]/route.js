import connectDB from "@/config/db";
import MarketingPlatformPreset from "@/models/MarketingPlatformPreset";
import User from "@/models/Users";
import { buildQuoteTestUrl, isValidPlatform } from "@/lib/marketing/attribution";
import { jsonResponse, requireMarketingAccess } from "@/lib/marketing/auth";

export const dynamic = "force-dynamic";

const CLICK_ID_KEYS = ["gclid", "fbclid", "msclkid", "ttclid", "wbraid", "gbraid"];

export async function PUT(request, { params }) {
  try {
    const access = await requireMarketingAccess();
    if (access.error) return access.error;

    const platform = params.platform?.toLowerCase();
    if (!isValidPlatform(platform)) {
      return jsonResponse({ error: "Invalid platform" }, 400);
    }

    const payload = await request.json();
    const update = {
      utm_source: String(payload.utm_source || "").trim(),
      utm_medium: String(payload.utm_medium || "").trim(),
      utm_campaign: String(payload.utm_campaign || "").trim(),
      utm_term: String(payload.utm_term || "").trim(),
      utm_content: String(payload.utm_content || "").trim(),
      clickIdKey: CLICK_ID_KEYS.includes(payload.clickIdKey)
        ? payload.clickIdKey
        : "",
      clickIdValue: String(payload.clickIdValue || "").trim(),
      isActive: payload.isActive !== false,
    };

    await connectDB();

    let updatedBy = null;
    if (access.user?.email) {
      const dbUser = await User.findOne({ email: access.user.email }).select("_id").lean();
      updatedBy = dbUser?._id || null;
    }

    const preset = await MarketingPlatformPreset.findOneAndUpdate(
      { platform },
      {
        $set: {
          ...update,
          updatedBy,
        },
      },
      { new: true }
    ).lean();

    if (!preset) {
      return jsonResponse({ error: "Platform preset not found" }, 404);
    }

    return jsonResponse({
      preset,
      testUrl: buildQuoteTestUrl(preset),
      message: "Platform preset saved",
    });
  } catch (error) {
    console.error("Marketing platform update error:", error);
    return jsonResponse({ error: "Failed to update platform preset" }, 500);
  }
}
