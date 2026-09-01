import connectDB from "@/config/db";
import Products from "@/models/Products";

function serialize(value) {
  return JSON.parse(JSON.stringify(value));
}

export async function getProducts({ full = false } = {}) {
  await connectDB();
  const products = full
    ? await Products.find().lean()
    : await Products.find().select("-documents").lean();
  return serialize(products);
}
