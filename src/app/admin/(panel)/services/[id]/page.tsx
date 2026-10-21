import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isValidObjectId } from "mongoose";
import { EntityForm } from "@/components/admin/entity-form";
import { PageHeader } from "@/components/admin/ui";
import { connectDB } from "@/lib/db";
import { ServiceModel } from "@/lib/models";
import { requireAdmin } from "@/lib/session";
import { saveService } from "../actions";
import { SERVICE_FIELDS } from "../fields";

export const metadata: Metadata = { title: "Edit service" };

export default async function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  if (!isValidObjectId(id)) notFound();
  await connectDB();
  const s = await ServiceModel.findById(id).lean();
  if (!s) notFound();
  const img = (i: { url: string; alt?: string | null; publicId?: string | null }) => ({ url: i.url, alt: i.alt ?? "", publicId: i.publicId ?? "" });

  return (
    <>
      <PageHeader title={`Edit: ${s.title}`} />
      <EntityForm
        fields={SERVICE_FIELDS}
        initial={{
          title: s.title,
          slug: s.slug,
          summary: s.summary,
          description: s.description ?? "",
          coverImage: s.coverImage ? img(s.coverImage) : null,
          gallery: (s.gallery ?? []).map(img),
          published: s.published,
          featured: s.featured,
        }}
        action={saveService.bind(null, id)}
        submitLabel="Save changes"
        cancelHref="/admin/services"
      />
    </>
  );
}
