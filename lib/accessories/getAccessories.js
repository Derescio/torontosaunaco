import connectDB from "@/config/db";
import Accessories from "@/models/Accessories";

function serialize(value) {
  return JSON.parse(JSON.stringify(value));
}

export async function getAccessories() {
  await connectDB();
  const accessories = await Accessories.find().lean();
  return serialize(accessories);
}
