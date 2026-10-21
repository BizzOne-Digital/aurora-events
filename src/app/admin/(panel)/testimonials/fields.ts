import type { FieldDef } from "@/components/admin/entity-form";

export const TESTIMONIAL_FIELDS: FieldDef[] = [
  { type: "textarea", name: "quote", label: "Testimonial", required: true, maxLength: 1500, rows: 6, hint: "Only add genuine feedback from a real client, with their permission." },
  { type: "text", name: "authorName", label: "Author name", required: true, maxLength: 120, half: true },
  { type: "text", name: "attribution", label: "Attribution", maxLength: 160, half: true, hint: "e.g. Wedding client, or Corporate event organiser" },
  { type: "checkbox", name: "published", label: "Published", hint: "Unpublished testimonials are never shown publicly." },
  { type: "checkbox", name: "featured", label: "Featured", hint: "Featured testimonials are shown first, including on the home page." },
];
