import type { Metadata } from "next";
import { EmptyState } from "@/components/site/empty-state";
import { PostCard } from "@/components/site/post-card";
import { CtaBand, PageHero } from "@/components/site/sections";
import { Reveal } from "@/components/motion/reveal";
import { getPosts, getSettings } from "@/lib/data";

export const metadata: Metadata = {
  title: "Blog",
  description: "Practical ideas and inspiration for planning weddings, corporate events, cultural celebrations and private functions.",
  alternates: { canonical: "/blog" },
};

export default async function BlogPage() {
  const [settings, posts] = await Promise.all([getSettings(), getPosts()]);
  const [first, ...rest] = posts;
  return (
    <>
      <PageHero
        eyebrow="The blog"
        title="Ideas for planning beautiful events."
        accentFrom={3}
        intro="Practical guidance, inspiration and things we think are worth knowing before you plan your celebration."
        image={{ src: "/images/event-floral-installation.jpg", alt: "Coral and ivory floral arrangement on a stone pedestal (illustrative image)" }}
      />
      <section className="section-pad after-hero">
        <div className="container-x">
          {!first ? (
            <EmptyState
              title="Articles are coming soon."
              text="We are preparing our first posts. Meanwhile, tell us about your event and we will be glad to help."
              cta={{ href: "/booking", label: "Plan Your Event" }}
            />
          ) : (
            <>
              <PostCard post={first} variant="feature" />
              {rest.length > 0 && (
                <div className="mt-24 grid gap-x-10 gap-y-16 md:grid-cols-2">
                  {rest.map((p, i) => (
                    <Reveal key={p.id} className={i % 2 === 1 ? "md:mt-20" : ""}>
                      <PostCard post={p} />
                    </Reveal>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>
      <CtaBand settings={settings} />
    </>
  );
}
