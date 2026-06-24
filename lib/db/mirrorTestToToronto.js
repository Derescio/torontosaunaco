import { MongoClient } from "mongodb";

const SOURCE_DB = "test";
const TARGET_DB = "toronto";

const COLLECTION_POLICIES = {
  accessories: {
    matchFields: ["_id", "name"],
    updateFields: ["name", "image", "price", "updatedAt"],
  },
  heaters: {
    matchFields: ["_id", "slug", "model", "name"],
    updateFields: [
      "name",
      "slug",
      "model",
      "power",
      "description",
      "basePrice",
      "specifications",
      "options",
      "images",
      "warranty",
      "installation",
      "features",
      "isFeatured",
      "updatedAt",
    ],
  },
  orders: {
    matchFields: ["_id", "paymentIntentId", "id"],
    updateFields: [
      "cardholderName",
      "address",
      "items",
      "username",
      "paymentIntentId",
      "email",
      "id",
      "amount",
      "emailSent",
      "updatedAt",
    ],
  },
  products: {
    matchFields: ["_id", "name", "type", "series"],
    updateFields: [
      "owner",
      "name",
      "type",
      "collectionType",
      "series",
      "description",
      "price",
      "baseCost",
      "dimension",
      "dimensions",
      "sizes",
      "features",
      "views",
      "wood_type",
      "stove_type",
      "video",
      "documents",
      "additional_upgrades",
      "additonal_features",
      "delivery",
      "installation",
      "seller_info",
      "images",
      "is_featured",
      "displayOrder",
      "updatedAt",
    ],
  },
  users: {
    matchFields: ["_id", "email"],
    // Keep auth/privilege fields out of mirrored updates for safety.
    updateFields: ["username", "email", "image", "bookmark", "updatedAt"],
  },
};

function getMongoUri() {
  return process.env.MDB_MCP_CONNECTION_STRING || process.env.MONGO_URI;
}

function buildMatchFilter(doc, matchFields) {
  for (const field of matchFields) {
    if (doc[field] !== undefined && doc[field] !== null && doc[field] !== "") {
      return { [field]: doc[field] };
    }
  }
  return null;
}

function pickFields(doc, fields) {
  const picked = {};
  for (const field of fields) {
    if (doc[field] !== undefined) {
      picked[field] = doc[field];
    }
  }
  return picked;
}

function parseCollections(collectionsInput) {
  if (!collectionsInput || collectionsInput.length === 0) {
    return Object.keys(COLLECTION_POLICIES);
  }

  return collectionsInput.filter((name) => COLLECTION_POLICIES[name]);
}

export async function runTestToTorontoMirror(options = {}) {
  const {
    dryRun = false,
    backupBeforeUpdate = false,
    collections: collectionsInput,
    sourceDb = SOURCE_DB,
    targetDb = TARGET_DB,
  } = options;

  const uri = getMongoUri();
  if (!uri) {
    throw new Error(
      "Missing Mongo URI. Set MDB_MCP_CONNECTION_STRING or MONGO_URI."
    );
  }

  const collections = parseCollections(collectionsInput);
  if (collections.length === 0) {
    throw new Error("No valid collections requested for mirroring.");
  }

  const client = new MongoClient(uri);
  await client.connect();

  try {
    const source = client.db(sourceDb);
    const target = client.db(targetDb);
    const startedAt = new Date().toISOString();
    const runId = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    const backupCollection = target.collection("_mirror_backups");

    const summary = {
      runId,
      sourceDb,
      targetDb,
      dryRun,
      backupBeforeUpdate,
      startedAt,
      endedAt: null,
      collections,
      totals: {
        scanned: 0,
        inserted: 0,
        updated: 0,
        skipped: 0,
        backups: 0,
        errors: 0,
      },
      perCollection: {},
    };

    for (const collectionName of collections) {
      const policy = COLLECTION_POLICIES[collectionName];
      const sourceCollection = source.collection(collectionName);
      const targetCollection = target.collection(collectionName);

      const result = {
        scanned: 0,
        inserted: 0,
        updated: 0,
        skipped: 0,
        backups: 0,
        errors: 0,
        errorSamples: [],
      };

      // Batch-friendly cursor prevents loading all docs at once.
      const cursor = sourceCollection.find({});
      for await (const sourceDoc of cursor) {
        result.scanned += 1;
        summary.totals.scanned += 1;

        try {
          const filter = buildMatchFilter(sourceDoc, policy.matchFields);
          if (!filter) {
            result.skipped += 1;
            summary.totals.skipped += 1;
            continue;
          }

          const existing = await targetCollection.findOne(
            filter,
            backupBeforeUpdate && !dryRun ? {} : { projection: { _id: 1 } }
          );

          if (!existing) {
            if (!dryRun) {
              await targetCollection.insertOne(sourceDoc);
            }
            result.inserted += 1;
            summary.totals.inserted += 1;
            continue;
          }

          const updatePayload = pickFields(sourceDoc, policy.updateFields);
          if (Object.keys(updatePayload).length === 0) {
            result.skipped += 1;
            summary.totals.skipped += 1;
            continue;
          }

          if (backupBeforeUpdate && !dryRun) {
            await backupCollection.insertOne({
              runId,
              mirroredAt: new Date(),
              sourceDb,
              targetDb,
              collection: collectionName,
              filter,
              previousDocument: existing,
            });
            result.backups += 1;
            summary.totals.backups += 1;
          }

          if (!dryRun) {
            await targetCollection.updateOne(filter, { $set: updatePayload });
          }
          result.updated += 1;
          summary.totals.updated += 1;
        } catch (error) {
          result.errors += 1;
          summary.totals.errors += 1;
          if (result.errorSamples.length < 5) {
            result.errorSamples.push(error?.message || "Unknown mirror error");
          }
        }
      }

      summary.perCollection[collectionName] = result;
    }

    summary.endedAt = new Date().toISOString();
    return summary;
  } finally {
    await client.close();
  }
}

