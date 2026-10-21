import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isValidObjectId } from "mongoose";
import { EntityForm } from "@/components/admin/entity-form";
import { PageHeader } from "@/components/admin/ui";
import { connectDB } from "@/lib/db";
import { BlogModel } from "@/lib/models";
import { requireAdmin } from "@/lib/session";
import { previewMarkdown, saveBlogPost } from "../actions";
import { BLOG_FIELDS } from "../fields";

export const metadata: Metadata = { title: "Edit post" };

export default async function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  if (!isValidObjectId(id)) notFound();
  await connectDB();
  const p = await BlogModel.findById(id).lean();
  if (!p) notFound();
  return (
    <>
      <PageHeader
        title={`Edit: ${p.title}`}
        action={
          <div className="flex gap-2">
            <Link href={`/admin/blog/${id}/preview`} className="adm-btn adm-btn-soft !min-h-11">
              Full preview
            </Link>
            {p.published && (
              <a href={`/blog/${p.slug}`} target="_blank" rel="noopener noreferrer" className="adm-btn adm-btn-soft !min-h-11">
                View live
              </a>
            )}
          </div>
        }
      />
      <EntityForm
        fields={BLOG_FIELDS}
        initial={{
          title: p.title,
          slug: p.slug,
          excerpt: p.excerpt,
          coverImage: p.coverImage ? { url: p.coverImage.url, alt: p.coverImage.alt ?? "", publicId: p.coverImage.publicId ?? "" } : null,
          body: p.body,
          authorName: p.authorName,
          publishedAt: new Date(p.publishedAt).toISOString().slice(0, 10),
          published: p.published,
          seoTitle: p.seoTitle ?? "",
          seoDescription: p.seoDescription ?? "",
        }}
        action={saveBlogPost.bind(null, id)}
        previewAction={previewMarkdown}
        submitLabel="Save changes"
        cancelHref="/admin/blog"
      />
    </>
  );
}
