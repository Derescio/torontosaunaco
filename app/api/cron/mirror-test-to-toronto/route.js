import { runTestToTorontoMirror } from "@/lib/db/mirrorTestToToronto";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const DEFAULT_COLLECTIONS = [
  "accessories",
  "heaters",
  "orders",
  "products",
  "users",
];

function unauthorizedResponse() {
  return new Response(
    JSON.stringify({ error: "Unauthorized: invalid CRON_SECRET." }),
    {
      status: 401,
      headers: { "Content-Type": "application/json" },
    }
  );
}

function getAuthHeaderToken(request) {
  const header = request.headers.get("authorization") || "";
  const [, token] = header.split(" ");
  return token || null;
}

function parseCsvList(value) {
  if (!value) return [];
  return value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

function parseBoolean(value) {
  if (value === true || value === false) return value;
  if (typeof value !== "string") return false;
  const normalized = value.trim().toLowerCase();
  return normalized === "1" || normalized === "true" || normalized === "yes";
}

function getMirrorOptionsFromRequest(request, body = null) {
  const { searchParams } = new URL(request.url);
  const dryRunFromQuery = searchParams.get("dryRun");
  const backupFromQuery = searchParams.get("backupBeforeUpdate");
  const collectionsFromQuery = parseCsvList(searchParams.get("collections"));

  const hasCollectionOverride =
    Boolean(body?.collections) || collectionsFromQuery.length > 0;
  const collections = hasCollectionOverride
    ? body?.collections || collectionsFromQuery
    : DEFAULT_COLLECTIONS;

  return {
    dryRun:
      body?.dryRun !== undefined
        ? parseBoolean(body.dryRun)
        : parseBoolean(dryRunFromQuery),
    backupBeforeUpdate:
      body?.backupBeforeUpdate !== undefined
        ? parseBoolean(body.backupBeforeUpdate)
        : parseBoolean(backupFromQuery),
    collections,
  };
}

async function executeMirror(request, body = null) {
  const expectedSecret = process.env.CRON_SECRET;
  if (!expectedSecret) {
    return new Response(
      JSON.stringify({ error: "Missing CRON_SECRET server configuration." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const providedToken = getAuthHeaderToken(request);
  if (providedToken !== expectedSecret) {
    return unauthorizedResponse();
  }

  const options = getMirrorOptionsFromRequest(request, body);
  try {
    const summary = await runTestToTorontoMirror(options);
    return new Response(JSON.stringify(summary), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Mirror job failed.",
        message: error?.message || "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

export async function GET(request) {
  return executeMirror(request);
}

export async function POST(request) {
  let body = null;
  try {
    body = await request.json();
  } catch {
    body = null;
  }
  return executeMirror(request, body);
}

