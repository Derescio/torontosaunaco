"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function EditorAccessoriesPage() {
  const [accessories, setAccessories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch("/api/accessories", { cache: "no-store" });
        if (!response.ok) throw new Error("Failed to fetch accessories");
        const data = await response.json();
        setAccessories(Array.isArray(data) ? data : []);
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
      <h1 className="text-3xl font-bold text-gray-900">Update Accessories</h1>
      <p className="mt-2 text-gray-700">Select an accessory to edit.</p>

      {loading ? (
        <p className="mt-6 text-gray-600">Loading accessories...</p>
      ) : (
        <div className="mt-6 grid gap-3">
          {accessories.map((item) => (
            <Link
              key={item._id}
              href={`/editor/accessories/${item._id}`}
              className="rounded-lg border border-gray-200 px-4 py-3 transition hover:border-black"
            >
              <div className="flex items-center justify-between gap-4">
                <p className="font-semibold text-gray-900">{item.name || "Untitled accessory"}</p>
                <p className="text-sm text-gray-700">${item.price ?? "-"}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}

