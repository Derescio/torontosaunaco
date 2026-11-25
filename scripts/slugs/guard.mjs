// The slug backfill writes to staging. Production ("test") only with --production, which the owner runs at cutover.

export function assertTarget(dbName, { production = false } = {}) {
  if (dbName === "staging") return;
  if (dbName === "test" && production === true) return;
  if (dbName === "test") {
    throw new Error(`refusing to write to "test" (production): pass --production, and only with the owner's go-ahead`);
  }
  throw new Error(`refusing to write to "${dbName}": the slug backfill only runs on staging (or test with --production)`);
}
