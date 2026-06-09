import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/assets/utils/authOptions";

export const dynamic = "force-dynamic";

export default async function EditorLayout({ children }) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/signin?callbackUrl=/editor");
  }

  const canEdit = session.user.canEditCatalog || session.user.canManageRoles;
  if (!canEdit) {
    redirect("/");
  }

  return children;
}

