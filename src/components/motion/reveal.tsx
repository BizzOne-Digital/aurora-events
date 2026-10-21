"use client";
import { motion, type HTMLMotionProps } from "motion/react";

const EASE = [0.16, 1, 0.3, 1] as const;

type RevealProps = Omit<HTMLMotionProps<"div">, "initial" | "animate" | "whileInView" | "transition"> & {
  delay?: number;
  y?: number;
  x?: number;
  duration?: number;
};

/** Fade + rise on scroll into view. Content stays visible without JS (see <noscript> in the root layout). */
export function Reveal({ delay = 0, y = 36, x = 0, duration = 1, children, ...rest }: RevealProps) {
  return (
    <motion.div
      data-reveal
      initial={{ opacity: 0, y, x }}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration, delay, ease: EASE }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

type SplitProps = {
  text: string;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  className?: string;
  /** index of the first word that receives `accentClassName` */
  accentFrom?: number;
  accentClassName?: string;
  delay?: number;
  /** animate on mount (hero) instead of on scroll */
  immediate?: boolean;
  stagger?: number;
};

/** Staggered word-by-word masked reveal for headings. Screen readers get the plain text. */
export function SplitText({
  text,
  as = "h2",
  className,
  accentFrom,
  accentClassName = "aurora-text",
  delay = 0,
  immediate = false,
  stagger = 0.07,
}: SplitProps) {
  const Tag = motion[as];
  const words = text.split(" ");
  const trigger = immediate
    ? { animate: "show" as const }
    : { whileInView: "show" as const, viewport: { once: true, margin: "0px 0px -15% 0px" } };
  return (
    <Tag
      data-reveal
      className={className}
      aria-label={text}
      initial="hidden"
      {...trigger}
      transition={{ staggerChildren: stagger, delayChildren: delay }}
    >
      {words.map((w, i) => (
        <span key={i} aria-hidden="true" className="inline-block overflow-hidden pb-[0.26em] -mb-[0.26em] align-top">
          <motion.span
            className={`inline-block ${accentFrom !== undefined && i >= accentFrom ? accentClassName : ""}`}
            variants={{ hidden: { y: "112%", rotate: 4 }, show: { y: "0%", rotate: 0 } }}
            transition={{ duration: 1.05, ease: EASE }}
          >
            {w}
            {i < words.length - 1 ? " " : ""}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}

/** Container that staggers direct <StaggerItem> children. */
export function Stagger({
  children,
  className,
  delay = 0,
  gap = 0.12,
  immediate = false,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  gap?: number;
  immediate?: boolean;
}) {
  const trigger = immediate
    ? { animate: "show" as const }
    : { whileInView: "show" as const, viewport: { once: true, margin: "0px 0px -10% 0px" } };
  return (
    <motion.div
      data-reveal
      className={className}
      initial="hidden"
      {...trigger}
      transition={{ staggerChildren: gap, delayChildren: delay }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className, y = 30 }: { children: React.ReactNode; className?: string; y?: number }) {
  return (
    <motion.div
      className={className}
      variants={{ hidden: { opacity: 0, y }, show: { opacity: 1, y: 0 } }}
      transition={{ duration: 0.9, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/** Vertical gradient line that draws itself downward when scrolled into view. */
export function GrowLine({ className }: { className?: string }) {
  return (
    <motion.div
      data-reveal
      aria-hidden="true"
      className={className}
      style={{ transformOrigin: "top" }}
      initial={{ scaleY: 0 }}
      whileInView={{ scaleY: 1 }}
      viewport={{ once: true, margin: "0px 0px -20% 0px" }}
      transition={{ duration: 1.8, ease: EASE }}
    />
  );
}
