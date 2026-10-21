import type { Metadata } from "next";
import { FlagButton, RowActions } from "@/components/admin/row-actions";
import { Badge, EmptyRow, PageHeader, Pager } from "@/components/admin/ui";
import { pageParam } from "@/lib/admin-crud";
import { connectDB } from "@/lib/db";
import { TestimonialModel } from "@/lib/models";
import { requireAdmin } from "@/lib/session";
import { deleteTestimonial, moveTestimonial, toggleFeaturedTestimonial, toggleTestimonial } from "./actions";

export const metadata: Metadata = { title: "Testimonials" };
const PAGE_SIZE = 10;

export default async function TestimonialsAdminPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  await requireAdmin();
  await connectDB();
  const page = pageParam((await searchParams).page);
  const [total, rows] = await Promise.all([
    TestimonialModel.countDocuments(),
    TestimonialModel.find()
      .sort({ order: 1, createdAt: 1 })
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .lean(),
  ]);
  return (
    <>
      <PageHeader
        title="Testimonials"
        subtitle="Add genuine client feedback only. Unpublished entries never appear on the public site."
        action={{ href: "/admin/testimonials/new", label: "Add testimonial" }}
      />
      {rows.length === 0 ? (
        <EmptyRow title="No testimonials yet" text="The public Testimonials page shows an elegant empty state until you add and publish real feedback." />
      ) : (
        <ul className="space-y-3">
          {rows.map((t) => (
            <li key={String(t._id)} className="adm-card flex flex-wrap items-center gap-4 p-4">
              <div className="min-w-0 flex-1 basis-60">
                <p className="font-display line-clamp-2 text-xl leading-snug">&ldquo;{t.quote}&rdquo;</p>
                <p className="mt-1.5 text-sm">
                  <span className="font-bold">{t.authorName}</span>
                  {t.attribution && <span className="text-[#7a6a89]"> &middot; {t.attribution}</span>}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Badge>{t.published ? "Published" : "Draft"}</Badge>
                  <FlagButton id={String(t._id)} on={t.featured} onLabel="Featured" offLabel="Not featured" action={toggleFeaturedTestimonial} />
                  {t.isDemo && <span className="adm-badge bg-[#fff0d6] text-[#7a5200]">Demo content</span>}
                </div>
              </div>
              <RowActions
                id={String(t._id)}
                itemName={t.authorName}
                editHref={`/admin/testimonials/${t._id}`}
                published={t.published}
                onToggle={toggleTestimonial}
                onMove={moveTestimonial}
                onDelete={deleteTestimonial}
              />
            </li>
          ))}
        </ul>
      )}
      <Pager page={page} total={total} pageSize={PAGE_SIZE} basePath="/admin/testimonials" />
    </>
  );
}
