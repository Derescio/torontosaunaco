// Create API Handlers

import connectDB from "@/config/db";
import Products from "@/models/Products";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/assets/utils/authOptions";
import { canEditCatalog } from "@/assets/utils/rbac";

export const revalidate = 3600;

export const GET = async (req) => {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const full = searchParams.get("full") === "1";

    const products = full
      ? await Products.find().lean()
      : await Products.find().select("-documents").lean();

    return new Response(JSON.stringify(products), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch products" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

function parseBoolean(value) {
  if (typeof value === "boolean") return value;
  if (typeof value !== "string") return false;
  return value === "true" || value === "1" || value.toLowerCase() === "yes";
}

function safeParseJson(value, fallback = {}) {
  if (!value || typeof value !== "string") return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

async function buildProductPayload(req, ownerId) {
  const contentType = req.headers.get("content-type") || "";
  if (!contentType.includes("multipart/form-data")) {
    const body = await req.json();
    return { ...body, owner: ownerId };
  }

  const formData = await req.formData();
  return {
    owner: ownerId,
    type: formData.get("type"),
    name: formData.get("name"),
    price: Number(formData.get("price")) || undefined,
    views: safeParseJson(formData.get("views"), {}),
    description: formData.get("description"),
    dimension: formData.get("dimension"),
    installation: safeParseJson(formData.get("installation"), {}),
    stove_type: safeParseJson(formData.get("stove_type"), {}),
    wood_type: safeParseJson(formData.get("wood_type"), {}),
    seller_info: {
      name: formData.get("seller_name") || formData.get("name"),
      email: formData.get("seller_email") || formData.get("email"),
      phone: formData.get("seller_phone") || formData.get("phone"),
    },
    is_featured: parseBoolean(formData.get("is_featured")),
  };
}

export const POST = async (req) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    if (!canEditCatalog(session.user)) {
      return new Response(
        JSON.stringify({ error: "Insufficient permissions" }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    await connectDB();
    const payload = await buildProductPayload(req, session.user.id);
    const product = await Products.create(payload);

    return new Response(JSON.stringify(product), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Failed to create product",
        message: error?.message || "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
