import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isValidObjectId } from "mongoose";
import { EntityForm } from "@/components/admin/entity-form";
import { PageHeader } from "@/components/admin/ui";
import { connectDB } from "@/lib/db";
import { FaqModel } from "@/lib/models";
import { requireAdmin } from "@/lib/session";
import { saveFaq } from "../actions";
import { FAQ_FIELDS } from "../fields";

export const metadata: Metadata = { title: "Edit FAQ" };

export default async function EditFaqPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  if (!isValidObjectId(id)) notFound();
  await connectDB();
  const f = await FaqModel.findById(id).lean();
  if (!f) notFound();
  return (
    <>
      <PageHeader title="Edit FAQ" />
      <EntityForm
        fields={FAQ_FIELDS}
        initial={{ question: f.question, answer: f.answer, page: f.page, published: f.published }}
        action={saveFaq.bind(null, id)}
        submitLabel="Save changes"
        cancelHref="/admin/faqs"
      />
    </>
  );
}
