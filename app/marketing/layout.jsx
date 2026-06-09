import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/assets/utils/authOptions";

export const dynamic = "force-dynamic";

export default async function MarketingLayout({ children }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/signin?callbackUrl=/marketing");
  }
  if (!session.user.canAccessMarketing && !session.user.canManageRoles) {
    redirect("/");
  }
  return children;
}

