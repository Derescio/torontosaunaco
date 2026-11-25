// The price diff reads catalogue prices from the staging copy only, never production ("test") or anything else.

export function assertStaging(dbName) {
  if (dbName !== "staging") {
    throw new Error(`refusing to read "${dbName}": the price diff only reads the staging database`);
  }
}
