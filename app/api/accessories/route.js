import { getAccessories } from "@/lib/accessories/getAccessories";

export const revalidate = 3600;

export const GET = async () => {
  try {
    const accessories = await getAccessories();

    return new Response(JSON.stringify(accessories), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Failed to fetch accessories" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
