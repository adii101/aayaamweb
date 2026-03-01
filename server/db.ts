import { MongoClient, Db, Collection } from "mongodb";

let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectDb(): Promise<Db> {
  if (db) return db;

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error("MONGODB_URI environment variable not set");
  }

  client = new MongoClient(mongoUri);
  await client.connect();
  db = client.db();

  // Create collections and indexes if they don't exist
  await initializeCollections();

  return db;
}

async function initializeCollections() {
  if (!db) return;

  // Create collections
  const usersCollection = await db.createCollection("users").catch(() => null);
  const eventsCollection = await db.createCollection("events").catch(() => null);
  const registrationsCollection = await db
    .createCollection("registrations")
    .catch(() => null);

  // Create indexes
  try {
    await db.collection("users").createIndex({ phone: 1 }, { unique: true });
    await db.collection("registrations").createIndex({ userPhone: 1 });
    await db.collection("registrations").createIndex({ eventId: 1 });
    await db
      .collection("registrations")
      .createIndex({ userPhone: 1, eventId: 1, mode: 1 });
  } catch (err) {
    // Indexes may already exist
  }
}

export function getDb(): Db {
  if (!db) {
    throw new Error(
      "Database not connected. Call connectDb() first.",
    );
  }
  return db;
}

export async function closeDb() {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
}

export function getUsersCollection(): Collection {
  return getDb().collection("users");
}

export function getEventsCollection(): Collection {
  return getDb().collection("events");
}

export function getRegistrationsCollection(): Collection {
  return getDb().collection("registrations");
}
