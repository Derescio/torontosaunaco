function canParseAsJson(contentType) {
  const type = (contentType || "").toLowerCase();
  if (type.includes("text/html")) {
    return false;
  }

  // Some API routes omit Content-Type, so Next.js defaults to text/plain.
  return (
    type.includes("application/json") ||
    type.includes("text/plain") ||
    type === ""
  );
}

export async function readJsonResponse(res, fallback) {
  if (!res?.ok) {
    return fallback;
  }

  const contentType = res.headers.get("content-type") || "";
  if (!canParseAsJson(contentType)) {
    return fallback;
  }

  try {
    return await res.json();
  } catch {
    return fallback;
  }
}
