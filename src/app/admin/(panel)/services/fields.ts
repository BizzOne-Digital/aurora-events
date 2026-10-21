import type { FieldDef } from "@/components/admin/entity-form";

export const SERVICE_FIELDS: FieldDef[] = [
  { type: "section", title: "Basics" },
  { type: "text", name: "title", label: "Title", required: true, maxLength: 120, half: true },
  { type: "text", name: "slug", label: "Slug", required: true, maxLength: 80, half: true, slugFrom: "title", hint: "Used in the link, e.g. /services#wedding-planning" },
  { type: "textarea", name: "summary", label: "Short summary", required: true, maxLength: 400, rows: 3, hint: "One or two sentences shown on cards and the services page." },
  { type: "textarea", name: "description", label: "Detailed description", maxLength: 8000, rows: 9, hint: "Separate paragraphs with a blank line. Avoid promises you cannot guarantee." },
  { type: "section", title: "Images" },
  { type: "image", name: "coverImage", label: "Cover image", required: true, folder: "pages", hint: "Landscape or portrait both work; it is shown in an arch frame." },
  { type: "images", name: "gallery", label: "Additional images", max: 12, folder: "pages", hint: "Every image needs alt text." },
  { type: "section", title: "Visibility" },
  { type: "checkbox", name: "published", label: "Published", hint: "Unticked services are drafts and stay off the public site." },
  { type: "checkbox", name: "featured", label: "Featured", hint: "Marks the service as a highlight." },
];
