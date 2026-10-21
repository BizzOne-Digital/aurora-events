import type { Metadata } from "next";
import Link from "next/link";
import { ActionButton, RowActions } from "@/components/admin/row-actions";
import { Badge, EmptyRow, PageHeader, Pager } from "@/components/admin/ui";
import { pageParam } from "@/lib/admin-crud";
import { connectDB } from "@/lib/db";
import { FaqModel } from "@/lib/models";
import { requireAdmin } from "@/lib/session";
import { loadStarterContent } from "../misc-actions";
import { deleteFaq, moveFaq, toggleFaq } from "./actions";

export const metadata: Metadata = { title: "FAQs" };
const PAGE_SIZE = 15;
const PAGES = ["services", "booking", "contact"] as const;

export default async function FaqsAdminPage({ searchParams }: { searchParams: Promise<{ page?: string; show?: string }> }) {
  await requireAdmin();
  await connectDB();
  const sp = await searchParams;
  const page = pageParam(sp.page);
  const show = (PAGES as readonly string[]).includes(sp.show ?? "") ? sp.show : undefined;
  const filter: Record<string, unknown> = show ? { page: show } : {};
  const [total, rows] = await Promise.all([
    FaqModel.countDocuments(filter),
    FaqModel.find(filter)
      .sort({ page: 1, order: 1, createdAt: 1 })
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .lean(),
  ]);

  return (
    <>
      <PageHeader
        title="FAQs"
        subtitle="Questions shown as sections on the Services, Booking and Contact pages. Reordering works within each page."
        action={{ href: "/admin/faqs/new", label: "Add FAQ" }}
      />
      <nav aria-label="Filter by page" className="mb-5 flex flex-wrap gap-2">
        {[undefined, ...PAGES].map((p) => (
          <Link
            key={p ?? "all"}
            href={p ? `/admin/faqs?show=${p}` : "/admin/faqs"}
            aria-current={show === p ? "page" : undefined}
            className={`adm-btn !min-h-9 capitalize ${show === p ? "adm-btn-primary" : "adm-btn-soft"}`}
          >
            {p ?? "All pages"}
          </Link>
        ))}
      </nav>
      {rows.length === 0 ? (
        <EmptyRow
          title="No FAQs here yet"
          text="Add a question, or load the starter FAQs and edit them."
          action={<ActionButton action={loadStarterContent}>Load starter content</ActionButton>}
        />
      ) : (
        <ul className="space-y-3">
          {rows.map((f) => (
            <li key={String(f._id)} className="adm-card flex flex-wrap items-center gap-4 p-4">
              <div className="min-w-0 flex-1 basis-60">
                <p className="font-bold">{f.question}</p>
                <p className="mt-1 line-clamp-2 text-sm text-[#5a4768]">{f.answer}</p>
                <div className="mt-2 flex gap-2">
                  <span className="adm-badge bg-[#efe6f5] capitalize text-plum-800">{f.page}</span>
                  <Badge>{f.published ? "Published" : "Draft"}</Badge>
                </div>
              </div>
              <RowActions id={String(f._id)} itemName={f.question} editHref={`/admin/faqs/${f._id}`} published={f.published} onToggle={toggleFaq} onMove={moveFaq} onDelete={deleteFaq} />
            </li>
          ))}
        </ul>
      )}
      <Pager page={page} total={total} pageSize={PAGE_SIZE} basePath="/admin/faqs" query={{ show }} />
    </>
  );
}
