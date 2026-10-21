import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Article } from "@/components/site/article";
import { PostCard } from "@/components/site/post-card";
import { CtaBand } from "@/components/site/sections";
import { getPost, getPosts, getSettings } from "@/lib/data";
import { SITE_URL } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Article not found", robots: { index: false } };
  const title = post.seoTitle || post.title;
  const description = post.seoDescription || post.excerpt;
  return {
    title,
    description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title,
      description,
      url: `/blog/${post.slug}`,
      publishedTime: post.publishedAt,
      authors: [post.authorName],
      images: [{ url: post.coverImage.url, alt: post.coverImage.alt }],
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const [post, settings, all] = await Promise.all([getPost(slug), getSettings(), getPosts()]);
  if (!post) notFound();

  const more = all.filter((p) => p.slug !== post.slug).slice(0, 2);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.seoDescription || post.excerpt,
    datePublished: post.publishedAt,
    author: { "@type": "Person", name: post.authorName },
    publisher: { "@type": "Organization", name: settings.businessName },
    image: post.coverImage.url.startsWith("/") ? `${SITE_URL}${post.coverImage.url}` : post.coverImage.url,
    mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
  };

  return (
    <>
      <Article post={post} />
      {more.length > 0 && (
        <section className="border-t border-plum-900/10 bg-ivory-deep py-20">
          <div className="container-x">
            <h2 className="display-md">Keep reading</h2>
            <div className="mt-10 grid gap-10 md:grid-cols-2">
              {more.map((p) => (
                <PostCard key={p.id} post={p} />
              ))}
            </div>
          </div>
        </section>
      )}
      <CtaBand settings={settings} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
    </>
  );
}
