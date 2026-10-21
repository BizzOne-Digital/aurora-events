"use client";
import Image from "next/image";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { useDesktopMotion } from "./hooks";

const EASE = [0.16, 1, 0.3, 1] as const;

type Props = {
  src: string;
  alt: string;
  sizes: string;
  /** shape + aspect-ratio classes, e.g. "arch arch-34 aspect-[3/4]" */
  className?: string;
  priority?: boolean;
  /** parallax travel in % of the frame (desktop only) */
  speed?: number;
  /** clip-path unveil on scroll */
  reveal?: boolean;
  delay?: number;
};

/**
 * Framed photograph with masked reveal and subtle parallax.
 * The outer frame owns the shape (overflow hidden); the inner layers animate with transform/clip-path only.
 */
export function ArchImage({ src, alt, sizes, className = "", priority, speed = 8, reveal = true, delay = 0 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const desktop = useDesktopMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [`-${speed}%`, `${speed}%`]);

  return (
    <div ref={ref} className={`relative overflow-hidden bg-plum-800 ${className}`}>
      <motion.div
        data-reveal
        className="absolute inset-0"
        initial={reveal ? { clipPath: "inset(100% 0% 0% 0%)" } : false}
        whileInView={reveal ? { clipPath: "inset(0% 0% 0% 0%)" } : undefined}
        viewport={{ once: true, margin: "0px 0px -8% 0px" }}
        transition={{ duration: 1.3, delay, ease: EASE }}
      >
        <motion.div
          className="absolute -inset-y-[10%] inset-x-0"
          style={desktop ? { y } : undefined}
          initial={reveal ? { scale: 1.25 } : false}
          whileInView={reveal ? { scale: 1 } : undefined}
          viewport={{ once: true, margin: "0px 0px -8% 0px" }}
          transition={{ duration: 1.8, delay, ease: EASE }}
        >
          <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />
        </motion.div>
      </motion.div>
    </div>
  );
}
