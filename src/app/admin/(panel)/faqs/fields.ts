import type { FieldDef } from "@/components/admin/entity-form";

export const FAQ_FIELDS: FieldDef[] = [
  { type: "text", name: "question", label: "Question", required: true, maxLength: 240 },
  { type: "textarea", name: "answer", label: "Answer", required: true, maxLength: 3000, rows: 6 },
  { type: "select", name: "page", label: "Show on page", options: ["services", "booking", "contact"], half: true, hint: "FAQs appear as a section on the chosen page." },
  { type: "checkbox", name: "published", label: "Published" },
];
