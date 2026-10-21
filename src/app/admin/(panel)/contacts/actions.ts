"use server";

import { revalidatePath } from "next/cache";
import { adminGuard, FAIL, guarded, NOT_FOUND, OK, type ActionResult } from "@/lib/admin-crud";
import { CONTACT_STATUSES } from "@/lib/constants";
import { ContactModel } from "@/lib/models";
import { contactUpdateSchema, formToObject, zodErrors, type FormState } from "@/lib/validation";

export async function updateContact(id: string, _prev: FormState, formData: FormData): Promise<FormState> {
  await adminGuard();
  const parsed = contactUpdateSchema.safeParse(formToObject(formData));
  if (!parsed.success) return { ok: false, message: "Please check the fields.", errors: zodErrors(parsed.error) };
  try {
    const doc = await ContactModel.findByIdAndUpdate(id, { $set: parsed.data }).select("_id").lean();
    if (!doc) return { ok: false, message: "This message no longer exists." };
  } catch (err) {
    console.error("[contact update]", err instanceof Error ? err.message : err);
    return { ok: false, message: "Could not save changes. Please try again." };
  }
  revalidatePath("/admin", "layout");
  return { ok: true, message: "Message updated." };
}

/** Quick status change from the list ("Mark read" / "Resolve"). */
export async function markContact(id: string, status: string): Promise<ActionResult> {
  if (!(CONTACT_STATUSES as readonly string[]).includes(status)) {
    await adminGuard();
    return FAIL("Unknown status.");
  }
  return guarded(async () => {
    const doc = await ContactModel.findByIdAndUpdate(id, { $set: { status } }).select("_id").lean();
    if (!doc) return NOT_FOUND;
    revalidatePath("/admin", "layout");
    return OK(`Marked as ${status.toLowerCase()}.`);
  });
}

export async function deleteContact(id: string): Promise<ActionResult> {
  return guarded(async () => {
    const doc = await ContactModel.findByIdAndDelete(id).select("_id").lean();
    if (!doc) return NOT_FOUND;
    revalidatePath("/admin", "layout");
    return OK("Message deleted.");
  });
}
