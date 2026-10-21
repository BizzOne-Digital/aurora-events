import type { Metadata } from "next";
import Link from "next/link";
import { ActionButton, ConfirmDelete } from "@/components/admin/row-actions";
import { Badge, EmptyRow, PageHeader, Pager } from "@/components/admin/ui";
import { escapeRegex, pageParam } from "@/lib/admin-crud";
import { CONTACT_STATUSES } from "@/lib/constants";
import { connectDB } from "@/lib/db";
import { ContactModel } from "@/lib/models";
import { requireAdmin } from "@/lib/session";
import { formatDate } from "@/lib/site";
import { deleteContact, markContact } from "./actions";

export const metadata: Metadata = { title: "Contact messages" };
const PAGE_SIZE = 15;

export default async function ContactsAdminPage({ searchParams }: { searchParams: Promise<{ page?: string; q?: string; status?: string }> }) {
  await requireAdmin();
  await connectDB();
  const sp = await searchParams;
  const page = pageParam(sp.page);
  const q = (sp.q ?? "").trim().slice(0, 80);
  const status = (CONTACT_STATUSES as readonly string[]).includes(sp.status ?? "") ? sp.status : undefined;

  const filter: Record<string, unknown> = {};
  if (status) filter.status = status;
  if (q) {
    const rx = new RegExp(escapeRegex(q), "i");
    filter.$or = [{ name: rx }, { email: rx }, { message: rx }];
  }
  const [total, rows] = await Promise.all([
    ContactModel.countDocuments(filter),
    ContactModel.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .lean(),
  ]);
  const filtered = Boolean(q || status);

  return (
    <>
      <PageHeader title="Contact messages" subtitle="Messages from the contact form. Mark them as read or resolved and keep private notes." />
      <form method="get" role="search" aria-label="Filter messages" className="adm-card mb-6 grid gap-4 p-5 sm:grid-cols-[1fr_12rem_auto] sm:items-end">
        <div>
          <label htmlFor="q" className="adm-label">
            Search
          </label>
          <input id="q" name="q" defaultValue={q} className="adm-field" placeholder="Name, email or message text" />
        </div>
        <div>
          <label htmlFor="status" className="adm-label">
            Status
          </label>
          <select id="status" name="status" defaultValue={status ?? ""} className="adm-field">
            <option value="">All</option>
            {CONTACT_STATUSES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <button type="submit" className="adm-btn adm-btn-primary">
            Filter
          </button>
          {filtered && (
            <Link href="/admin/contacts" className="adm-btn adm-btn-soft">
              Clear
            </Link>
          )}
        </div>
      </form>

      {rows.length === 0 ? (
        <EmptyRow title={filtered ? "No messages match" : "No messages yet"} text={filtered ? "Try a different search or clear the filters." : "Messages sent from the Contact page will appear here."} />
      ) : (
        <ul className="space-y-3">
          {rows.map((c) => {
            const id = String(c._id);
            return (
              <li key={id} className="adm-card p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <Link href={`/admin/contacts/${id}`} className="min-w-0 flex-1 basis-64 hover:underline">
                    <span className="block font-bold">{c.name}</span>
                    <span className="block text-xs text-[#7a6a89]">
                      {c.email}
                      {c.phone ? ` · ${c.phone}` : ""} &middot; {formatDate(c.createdAt)}
                    </span>
                    <span className="mt-2 line-clamp-2 block text-sm text-[#5a4768]">{c.message}</span>
                  </Link>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge>{c.status}</Badge>
                    {c.status === "New" && <ActionButton className="adm-btn adm-btn-soft !min-h-9" action={markContact.bind(null, id, "Read")}>Mark read</ActionButton>}
                    {c.status !== "Resolved" && <ActionButton className="adm-btn adm-btn-soft !min-h-9" action={markContact.bind(null, id, "Resolved")}>Resolve</ActionButton>}
                    <Link href={`/admin/contacts/${id}`} className="adm-btn adm-btn-primary !min-h-9">
                      Open
                    </Link>
                    <ConfirmDelete id={id} itemName={`message from ${c.name}`} onDelete={deleteContact} />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <Pager page={page} total={total} pageSize={PAGE_SIZE} basePath="/admin/contacts" query={{ q, status }} />
    </>
  );
}
