import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isValidObjectId } from "mongoose";
import { EntityForm } from "@/components/admin/entity-form";
import { PageHeader } from "@/components/admin/ui";
import { connectDB } from "@/lib/db";
import { GalleryModel } from "@/lib/models";
import { requireAdmin } from "@/lib/session";
import { saveGalleryItem } from "../actions";
import { GALLERY_FIELDS } from "../fields";

export const metadata: Metadata = { title: "Edit gallery image" };

export default async function EditGalleryItemPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  if (!isValidObjectId(id)) notFound();
  await connectDB();
  const g = await GalleryModel.findById(id).lean();
  if (!g) notFound();
  return (
    <>
      <PageHeader title="Edit gallery image" />
      <EntityForm
        fields={GALLERY_FIELDS}
        initial={{
          image: { url: g.image.url, alt: g.image.alt ?? "", publicId: g.image.publicId ?? "" },
          caption: g.caption ?? "",
          category: g.category,
          illustrative: g.illustrative,
          published: g.published,
        }}
        action={saveGalleryItem.bind(null, id)}
        submitLabel="Save changes"
        cancelHref="/admin/gallery"
      />
    </>
  );
}
