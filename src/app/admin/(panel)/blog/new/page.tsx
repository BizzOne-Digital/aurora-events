import type { Metadata } from "next";
import { EntityForm } from "@/components/admin/entity-form";
import { PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/session";
import { previewMarkdown, saveBlogPost } from "../actions";
import { BLOG_FIELDS } from "../fields";

export const metadata: Metadata = { title: "New post" };

export default async function NewBlogPostPage() {
  await requireAdmin();
  return (
    <>
      <PageHeader title="New post" />
      <EntityForm
        fields={BLOG_FIELDS}
        initial={{
          title: "",
          slug: "",
          excerpt: "",
          coverImage: null,
          body: "",
          authorName: "7270020 Canada Ltd.",
          publishedAt: new Date().toISOString().slice(0, 10),
          published: false,
          seoTitle: "",
          seoDescription: "",
        }}
        action={saveBlogPost.bind(null, null)}
        previewAction={previewMarkdown}
        submitLabel="Create post"
        cancelHref="/admin/blog"
      />
    </>
  );
}
