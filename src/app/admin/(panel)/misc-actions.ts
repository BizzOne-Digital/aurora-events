"use server";

import { revalidatePath, updateTag } from "next/cache";
import { adminGuard, FAIL, OK, type ActionResult } from "@/lib/admin-crud";
import { seedStarterContent } from "@/lib/seed";

/** Fills only EMPTY collections with the bundled starter content (never overwrites real content). */
export async function loadStarterContent(): Promise<ActionResult> {
  await adminGuard();
  try {
    const report = await seedStarterContent();
    for (const tag of ["services", "faqs", "gallery", "blog", "settings"]) updateTag(tag);
    revalidatePath("/admin", "layout");
    const added = Object.keys(report);
    return OK(added.length ? `Starter content added: ${added.join(", ")}.` : "Nothing to add. Your collections already have content.");
  } catch (err) {
    console.error("[seed] failed:", err instanceof Error ? err.message : err);
    return FAIL("Could not load starter content.");
  }
}
