import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isValidObjectId } from "mongoose";
import { InquiryUpdateForm } from "@/components/admin/inquiry-form";
import { ConfirmDelete } from "@/components/admin/row-actions";
import { Badge, PageHeader } from "@/components/admin/ui";
import { BOOKING_STATUSES } from "@/lib/constants";
import { connectDB } from "@/lib/db";
import { BookingModel } from "@/lib/models";
import { requireAdmin } from "@/lib/session";
import { formatDate } from "@/lib/site";
import { deleteBooking, updateBooking } from "../actions";

export const metadata: Metadata = { title: "Booking inquiry" };

export default async function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  if (!isValidObjectId(id)) notFound();
  await connectDB();
  const b = await BookingModel.findById(id).lean();
  if (!b) notFound();

  const rows: [string, React.ReactNode][] = [
    ["Event type", b.eventType],
    ["Preferred date", formatDate(b.eventDate)],
    ["Estimated guests", b.guestCount],
    ["Location / city", b.location],
    ["Contact preference", b.contactPreference],
    ["Received", formatDate(b.createdAt, { dateStyle: "long", timeStyle: "short" })],
    ["Consent to be contacted", b.consent ? `Yes, ${formatDate(b.consentAt, { dateStyle: "medium", timeStyle: "short" })}` : "No"],
  ];

  return (
    <>
      <PageHeader
        title={b.name}
        subtitle="Booking inquiry"
        action={
          <div className="flex items-center gap-2">
            <Badge>{b.status}</Badge>
            <Link href="/admin/bookings" className="adm-btn adm-btn-soft !min-h-10">
              All inquiries
            </Link>
          </div>
        }
      />
      <div className="grid gap-6 lg:grid-cols-5">
        <section className="adm-card p-6 lg:col-span-3" aria-label="Inquiry details">
          <div className="flex flex-wrap gap-3">
            <a href={`tel:${b.phone}`} className="adm-btn adm-btn-primary">
              Call {b.phone}
            </a>
            <a href={`mailto:${b.email}`} className="adm-btn adm-btn-soft">
              Email {b.email}
            </a>
          </div>
          <dl className="mt-6 divide-y divide-[#f0e8f6]">
            {rows.map(([k, v]) => (
              <div key={k} className="grid gap-1 py-3 sm:grid-cols-[11rem_1fr]">
                <dt className="text-sm font-bold text-[#5a4768]">{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
          <h2 className="mt-6 text-sm font-bold text-[#5a4768]">Event details</h2>
          <p className="mt-2 whitespace-pre-wrap rounded-xl bg-[#faf6fd] p-4">{b.details}</p>
          <div className="mt-8 border-t border-[#f0e8f6] pt-5">
            <ConfirmDelete id={id} itemName={`${b.name} (${b.eventType})`} onDelete={deleteBooking} label="Delete inquiry" redirectTo="/admin/bookings" />
          </div>
        </section>

        <section className="adm-card p-6 lg:col-span-2" aria-label="Status and notes">
          <h2 className="font-display text-2xl">Manage</h2>
          <div className="mt-5">
            <InquiryUpdateForm statuses={BOOKING_STATUSES} status={b.status} notes={b.notes ?? ""} action={updateBooking.bind(null, id)} />
          </div>
        </section>
      </div>
    </>
  );
}
