import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isValidObjectId } from "mongoose";
import { InquiryUpdateForm } from "@/components/admin/inquiry-form";
import { ConfirmDelete } from "@/components/admin/row-actions";
import { Badge, PageHeader } from "@/components/admin/ui";
import { CONTACT_STATUSES } from "@/lib/constants";
import { connectDB } from "@/lib/db";
import { ContactModel } from "@/lib/models";
import { requireAdmin } from "@/lib/session";
import { formatDate } from "@/lib/site";
import { deleteContact, updateContact } from "../actions";

export const metadata: Metadata = { title: "Contact message" };

export default async function ContactDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  if (!isValidObjectId(id)) notFound();
  await connectDB();
  const c = await ContactModel.findById(id).lean();
  if (!c) notFound();

  return (
    <>
      <PageHeader
        title={c.name}
        subtitle="Contact message"
        action={
          <div className="flex items-center gap-2">
            <Badge>{c.status}</Badge>
            <Link href="/admin/contacts" className="adm-btn adm-btn-soft !min-h-10">
              All messages
            </Link>
          </div>
        }
      />
      <div className="grid gap-6 lg:grid-cols-5">
        <section className="adm-card p-6 lg:col-span-3" aria-label="Message">
          <div className="flex flex-wrap gap-3">
            <a href={`mailto:${c.email}`} className="adm-btn adm-btn-primary">
              Email {c.email}
            </a>
            {c.phone && (
              <a href={`tel:${c.phone}`} className="adm-btn adm-btn-soft">
                Call {c.phone}
              </a>
            )}
          </div>
          <p className="mt-5 text-sm text-[#7a6a89]">Received {formatDate(c.createdAt, { dateStyle: "long", timeStyle: "short" })}</p>
          <p className="mt-3 whitespace-pre-wrap rounded-xl bg-[#faf6fd] p-4">{c.message}</p>
          <div className="mt-8 border-t border-[#f0e8f6] pt-5">
            <ConfirmDelete id={id} itemName={`message from ${c.name}`} onDelete={deleteContact} label="Delete message" redirectTo="/admin/contacts" />
          </div>
        </section>
        <section className="adm-card p-6 lg:col-span-2" aria-label="Status and notes">
          <h2 className="font-display text-2xl">Manage</h2>
          <div className="mt-5">
            <InquiryUpdateForm statuses={CONTACT_STATUSES} status={c.status} notes={c.notes ?? ""} action={updateContact.bind(null, id)} />
          </div>
        </section>
      </div>
    </>
  );
}
