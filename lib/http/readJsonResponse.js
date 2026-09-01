export async function readJsonResponse(res, fallback) {
  if (!res?.ok) {
    return fallback;
  }

  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    return fallback;
  }

  try {
    return await res.json();
  } catch {
    return fallback;
  }
}
