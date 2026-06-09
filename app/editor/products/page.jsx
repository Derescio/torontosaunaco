"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function EditorProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch("/api/products?full=1", { cache: "no-store" });
        if (!response.ok) throw new Error("Failed to fetch products");
        const data = await response.json();
        setProducts(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900">Update Products</h1>
      <p className="mt-2 text-gray-700">Select a product to edit.</p>

      {loading ? (
        <p className="mt-6 text-gray-600">Loading products...</p>
      ) : (
        <div className="mt-6 grid gap-3">
          {products.map((product) => (
            <Link
              key={product._id}
              href={`/editor/products/${product._id}`}
              className="rounded-lg border border-gray-200 px-4 py-3 transition hover:border-black"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-gray-900">{product.name || "Untitled product"}</p>
                  <p className="text-sm text-gray-600">{product.type || "No type"}</p>
                </div>
                <p className="text-sm text-gray-700">${product.price ?? product.baseCost ?? "-"}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}

