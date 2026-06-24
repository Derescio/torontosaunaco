import fs from "fs";
import path from "path";
import { MongoClient, ObjectId } from "mongodb";

const VALID_ROLES = new Set(["admin", "editor", "marketing", "user"]);

function parseArg(name) {
  const prefix = `--${name}=`;
  const arg = process.argv.find((entry) => entry.startsWith(prefix));
  return arg ? arg.slice(prefix.length) : "";
}

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

function usageAndExit() {
  console.error(
    [
      "Usage:",
      "  node scripts/set-user-role.mjs --email=user@example.com --role=editor",
      "  node scripts/set-user-role.mjs --email=user@example.com --role=marketing",
      "  node scripts/set-user-role.mjs --userId=<mongoObjectId> --role=admin",
      "",
      "Options:",
      "  --database=toronto   (optional, default: toronto)",
    ].join("\n")
  );
  process.exit(1);
}

async function main() {
  loadEnvFile();

  const uri = process.env.MDB_MCP_CONNECTION_STRING || process.env.MONGO_URI;
  if (!uri) {
    throw new Error("Missing Mongo URI in MDB_MCP_CONNECTION_STRING or MONGO_URI");
  }

  const email = parseArg("email");
  const userId = parseArg("userId");
  const role = parseArg("role");
  const database = parseArg("database") || "toronto";

  if ((!email && !userId) || !role || !VALID_ROLES.has(role)) {
    usageAndExit();
  }

  const filter = email
    ? { email }
    : ObjectId.isValid(userId)
      ? { _id: new ObjectId(userId) }
      : null;

  if (!filter) {
    throw new Error("Invalid userId provided.");
  }

  const client = new MongoClient(uri);
  await client.connect();

  try {
    const collection = client.db(database).collection("users");
    await collection.findOneAndUpdate(
      filter,
      {
        $set: {
          role,
          isAdmin: role === "admin",
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" }
    );

    const updatedUser = await collection.findOne(filter, {
      projection: { _id: 1, email: 1, role: 1, isAdmin: 1 },
    });

    if (!updatedUser) {
      throw new Error("User not found.");
    }

    console.log(
      JSON.stringify(
        {
          message: "Role updated successfully.",
          user: {
            id: updatedUser._id,
            email: updatedUser.email,
            role: updatedUser.role,
            isAdmin: updatedUser.isAdmin,
          },
        },
        null,
        2
      )
    );
  } finally {
    await client.close();
  }
}

main().catch((error) => {
  console.error("Failed to set user role:", error.message);
  process.exit(1);
});

