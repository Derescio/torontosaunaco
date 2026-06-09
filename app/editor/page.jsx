import Link from "next/link";

export default async function EditorPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900">Editor Access</h1>
      <p className="mt-2 text-gray-700">
        Manage catalog content and product data from this workspace.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link
          href="/saunas/add"
          className="rounded-lg border border-gray-200 p-5 transition hover:border-black"
        >
          <h2 className="text-xl font-semibold">Create Product</h2>
          <p className="mt-2 text-sm text-gray-600">
            Open the add-product flow to create new catalog entries.
          </p>
        </Link>

        <Link
          href="/saunas"
          className="rounded-lg border border-gray-200 p-5 transition hover:border-black"
        >
          <h2 className="text-xl font-semibold">Review Catalog</h2>
          <p className="mt-2 text-sm text-gray-600">
            Browse existing products and verify listing data.
          </p>
        </Link>
      </div>

      <h2 className="mt-12 text-2xl font-semibold text-gray-900">Update Items</h2>
      <p className="mt-2 text-gray-700">
        Open the update tools for each collection and save edits directly.
      </p>
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <Link
          href="/editor/products"
          className="rounded-lg border border-gray-200 p-5 transition hover:border-black"
        >
          <h3 className="text-lg font-semibold">Update Products</h3>
          <p className="mt-2 text-sm text-gray-600">
            Edit product name, price, description, and featured state.
          </p>
        </Link>
        <Link
          href="/editor/heaters"
          className="rounded-lg border border-gray-200 p-5 transition hover:border-black"
        >
          <h3 className="text-lg font-semibold">Update Heaters</h3>
          <p className="mt-2 text-sm text-gray-600">
            Edit heater details including name, base price, and description.
          </p>
        </Link>
        <Link
          href="/editor/accessories"
          className="rounded-lg border border-gray-200 p-5 transition hover:border-black"
        >
          <h3 className="text-lg font-semibold">Update Accessories</h3>
          <p className="mt-2 text-sm text-gray-600">
            Edit accessory name, price, and image.
          </p>
        </Link>
      </div>
    </main>
  );
}

