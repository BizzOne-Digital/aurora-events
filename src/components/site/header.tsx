"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { NAV_LINKS } from "@/lib/site";
import { Logo } from "./logo";

// Primary bar: the five main pages. The full list (incl. Testimonials, Blog, Our Team) is in the menu and footer.
const PRIMARY = NAV_LINKS.filter((l) => ["/", "/about", "/services", "/gallery", "/contact"].includes(l.href));

type NavService = { title: string; slug: string };

export function Header({ services, phone, phoneDisplay, ctaText }: { services: NavService[]; phone: string; phoneDisplay: string; ctaText: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const { scrollY } = useScroll();
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setHidden(y > 200 && y > prev);
  });

  const close = useCallback(() => {
    setOpen(false);
    toggleRef.current?.focus();
  }, []);

  // lock page scroll, trap focus and support Escape while the mobile menu is open
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusables = () =>
      Array.from(menuRef.current?.querySelectorAll<HTMLElement>("a[href], button:not([disabled])") ?? []);
    focusables()[0]?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return close();
      if (e.key !== "Tab") return;
      const items = focusables();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <>
      <motion.header
        className="fixed inset-x-0 top-0 z-50 border-b border-plum-900/5 bg-ivory/95 text-plum-900 backdrop-blur-md"
        animate={{ y: hidden && !open ? "-100%" : "0%" }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="container-x flex h-[4.5rem] items-center justify-between gap-6 sm:h-20">
          <Link href="/" aria-label="7270020 Canada Ltd. home" className="shrink-0">
            <Logo className="h-10 sm:h-[3.6rem]" />
          </Link>

          <nav aria-label="Primary" className="hidden items-center gap-9 lg:flex">
            {PRIMARY.map((l) => {
              const link = (
                <Link
                  key={l.href}
                  href={l.href}
                  aria-current={isActive(l.href) ? "page" : undefined}
                  className="font-elegant relative inline-flex items-center gap-1.5 py-2 text-[1.08rem] font-medium text-plum-900 transition-colors hover:text-ember aria-[current=page]:text-ember"
                >
                  {l.label}
                  {l.href === "/services" && services.length > 0 && (
                    <svg viewBox="0 0 12 8" className="h-2 w-2.5 transition-transform duration-300 group-hover/dd:rotate-180 group-focus-within/dd:rotate-180" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                      <path d="M1 1.5l5 5 5-5" />
                    </svg>
                  )}
                  {isActive(l.href) && (
                    <motion.span layoutId="nav-underline" className="absolute inset-x-0 -bottom-0.5 h-[2px] rounded-full bg-[#e9645a]" />
                  )}
                </Link>
              );
              if (l.href !== "/services" || services.length === 0) return link;
              return (
                <div
                  key={l.href}
                  className="group/dd relative"
                  onKeyDown={(e) => {
                    if (e.key === "Escape") (document.activeElement as HTMLElement | null)?.blur();
                  }}
                >
                  {link}
                  <div className="invisible absolute left-1/2 top-full z-50 w-[19rem] -translate-x-1/2 translate-y-2 pt-3 opacity-0 transition-all duration-300 group-focus-within/dd:visible group-focus-within/dd:translate-y-0 group-focus-within/dd:opacity-100 group-hover/dd:visible group-hover/dd:translate-y-0 group-hover/dd:opacity-100">
                    <ul className="overflow-hidden rounded-2xl border border-plum-900/10 bg-ivory p-2 shadow-[0_30px_70px_-25px_rgba(30,10,46,0.55)]">
                      {services.map((s) => (
                        <li key={s.slug}>
                          <Link href={`/services#${s.slug}`} className="font-elegant block rounded-xl px-4 py-2.5 text-[1.05rem] text-plum-900 transition-colors hover:bg-plum-900/5 hover:text-ember focus-visible:bg-plum-900/5">
                            {s.title}
                          </Link>
                        </li>
                      ))}
                      <li className="mt-1 border-t border-plum-900/10 pt-1">
                        <Link href="/services" className="eyebrow block rounded-xl px-4 py-2.5 !text-[0.68rem] text-ember transition-colors hover:bg-plum-900/5">
                          View all services &rarr;
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex">
              <Link
                href="/booking"
                className="font-elegant inline-flex items-center rounded-full bg-plum-900 px-6 py-3 text-[1.05rem] font-medium text-ivory transition-all duration-300 hover:-translate-y-0.5 hover:bg-plum-700 hover:shadow-[0_12px_30px_-10px_rgba(30,10,46,0.7)]"
              >
                {ctaText}
              </Link>
            </span>
            <button
              ref={toggleRef}
              type="button"
              className="relative grid h-11 w-11 place-items-center rounded-full border border-plum-900/25 lg:hidden"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-controls="mobile-menu"
              onClick={() => (open ? close() : setOpen(true))}
            >
              <span aria-hidden="true" className="relative block h-3 w-5">
                <motion.span className="absolute left-0 top-0 h-[2px] w-5 rounded bg-plum-900" animate={open ? { y: 5, rotate: 45 } : { y: 0, rotate: 0 }} />
                <motion.span className="absolute bottom-0 left-0 h-[2px] w-5 rounded bg-plum-900" animate={open ? { y: -5, rotate: -45 } : { y: 0, rotate: 0 }} />
              </span>
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            ref={menuRef}
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            className="on-dark aurora-deep grain fixed inset-0 z-40 flex flex-col overflow-y-auto px-6 pb-10 pt-28 text-ivory"
            initial={{ clipPath: "circle(0px at calc(100% - 2.75rem) 2.25rem)" }}
            animate={{ clipPath: "circle(160% at calc(100% - 2.75rem) 2.25rem)" }}
            exit={{ clipPath: "circle(0px at calc(100% - 2.75rem) 2.25rem)" }}
            transition={{ duration: 0.75, ease: [0.76, 0, 0.24, 1] }}
          >
            <nav aria-label="Mobile" className="relative z-10 flex flex-1 flex-col justify-center gap-1">
              {NAV_LINKS.map((l, i) => (
                <motion.div
                  key={l.href}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: 0.25 + i * 0.05, duration: 0.7, ease: [0.16, 1, 0.3, 1] } }}
                  exit={{ opacity: 0, transition: { duration: 0.15 } }}
                >
                  <Link
                    href={l.href}
                    onClick={() => setOpen(false)}
                    aria-current={isActive(l.href) ? "page" : undefined}
                    className="font-elegant flex items-baseline gap-4 py-1.5 text-[2.4rem] leading-tight text-ivory/90 transition-colors hover:text-peach aria-[current=page]:text-peach"
                  >
                    <span className="eyebrow !text-[0.65rem] text-champagne">{String(i + 1).padStart(2, "0")}</span>
                    {l.label}
                  </Link>
                  {l.href === "/services" && services.length > 0 && (
                    <ul className="mb-2 ml-12 mt-1 space-y-1 border-l border-white/20 pl-4">
                      {services.map((s) => (
                        <li key={s.slug}>
                          <Link href={`/services#${s.slug}`} onClick={() => setOpen(false)} className="block py-1 text-lg text-ivory/70 transition-colors hover:text-peach">
                            {s.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </motion.div>
              ))}
            </nav>
            <motion.div
              className="relative z-10 mt-8 flex flex-col gap-3"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0, transition: { delay: 0.65, duration: 0.7 } }}
              exit={{ opacity: 0, transition: { duration: 0.1 } }}
            >
              <Link href="/booking" onClick={() => setOpen(false)} className="btn btn-primary">
                {ctaText}
              </Link>
              <a href={`tel:${phone}`} className="btn btn-ghost-dark">
                Call {phoneDisplay}
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
