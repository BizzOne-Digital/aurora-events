import type { Metadata } from "next";
import { Reveal } from "@/components/motion/reveal";
import { EmptyState } from "@/components/site/empty-state";
import { CtaBand, PageHero } from "@/components/site/sections";
import { getSettings, getTestimonials } from "@/lib/data";

export const metadata: Metadata = {
  title: "Testimonials",
  description: "Kind words from the clients of 7270020 Canada Ltd.",
  alternates: { canonical: "/testimonials" },
};

export default async function TestimonialsPage() {
  const [settings, items] = await Promise.all([getSettings(), getTestimonials()]);
  return (
    <>
      <PageHero
        eyebrow="Testimonials"
        title="In our clients' words."
        accentFrom={2}
        intro="Feedback from the people we have worked with, shared with their permission."
      />
      <section className="section-pad">
        <div className="container-x">
          {items.length === 0 ? (
            <EmptyState
              title="Client stories will appear here."
              text="We only publish genuine feedback from real clients. Until then, we would love to hear about your event."
              cta={{ href: "/booking", label: "Plan Your Event" }}
            />
          ) : (
            <div className="mx-auto max-w-5xl divide-y divide-plum-900/15">
              {items.map((t, i) => (
                <Reveal key={t.id} className="grid gap-6 py-14 first:pt-0 md:grid-cols-12">
                  <div className="md:col-span-2">
                    <span aria-hidden="true" className="font-display aurora-text-dark block text-8xl leading-[0.7]">
                      &ldquo;
                    </span>
                    {t.featured && <span className="eyebrow mt-4 inline-block text-ember">Featured</span>}
                  </div>
                  <figure className="md:col-span-10">
                    <blockquote className={`font-display leading-snug ${i === 0 ? "text-3xl sm:text-5xl" : "text-2xl sm:text-3xl"}`}>
                      {t.quote}
                    </blockquote>
                    <figcaption className="mt-6 text-sm">
                      <span className="font-bold">{t.authorName}</span>
                      {t.attribution && <span className="text-muted"> &middot; {t.attribution}</span>}
                    </figcaption>
                  </figure>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>
      <CtaBand settings={settings} />
    </>
  );
}
