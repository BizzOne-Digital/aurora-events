import "server-only";
import { connectDB } from "./db";
import { UPLOAD_FOLDERS, type UploadFolder } from "./constants";
import { StoredUploadModel } from "./models";

export const FILENAME_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;

export function isUploadFolder(value: string): value is UploadFolder {
  return (UPLOAD_FOLDERS as readonly string[]).includes(value);
}

/** Safe filename check: no slashes, no traversal, only plain characters. */
export function isSafeFilename(name: string): boolean {
  return FILENAME_PATTERN.test(name) && !name.includes("..") && name.length <= 120;
}

/** `/api/uploads/<folder>/<filename>` -> parts, or null when the URL is not one of ours. */
export function parseUploadUrl(url: string | null | undefined): { folder: UploadFolder; filename: string } | null {
  const m = /^\/api\/uploads\/([a-z]+)\/([^/?#]+)$/.exec(url ?? "");
  if (!m || !isUploadFolder(m[1]) || !isSafeFilename(m[2])) return null;
  return { folder: m[1], filename: m[2] };
}

/** Deletes the stored binary behind an upload URL. Other URLs (bundled /images/, legacy) are ignored. */
export async function deleteStoredUpload(url: string | null | undefined): Promise<void> {
  const parts = parseUploadUrl(url);
  if (!parts) return;
  try {
    await connectDB();
    await StoredUploadModel.deleteOne(parts);
  } catch (err) {
    console.error("[uploads] delete failed", err instanceof Error ? err.message : err);
  }
}
