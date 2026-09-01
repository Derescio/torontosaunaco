import mongoose from "mongoose";
import { MARKETING_PLATFORMS } from "@/models/MarketingPlatformPreset";

const DETECTED_PLATFORMS = [...MARKETING_PLATFORMS, "unknown"];

const quoteAttributionSubmissionSchema = new mongoose.Schema(
  {
    submissionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    formId: { type: String, default: "" },
    formType: {
      type: String,
      enum: [
        "quote",
        "general_contact",
        "consultation",
        "cart_quote",
        "custom_build",
        "other",
      ],
      default: "quote",
    },
    subject: { type: String, default: "" },
    contact: {
      name: { type: String, default: "" },
      email: { type: String, default: "" },
      phone: { type: String, default: "" },
      postalcode: { type: String, default: "" },
      message: { type: String, default: "" },
    },
    attribution: {
      utm_source: { type: String, default: "" },
      utm_medium: { type: String, default: "" },
      utm_campaign: { type: String, default: "" },
      utm_term: { type: String, default: "" },
      utm_content: { type: String, default: "" },
      gclid: { type: String, default: "" },
      fbclid: { type: String, default: "" },
      msclkid: { type: String, default: "" },
      ttclid: { type: String, default: "" },
      wbraid: { type: String, default: "" },
      gbraid: { type: String, default: "" },
      gad_source: { type: String, default: "" },
      gad_campaignid: { type: String, default: "" },
    },
    detectedPlatform: {
      type: String,
      enum: DETECTED_PLATFORMS,
      default: "unknown",
      index: true,
    },
    events: {
      submittedAt: { type: Date, default: null },
      thankYouViewedAt: { type: Date, default: null },
    },
    emailSent: {
      type: Boolean,
      default: false,
    },
    sourcePath: {
      type: String,
      default: "",
    },
    matchedPresetPlatform: {
      type: String,
      enum: MARKETING_PLATFORMS,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.QuoteAttributionSubmission ||
  mongoose.model("QuoteAttributionSubmission", quoteAttributionSubmissionSchema);
