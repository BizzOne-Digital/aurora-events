"use server";

import { redirect } from "next/navigation";
import { adminGuard, crudOps, invalidate, nextOrder, type ActionResult } from "@/lib/admin-crud";
import { TestimonialModel } from "@/lib/models";
import { formToObject, testimonialSchema, zodErrors, type FormState } from "@/lib/validation";

const ops = crudOps({ model: TestimonialModel, tag: "testimonials", path: "/admin/testimonials", noun: "Testimonial" });

export async function saveTestimonial(id: string | null, _prev: FormState, formData: FormData): Promise<FormState> {
  await adminGuard();
  const parsed = testimonialSchema.safeParse(formToObject(formData));
  if (!parsed.success) return { ok: false, message: "Please fix the highlighted fields.", errors: zodErrors(parsed.error) };
  try {
    if (id) {
      const doc = await TestimonialModel.findById(id);
      if (!doc) return { ok: false, message: "This testimonial no longer exists." };
      doc.set({ ...parsed.data, isDemo: false }); // editing a demo entry turns it into real content
      await doc.save();
    } else {
      await TestimonialModel.create({ ...parsed.data, order: await nextOrder(TestimonialModel) });
    }
  } catch (err) {
    console.error("[testimonial save]", err instanceof Error ? err.message : err);
    return { ok: false, message: "Could not save the testimonial. Please try again." };
  }
  invalidate("testimonials", "/admin/testimonials");
  if (!id) redirect("/admin/testimonials");
  return { ok: true, message: "Testimonial saved." };
}

export async function toggleTestimonial(id: string): Promise<ActionResult> {
  return ops.toggle(id, "published");
}
export async function toggleFeaturedTestimonial(id: string): Promise<ActionResult> {
  return ops.toggle(id, "featured");
}
export async function moveTestimonial(id: string, direction: "up" | "down"): Promise<ActionResult> {
  return ops.move(id, direction);
}
export async function deleteTestimonial(id: string): Promise<ActionResult> {
  return ops.remove(id);
}
