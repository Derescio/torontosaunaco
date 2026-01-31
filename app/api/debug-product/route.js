import connectDB from "@/config/db";
import Products from "@/models/Products";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

// Debug endpoint to test specific product lookups
// GET /api/debug-product?id=668af06648215c199c418a96
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  const results = {
    timestamp: new Date().toISOString(),
    requestedId: id,
    mongoUri: process.env.MONGO_URI ? "SET (hidden)" : "NOT SET",
    connectionState: mongoose.connection.readyState,
    tests: {},
  };

  try {
    await connectDB();
    results.tests.connectionAfterConnect = mongoose.connection.readyState;
    results.tests.databaseName = mongoose.connection.db?.databaseName;

    // Test 1: Find by ID
    if (id) {
      const product = await Products.findById(id).lean();
      results.tests.findById = product
        ? { found: true, name: product.name, _id: product._id }
        : { found: false };
    }

    // Test 2: Find Mini and Max specifically by name
    const mini = await Products.findOne({ name: /mini/i }).lean();
    const max = await Products.findOne({ name: /max/i }).lean();

    results.tests.findMiniByName = mini
      ? { found: true, name: mini.name, _id: mini._id }
      : { found: false };

    results.tests.findMaxByName = max
      ? { found: true, name: max.name, _id: max._id }
      : { found: false };

    // Test 3: Count total products
    const totalProducts = await Products.countDocuments();
    results.tests.totalProducts = totalProducts;

    // Test 4: List all collection names in database
    const collections = await mongoose.connection.db.listCollections().toArray();
    results.tests.collections = collections.map((c) => c.name);

    return new Response(JSON.stringify(results, null, 2), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    results.error = {
      message: error.message,
      stack: error.stack,
    };
    return new Response(JSON.stringify(results, null, 2), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

