import type { Metadata } from "next";
import { ActionButton, RowActions } from "@/components/admin/row-actions";
import { Badge, EmptyRow, PageHeader, Pager, Thumb } from "@/components/admin/ui";
import { pageParam } from "@/lib/admin-crud";
import { connectDB } from "@/lib/db";
import { GalleryModel } from "@/lib/models";
import { requireAdmin } from "@/lib/session";
import { loadStarterContent } from "../misc-actions";
import { deleteGalleryItem, moveGalleryItem, toggleGalleryItem } from "./actions";

export const metadata: Metadata = { title: "Gallery" };
const PAGE_SIZE = 12;

export default async function GalleryAdminPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  await requireAdmin();
  await connectDB();
  const page = pageParam((await searchParams).page);
  const [total, rows] = await Promise.all([
    GalleryModel.countDocuments(),
    GalleryModel.find()
      .sort({ order: 1, createdAt: 1 })
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .lean(),
  ]);
  return (
    <>
      <PageHeader
        title="Gallery"
        subtitle="Upload images, edit captions, categories and alt text, and control their order and visibility."
        action={{ href: "/admin/gallery/new", label: "Upload image" }}
      />
      {rows.length === 0 ? (
        <EmptyRow title="The gallery is empty" text="Upload your first image, or load the starter set of illustrative photos." action={<ActionButton action={loadStarterContent}>Load starter content</ActionButton>} />
      ) : (
        <ul className="space-y-3">
          {rows.map((g) => (
            <li key={String(g._id)} className="adm-card flex flex-wrap items-center gap-4 p-4">
              <Thumb url={g.image.url} alt={g.image.alt} />
              <div className="min-w-0 flex-1 basis-48">
                <p className="truncate font-bold">{g.caption || "(no caption)"}</p>
                <p className="truncate text-xs text-[#7a6a89]">{g.image.alt || "No alt text"}</p>
                <div className="mt-1.5 flex flex-wrap gap-2">
                  <span className="adm-badge bg-[#efe6f5] text-plum-800">{g.category}</span>
                  <Badge>{g.published ? "Published" : "Draft"}</Badge>
                  {g.illustrative && <span className="adm-badge bg-[#f3f3f3] text-[#555]">Illustrative</span>}
                </div>
              </div>
              <RowActions
                id={String(g._id)}
                itemName={g.caption || g.image.alt || "image"}
                editHref={`/admin/gallery/${g._id}`}
                published={g.published}
                onToggle={toggleGalleryItem}
                onMove={moveGalleryItem}
                onDelete={deleteGalleryItem}
              />
            </li>
          ))}
        </ul>
      )}
      <Pager page={page} total={total} pageSize={PAGE_SIZE} basePath="/admin/gallery" />
    </>
  );
}
