import type { Metadata } from "next";
import Link from "next/link";
import { Badge, EmptyRow, PageHeader, Pager } from "@/components/admin/ui";
import { escapeRegex, pageParam } from "@/lib/admin-crud";
import { BOOKING_STATUSES, EVENT_TYPES } from "@/lib/constants";
import { connectDB } from "@/lib/db";
import { BookingModel } from "@/lib/models";
import { requireAdmin } from "@/lib/session";
import { formatDate } from "@/lib/site";

export const metadata: Metadata = { title: "Booking inquiries" };
const PAGE_SIZE = 15;

type SP = { page?: string; q?: string; type?: string; status?: string; from?: string; to?: string };
const isDate = (v?: string) => Boolean(v && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v)));

export default async function BookingsAdminPage({ searchParams }: { searchParams: Promise<SP> }) {
  await requireAdmin();
  await connectDB();
  const sp = await searchParams;
  const page = pageParam(sp.page);
  const q = (sp.q ?? "").trim().slice(0, 80);
  const type = (EVENT_TYPES as readonly string[]).includes(sp.type ?? "") ? sp.type : undefined;
  const status = (BOOKING_STATUSES as readonly string[]).includes(sp.status ?? "") ? sp.status : undefined;
  const from = isDate(sp.from) ? sp.from : undefined;
  const to = isDate(sp.to) ? sp.to : undefined;

  const filter: Record<string, unknown> = {};
  if (q) {
    const rx = new RegExp(escapeRegex(q), "i");
    filter.$or = [{ name: rx }, { email: rx }, { phone: rx }, { location: rx }];
  }
  if (type) filter.eventType = type;
  if (status) filter.status = status;
  if (from || to) {
    filter.eventDate = {
      ...(from ? { $gte: new Date(`${from}T00:00:00Z`) } : {}),
      ...(to ? { $lte: new Date(`${to}T23:59:59Z`) } : {}),
    };
  }

  const [total, rows] = await Promise.all([
    BookingModel.countDocuments(filter),
    BookingModel.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .select("name email phone eventType eventDate guestCount location status createdAt")
      .lean(),
  ]);
  const filtered = Boolean(q || type || status || from || to);

  return (
    <>
      <PageHeader title="Booking inquiries" subtitle="Inquiries from the public booking form. They do not confirm availability or reserve a date until you decide." />

      <form method="get" className="adm-card mb-6 grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-6" role="search" aria-label="Filter inquiries">
        <div className="sm:col-span-2">
          <label htmlFor="q" className="adm-label">
            Search
          </label>
          <input id="q" name="q" defaultValue={q} className="adm-field" placeholder="Name, email, phone or location" />
        </div>
        <div>
          <label htmlFor="type" className="adm-label">
            Event type
          </label>
          <select id="type" name="type" defaultValue={type ?? ""} className="adm-field">
            <option value="">All</option>
            {EVENT_TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="status" className="adm-label">
            Status
          </label>
          <select id="status" name="status" defaultValue={status ?? ""} className="adm-field">
            <option value="">All</option>
            {BOOKING_STATUSES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="from" className="adm-label">
            Event date from
          </label>
          <input id="from" name="from" type="date" defaultValue={from ?? ""} className="adm-field" />
        </div>
        <div>
          <label htmlFor="to" className="adm-label">
            Event date to
          </label>
          <input id="to" name="to" type="date" defaultValue={to ?? ""} className="adm-field" />
        </div>
        <div className="flex gap-2 sm:col-span-2 lg:col-span-6">
          <button type="submit" className="adm-btn adm-btn-primary">
            Apply filters
          </button>
          {filtered && (
            <Link href="/admin/bookings" className="adm-btn adm-btn-soft">
              Clear
            </Link>
          )}
        </div>
      </form>

      {rows.length === 0 ? (
        <EmptyRow
          title={filtered ? "No inquiries match these filters" : "No inquiries yet"}
          text={filtered ? "Try a different search or clear the filters." : "When someone submits the booking form on the website, it will appear here."}
        />
      ) : (
        <div className="adm-card overflow-hidden">
          <ul className="divide-y divide-[#f0e8f6]">
            {rows.map((b) => (
              <li key={String(b._id)}>
                <Link href={`/admin/bookings/${b._id}`} className="grid items-center gap-2 px-5 py-4 transition-colors hover:bg-[#faf6fd] md:grid-cols-[1.4fr_1fr_1fr_auto]">
                  <span className="min-w-0">
                    <span className="block truncate font-bold">{b.name}</span>
                    <span className="block truncate text-xs text-[#7a6a89]">
                      {b.email} &middot; {b.phone}
                    </span>
                  </span>
                  <span className="text-sm">
                    <span className="block font-semibold">{b.eventType}</span>
                    <span className="block text-xs text-[#7a6a89]">
                      {b.guestCount} guests &middot; {b.location}
                    </span>
                  </span>
                  <span className="text-sm">
                    <span className="block">Event: {formatDate(b.eventDate)}</span>
                    <span className="block text-xs text-[#7a6a89]">Received: {formatDate(b.createdAt)}</span>
                  </span>
                  <Badge>{b.status}</Badge>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
      <Pager page={page} total={total} pageSize={PAGE_SIZE} basePath="/admin/bookings" query={{ q, type, status, from, to }} />
    </>
  );
}
