import connectDB from "@/config/db";
import Accessories from "@/models/Accessories";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/assets/utils/authOptions";
import { canEditCatalog } from "@/assets/utils/rbac";

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const GET = async (request, { params }) => {
  const { id } = await params;
  try {
    await connectDB();
    const item = await Accessories.findById(id).lean();
    if (!item) {
      return jsonResponse({ error: "Accessory not found" }, 404);
    }
    return jsonResponse(item, 200);
  } catch (error) {
    return jsonResponse({ error: "Failed to fetch accessory" }, 500);
  }
};

export const PATCH = async (request, { params }) => {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return jsonResponse({ error: "Not authenticated" }, 401);
    }
    if (!canEditCatalog(session.user)) {
      return jsonResponse({ error: "Insufficient permissions" }, 403);
    }

    const payload = await request.json();
    await connectDB();

    const updated = await Accessories.findByIdAndUpdate(
      id,
      {
        name: payload.name,
        price: payload.price,
        image: payload.image,
      },
      { new: true, runValidators: true }
    ).lean();

    if (!updated) {
      return jsonResponse({ error: "Accessory not found" }, 404);
    }

    return jsonResponse(updated, 200);
  } catch (error) {
    return jsonResponse(
      {
        error: "Failed to update accessory",
        message: error?.message || "Unknown error",
      },
      500
    );
  }
};

