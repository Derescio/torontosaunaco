// Seeds the redesign staging database from production (`test`).
//
// Reads `test` (never writes it) and writes a separate database (default `staging`)
// on the same cluster. Customer data is left out: no orders, no quote/lead
// submissions, and only staff accounts (admin, editor, marketing) from `users`.
//
// Usage (from the repo root; MONGO_URI comes from .env and is never printed):
//   node --env-file=.env scripts/staging/copy-test-to-staging.mjs            # dry run
//   node --env-file=.env scripts/staging/copy-test-to-staging.mjs --write    # copy
//   ... --write --drop    # replace an existing staging database's collections
//   ... --target=<name>   # different target database name

import { MongoClient } from "mongodb";

const SOURCE_DB = "test";
const FORBIDDEN_TARGETS = new Set(["test", "toronto", "admin", "local", "config"]);
const STAFF_ROLES = ["admin", "editor", "marketing"];

// collection -> filter. Anything not listed is skipped.
const COPY = {
  products: {},
  heaters: {},
  accessories: {},
  stovetypes: {},
  woodtypes: {},
  updatedproducts: {},
  marketingplatformpresets: {},
  users: { $or: [{ role: { $in: STAFF_ROLES } }, { isAdmin: true }] },
};
const SKIP_REASON = {
  orders: "customer orders",
  quoteattributionsubmissions: "customer leads",
  _mirror_backups: "mirror job internals",
};

const args = new Set(process.argv.slice(2));
const write = args.has("--write");
const drop = args.has("--drop");
const targetArg = process.argv.find((a) => a.startsWith("--target="));
const TARGET_DB = targetArg ? targetArg.split("=")[1] : "staging";

if (!process.env.MONGO_URI) {
  console.error("MONGO_URI is not set. Run with: node --env-file=.env ...");
  process.exit(1);
}
if (FORBIDDEN_TARGETS.has(TARGET_DB)) {
  console.error(`Refusing to write to "${TARGET_DB}".`);
  process.exit(1);
}

const client = new MongoClient(process.env.MONGO_URI);

try {
  await client.connect();
  const src = client.db(SOURCE_DB);
  const dst = client.db(TARGET_DB);

  const srcCollections = (await src.listCollections({}, { nameOnly: true }).toArray())
    .map((c) => c.name)
    .filter((n) => !n.startsWith("system."))
    .sort();
  const existing = new Set(
    (await dst.listCollections({}, { nameOnly: true }).toArray()).map((c) => c.name)
  );

  console.log(`${write ? "WRITE" : "DRY RUN"}: ${SOURCE_DB} -> ${TARGET_DB}\n`);

  for (const name of srcCollections) {
    if (!(name in COPY)) {
      const total = await src.collection(name).estimatedDocumentCount();
      console.log(`  skip  ${name} (${total} docs) - ${SKIP_REASON[name] ?? "not in allowlist"}`);
      continue;
    }
    const filter = COPY[name];
    const docs = await src.collection(name).find(filter).toArray();
    const total = await src.collection(name).estimatedDocumentCount();
    const note = Object.keys(filter).length ? ` of ${total} (filtered)` : "";

    if (existing.has(name) && !drop) {
      console.log(`  HOLD  ${name}: already exists in ${TARGET_DB}; pass --drop to replace`);
      continue;
    }
    console.log(`  copy  ${name}: ${docs.length}${note}`);
    if (!write) continue;

    if (existing.has(name)) await dst.collection(name).drop();
    if (docs.length) await dst.collection(name).insertMany(docs, { ordered: false });

    const indexes = await src.collection(name).indexes();
    for (const { key, v, ns, ...opts } of indexes) {
      if (opts.name === "_id_") continue;
      await dst.collection(name).createIndex(key, opts);
    }
  }

  for (const name of Object.keys(COPY)) {
    if (!srcCollections.includes(name)) console.log(`  note  ${name}: not found in ${SOURCE_DB}`);
  }
  console.log(write ? "\nDone." : "\nDry run only. Re-run with --write to copy.");
} finally {
  await client.close();
}
