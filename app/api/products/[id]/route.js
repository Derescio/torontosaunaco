import connectDB from "@/config/db";
import Products from "@/models/Products";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/assets/utils/authOptions";
import { canEditCatalog } from "@/assets/utils/rbac";

// GET API Handler - /api/products/:id
export const GET = async (request, {params}) => {
    
    const {id }= await params;

    try {
        await connectDB();

        const product = await Products.findById(id);
        if (!product) {
            return new Response("Product not found", { status: 404 });
        }
        return new Response(JSON.stringify(product), { status: 200 });
    } catch (error) {
       // console.log(error);
        return new Response(error, { status: 500 });
    }
}

export const PATCH = async (request, { params }) => {
    const { id } = await params;

    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return new Response(JSON.stringify({ error: "Not authenticated" }), {
                status: 401,
                headers: { "Content-Type": "application/json" },
            });
        }
        if (!canEditCatalog(session.user)) {
            return new Response(JSON.stringify({ error: "Insufficient permissions" }), {
                status: 403,
                headers: { "Content-Type": "application/json" },
            });
        }

        const payload = await request.json();
        await connectDB();

        const product = await Products.findByIdAndUpdate(id, payload, {
            new: true,
            runValidators: true,
        });

        if (!product) {
            return new Response(JSON.stringify({ error: "Product not found" }), {
                status: 404,
                headers: { "Content-Type": "application/json" },
            });
        }

        return new Response(JSON.stringify(product), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        return new Response(
            JSON.stringify({
                error: "Failed to update product",
                message: error?.message || "Unknown error",
            }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" },
            }
        );
    }
};

