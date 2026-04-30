import connectDB from "@/config/db";
import Accessories from "@/models/Accessories";

export const revalidate = 3600;

export const GET = async () => {
  try {
    await connectDB();
    const accessories = await Accessories.find().lean();

    return new Response(JSON.stringify(accessories), { status: 200 });
  } catch (error) {
    return new Response("error", { status: 500 });
  }
};
