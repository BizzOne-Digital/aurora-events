import type { Metadata } from "next";
import { EntityForm } from "@/components/admin/entity-form";
import { PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/session";
import { saveFaq } from "../actions";
import { FAQ_FIELDS } from "../fields";

export const metadata: Metadata = { title: "Add FAQ" };

export default async function NewFaqPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  await requireAdmin();
  const { page } = await searchParams;
  return (
    <>
      <PageHeader title="Add FAQ" />
      <EntityForm
        fields={FAQ_FIELDS}
        initial={{ question: "", answer: "", page: ["services", "booking", "contact"].includes(page ?? "") ? (page as string) : "services", published: true }}
        action={saveFaq.bind(null, null)}
        submitLabel="Create FAQ"
        cancelHref="/admin/faqs"
      />
    </>
  );
}
