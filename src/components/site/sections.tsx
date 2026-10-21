import Link from "next/link";
import { ArchImage } from "@/components/motion/arch-image";
import { Magnetic } from "@/components/motion/magnetic";
import { Reveal, SplitText } from "@/components/motion/reveal";
import type { SettingsDTO } from "@/lib/types";
import { AuroraBackground, CelebrationRibbon } from "./decor";

/** Dark aurora page header with an arch photograph that overlaps into the next section. */
export function PageHero({
  eyebrow,
  title,
  accentFrom,
  intro,
  image,
}: {
  eyebrow: string;
  title: string;
  accentFrom?: number;
  intro: string;
  image?: { src: string; alt: string };
}) {
  return (
    <section className="on-dark aurora-deep grain relative z-10 text-ivory">
      <div className="absolute inset-0 overflow-hidden">
        <AuroraBackground />
        <CelebrationRibbon className="bottom-6 left-0 h-40 opacity-60" />
      </div>
      <div className="container-x relative grid gap-12 pb-32 pt-36 lg:grid-cols-12 lg:items-end lg:pb-28 lg:pt-44">
        <div className="lg:col-span-7">
          <Reveal y={16}>
            <p className="eyebrow text-peach">{eyebrow}</p>
          </Reveal>
          <SplitText as="h1" text={title} accentFrom={accentFrom} className="display-lg mt-5" immediate delay={0.15} />
          <Reveal delay={0.55} className="mt-7 max-w-xl text-lg text-ivory/80">
            <p>{intro}</p>
          </Reveal>
        </div>
        {image && (
          <div className="w-full max-w-[17rem] justify-self-end sm:max-w-sm lg:col-span-5 lg:-mb-64 lg:max-w-[26rem]">
            <ArchImage
              src={image.src}
              alt={image.alt}
              sizes="(min-width:1024px) 26rem, 70vw"
              priority
              reveal
              delay={0.3}
              className="arch arch-45 aspect-[4/5] shadow-[0_40px_90px_-30px_rgba(217,106,210,0.7)]"
            />
          </div>
        )}
      </div>
    </section>
  );
}

export function SectionHead({
  n,
  eyebrow,
  title,
  accentFrom,
  dark = false,
  className = "",
}: {
  n?: string;
  eyebrow: string;
  title: string;
  accentFrom?: number;
  dark?: boolean;
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      {n && (
        <span
          aria-hidden="true"
          className={`big-number pointer-events-none absolute -top-6 right-0 hidden select-none sm:block ${
            dark ? "text-ivory/15" : "text-plum-900/10"
          }`}
        >
          {n}
        </span>
      )}
      <Reveal y={14}>
        <p className={`eyebrow ${dark ? "text-peach" : "text-ember"}`}>{eyebrow}</p>
      </Reveal>
      <SplitText
        text={title}
        accentFrom={accentFrom}
        accentClassName={dark ? "aurora-text" : "aurora-text-dark"}
        className="display-md mt-4 max-w-3xl"
      />
    </div>
  );
}

export function CtaBand({ settings, headline }: { settings: SettingsDTO; headline?: string }) {
  return (
    <section className="on-dark aurora-deep grain relative overflow-hidden text-ivory">
      <AuroraBackground />
      <CelebrationRibbon className="bottom-0 left-0 h-40 opacity-70" />
      <div className="container-x relative z-10 py-24 text-center sm:py-32">
        <Reveal y={14}>
          <p className="eyebrow text-peach">Request a consultation</p>
        </Reveal>
        <SplitText
          text={headline ?? settings.consultationHeadline}
          accentFrom={3}
          className="display-lg mx-auto mt-5 max-w-4xl"
        />
        <Reveal delay={0.3} className="mx-auto mt-6 max-w-xl text-lg text-ivory/80">
          <p>
            Tell us what you are planning. We will talk through your ideas and the next steps. Contact us for pricing.
          </p>
        </Reveal>
        <Reveal delay={0.45} className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Magnetic>
            <Link href="/booking" className="btn btn-primary">
              {settings.primaryCtaText}
            </Link>
          </Magnetic>
          <Magnetic>
            <a href={`tel:${settings.phone}`} className="btn btn-ghost-dark">
              Call {settings.phoneDisplay}
            </a>
          </Magnetic>
        </Reveal>
      </div>
    </section>
  );
}
