import type { Metadata } from "next";
import Link from "next/link";
import { ArchImage } from "@/components/motion/arch-image";
import { GrowLine, Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { Magnetic } from "@/components/motion/magnetic";
import { Marquee } from "@/components/site/decor";
import { HomeHero } from "@/components/site/home-hero";
import { CtaBand, SectionHead } from "@/components/site/sections";
import { ServicePanels } from "@/components/site/service-panels";
import { PROCESS_STEPS } from "@/content/defaults";
import { getGallery, getServices, getSettings, getTestimonials } from "@/lib/data";
import type { GalleryDTO } from "@/lib/types";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return {
    title: { absolute: s.seoTitle },
    description: s.seoDescription,
    alternates: { canonical: "/" },
    openGraph: { title: s.seoTitle, description: s.seoDescription, url: "/" },
  };
}

const MARQUEE = ["Weddings", "Corporate events", "Cultural celebrations", "Private parties", "Intimate gatherings", "Large celebrations"];

const PRINCIPLES = [
  { t: "Listen first", d: "Your story, traditions and priorities set the direction." },
  { t: "Arrange with care", d: "Layouts, styling and schedules are organised and checked with you." },
  { t: "Stay in touch", d: "Clear communication from the first call to the final detail." },
];

const MOSAIC_SHAPES = [
  ["arch arch-34 aspect-[3/4] [--rb:1.5rem]", "aspect-[4/3] rounded-3xl"],
  ["aspect-[4/3] rounded-3xl", "arch arch-34 aspect-[3/4] [--rb:1.5rem]"],
  ["aspect-[3/4] rounded-3xl", "aspect-square rounded-full"],
];

