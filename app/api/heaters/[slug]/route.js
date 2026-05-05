import connectDB from "@/config/db";
import Heaters from "@/models/Heaters";
import { NextResponse } from "next/server";
import { isLikelyMongoObjectId, slugify } from "@/assets/utils/slugify";

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function safeDecodeSegment(segment) {
  const s = String(segment ?? "");
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

// GET /api/heaters/:slug — accepts Mongo id, stored slug, or human name (slugified / matched)
export const GET = async (request, { params }) => {
  const { slug: segment } = await params;

  try {
    await connectDB();

    const raw = safeDecodeSegment(segment).trim();
    let heater = null;

    if (isLikelyMongoObjectId(raw)) {
      heater = await Heaters.findById(raw);
    } else if (raw) {
      const lower = raw.toLowerCase();
      const fromSlugify = slugify(raw);

      heater = await Heaters.findOne({ slug: lower });

      if (!heater && fromSlugify) {
        heater = await Heaters.findOne({ slug: fromSlugify });
      }

      if (!heater) {
        heater = await Heaters.findOne({
          name: new RegExp(`^${escapeRegex(raw)}$`, "i"),
        });
      }
    }

    if (!heater) {
      return NextResponse.json({ error: "Heater not found" }, { status: 404 });
    }

    return NextResponse.json(heater);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch heater" },
      { status: 500 },
    );
  }
};
