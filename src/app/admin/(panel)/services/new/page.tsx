import type { Metadata } from "next";
import { EntityForm } from "@/components/admin/entity-form";
import { PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/session";
import { saveService } from "../actions";
import { SERVICE_FIELDS } from "../fields";

export const metadata: Metadata = { title: "Add service" };

export default async function NewServicePage() {
  await requireAdmin();
  return (
    <>
      <PageHeader title="Add service" />
      <EntityForm
        fields={SERVICE_FIELDS}
        initial={{ title: "", slug: "", summary: "", description: "", coverImage: null, gallery: [], published: true, featured: false }}
        action={saveService.bind(null, null)}
        submitLabel="Create service"
        cancelHref="/admin/services"
      />
    </>
  );
}
