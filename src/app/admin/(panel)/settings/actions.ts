"use server";

import { adminGuard, invalidate } from "@/lib/admin-crud";
import { SettingsModel } from "@/lib/models";
import { formToObject, settingsSchema, zodErrors, type FormState } from "@/lib/validation";

export async function saveSettings(_prev: FormState, formData: FormData): Promise<FormState> {
  await adminGuard();
  const parsed = settingsSchema.safeParse(formToObject(formData));
  if (!parsed.success) return { ok: false, message: "Please fix the highlighted fields.", errors: zodErrors(parsed.error) };
  const { facebook, instagram, linkedin, tiktok, youtube, ...rest } = parsed.data;
  try {
    await SettingsModel.findOneAndUpdate(
      { key: "main" },
      { $set: { ...rest, social: { facebook, instagram, linkedin, tiktok, youtube } }, $setOnInsert: { key: "main" } },
      { upsert: true },
    );
  } catch (err) {
    console.error("[settings save]", err instanceof Error ? err.message : err);
    return { ok: false, message: "Could not save settings. Please try again." };
  }
  invalidate("settings", "/admin/settings");
  return { ok: true, message: "Website settings saved. The public site is updated." };
}
