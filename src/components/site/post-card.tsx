import Link from "next/link";
import { ArchImage } from "@/components/motion/arch-image";
import { formatDate } from "@/lib/site";
import type { PostSummaryDTO } from "@/lib/types";

export function PostCard({ post, variant = "default" }: { post: PostSummaryDTO; variant?: "default" | "feature" }) {
  const feature = variant === "feature";
  return (
    <article className={`group ${feature ? "grid items-center gap-10 lg:grid-cols-12" : ""}`}>
      <Link href={`/blog/${post.slug}`} className={`block ${feature ? "lg:col-span-7" : ""}`} aria-label={post.title} tabIndex={-1}>
        <ArchImage
          src={post.coverImage.url}
          alt={post.coverImage.alt}
          sizes={feature ? "(min-width:1024px) 55vw, 92vw" : "(min-width:768px) 45vw, 92vw"}
          className={feature ? "aspect-[4/3] rounded-[2.5rem] rounded-tl-[12rem]" : "aspect-[4/3] rounded-3xl"}
        />
      </Link>
      <div className={feature ? "lg:col-span-5" : "mt-6"}>
        <p className="eyebrow text-ember">
          {formatDate(post.publishedAt)} <span aria-hidden="true">&middot;</span> {post.authorName}
        </p>
        <h2 className={`font-display mt-3 ${feature ? "display-md" : "text-3xl leading-tight"}`}>
          <Link href={`/blog/${post.slug}`} className="link-underline">
            {post.title}
          </Link>
        </h2>
        <p className="mt-4 text-muted">{post.excerpt}</p>
        <Link
          href={`/blog/${post.slug}`}
          className="eyebrow mt-5 inline-flex items-center gap-2 text-plum-900 transition-all group-hover:gap-4"
          aria-label={`Read article: ${post.title}`}
        >
          Read article <span aria-hidden="true">&rarr;</span>
        </Link>
      </div>
    </article>
  );
}
