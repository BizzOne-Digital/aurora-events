"use server";

import { revalidatePath } from "next/cache";
import { adminGuard, guarded, NOT_FOUND, OK, type ActionResult } from "@/lib/admin-crud";
import { BookingModel } from "@/lib/models";
import { bookingUpdateSchema, formToObject, zodErrors, type FormState } from "@/lib/validation";

export async function updateBooking(id: string, _prev: FormState, formData: FormData): Promise<FormState> {
  await adminGuard();
  const parsed = bookingUpdateSchema.safeParse(formToObject(formData));
  if (!parsed.success) return { ok: false, message: "Please check the fields.", errors: zodErrors(parsed.error) };
  try {
    const doc = await BookingModel.findByIdAndUpdate(id, { $set: parsed.data }, { returnDocument: "after" }).select("_id").lean();
    if (!doc) return { ok: false, message: "This inquiry no longer exists." };
  } catch (err) {
    console.error("[booking update]", err instanceof Error ? err.message : err);
    return { ok: false, message: "Could not save changes. Please try again." };
  }
  revalidatePath("/admin", "layout");
  return { ok: true, message: "Inquiry updated." };
}

export async function deleteBooking(id: string): Promise<ActionResult> {
  return guarded(async () => {
    const doc = await BookingModel.findByIdAndDelete(id).select("_id").lean();
    if (!doc) return NOT_FOUND;
    revalidatePath("/admin", "layout");
    return OK("Inquiry deleted.");
  });
}
