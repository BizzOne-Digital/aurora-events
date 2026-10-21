import mongoose from "mongoose";

type Cache = { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };

const globalForMongoose = globalThis as unknown as { __mongoose?: Cache };
const cache: Cache = (globalForMongoose.__mongoose ??= { conn: null, promise: null });

export function isDbConfigured(): boolean {
  return Boolean(process.env.MONGODB_URI);
}

/** Reusable, cached Mongoose connection (safe across hot reloads and serverless invocations). */
export async function connectDB(): Promise<typeof mongoose> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set. See README.md for MongoDB Atlas setup.");
  if (cache.conn) return cache.conn;
  if (!cache.promise) {
    cache.promise = mongoose
      .connect(uri, { bufferCommands: false, serverSelectionTimeoutMS: 8000, maxPoolSize: 10 })
      .catch((err) => {
        cache.promise = null; // allow a retry on the next request
        throw err;
      });
  }
  cache.conn = await cache.promise;
  return cache.conn;
}
