"use client";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { useDesktopMotion } from "@/components/motion/hooks";
import { Magnetic } from "@/components/motion/magnetic";
import { Reveal, SplitText } from "@/components/motion/reveal";
import type { SettingsDTO } from "@/lib/types";

type Props = Pick<SettingsDTO, "heroEyebrow" | "heroHeadline" | "heroSubcopy" | "primaryCtaText" | "secondaryCtaText">;

const Arrow = () => (
  <svg viewBox="0 0 24 24" className="h-[1.1em] w-[1.1em]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

export function HomeHero({ heroEyebrow, heroHeadline, heroSubcopy, primaryCtaText, secondaryCtaText }: Props) {
  const ref = useRef<HTMLElement>(null);
  const desktop = useDesktopMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, 70]);
  // each sentence of the headline sits on its own line
  const lines = heroHeadline.split(/(?<=[.!?])\s+/).filter(Boolean);

  return (
    <section ref={ref} className="on-dark relative isolate flex min-h-[44rem] items-center overflow-hidden bg-plum-950 pt-20 text-ivory lg:min-h-[100svh]">
      {/* background photograph (slow settle-in, gentle parallax on desktop) */}
      <motion.div className="absolute inset-0 -z-10" style={desktop ? { y: bgY } : undefined}>
        <motion.div
          className="absolute -inset-x-4 -bottom-10 top-0"
          initial={{ scale: 1.12, opacity: 0.4 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 2.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <Image src="/images/hero-bg.jpg" alt="" fill priority sizes="100vw" className="object-cover object-[72%_center] md:object-center" />
        </motion.div>
        {/* readability on narrow screens, where text sits over the photo */}
        <div className="absolute inset-0 bg-gradient-to-r from-plum-950/90 via-plum-950/55 to-plum-950/10 md:from-plum-950/30 md:via-transparent md:to-transparent" />
      </motion.div>

      <div className="container-x relative z-10 pb-28 pt-12 lg:pb-32">
        <motion.div className="max-w-[56rem]" style={desktop ? { y: textY } : undefined}>
          <Reveal y={12} delay={0.2}>
            <p className="eyebrow !text-[0.72rem] !tracking-[0.32em] text-[#e6c98f]">{heroEyebrow.toUpperCase()}</p>
          </Reveal>

          <h1 className="font-elegant mt-9 text-[clamp(2.7rem,7.2vw,5.9rem)] font-normal leading-[1.04] tracking-[-0.012em] text-ivory" aria-label={heroHeadline}>
            {lines.map((line, i) => (
              <SplitText key={i} as="span" text={line} className="block" immediate delay={0.35 + i * 0.35} stagger={0.08} />
            ))}
          </h1>

          <Reveal delay={1.1} className="font-elegant mt-8 max-w-[34rem] text-[clamp(1.3rem,2.3vw,1.75rem)] leading-snug text-ivory/90">
            <p>{heroSubcopy}</p>
          </Reveal>

          <Reveal delay={1.3} className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Magnetic>
              <Link
                href="/booking"
                className="font-elegant group inline-flex w-full items-center justify-center gap-4 rounded-full bg-[#ea5a52] px-9 py-[1.05rem] text-[1.25rem] font-medium text-ivory shadow-[0_14px_40px_-14px_rgba(234,90,82,0.9)] transition-all duration-500 hover:-translate-y-0.5 hover:bg-[#f06a61] sm:w-auto"
              >
                {primaryCtaText}
                <span className="transition-transform duration-500 group-hover:translate-x-1.5">
                  <Arrow />
                </span>
              </Link>
            </Magnetic>
            <Magnetic>
              <Link
                href="/services"
                className="font-elegant group inline-flex w-full items-center justify-center gap-4 rounded-full border border-[#d8b56d] px-9 py-[1.05rem] text-[1.25rem] font-medium text-ivory transition-all duration-500 hover:-translate-y-0.5 hover:bg-[#d8b56d]/15 sm:w-auto"
              >
                {secondaryCtaText}
                <span className="transition-transform duration-500 group-hover:translate-x-1.5">
                  <Arrow />
                </span>
              </Link>
            </Magnetic>
          </Reveal>

          <Reveal delay={1.5} className="mt-14 flex flex-wrap items-center gap-x-5 gap-y-2 text-[0.72rem] font-medium tracking-[0.26em] text-ivory/85">
            <span aria-hidden="true" className="h-px w-10 bg-[#d8b56d]" />
            {["WEDDINGS", "CORPORATE", "CULTURAL", "PRIVATE EVENTS"].map((t, i) => (
              <span key={t} className="flex items-center gap-5">
                {i > 0 && <span aria-hidden="true">/</span>}
                {t}
              </span>
            ))}
          </Reveal>
        </motion.div>
      </div>

      {/* soft curved edge into the ivory page */}
      <svg aria-hidden="true" viewBox="0 0 1440 48" preserveAspectRatio="none" className="absolute inset-x-0 bottom-[-1px] z-10 h-8 w-full fill-ivory sm:h-12">
        <path d="M0 0 Q720 56 1440 0 V48 H0 Z" />
      </svg>
    </section>
  );
}
