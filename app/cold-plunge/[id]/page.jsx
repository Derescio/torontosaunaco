import { notFound, permanentRedirect } from "next/navigation";
import { resolveProductParam } from "@/lib/products/resolve";
import ColdPlungeClient from "./ColdPlungeClient";

// Old /cold-plunge/<id> URL. A product with a slug permanently redirects to /cold-plunges/<slug>; one without a slug yet renders as before.
export default async function ColdPlungePage({ params }) {
  const { id } = await params;
  const result = await resolveProductParam(id, "cold-plunge");
  if (!result) notFound();
  if (result.redirectTo) permanentRedirect(result.redirectTo);
  return <ColdPlungeClient id={id} />;
}
