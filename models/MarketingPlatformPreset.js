import mongoose from "mongoose";

export const MARKETING_PLATFORMS = [
  "google",
  "facebook",
  "instagram",
  "microsoft",
];

const marketingPlatformPresetSchema = new mongoose.Schema(
  {
    platform: {
      type: String,
      enum: MARKETING_PLATFORMS,
      required: true,
      unique: true,
      index: true,
    },
    label: {
      type: String,
      required: true,
    },
    utm_source: { type: String, default: "" },
    utm_medium: { type: String, default: "" },
    utm_campaign: { type: String, default: "" },
    utm_term: { type: String, default: "" },
    utm_content: { type: String, default: "" },
    clickIdKey: {
      type: String,
      default: "",
    },
    clickIdValue: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.MarketingPlatformPreset ||
  mongoose.model("MarketingPlatformPreset", marketingPlatformPresetSchema);
