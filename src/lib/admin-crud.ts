/* eslint-disable @typescript-eslint/no-explicit-any -- generic helpers over heterogeneous Mongoose documents */
import "server-only";
import { revalidatePath, updateTag } from "next/cache";
import type { Model } from "mongoose";
import { connectDB } from "./db";
import { requireAdmin } from "./session";
import { deleteStoredUpload } from "./uploads";

// Mongoose models are generic over their schema; these helpers only touch `order`, `_id` and image URLs.
export type AnyModel = Model<any>;

export type ActionResult = { ok: boolean; message: string };

export const OK = (message: string): ActionResult => ({ ok: true, message });
export const FAIL = (message: string): ActionResult => ({ ok: false, message });

/** Expire the public cache tag (read-your-writes) and refresh the admin list. */
export function invalidate(tag: string, ...paths: string[]) {
  updateTag(tag);
  for (const p of paths) revalidatePath(p);
}

export function isDuplicateKey(err: unknown): boolean {
  return typeof err === "object" && err !== null && (err as { code?: number }).code === 11000;
}

export async function nextOrder(model: AnyModel, filter: Record<string, unknown> = {}): Promise<number> {
  const last = await model.findOne(filter).sort({ order: -1 }).select("order").lean<{ order?: number }>();
  return (last?.order ?? 0) + 1;
}

/** Swap an item with its neighbour, renumbering the whole (filtered) list so orders are always distinct. */
export async function moveItem(
  model: AnyModel,
  id: string,
  direction: "up" | "down",
  filter: Record<string, unknown> = {},
): Promise<boolean> {
  const docs = await model.find(filter).sort({ order: 1, createdAt: 1 }).select("_id").lean<{ _id: unknown }[]>();
  const ids = docs.map((d) => String(d._id));
  const from = ids.indexOf(id);
  const to = direction === "up" ? from - 1 : from + 1;
  if (from < 0 || to < 0 || to >= ids.length) return false;
  [ids[from], ids[to]] = [ids[to], ids[from]];
  await model.bulkWrite(ids.map((_id, i) => ({ updateOne: { filter: { _id }, update: { $set: { order: i + 1 } } } })));
  return true;
}

export type StoredImage = { url?: string } | null | undefined;

/** Best-effort removal of uploaded binaries (/api/uploads/...) that a saved document no longer references. */
export async function removeUnusedImages(before: StoredImage[], after: StoredImage[]): Promise<void> {
  const keep = new Set(after.map((i) => i?.url).filter(Boolean));
  const drop = before.map((i) => i?.url).filter((u): u is string => Boolean(u) && !keep.has(u));
  await Promise.all(drop.map((u) => deleteStoredUpload(u)));
}

/** Common preamble for every admin server action: authorise on the server, then connect. */
export async function adminGuard() {
  const admin = await requireAdmin();
  await connectDB();
  return admin;
}

export function pageParam(value: string | undefined, fallback = 1): number {
  const n = Number.parseInt(value ?? "", 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Authorises, connects and converts unexpected errors into a friendly ActionResult (no stack traces leak). */
export async function guarded(fn: () => Promise<ActionResult>): Promise<ActionResult> {
  await adminGuard();
  try {
    return await fn();
  } catch (err) {
    console.error("[admin action] failed:", err instanceof Error ? err.message : err);
    return FAIL("Something went wrong. Please try again.");
  }
}

export const NOT_FOUND = FAIL("That item no longer exists. Refresh the page.");

const FLAG_TEXT: Record<string, [string, string]> = {
  published: ["published", "unpublished and is now a draft"],
  visible: ["now visible on the site", "hidden from the site"],
  featured: ["marked as featured", "removed from featured"],
};

/** Shared toggle / reorder / delete behaviour so each entity only declares what is special about it. */
export function crudOps(cfg: {
  model: AnyModel;
  tag: string;
  path: string;
  noun: string;
  images?: (doc: any) => StoredImage[];
  scope?: (doc: any) => Record<string, unknown>;
  extraTags?: string[];
}) {
  const refresh = () => {
    invalidate(cfg.tag, cfg.path);
    for (const t of cfg.extraTags ?? []) updateTag(t);
  };
  return {
    toggle(id: string, field: "published" | "visible" | "featured" = "published"): Promise<ActionResult> {
      return guarded(async () => {
        const doc = await cfg.model.findById(id);
        if (!doc) return NOT_FOUND;
        doc[field] = !doc[field];
        await doc.save();
        refresh();
        const [on, off] = FLAG_TEXT[field];
        return OK(`${cfg.noun} ${doc[field] ? on : off}.`);
      });
    },
    move(id: string, direction: "up" | "down"): Promise<ActionResult> {
      return guarded(async () => {
        const doc = await cfg.model.findById(id).select("_id").lean();
        if (!doc) return NOT_FOUND;
        const full = cfg.scope ? await cfg.model.findById(id).lean() : null;
        const moved = await moveItem(cfg.model, id, direction, full && cfg.scope ? cfg.scope(full) : {});
        if (!moved) return FAIL(direction === "up" ? "Already first in the list." : "Already last in the list.");
        refresh();
        return OK("Order updated.");
      });
    },
    remove(id: string): Promise<ActionResult> {
      return guarded(async () => {
        const doc = await cfg.model.findByIdAndDelete(id).lean();
        if (!doc) return NOT_FOUND;
        if (cfg.images) await removeUnusedImages(cfg.images(doc), []);
        refresh();
        return OK(`${cfg.noun} deleted.`);
      });
    },
  };
}
