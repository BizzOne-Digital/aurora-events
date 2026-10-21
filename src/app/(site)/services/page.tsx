import type { Metadata } from "next";
import Link from "next/link";
import { ArchImage } from "@/components/motion/arch-image";
import { Reveal, SplitText } from "@/components/motion/reveal";
import { EmptyState } from "@/components/site/empty-state";
import { FaqList } from "@/components/site/faq";
import { CtaBand, PageHero, SectionHead } from "@/components/site/sections";
import { getFaqs, getServices, getSettings } from "@/lib/data";
import { eventTypeForService } from "@/lib/site";

export const metadata: Metadata = {
  title: "Event Planning Services",
  description:
    "Wedding planning, corporate events, cultural celebrations, private parties, intimate gatherings and large celebrations. Contact for pricing and request a consultation.",
  alternates: { canonical: "/services" },
};

export default async function ServicesPage() {
  const [settings, services, faqs] = await Promise.all([getSettings(), getServices(), getFaqs("services")]);

  return (
    <>
      <PageHero
        eyebrow="Our services"
        title="Celebrations of every kind, shaped around you."
        accentFrom={3}
        intro="Whatever the occasion and whatever the size, we help you plan and arrange it. Contact us for pricing and request a consultation to start the conversation."
        image={{ src: "/images/event-garden-wedding.jpg", alt: "Garden wedding ceremony with floral arch and empty chairs (illustrative image)" }}
      />

      {services.length === 0 ? (
        <section className="section-pad after-hero">
          <div className="container-x">
            <EmptyState
              title="Our services are being updated."
              text="Please check back soon, or get in touch and tell us about your event."
              cta={{ href: "/booking", label: "Request a consultation" }}
            />
          </div>
        </section>
      ) : (
        <div className="after-hero">
          {services.map((s, i) => {
            const flip = i % 2 === 1;
            const paragraphs = s.description.split(/\n{2,}/).filter(Boolean);
            return (
              <section
                key={s.id}
                id={s.slug}
                className={`relative scroll-mt-20 overflow-hidden py-16 sm:py-24 ${i % 2 ? "bg-ivory-deep" : ""}`}
              >
                <div className="container-x grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
                  <div className={`relative ${flip ? "lg:order-2 lg:col-span-6 lg:col-start-7" : "lg:col-span-6"}`}>
                    <ArchImage
                      src={s.coverImage.url}
                      alt={s.coverImage.alt}
                      sizes="(min-width:1024px) 45vw, 92vw"
                      className="arch arch-45 aspect-[4/5] [--rb:2.5rem]"
                    />
                    {s.gallery[0] && (
                      <div className={`absolute -bottom-8 w-[38%] ${flip ? "-right-3 sm:-right-8" : "-left-3 sm:-left-8"}`}>
                        <ArchImage
                          src={s.gallery[0].url}
                          alt={s.gallery[0].alt}
                          sizes="22vw"
                          speed={12}
                          delay={0.25}
                          className="grad-border aspect-square rounded-full [--bw:4px] shadow-[0_30px_60px_-25px_rgba(30,10,46,0.7)]"
                        />
                      </div>
                    )}
                  </div>

                  <div className={flip ? "lg:order-1 lg:col-span-6" : "lg:col-span-6"}>
                    <span aria-hidden="true" className="big-number text-plum-900/15">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <SplitText text={s.title} className="display-md mt-2" accentFrom={Math.max(1, s.title.split(" ").length - 1)} accentClassName="aurora-text-dark" />
                    <Reveal delay={0.1}>
                      <p className="font-display mt-5 text-2xl leading-snug text-plum-800">{s.summary}</p>
                    </Reveal>
                    <Reveal delay={0.15} className="mt-6 space-y-4 text-muted">
                      {paragraphs.map((p, k) => (
                        <p key={k}>{p}</p>
                      ))}
                    </Reveal>
                    {s.gallery.length > 1 && (
                      <Reveal delay={0.2} className="mt-8 flex gap-3">
                        {s.gallery.slice(1, 4).map((g) => (
                          <ArchImage
                            key={g.url}
                            src={g.url}
                            alt={g.alt}
                            sizes="140px"
                            reveal={false}
                            className="arch arch-34 aspect-[3/4] w-24 [--rb:0.75rem] sm:w-32"
                          />
                        ))}
                      </Reveal>
                    )}
                    <Reveal delay={0.25} className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
                      <Link href={`/booking?type=${encodeURIComponent(eventTypeForService(s.title))}`} className="btn btn-primary">
                        Request a consultation
                      </Link>
                      <span className="text-sm font-semibold text-plum-800">Contact for pricing</span>
                    </Reveal>
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      )}

      {faqs.length > 0 && (
        <section className="section-pad">
          <div className="container-x grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <SectionHead eyebrow="Good to know" title="Questions about our services." accentFrom={2} />
            </div>
            <div className="lg:col-span-8">
              <FaqList faqs={faqs} />
            </div>
          </div>
        </section>
      )}

      <CtaBand settings={settings} />
    </>
  );
}
