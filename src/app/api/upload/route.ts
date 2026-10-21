import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { UPLOAD_FOLDERS } from "@/lib/constants";
import { connectDB } from "@/lib/db";
import { MAX_UPLOAD_BYTES, MIME_EXT, sniffImageType } from "@/lib/image-sniff";
import { StoredUploadModel } from "@/lib/models";
import { rateLimit } from "@/lib/rate-limit";
import { getAdmin } from "@/lib/session";
import { isUploadFolder } from "@/lib/uploads";

export const runtime = "nodejs";

const json = (body: Record<string, unknown>, status: number) =>
  NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });

/** Stores an uploaded image in MongoDB (works on read-only / serverless hosts such as Vercel). */
export async function POST(request: Request) {
  // 1. Authorisation on the server. Hiding the upload button is not security.
  const admin = await getAdmin();
  if (!admin) return json({ success: false, error: "You must be signed in to upload images." }, 401);

  // 2. Same-origin only (defence in depth on top of the SameSite=Lax session cookie).
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (origin && host && new URL(origin).host !== host) return json({ success: false, error: "Cross-site uploads are not allowed." }, 403);

  try {
    const limit = await rateLimit(`upload:${admin.id}`, 60, 10 * 60);
    if (!limit.ok) return json({ success: false, error: "Too many uploads. Please wait a few minutes." }, 429);

    const declared = Number(request.headers.get("content-length") ?? 0);
    if (declared > MAX_UPLOAD_BYTES + 512 * 1024) return json({ success: false, error: "Image is larger than 8 MB." }, 413);

    const form = await request.formData();
    const folder = String(form.get("folder") ?? "misc");
    if (!isUploadFolder(folder)) {
      return json({ success: false, error: `Unknown folder. Use one of: ${UPLOAD_FOLDERS.join(", ")}.` }, 400);
    }
    const file = form.get("file");
    if (!(file instanceof File)) return json({ success: false, error: "No image was provided." }, 400);
    if (file.size === 0) return json({ success: false, error: "That file is empty." }, 400);
    if (file.size > MAX_UPLOAD_BYTES) return json({ success: false, error: "Image is larger than 8 MB." }, 413);

    const buffer = Buffer.from(await file.arrayBuffer());
    const mimeType = sniffImageType(buffer); // trust the bytes, not the filename or declared type
    if (!mimeType) return json({ success: false, error: "Only JPG, PNG, WebP or GIF images are allowed." }, 415);

    const filename = `${Date.now()}-${randomBytes(6).toString("hex")}.${MIME_EXT[mimeType]}`;
    await connectDB();
    await StoredUploadModel.create({ folder, filename, mimeType, size: buffer.length, data: buffer });

    return json({ success: true, url: `/api/uploads/${folder}/${filename}`, filename, size: buffer.length, folder }, 201);
  } catch (err) {
    console.error("[upload] failed:", err instanceof Error ? err.message : err);
    return json({ success: false, error: "The upload failed. Please try again." }, 500);
  }
}
