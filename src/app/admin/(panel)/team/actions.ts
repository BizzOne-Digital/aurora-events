"use server";

import { redirect } from "next/navigation";
import { adminGuard, crudOps, invalidate, nextOrder, removeUnusedImages, type ActionResult } from "@/lib/admin-crud";
import { TeamModel } from "@/lib/models";
import { formToObject, teamSchema, zodErrors, type FormState } from "@/lib/validation";

const ops = crudOps({ model: TeamModel, tag: "team", path: "/admin/team", noun: "Team member", images: (d) => [d.photo] });

export async function saveTeamMember(id: string | null, _prev: FormState, formData: FormData): Promise<FormState> {
  await adminGuard();
  const parsed = teamSchema.safeParse(formToObject(formData));
  if (!parsed.success) return { ok: false, message: "Please fix the highlighted fields.", errors: zodErrors(parsed.error) };
  const { photo, ...rest } = parsed.data;
  try {
    if (id) {
      const doc = await TeamModel.findById(id);
      if (!doc) return { ok: false, message: "This team member no longer exists." };
      const before = [doc.photo];
      doc.set({ ...rest, isDemo: false }); // editing a demo entry turns it into real content
      doc.set("photo", photo ?? undefined);
      await doc.save();
      await removeUnusedImages(before, [photo]);
    } else {
      await TeamModel.create({ ...rest, ...(photo ? { photo } : {}), order: await nextOrder(TeamModel) });
    }
  } catch (err) {
    console.error("[team save]", err instanceof Error ? err.message : err);
    return { ok: false, message: "Could not save the team member. Please try again." };
  }
  invalidate("team", "/admin/team");
  if (!id) redirect("/admin/team");
  return { ok: true, message: "Team member saved." };
}

export async function toggleTeamMember(id: string): Promise<ActionResult> {
  return ops.toggle(id, "visible");
}
export async function moveTeamMember(id: string, direction: "up" | "down"): Promise<ActionResult> {
  return ops.move(id, direction);
}
export async function deleteTeamMember(id: string): Promise<ActionResult> {
  return ops.remove(id);
}