function Mosaic({ items }: { items: GalleryDTO[] }) {
  const cols: GalleryDTO[][] = [[], [], []];
  items.slice(0, 6).forEach((it, i) => cols[i % 3].push(it));
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3">
      {cols.map((col, c) => (
        <div key={c} className={`flex flex-col gap-3 sm:gap-5 ${c === 1 ? "mt-10 md:mt-16" : ""} ${c === 2 ? "hidden md:flex" : ""}`}>
          {col.map((it, r) => (
            <ArchImage
              key={it.id}
              src={it.image.url}
              alt={it.image.alt}
              sizes="(min-width:768px) 28vw, 46vw"
              speed={6 + c * 2}
              delay={r * 0.15}
              className={MOSAIC_SHAPES[c][r]}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export default async function HomePage() {
  const [settings, services, gallery, testimonials] = await Promise.all([
    getSettings(),
    getServices(),
    getGallery(),
    getTestimonials(),
  ]);
  const quotes = testimonials.slice(0, 3);

  return (
    <>
      <HomeHero
        heroEyebrow={settings.heroEyebrow}
        heroHeadline={settings.heroHeadline}
        heroSubcopy={settings.heroSubcopy}
        primaryCtaText={settings.primaryCtaText}
        secondaryCtaText={settings.secondaryCtaText}
      />

      <div aria-hidden="true" className="flex items-center justify-center gap-4 bg-ivory py-7 text-[#c9a25f]">
        <span className="h-px w-24 bg-gradient-to-r from-transparent to-[#d8b56d]" />
        <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current"><path d="M12 1c.8 6.2 4.8 10.2 11 11-6.2.8-10.2 4.800-11 11-.8-6.200-4.800-10.200-11-11 6.200-.8 10.200-4.800 11-11z" /></svg>
        <span className="h-px w-24 bg-gradient-to-l from-transparent to-[#d8b56d]" />
      </div>
      <div className="relative border-y border-white/10 bg-plum-900 py-6 text-ivory">
        <Marquee items={MARQUEE} />
      </div>

      {/* 01 Introduction */}
      <section id="intro" className="section-pad relative scroll-mt-16">
        <div className="container-x grid items-center gap-16 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <SectionHead
              n="01"
              eyebrow="Welcome"
              title="Gatherings designed around the people in them."
              accentFrom={4}
            />
            <Reveal delay={0.1} className="mt-8 max-w-2xl space-y-5 text-lg text-muted">
              <p>
                {settings.businessName} plans and arranges events of every size: weddings, corporate gatherings,
                cultural celebrations and private functions. We begin by listening, then shape the setting, styling
                and flow of the day around what matters to you and your guests.
              </p>
            </Reveal>
            <Stagger className="mt-10 max-w-2xl divide-y divide-plum-900/15 border-y border-plum-900/15">
              {PRINCIPLES.map((p, i) => (
                <StaggerItem key={p.t} className="flex gap-6 py-5">
                  <span className="eyebrow pt-1.5 text-ember">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <h3 className="font-display text-2xl">{p.t}</h3>
                    <p className="mt-1 text-muted">{p.d}</p>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
            <Reveal delay={0.1} className="mt-10">
              <Link href="/about" className="link-underline eyebrow inline-flex items-center gap-2 pb-1 text-plum-900">
                More about us <span aria-hidden="true">&rarr;</span>
              </Link>
            </Reveal>
          </div>

          <div className="relative mx-auto w-full max-w-md lg:col-span-5 lg:max-w-none">
            <ArchImage
              src="/images/event-garden-wedding.jpg"
              alt="Garden wedding ceremony with floral arch and empty chairs (illustrative image)"
              sizes="(min-width:1024px) 34vw, 90vw"
              className="arch arch-45 aspect-[4/5]"
            />
            <div className="absolute -bottom-10 -left-4 w-[46%] sm:-left-10">
              <ArchImage
                src="/images/event-wedding-table-details.jpg"
                alt="Wedding table setting with plum napkin and gold cutlery (illustrative image)"
                sizes="20vw"
                delay={0.3}
                speed={14}
                className="grad-border aspect-square rounded-full [--bw:4px] shadow-[0_30px_60px_-25px_rgba(30,10,46,0.7)]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 02 Services */}
      {services.length > 0 && (
        <section className="on-dark aurora-deep grain relative overflow-hidden py-24 text-ivory sm:py-32" aria-labelledby="home-services">
          <div className="container-x relative z-10">
            <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
              <div id="home-services">
                <SectionHead n="02" dark eyebrow="What we plan" title="Every kind of celebration, arranged with care." accentFrom={4} />
              </div>
              <Reveal>
                <Magnetic>
                  <Link href="/services" className="btn btn-ghost-dark">
                    All services
                  </Link>
                </Magnetic>
              </Reveal>
            </div>
            <div className="mt-14">
              <ServicePanels services={services} />
            </div>
            <p className="mt-8 text-sm text-ivory/60">Contact for pricing. Every event is quoted around its own details.</p>
          </div>
        </section>
      )}

      {/* 03 Gallery */}
      {gallery.length > 0 && (
        <section className="section-pad relative overflow-hidden">
          <div className="container-x">
            <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
              <SectionHead n="03" eyebrow="Inspiration" title="A look at the moods we love to create." accentFrom={5} />
              <Reveal>
                <Magnetic>
                  <Link href="/gallery" className="btn btn-ghost">
                    Open the gallery
                  </Link>
                </Magnetic>
              </Reveal>
            </div>
            <div className="mt-14">
              <Mosaic items={gallery} />
            </div>
            <p className="mt-6 text-sm text-muted">
              Illustrative imagery that shows the style of celebrations we plan. It is not a record of past
              events.
            </p>
          </div>
        </section>
      )}

      {/* 04 Process */}
      <section className="relative overflow-hidden bg-ivory-deep py-24 sm:py-32">
        <div className="container-x grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-32">
              <SectionHead n="04" eyebrow="How it works" title="A clear path from first idea to the big day." accentFrom={5} />
              <Reveal delay={0.1} className="mt-8 max-w-md text-lg text-muted">
                <p>
                  A simple, transparent process, so you always know where things stand and what comes next.
                </p>
              </Reveal>
            </div>
          </div>
          <ol className="relative lg:col-span-7">
            <GrowLine className="absolute bottom-6 left-[1.4rem] top-6 w-px bg-gradient-to-b from-coral via-orchid to-champagne sm:left-[2.1rem]" />
            {PROCESS_STEPS.map((s, i) => (
              <li key={s.title} className="relative pb-14 last:pb-0">
                <Reveal x={30} y={20} className="flex gap-6 sm:gap-10">
                  <span className="font-display relative z-10 grid h-12 w-12 shrink-0 place-items-center rounded-full bg-plum-900 text-lg text-peach sm:h-[4.2rem] sm:w-[4.2rem] sm:text-2xl">
                    {i + 1}
                  </span>
                  <div className="pt-1 sm:pt-3">
                    <h3 className="font-display text-3xl sm:text-4xl">{s.title}</h3>
                    <p className="mt-3 max-w-lg text-muted">{s.text}</p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 05 Testimonials (only when published) */}
      {quotes.length > 0 && (
        <section className="section-pad relative overflow-hidden">
          <div className="container-x">
            <SectionHead n="05" eyebrow="Kind words" title="What our clients say." accentFrom={2} />
            <div className="mt-14 grid gap-10 lg:grid-cols-12">
              {quotes.map((t, i) => (
                <Reveal key={t.id} delay={i * 0.12} className={i === 0 ? "lg:col-span-7" : "lg:col-span-5"}>
                  <figure className={`h-full ${i === 0 ? "" : "border-l border-plum-900/15 pl-8"}`}>
                    <span aria-hidden="true" className="font-display aurora-text-dark block text-7xl leading-none">&ldquo;</span>
                    <blockquote className={`font-display ${i === 0 ? "text-3xl sm:text-4xl" : "text-2xl"} leading-snug`}>
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
          </div>
        </section>
      )}

      <CtaBand settings={settings} />
    </>
  );
}
