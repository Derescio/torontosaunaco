import Link from "next/link";
import { Button } from "./ui/button";
import { fetchProducts } from "@/assets/utils/request";
import PureCubeSlider from "./PureCube1";
import { normalizeProducts } from "@/lib/product-utils";

export default async function PureCubeV2() {
  const raw = await fetchProducts();
  const list = normalizeProducts(raw);
  const cubes = list
    .filter((product) => product.type === "Pure Cube")
    .sort((a, b) => (a.price || 0) - (b.price || 0));

  return (
    <>
      <section className="px-4 py-6">
        <div className="container-xl lg:container m-auto">
          <PureCubeSlider cubes={cubes} />
        </div>
      </section>
      <section className="m-auto max-w-lg my-10 px-6">
        <Link href="/saunas">
          <Button className="block bg-black text-white text-center py-4 px-6 rounded-xl hover:bg-gray-700">
            View All Products
          </Button>
        </Link>
      </section>
    </>
  );
}
