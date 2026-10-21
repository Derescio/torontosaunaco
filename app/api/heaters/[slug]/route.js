import connectDB from "@/config/db";
import Heaters from "@/models/Heaters";
import { NextResponse } from "next/server";
import { isLikelyMongoObjectId, slugify } from "@/assets/utils/slugify";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/assets/utils/authOptions";
import { canEditCatalog } from "@/assets/utils/rbac";
import { syncHeaterToProducts } from "@/lib/catalog/syncHeaterToProducts";

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

    const series =
      typeof heater.series === "string" ? heater.series.trim() : "";
    if (!series) {
      return NextResponse.json(heater);
    }

    const variants = await Heaters.find({ series }).sort({ power: 1 }).lean();

    return NextResponse.json({
      ...heater.toObject(),
      variants,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch heater" },
      { status: 500 },
    );
  }
};

export const PATCH = async (request, { params }) => {
  const { slug: segment } = await params;

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    if (!canEditCatalog(session.user)) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    await connectDB();

    const raw = safeDecodeSegment(segment).trim();
    let filter = null;

    if (isLikelyMongoObjectId(raw)) {
      filter = { _id: raw };
    } else if (raw) {
      filter = {
        $or: [
          { slug: raw.toLowerCase() },
          { slug: slugify(raw) },
          { name: new RegExp(`^${escapeRegex(raw)}$`, "i") },
        ],
      };
    }

    if (!filter) {
      return NextResponse.json({ error: "Invalid heater identifier" }, { status: 400 });
    }

    const payload = await request.json();
    const previous = await Heaters.findOne(filter);
    if (!previous) {
      return NextResponse.json({ error: "Heater not found" }, { status: 404 });
    }

    const updated = await Heaters.findByIdAndUpdate(previous._id, payload, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return NextResponse.json({ error: "Heater not found" }, { status: 404 });
    }

    let synced = { products: 0, options: 0 };
    let syncErrorMessage = null;
    try {
      synced = await syncHeaterToProducts({ previous, updated });
    } catch (syncError) {
      console.error("Failed to sync heater changes to products:", syncError);
      syncErrorMessage = syncError.message;
    }

    const body = updated.toObject ? updated.toObject() : updated;
    return NextResponse.json(
      {
        ...body,
        syncedProductCount: synced.products,
        syncedStoveOptionCount: synced.options,
        syncError: syncErrorMessage,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update heater" },
      { status: 500 }
    );
  }
};
