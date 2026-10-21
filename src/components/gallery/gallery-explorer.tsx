"use client";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { GalleryDTO } from "@/lib/types";

// The lightbox is only needed after a click, so it is loaded lazily.
const Lightbox = dynamic(() => import("./lightbox"), { ssr: false });

export function GalleryExplorer({ items }: { items: GalleryDTO[] }) {
  const categories = useMemo(() => ["All", ...Array.from(new Set(items.map((i) => i.category)))], [items]);
  const [active, setActive] = useState("All");
  const [open, setOpen] = useState<number | null>(null);

  const visible = useMemo(() => (active === "All" ? items : items.filter((i) => i.category === active)), [items, active]);

  return (
    <div>
      <div role="group" aria-label="Filter gallery by category" className="flex flex-wrap gap-2">
        {categories.map((c) => {
          const on = c === active;
          return (
            <button
              key={c}
              type="button"
              aria-pressed={on}
              onClick={() => setActive(c)}
              className={`relative rounded-full px-5 py-2.5 text-sm font-bold transition-colors ${
                on ? "text-plum-950" : "text-plum-900 hover:bg-plum-900/5"
              } border border-plum-900/20`}
            >
              {on && (
                <motion.span layoutId="gallery-pill" className="aurora-fill absolute inset-0 -z-0 rounded-full" transition={{ type: "spring", stiffness: 380, damping: 32 }} />
              )}
              <span className="relative z-10">{c}</span>
            </button>
          );
        })}
      </div>
      <p className="sr-only" aria-live="polite">
        Showing {visible.length} {visible.length === 1 ? "image" : "images"}
        {active !== "All" ? ` in ${active}` : ""}
      </p>

      <motion.ul layout className="mt-10 grid grid-flow-dense grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {visible.map((it, i) => {
            const feature = i % 5 === 0; // every fifth tile is a wide feature tile
            return (
              <motion.li
                key={it.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className={feature ? "col-span-2 md:row-span-2" : ""}
              >
                <button
                  type="button"
                  onClick={() => setOpen(i)}
                  aria-haspopup="dialog"
                  aria-label={`Open image: ${it.caption || it.image.alt}`}
                  className={`group relative block w-full overflow-hidden rounded-3xl bg-plum-800 ${feature ? "aspect-[16/9] md:aspect-auto md:h-full" : "aspect-[4/3]"}`}
                >
                  <Image
                    src={it.image.url}
                    alt=""
                    fill
                    sizes={feature ? "(min-width:768px) 66vw, 100vw" : "(min-width:768px) 33vw, 50vw"}
                    className="object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-110"
                  />
                  <span className="absolute inset-0 bg-gradient-to-t from-plum-950/85 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100" />
                  <span className="absolute inset-x-0 bottom-0 translate-y-3 p-5 text-left text-ivory opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
                    <span className="eyebrow block !text-[0.62rem] text-peach">{it.category}</span>
                    <span className="font-display mt-1 block text-xl leading-tight">{it.caption || it.image.alt}</span>
                  </span>
                </button>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </motion.ul>

      <AnimatePresence>
        {open !== null && (
          <Lightbox items={visible} index={Math.min(open, visible.length - 1)} onIndex={setOpen} onClose={() => setOpen(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
