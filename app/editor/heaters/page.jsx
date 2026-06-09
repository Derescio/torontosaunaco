"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function EditorHeatersPage() {
  const [heaters, setHeaters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch("/api/heaters", { cache: "no-store" });
        if (!response.ok) throw new Error("Failed to fetch heaters");
        const data = await response.json();
        setHeaters(Array.isArray(data) ? data : []);
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
      <h1 className="text-3xl font-bold text-gray-900">Update Heaters</h1>
      <p className="mt-2 text-gray-700">Select a heater to edit.</p>

      {loading ? (
        <p className="mt-6 text-gray-600">Loading heaters...</p>
      ) : (
        <div className="mt-6 grid gap-3">
          {heaters.map((heater) => (
            <Link
              key={heater._id}
              href={`/editor/heaters/${heater.slug || heater._id}`}
              className="rounded-lg border border-gray-200 px-4 py-3 transition hover:border-black"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-gray-900">{heater.name || "Untitled heater"}</p>
                  <p className="text-sm text-gray-600">{heater.model || "No model"}</p>
                </div>
                <p className="text-sm text-gray-700">${heater.basePrice ?? "-"}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}

