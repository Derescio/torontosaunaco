import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { authOptions } from "@/assets/utils/authOptions";
import MarketingDashboardClient from "@/components/marketing/MarketingDashboardClient";

export const dynamic = "force-dynamic";

export default async function MarketingPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/signin?callbackUrl=/marketing");
  }
  if (!session.user.canAccessMarketing && !session.user.canManageRoles) {
    redirect("/");
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <header>
          <h1 className="text-3xl font-bold text-gray-900">Marketing Workspace</h1>
          <p className="mt-2 text-gray-600">
            Monitor quote tracking health on the Dashboard, or configure ad platform test presets.
          </p>
        </header>

        <Suspense
          fallback={
            <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-8 text-center text-gray-600">
              Loading marketing workspace...
            </section>
          }
        >
          <MarketingDashboardClient />
        </Suspense>
      </div>
    </main>
  );
}

