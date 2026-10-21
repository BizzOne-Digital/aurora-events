"use server";

import { redirect } from "next/navigation";
import {
  adminGuard,
  crudOps,
  invalidate,
  isDuplicateKey,
  nextOrder,
  removeUnusedImages,
  type ActionResult,
} from "@/lib/admin-crud";
import { ServiceModel } from "@/lib/models";
import { formToObject, serviceSchema, zodErrors, type FormState } from "@/lib/validation";

const ops = crudOps({
  model: ServiceModel,
  tag: "services",
  path: "/admin/services",
  noun: "Service",
  images: (d) => [d.coverImage, ...(d.gallery ?? [])],
});

export async function saveService(id: string | null, _prev: FormState, formData: FormData): Promise<FormState> {
  await adminGuard();
  const parsed = serviceSchema.safeParse(formToObject(formData));
  if (!parsed.success) return { ok: false, message: "Please fix the highlighted fields.", errors: zodErrors(parsed.error) };
  const d = parsed.data;

  try {
    if (id) {
      const doc = await ServiceModel.findById(id);
      if (!doc) return { ok: false, message: "This service no longer exists." };
      const before = [doc.coverImage, ...doc.gallery];
      doc.set(d);
      await doc.save();
      await removeUnusedImages(before, [d.coverImage, ...d.gallery]);
    } else {
      await ServiceModel.create({ ...d, order: await nextOrder(ServiceModel) });
    }
  } catch (err) {
    if (isDuplicateKey(err)) return { ok: false, message: "That slug is already in use.", errors: { slug: "Another service already uses this slug." } };
    console.error("[service save]", err instanceof Error ? err.message : err);
    return { ok: false, message: "Could not save the service. Please try again." };
  }
  invalidate("services", "/admin/services");
  if (!id) redirect("/admin/services");
  return { ok: true, message: "Service saved." };
}

export async function toggleService(id: string): Promise<ActionResult> {
  return ops.toggle(id, "published");
}
export async function toggleFeaturedService(id: string): Promise<ActionResult> {
  return ops.toggle(id, "featured");
}
export async function moveService(id: string, direction: "up" | "down"): Promise<ActionResult> {
  return ops.move(id, direction);
}
export async function deleteService(id: string): Promise<ActionResult> {
  return ops.remove(id);
}
