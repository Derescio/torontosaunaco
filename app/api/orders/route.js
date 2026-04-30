import connectDB from "@/config/db";
import Orders from "@/models/Orders";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/assets/utils/authOptions";

export const maxDuration = 25;
export const dynamic = "force-dynamic";

export const GET = async () => {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    await connectDB();
    const email = session.user.email;
    const orders = await Orders.find({
      $or: [{ email }, { username: email }],
    })
      .lean()
      .sort({ createdAt: -1 });

    return new Response(JSON.stringify(orders), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.log(error);
    return new Response("error", { status: 500 });
  }
};
