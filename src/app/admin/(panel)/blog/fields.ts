import type { FieldDef } from "@/components/admin/entity-form";

export const BLOG_FIELDS: FieldDef[] = [
  { type: "section", title: "Article" },
  { type: "text", name: "title", label: "Title", required: true, maxLength: 160, half: true },
  { type: "text", name: "slug", label: "Slug", required: true, maxLength: 80, half: true, slugFrom: "title", hint: "Appears in the link: /blog/your-slug" },
  { type: "textarea", name: "excerpt", label: "Excerpt", required: true, maxLength: 400, rows: 3, hint: "A short summary used on the blog list and in search previews." },
  { type: "image", name: "coverImage", label: "Cover image", required: true, folder: "pages" },
  { type: "markdown", name: "body", label: "Article body", required: true, hint: "Markdown is supported: ## headings, **bold**, lists, links and quotes. The content is sanitised before it is shown." },
  { type: "section", title: "Publishing" },
  { type: "text", name: "authorName", label: "Author display name", required: true, maxLength: 120, half: true },
  { type: "date", name: "publishedAt", label: "Publication date", half: true, hint: "Future dates keep a published post hidden until that day." },
  { type: "checkbox", name: "published", label: "Published", hint: "Unticked posts are drafts. Only published posts appear publicly." },
  { type: "section", title: "SEO" },
  { type: "text", name: "seoTitle", label: "SEO title", maxLength: 70, hint: "Optional. Defaults to the article title." },
  { type: "textarea", name: "seoDescription", label: "SEO description", maxLength: 170, rows: 2, hint: "Optional. Defaults to the excerpt." },
];
