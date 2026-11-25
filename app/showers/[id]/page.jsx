import { notFound, permanentRedirect } from "next/navigation";
import { resolveProductParam } from "@/lib/products/resolve";
import ShowersClient from "./ShowersClient";

// Old /showers/<id> URL. A product with a slug permanently redirects to /outdoor-showers/<slug>; one without a slug yet renders as before.
export default async function ShowersPage({ params }) {
  const { id } = await params;
  const result = await resolveProductParam(id, "shower");
  if (!result) notFound();
  if (result.redirectTo) permanentRedirect(result.redirectTo);
  return <ShowersClient id={id} />;
}
