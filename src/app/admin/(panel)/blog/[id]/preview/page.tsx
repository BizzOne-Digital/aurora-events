import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isValidObjectId } from "mongoose";
import { Article } from "@/components/site/article";
import { connectDB } from "@/lib/db";
import { BlogModel } from "@/lib/models";
import { requireAdmin } from "@/lib/session";

export const metadata: Metadata = { title: "Post preview" };

/** Renders any post, including drafts, with the same sanitised template as the public article page. */
export default async function PreviewPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  if (!isValidObjectId(id)) notFound();
  await connectDB();
  const p = await BlogModel.findById(id).lean();
  if (!p) notFound();
  return (
    <div className="-mx-4 -my-8 sm:-mx-8 sm:-my-10">
      <div className="sticky top-14 z-20 flex flex-wrap items-center justify-between gap-3 bg-plum-900 px-4 py-3 text-sm text-ivory lg:top-0">
        <p>
          <strong>Preview.</strong> {p.published ? "This post is published." : "This post is a draft and is not visible to the public."}
        </p>
        <Link href={`/admin/blog/${id}`} className="adm-btn adm-btn-primary !min-h-9">
          Back to editor
        </Link>
      </div>
      <Article
        post={{
          title: p.title,
          excerpt: p.excerpt,
          coverImage: { url: p.coverImage.url, alt: p.coverImage.alt ?? "" },
          authorName: p.authorName,
          publishedAt: new Date(p.publishedAt).toISOString(),
          body: p.body,
        }}
      />
    </div>
  );
}
