import { getServerSession } from "next-auth/next";
import { authOptions } from "@/assets/utils/authOptions";
import { canAccessMarketing } from "@/assets/utils/rbac";

export function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function requireMarketingAccess() {
  const session = await getServerSession(authOptions);
  const user = session?.user;

  if (!user) {
    return { error: jsonResponse({ error: "Not authenticated" }, 401) };
  }

  if (!canAccessMarketing(user)) {
    return { error: jsonResponse({ error: "Marketing permissions required" }, 403) };
  }

  return { user };
}
