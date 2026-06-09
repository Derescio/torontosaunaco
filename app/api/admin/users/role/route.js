import connectDB from "@/config/db";
import User from "@/models/Users";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/assets/utils/authOptions";
import { canManageRoles, USER_ROLES } from "@/assets/utils/rbac";

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function isValidRole(role) {
  return [
    USER_ROLES.ADMIN,
    USER_ROLES.EDITOR,
    USER_ROLES.MARKETING,
    USER_ROLES.USER,
  ].includes(role);
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    const actor = session?.user;

    if (!actor) {
      return jsonResponse({ error: "Not authenticated" }, 401);
    }
    if (!canManageRoles(actor)) {
      return jsonResponse({ error: "Admin permissions required" }, 403);
    }

    const payload = await request.json();
    const { email, userId, role } = payload || {};

    if (!isValidRole(role)) {
      return jsonResponse(
        {
          error: "Invalid role. Use one of: admin, editor, marketing, user.",
        },
        400
      );
    }

    if (!email && !userId) {
      return jsonResponse(
        { error: "Provide either email or userId to identify the user." },
        400
      );
    }

    await connectDB();

    const filter = email ? { email } : { _id: userId };
    const user = await User.findOne(filter);
    if (!user) {
      return jsonResponse({ error: "User not found." }, 404);
    }

    user.role = role;
    user.isAdmin = role === USER_ROLES.ADMIN;
    await user.save();

    return jsonResponse(
      {
        message: "User role updated.",
        user: {
          id: user._id.toString(),
          email: user.email,
          username: user.username,
          role: user.role,
          isAdmin: user.isAdmin,
        },
      },
      200
    );
  } catch (error) {
    return jsonResponse(
      {
        error: "Failed to update user role.",
        message: error?.message || "Unknown error",
      },
      500
    );
  }
}

