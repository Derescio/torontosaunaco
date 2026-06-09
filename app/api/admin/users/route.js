import connectDB from "@/config/db";
import User from "@/models/Users";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/assets/utils/authOptions";
import { canManageRoles, normalizeRole } from "@/assets/utils/rbac";

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return jsonResponse({ error: "Not authenticated" }, 401);
    }
    if (!canManageRoles(session.user)) {
      return jsonResponse({ error: "Admin permissions required" }, 403);
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query")?.trim() || "";
    const limitValue = Number.parseInt(searchParams.get("limit") || "50", 10);
    const limit = Number.isFinite(limitValue)
      ? Math.min(Math.max(limitValue, 1), 200)
      : 50;

    await connectDB();

    const filter = query
      ? {
          $or: [
            { email: { $regex: query, $options: "i" } },
            { username: { $regex: query, $options: "i" } },
          ],
        }
      : {};

    const users = await User.find(filter)
      .sort({ updatedAt: -1 })
      .limit(limit)
      .select("_id username email role isAdmin updatedAt createdAt")
      .lean();

    return jsonResponse(
      {
        users: users.map((user) => ({
          id: user._id.toString(),
          username: user.username || "",
          email: user.email,
          role: normalizeRole(user),
          isAdmin: Boolean(user.isAdmin),
          updatedAt: user.updatedAt,
          createdAt: user.createdAt,
        })),
      },
      200
    );
  } catch (error) {
    return jsonResponse(
      {
        error: "Failed to fetch users.",
        message: error?.message || "Unknown error",
      },
      500
    );
  }
}

