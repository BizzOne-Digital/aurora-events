import type { Metadata } from "next";
import { EntityForm } from "@/components/admin/entity-form";
import { PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/session";
import { saveGalleryItem } from "../actions";
import { GALLERY_FIELDS } from "../fields";

export const metadata: Metadata = { title: "Upload image" };

export default async function NewGalleryItemPage() {
  await requireAdmin();
  return (
    <>
      <PageHeader title="Upload image" />
      <EntityForm
        fields={GALLERY_FIELDS}
        initial={{ image: null, caption: "", category: "Wedding", illustrative: true, published: true }}
        action={saveGalleryItem.bind(null, null)}
        submitLabel="Add to gallery"
        cancelHref="/admin/gallery"
      />
    </>
  );
}
