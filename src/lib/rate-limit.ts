import "server-only";
import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { connectDB } from "./db";
import { RateLimitModel } from "./models";

export type LimitResult = { ok: boolean; remaining: number; retryAfterSeconds: number };

/** MongoDB-backed fixed-window limiter, so limits are shared across all server instances. */
export async function rateLimit(key: string, limit: number, windowSeconds: number): Promise<LimitResult> {
  await connectDB();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + windowSeconds * 1000);

  let doc = await RateLimitModel.findOneAndUpdate(
    { key, expiresAt: { $gt: now } },
    { $inc: { count: 1 } },
    { returnDocument: "after" },
  ).lean();

  if (!doc) {
    try {
      doc = await RateLimitModel.findOneAndUpdate(
        { key },
        { $set: { count: 1, expiresAt } },
        { upsert: true, returnDocument: "after" },
      ).lean();
    } catch {
      // Concurrent first requests can collide on the unique key; count the loser against the winner's window.
      doc = await RateLimitModel.findOneAndUpdate({ key }, { $inc: { count: 1 } }, { returnDocument: "after" }).lean();
    }
  }

  const count = doc?.count ?? 1;
  const resetAt = doc?.expiresAt ?? expiresAt;
  return {
    ok: count <= limit,
    remaining: Math.max(0, limit - count),
    retryAfterSeconds: Math.max(1, Math.ceil((resetAt.getTime() - now.getTime()) / 1000)),
  };
}

export async function resetRateLimit(key: string): Promise<void> {
  await connectDB();
  await RateLimitModel.deleteOne({ key });
}

/** Salted hash of the client IP, so raw addresses are never stored. */
export async function clientKey(): Promise<string> {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
  return createHash("sha256")
    .update(ip + (process.env.AUTH_SECRET ?? ""))
    .digest("hex")
    .slice(0, 24);
}

export function waitMessage(seconds: number): string {
  const minutes = Math.ceil(seconds / 60);
  return minutes <= 1 ? "a minute" : `${minutes} minutes`;
}
