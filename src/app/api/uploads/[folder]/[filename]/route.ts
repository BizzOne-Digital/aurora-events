import { connectDB } from "@/lib/db";
import { StoredUploadModel } from "@/lib/models";
import { isSafeFilename, isUploadFolder } from "@/lib/uploads";

export const runtime = "nodejs";

const notFound = () => new Response("Not found", { status: 404, headers: { "Cache-Control": "no-store" } });

/** Streams a stored image. Filenames are unique, so responses are safe to cache forever. */
export async function GET(_request: Request, { params }: { params: Promise<{ folder: string; filename: string }> }) {
  const { folder, filename } = await params;
  if (!isUploadFolder(folder) || !isSafeFilename(filename)) return notFound();

  try {
    await connectDB();
    const doc = await StoredUploadModel.findOne({ folder, filename }).select("mimeType size data").lean();
    if (!doc) return notFound();
    // `.lean()` returns a BSON Binary for Buffer fields; normalise to a Buffer.
    const raw = doc.data as unknown as { buffer?: Uint8Array } | Buffer;
    const bytes = Buffer.isBuffer(raw) ? raw : Buffer.from((raw as { buffer: Uint8Array }).buffer);

    return new Response(new Uint8Array(bytes), {
      status: 200,
      headers: {
        "Content-Type": doc.mimeType,
        "Content-Length": String(bytes.length),
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "default-src 'none'; sandbox",
      },
    });
  } catch (err) {
    console.error("[uploads] read failed:", err instanceof Error ? err.message : err);
    return new Response("Could not load image", { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}
