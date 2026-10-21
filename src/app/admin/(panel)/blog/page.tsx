import type { Metadata } from "next";
import Link from "next/link";
import { ActionButton, RowActions } from "@/components/admin/row-actions";
import { Badge, EmptyRow, PageHeader, Pager, Thumb } from "@/components/admin/ui";
import { pageParam } from "@/lib/admin-crud";
import { connectDB } from "@/lib/db";
import { BlogModel } from "@/lib/models";
import { requireAdmin } from "@/lib/session";
import { formatDate } from "@/lib/site";
import { loadStarterContent } from "../misc-actions";
import { deleteBlogPost, toggleBlogPost } from "./actions";

export const metadata: Metadata = { title: "Blog" };
const PAGE_SIZE = 10;
const isFuture = (d: Date) => new Date(d).getTime() > Date.now();

export default async function BlogAdminPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  await requireAdmin();
  await connectDB();
  const page = pageParam((await searchParams).page);
  const [total, rows] = await Promise.all([
    BlogModel.countDocuments(),
    BlogModel.find()
      .select("title slug coverImage published publishedAt authorName")
      .sort({ publishedAt: -1 })
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .lean(),
  ]);
  return (
    <>
      <PageHeader
        title="Blog"
        subtitle="Write, preview and publish articles. Drafts and future-dated posts stay hidden from the public site."
        action={{ href: "/admin/blog/new", label: "New post" }}
      />
      {rows.length === 0 ? (
        <EmptyRow title="No posts yet" text="Write your first article, or load the starter articles and edit them." action={<ActionButton action={loadStarterContent}>Load starter content</ActionButton>} />
      ) : (
        <ul className="space-y-3">
          {rows.map((p) => {
            const scheduled = p.published && isFuture(p.publishedAt);
            return (
              <li key={String(p._id)} className="adm-card flex flex-wrap items-center gap-4 p-4">
                <Thumb url={p.coverImage?.url} alt={p.coverImage?.alt} />
                <div className="min-w-0 flex-1 basis-56">
                  <p className="truncate font-bold">{p.title}</p>
                  <p className="truncate text-xs text-[#7a6a89]">
                    /blog/{p.slug} &middot; {p.authorName} &middot; {formatDate(p.publishedAt)}
                  </p>
                  <div className="mt-1.5 flex gap-2">
                    <Badge>{p.published ? "Published" : "Draft"}</Badge>
                    {scheduled && <span className="adm-badge bg-[#e5eefc] text-[#1d4a9b]">Scheduled</span>}
                  </div>
                </div>
                <RowActions id={String(p._id)} itemName={p.title} editHref={`/admin/blog/${p._id}`} published={p.published} onToggle={toggleBlogPost} onDelete={deleteBlogPost}>
                  <Link href={`/admin/blog/${p._id}/preview`} className="adm-btn adm-btn-soft !min-h-9">
                    Preview
                  </Link>
                </RowActions>
              </li>
            );
          })}
        </ul>
      )}
      <Pager page={page} total={total} pageSize={PAGE_SIZE} basePath="/admin/blog" />
    </>
  );
}
