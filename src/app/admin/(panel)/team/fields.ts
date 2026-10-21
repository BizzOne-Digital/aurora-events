import type { FieldDef } from "@/components/admin/entity-form";

export const TEAM_FIELDS: FieldDef[] = [
  { type: "text", name: "name", label: "Name", required: true, maxLength: 120, half: true },
  { type: "text", name: "role", label: "Role", required: true, maxLength: 120, half: true },
  { type: "textarea", name: "bio", label: "Short bio", maxLength: 1200, rows: 5, hint: "Only add real people and details they have approved." },
  { type: "image", name: "photo", label: "Photo", folder: "pages", hint: "Optional. Portrait photos work best." },
  { type: "checkbox", name: "visible", label: "Visible on the Our Team page", hint: "Hidden members are never shown publicly." },
];
