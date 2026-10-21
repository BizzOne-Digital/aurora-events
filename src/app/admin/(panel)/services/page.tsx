import type { Metadata } from "next";
import { FlagButton, RowActions } from "@/components/admin/row-actions";
import { Badge, EmptyRow, PageHeader, Pager, Thumb } from "@/components/admin/ui";
import { ActionButton } from "@/components/admin/row-actions";
import { connectDB } from "@/lib/db";
import { pageParam } from "@/lib/admin-crud";
import { ServiceModel } from "@/lib/models";
import { requireAdmin } from "@/lib/session";
import { loadStarterContent } from "../misc-actions";
import { deleteService, moveService, toggleFeaturedService, toggleService } from "./actions";

export const metadata: Metadata = { title: "Services" };
const PAGE_SIZE = 10;

export default async function ServicesAdminPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  await requireAdmin();
  await connectDB();
  const page = pageParam((await searchParams).page);
  const [total, rows] = await Promise.all([
    ServiceModel.countDocuments(),
    ServiceModel.find()
      .sort({ order: 1, createdAt: 1 })
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .lean(),
  ]);

  return (
    <>
      <PageHeader
        title="Services"
        subtitle="The service categories shown on the home and services pages. Reorder with the arrows; drafts stay hidden."
        action={{ href: "/admin/services/new", label: "Add service" }}
      />
      {rows.length === 0 ? (
        <EmptyRow
          title="No services yet"
          text="Add your first service, or load the six starter categories and edit them."
          action={<ActionButton action={loadStarterContent}>Load starter content</ActionButton>}
        />
      ) : (
        <ul className="space-y-3">
          {rows.map((s) => (
            <li key={String(s._id)} className="adm-card flex flex-wrap items-center gap-4 p-4">
              <Thumb url={s.coverImage?.url} alt={s.coverImage?.alt} />
              <div className="min-w-0 flex-1 basis-48">
                <p className="truncate font-bold">{s.title}</p>
                <p className="truncate text-xs text-[#7a6a89]">/{s.slug}</p>
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  <Badge>{s.published ? "Published" : "Draft"}</Badge>
                  <FlagButton id={String(s._id)} on={s.featured} onLabel="Featured" offLabel="Not featured" action={toggleFeaturedService} />
                  <span className="text-xs text-[#7a6a89]">{s.gallery?.length ?? 0} extra {s.gallery?.length === 1 ? "image" : "images"}</span>
                </div>
              </div>
              <RowActions
                id={String(s._id)}
                itemName={s.title}
                editHref={`/admin/services/${s._id}`}
                published={s.published}
                onToggle={toggleService}
                onMove={moveService}
                onDelete={deleteService}
              />
            </li>
          ))}
        </ul>
      )}
      <Pager page={page} total={total} pageSize={PAGE_SIZE} basePath="/admin/services" />
    </>
  );
}
