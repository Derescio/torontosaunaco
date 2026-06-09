import fs from "fs";
import path from "path";
import { runTestToTorontoMirror } from "../lib/db/mirrorTestToToronto.js";

function loadEnvFile() {
  const envPath = path.resolve(".env");
  if (!fs.existsSync(envPath)) return;

  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!match) continue;

    const key = match[1];
    let value = match[2] ?? "";

    if (
      (value.startsWith("\"") && value.endsWith("\"")) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

if (!process.env.MDB_MCP_CONNECTION_STRING && !process.env.MONGO_URI) {
  loadEnvFile();
}

const summary = await runTestToTorontoMirror({
  dryRun: true,
  backupBeforeUpdate: true,
});

console.log(JSON.stringify(summary, null, 2));

