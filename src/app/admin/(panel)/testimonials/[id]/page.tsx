import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isValidObjectId } from "mongoose";
import { EntityForm } from "@/components/admin/entity-form";
import { PageHeader } from "@/components/admin/ui";
import { connectDB } from "@/lib/db";
import { TestimonialModel } from "@/lib/models";
import { requireAdmin } from "@/lib/session";
import { saveTestimonial } from "../actions";
import { TESTIMONIAL_FIELDS } from "../fields";

export const metadata: Metadata = { title: "Edit testimonial" };

export default async function EditTestimonialPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  if (!isValidObjectId(id)) notFound();
  await connectDB();
  const t = await TestimonialModel.findById(id).lean();
  if (!t) notFound();
  return (
    <>
      <PageHeader title="Edit testimonial" subtitle={t.isDemo ? "This is demo content. Replace it with a genuine testimonial before publishing." : undefined} />
      <EntityForm
        fields={TESTIMONIAL_FIELDS}
        initial={{ quote: t.quote, authorName: t.authorName, attribution: t.attribution ?? "", published: t.published, featured: t.featured }}
        action={saveTestimonial.bind(null, id)}
        submitLabel="Save changes"
        cancelHref="/admin/testimonials"
      />
    </>
  );
}
