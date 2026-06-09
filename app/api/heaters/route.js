import connectDB from "@/config/db";
import Heaters from "@/models/Heaters";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/assets/utils/authOptions";
import { canEditCatalog, canManageRoles } from "@/assets/utils/rbac";

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

async function getSessionUser() {
  const session = await getServerSession(authOptions);
  return session?.user || null;
}

// GET all heaters
export const GET = async () => {
  try {
    await connectDB();
    const heaters = await Heaters.find({});
    return new Response(JSON.stringify(heaters), { status: 200 });
  } catch (error) {
    return new Response("Failed to fetch heaters", { status: 500 });
  }
};

// POST new heater
export const POST = async (request) => {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return jsonResponse({ error: "Not authenticated" }, 401);
    }
    if (!canEditCatalog(sessionUser)) {
      return jsonResponse({ error: "Insufficient permissions" }, 403);
    }

    const body = await request.json();
    await connectDB();

    const heater = await Heaters.create(body);
    return jsonResponse(heater, 201);
  } catch (error) {
    console.error("Error creating heater:", error);
    return jsonResponse(
      {
        error:
          error.name === "ValidationError"
            ? `Validation error: ${Object.values(error.errors)
                .map((err) => err.message)
                .join(", ")}`
            : error.message || "Failed to create heater",
      },
      500
    );
  }
};

// DELETE all heaters
export const DELETE = async () => {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return jsonResponse({ error: "Not authenticated" }, 401);
    }
    if (!canManageRoles(sessionUser)) {
      return jsonResponse({ error: "Admin permissions required" }, 403);
    }

    await connectDB();
    await Heaters.deleteMany({});
    return jsonResponse({ message: "All heaters deleted successfully" }, 200);
  } catch (error) {
    return jsonResponse({ error: "Failed to delete heaters" }, 500);
  }
};
