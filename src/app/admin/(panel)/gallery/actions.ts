"use server";

import { redirect } from "next/navigation";
import { adminGuard, crudOps, invalidate, nextOrder, removeUnusedImages, type ActionResult } from "@/lib/admin-crud";
import { GalleryModel } from "@/lib/models";
import { formToObject, galleryItemSchema, zodErrors, type FormState } from "@/lib/validation";

const ops = crudOps({ model: GalleryModel, tag: "gallery", path: "/admin/gallery", noun: "Gallery image", images: (d) => [d.image] });

export async function saveGalleryItem(id: string | null, _prev: FormState, formData: FormData): Promise<FormState> {
  await adminGuard();
  const parsed = galleryItemSchema.safeParse(formToObject(formData));
  if (!parsed.success) return { ok: false, message: "Please fix the highlighted fields.", errors: zodErrors(parsed.error) };
  const d = parsed.data;
  try {
    if (id) {
      const doc = await GalleryModel.findById(id);
      if (!doc) return { ok: false, message: "This image no longer exists." };
      const before = [doc.image];
      doc.set(d);
      await doc.save();
      await removeUnusedImages(before, [d.image]);
    } else {
      await GalleryModel.create({ ...d, order: await nextOrder(GalleryModel) });
    }
  } catch (err) {
    console.error("[gallery save]", err instanceof Error ? err.message : err);
    return { ok: false, message: "Could not save the image. Please try again." };
  }
  invalidate("gallery", "/admin/gallery");
  if (!id) redirect("/admin/gallery");
  return { ok: true, message: "Gallery image saved." };
}

export async function toggleGalleryItem(id: string): Promise<ActionResult> {
  return ops.toggle(id, "published");
}
export async function moveGalleryItem(id: string, direction: "up" | "down"): Promise<ActionResult> {
  return ops.move(id, direction);
}
export async function deleteGalleryItem(id: string): Promise<ActionResult> {
  return ops.remove(id);
}
