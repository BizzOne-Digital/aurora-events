import type { Metadata } from "next";
import { EntityForm } from "@/components/admin/entity-form";
import { PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/session";
import { saveTestimonial } from "../actions";
import { TESTIMONIAL_FIELDS } from "../fields";

export const metadata: Metadata = { title: "Add testimonial" };

export default async function NewTestimonialPage() {
  await requireAdmin();
  return (
    <>
      <PageHeader title="Add testimonial" />
      <EntityForm
        fields={TESTIMONIAL_FIELDS}
        initial={{ quote: "", authorName: "", attribution: "", published: false, featured: false }}
        action={saveTestimonial.bind(null, null)}
        submitLabel="Create testimonial"
        cancelHref="/admin/testimonials"
      />
    </>
  );
}
