"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EditorHeaterDetailPage() {
  const { slug } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const [form, setForm] = useState({
    name: "",
    basePrice: "",
    description: "",
    isFeatured: false,
  });

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch(`/api/heaters/${slug}`, { cache: "no-store" });
        if (!response.ok) throw new Error("Failed to fetch heater");
        const heater = await response.json();
        setForm({
          name: heater.name || "",
          basePrice: heater.basePrice ?? "",
          description: heater.description || "",
          isFeatured: Boolean(heater.isFeatured),
        });
      } catch (error) {
        setStatus(error.message);
      } finally {
        setLoading(false);
      }
    }
    if (slug) load();
  }, [slug]);

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setStatus("");
    try {
      const response = await fetch(`/api/heaters/${slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          basePrice: Number(form.basePrice),
          description: form.description,
          isFeatured: form.isFeatured,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "Failed to update heater");
      }
      setStatus("Heater updated successfully.");
    } catch (error) {
      setStatus(error.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <main className="mx-auto max-w-3xl px-4 py-10">Loading heater...</main>;
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900">Edit Heater</h1>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-800">Name</label>
          <input
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            className="w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-800">Base Price</label>
          <input
            type="number"
            value={form.basePrice}
            onChange={(e) => setForm((p) => ({ ...p, basePrice: e.target.value }))}
            className="w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-800">Description</label>
          <textarea
            rows={6}
            value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            className="w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-800">
          <input
            type="checkbox"
            checked={form.isFeatured}
            onChange={(e) =>
              setForm((p) => ({ ...p, isFeatured: e.target.checked }))
            }
          />
          Featured Heater
        </label>
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-black px-4 py-2 text-white disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/editor/heaters")}
            className="rounded-md border border-gray-300 px-4 py-2"
          >
            Back
          </button>
        </div>
      </form>
      {status && <p className="mt-4 text-sm text-gray-700">{status}</p>}
    </main>
  );
}

