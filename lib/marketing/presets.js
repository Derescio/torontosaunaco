import connectDB from "@/config/db";
import MarketingPlatformPreset from "@/models/MarketingPlatformPreset";
import { PLATFORM_DEFAULTS } from "@/lib/marketing/attribution";

export async function ensureMarketingPlatformPresets() {
  await connectDB();

  for (const defaults of Object.values(PLATFORM_DEFAULTS)) {
    await MarketingPlatformPreset.findOneAndUpdate(
      { platform: defaults.platform },
      {
        $setOnInsert: {
          platform: defaults.platform,
          label: defaults.label,
          utm_source: defaults.utm_source,
          utm_medium: defaults.utm_medium,
          utm_campaign: defaults.utm_campaign,
          utm_term: "",
          utm_content: "",
          clickIdKey: defaults.clickIdKey,
          clickIdValue: defaults.clickIdValue,
          isActive: true,
        },
      },
      { upsert: true, new: true }
    );
  }

  return MarketingPlatformPreset.find().sort({ platform: 1 }).lean();
}
