import type { Metadata } from "next";
import { ArchImage } from "@/components/motion/arch-image";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { Marquee } from "@/components/site/decor";
import { CtaBand, PageHero, SectionHead } from "@/components/site/sections";
import { getSettings } from "@/lib/data";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "7270020 Canada Ltd. plans and arranges weddings, corporate events, cultural celebrations and private functions with warmth, care and a creative eye.",
  alternates: { canonical: "/about" },
};

const VALUES = [
  {
    t: "We listen before we plan",
    d: "Every event starts with a conversation about the people, the occasion and what you want guests to feel.",
  },
  {
    t: "We respect your traditions",
    d: "Cultural and family customs shape a celebration. We make room for them from the very first draft of the plan.",
  },
  {
    t: "We care about the details",
    d: "Layouts, styling, timings and small touches are organised and checked so the day runs smoothly.",
  },
  {
    t: "We keep communication clear",
    d: "You will know what is happening and what comes next, with straightforward answers along the way.",
  },
];

export default async function AboutPage() {
  const settings = await getSettings();
  return (
    <>
      <PageHero
        eyebrow="About us"
        title="Planning with warmth, creativity and care."
        accentFrom={2}
        intro={`${settings.businessName} is an event planning and arrangement company. We help people bring gatherings of every size to life.`}
        image={{ src: "/images/event-wedding-table-details.jpg", alt: "Wedding table setting with plum napkin and gold cutlery (illustrative image)" }}
      />

      <section className="section-pad after-hero">
        <div className="container-x grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHead n="01" eyebrow="Our approach" title="Events should feel like you." accentFrom={3} />
          </div>
          <Reveal className="space-y-6 text-lg text-muted lg:col-span-7">
            <p className="font-display text-3xl leading-snug text-plum-900 sm:text-4xl">
              A great gathering is not a template. It is the people, the place and the little details that make it
              yours.
            </p>
            <p>
              We plan and arrange weddings, corporate events, cultural celebrations, private functions and
              celebrations of every size. Our focus is simple: understand what you want, then organise the setting,
              styling and flow of the day so you can enjoy it with the people who matter.
            </p>
            <p>
              Whether you are imagining a large celebration or a quiet dinner, we would be glad to talk it through.
              Contact us for pricing and request a consultation to begin.
            </p>
          </Reveal>
        </div>
      </section>

      <div className="border-y border-plum-900/10 bg-ivory-deep py-6 text-plum-900">
        <Marquee items={["Weddings", "Corporate events", "Cultural celebrations", "Private parties", "Intimate gatherings", "Large celebrations"]} />
      </div>

      <section className="section-pad overflow-hidden">
        <div className="container-x">
          <SectionHead n="02" eyebrow="What guides us" title="Four things we hold close." accentFrom={3} />
          <div className="mt-16 grid items-start gap-12 lg:grid-cols-12">
            <Stagger className="divide-y divide-plum-900/15 border-y border-plum-900/15 lg:col-span-7">
              {VALUES.map((v, i) => (
                <StaggerItem key={v.t} className="grid gap-4 py-8 sm:grid-cols-[5rem_1fr]">
                  <span className="font-display aurora-text-dark text-5xl leading-none">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <h3 className="font-display text-3xl">{v.t}</h3>
                    <p className="mt-2 text-muted">{v.d}</p>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
            <div className="relative mx-auto grid w-full max-w-md grid-cols-2 gap-4 lg:col-span-5 lg:max-w-none">
              <ArchImage
                src="/images/event-networking-reception.jpg"
                alt="Rooftop reception with cocktail tables and warm string lights (illustrative image)"
                sizes="(min-width:1024px) 20vw, 45vw"
                className="arch arch-35 aspect-[3/5] [--rb:1.5rem]"
              />
              <ArchImage
                src="/images/event-anniversary-dinner.jpg"
                alt="Anniversary terrace dinner with roses and candles (illustrative image)"
                sizes="(min-width:1024px) 20vw, 45vw"
                delay={0.2}
                className="mt-14 aspect-[3/5] rounded-3xl"
              />
            </div>
          </div>
        </div>
      </section>

      <CtaBand settings={settings} headline="Let us plan something beautiful together." />
    </>
  );
}
