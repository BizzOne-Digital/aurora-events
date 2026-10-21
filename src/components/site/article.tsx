import { ArchImage } from "@/components/motion/arch-image";
import { Reveal, SplitText } from "@/components/motion/reveal";
import { renderMarkdown } from "@/lib/sanitize";
import { formatDate } from "@/lib/site";
import type { PostDTO } from "@/lib/types";
import { AuroraBackground } from "./decor";

/** Shared by the public article page and the admin draft preview. Body HTML is always sanitised. */
export function Article({ post }: { post: Omit<PostDTO, "id" | "slug" | "seoTitle" | "seoDescription"> }) {
  const html = renderMarkdown(post.body);
  return (
    <>
      <section className="on-dark aurora-deep grain relative z-0 overflow-hidden pb-40 pt-36 text-ivory sm:pb-52 sm:pt-44">
        <AuroraBackground />
        <div className="container-x relative z-10 max-w-4xl">
          <Reveal y={14}>
            <p className="eyebrow text-peach">
              {formatDate(post.publishedAt)} <span aria-hidden="true">&middot;</span> {post.authorName}
            </p>
          </Reveal>
          <SplitText as="h1" text={post.title} accentFrom={Math.max(2, post.title.split(" ").length - 2)} className="display-lg mt-5" immediate delay={0.1} />
          <Reveal delay={0.5} className="mt-7 max-w-2xl text-xl text-ivory/80">
            <p>{post.excerpt}</p>
          </Reveal>
        </div>
      </section>
      <div className="container-x relative z-10 -mt-28 max-w-5xl sm:-mt-40">
        <ArchImage
          src={post.coverImage.url}
          alt={post.coverImage.alt}
          sizes="(min-width:1024px) 960px, 92vw"
          priority
          className="aspect-[16/9] rounded-[2rem] shadow-[0_40px_90px_-30px_rgba(30,10,46,0.6)] sm:rounded-[3rem]"
        />
      </div>
      <article className="container-x max-w-3xl py-16 sm:py-24">
        <div className="prose-article" dangerouslySetInnerHTML={{ __html: html }} />
      </article>
    </>
  );
}
