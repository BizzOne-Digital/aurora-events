"use server";

import { redirect } from "next/navigation";
import { adminGuard, crudOps, invalidate, nextOrder, type ActionResult } from "@/lib/admin-crud";
import { FaqModel } from "@/lib/models";
import { faqSchema, formToObject, zodErrors, type FormState } from "@/lib/validation";

const ops = crudOps({ model: FaqModel, tag: "faqs", path: "/admin/faqs", noun: "FAQ", scope: (d) => ({ page: d.page }) });

export async function saveFaq(id: string | null, _prev: FormState, formData: FormData): Promise<FormState> {
  await adminGuard();
  const parsed = faqSchema.safeParse(formToObject(formData));
  if (!parsed.success) return { ok: false, message: "Please fix the highlighted fields.", errors: zodErrors(parsed.error) };
  const d = parsed.data;
  try {
    if (id) {
      const doc = await FaqModel.findById(id);
      if (!doc) return { ok: false, message: "This FAQ no longer exists." };
      doc.set(d);
      await doc.save();
    } else {
      await FaqModel.create({ ...d, order: await nextOrder(FaqModel, { page: d.page }) });
    }
  } catch (err) {
    console.error("[faq save]", err instanceof Error ? err.message : err);
    return { ok: false, message: "Could not save the FAQ. Please try again." };
  }
  invalidate("faqs", "/admin/faqs");
  if (!id) redirect("/admin/faqs");
  return { ok: true, message: "FAQ saved." };
}

export async function toggleFaq(id: string): Promise<ActionResult> {
  return ops.toggle(id, "published");
}
export async function moveFaq(id: string, direction: "up" | "down"): Promise<ActionResult> {
  return ops.move(id, direction);
}
export async function deleteFaq(id: string): Promise<ActionResult> {
  return ops.remove(id);
}
