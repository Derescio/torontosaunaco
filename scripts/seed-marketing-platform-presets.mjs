import fs from "fs";
import path from "path";
import mongoose from "mongoose";

function loadEnvFile() {
  const envPath = path.resolve(".env");
  if (!fs.existsSync(envPath)) return;

  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!match) continue;

    const key = match[1];
    let value = match[2] ?? "";
    if (
      (value.startsWith("\"") && value.endsWith("\"")) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadEnvFile();

const mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
  console.error("MONGO_URI not found in .env");
  process.exit(1);
}

const PLATFORM_DEFAULTS = [
  {
    platform: "google",
    label: "Google Ads",
    utm_source: "google",
    utm_medium: "cpc",
    clickIdKey: "gclid",
  },
  {
    platform: "facebook",
    label: "Facebook Ads",
    utm_source: "facebook",
    utm_medium: "cpc",
    clickIdKey: "fbclid",
  },
  {
    platform: "instagram",
    label: "Instagram Ads",
    utm_source: "instagram",
    utm_medium: "cpc",
    clickIdKey: "fbclid",
  },
  {
    platform: "microsoft",
    label: "Microsoft Ads",
    utm_source: "microsoft",
    utm_medium: "cpc",
    clickIdKey: "msclkid",
  },
];

const schema = new mongoose.Schema(
  {
    platform: { type: String, required: true, unique: true },
    label: { type: String, required: true },
    utm_source: String,
    utm_medium: String,
    utm_campaign: String,
    utm_term: String,
    utm_content: String,
    clickIdKey: String,
    clickIdValue: String,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const MarketingPlatformPreset =
  mongoose.models.MarketingPlatformPreset ||
  mongoose.model("MarketingPlatformPreset", schema);

await mongoose.connect(mongoUri);

for (const defaults of PLATFORM_DEFAULTS) {
  await MarketingPlatformPreset.findOneAndUpdate(
    { platform: defaults.platform },
    {
      $setOnInsert: {
        ...defaults,
        utm_campaign: "",
        utm_term: "",
        utm_content: "",
        clickIdValue: "",
        isActive: true,
      },
    },
    { upsert: true, new: true }
  );
  console.log(`Seeded preset: ${defaults.platform}`);
}

const presets = await MarketingPlatformPreset.find().sort({ platform: 1 }).lean();
console.log(JSON.stringify(presets, null, 2));

await mongoose.disconnect();
