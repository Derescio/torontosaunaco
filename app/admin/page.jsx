import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/assets/utils/authOptions";
import RoleManagementPanel from "@/components/admin/RoleManagementPanel";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/signin?callbackUrl=/admin");
  }

  if (!session.user.canManageRoles) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-3 text-gray-700">
          You do not currently have admin permissions for this area.
        </p>
        <div className="mt-6">
          <Link href="/" className="rounded-md bg-black px-4 py-2 text-white">
            Back to Home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
      <p className="mt-2 text-gray-700">
        Manage elevated operations and administration tasks.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link
          href="/admin/seed"
          className="rounded-lg border border-gray-200 p-5 transition hover:border-black"
        >
          <h2 className="text-xl font-semibold">Database Seeding</h2>
          <p className="mt-2 text-sm text-gray-600">
            Access the existing seed workflow for controlled data resets.
          </p>
        </Link>

        <Link
          href="/editor"
          className="rounded-lg border border-gray-200 p-5 transition hover:border-black"
        >
          <h2 className="text-xl font-semibold">Editor Workspace</h2>
          <p className="mt-2 text-sm text-gray-600">
            Open editor tools to manage product and catalog content.
          </p>
        </Link>
      </div>

      <RoleManagementPanel />
    </main>
  );
}

