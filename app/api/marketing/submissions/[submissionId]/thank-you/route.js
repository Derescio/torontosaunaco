import connectDB from "@/config/db";
import QuoteAttributionSubmission from "@/models/QuoteAttributionSubmission";
import { jsonResponse } from "@/lib/marketing/auth";

export const dynamic = "force-dynamic";

export async function POST(_request, { params }) {
  try {
    const submissionId = params.submissionId?.trim();
    if (!submissionId) {
      return jsonResponse({ error: "submissionId is required" }, 400);
    }

    await connectDB();

    const submission = await QuoteAttributionSubmission.findOneAndUpdate(
      { submissionId },
      {
        $set: {
          "events.thankYouViewedAt": new Date(),
        },
      },
      { new: true }
    ).lean();

    if (!submission) {
      return jsonResponse({ error: "Submission not found" }, 404);
    }

    return jsonResponse({
      message: "Thank-you event recorded",
      submission,
    });
  } catch (error) {
    console.error("Thank-you event error:", error);
    return jsonResponse({ error: "Failed to record thank-you event" }, 500);
  }
}
