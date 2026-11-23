// Guards that keep non-production deployments (staging, previews, local) away from
// production data and real inboxes. See CLAUDE.md, "Data: production safety rules".

const PRODUCTION_DB = "test";

export function isProduction(env = process.env) {
  return env.VERCEL_ENV === "production";
}

// MongoDB uses `test` when the URI names no database.
export function getMongoDbName(uri) {
  const afterHosts = uri.replace(/^mongodb(\+srv)?:\/\/[^/]*/, "");
  const name = afterHosts.replace(/^\//, "").split("?")[0];
  return name || PRODUCTION_DB;
}

export function assertMongoTargetAllowed(uri, env = process.env) {
  if (isProduction(env)) return;
  const dbName = getMongoDbName(uri);
  if (dbName === PRODUCTION_DB) {
    throw new Error(
      `Refusing to connect to the production database "${PRODUCTION_DB}" outside production. ` +
        `Point MONGO_URI at "staging" (or name a database in the URI).`
    );
  }
}

const list = (value) => (Array.isArray(value) ? value : value ? [value] : []);

export function applyEmailSafety(mail, env = process.env) {
  if (isProduction(env)) return mail;

  const override = env.STAGING_EMAIL_TO;
  if (!override) {
    throw new Error("STAGING_EMAIL_TO is not set; refusing to send email outside production.");
  }

  const original = [
    ["To", list(mail.to)],
    ["Cc", list(mail.cc)],
    ["Bcc", list(mail.bcc)],
  ]
    .filter(([, addrs]) => addrs.length)
    .map(([label, addrs]) => `${label}: ${addrs.join(", ")}`)
    .join(" | ");

  const banner =
    `<div style="background:#fff3cd;border:1px solid #e0c36c;padding:8px 12px;margin-bottom:12px;font-family:Arial,sans-serif;font-size:13px;">` +
    `Staging email. In production this would go to: ${original || "(no recipients)"}</div>`;

  return {
    ...mail,
    to: override,
    cc: undefined,
    bcc: undefined,
    subject: `[STAGING] ${mail.subject ?? ""}`.trim(),
    html: banner + (mail.html ?? ""),
  };
}
