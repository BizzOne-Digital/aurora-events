import type { FieldDef } from "@/components/admin/entity-form";
import { GALLERY_CATEGORIES } from "@/lib/constants";

export const GALLERY_FIELDS: FieldDef[] = [
  { type: "image", name: "image", label: "Image", required: true, folder: "gallery", hint: "JPG, PNG, WebP or GIF. Large photos are shrunk automatically." },
  { type: "text", name: "caption", label: "Caption", maxLength: 200, half: true },
  { type: "select", name: "category", label: "Category", options: GALLERY_CATEGORIES, half: true },
  { type: "checkbox", name: "illustrative", label: "Illustrative image", hint: "Keep ticked for AI-generated or stock imagery so it is labelled as not being an event you organised. Untick only for your own real event photos." },
  { type: "checkbox", name: "published", label: "Published" },
];
