"use server";

import { redirect } from "next/navigation";
import { adminGuard, crudOps, invalidate, isDuplicateKey, removeUnusedImages, type ActionResult } from "@/lib/admin-crud";
import { BlogModel } from "@/lib/models";
import { renderMarkdown } from "@/lib/sanitize";
import { blogSchema, formToObject, zodErrors, type FormState } from "@/lib/validation";

const ops = crudOps({ model: BlogModel, tag: "blog", path: "/admin/blog", noun: "Post", images: (d) => [d.coverImage] });

export async function saveBlogPost(id: string | null, _prev: FormState, formData: FormData): Promise<FormState> {
  await adminGuard();
  const parsed = blogSchema.safeParse(formToObject(formData));
  if (!parsed.success) return { ok: false, message: "Please fix the highlighted fields.", errors: zodErrors(parsed.error) };
  const { publishedAt, ...d } = parsed.data;
  const when = publishedAt ? new Date(`${publishedAt}T00:00:00Z`) : new Date();

  try {
    if (id) {
      const doc = await BlogModel.findById(id);
      if (!doc) return { ok: false, message: "This post no longer exists." };
      const before = [doc.coverImage];
      doc.set({ ...d, publishedAt: publishedAt ? when : doc.publishedAt });
      await doc.save();
      await removeUnusedImages(before, [d.coverImage]);
    } else {
      await BlogModel.create({ ...d, publishedAt: when });
    }
  } catch (err) {
    if (isDuplicateKey(err)) return { ok: false, message: "That slug is already in use.", errors: { slug: "Another post already uses this slug." } };
    console.error("[blog save]", err instanceof Error ? err.message : err);
    return { ok: false, message: "Could not save the post. Please try again." };
  }
  invalidate("blog", "/admin/blog");
  if (!id) redirect("/admin/blog");
  return { ok: true, message: d.published ? "Post saved and published." : "Draft saved." };
}

export async function toggleBlogPost(id: string): Promise<ActionResult> {
  return ops.toggle(id, "published");
}
export async function deleteBlogPost(id: string): Promise<ActionResult> {
  return ops.remove(id);
}

/** Authorised, sanitised Markdown preview for the editor's Preview tab. */
export async function previewMarkdown(markdown: string): Promise<{ html: string }> {
  await adminGuard();
  return { html: renderMarkdown(String(markdown).slice(0, 60000)) };
}
