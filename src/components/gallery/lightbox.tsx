"use client";
import Image from "next/image";
import { useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion } from "motion/react";
import type { GalleryDTO } from "@/lib/types";

type Props = {
  items: GalleryDTO[];
  index: number;
  onIndex: (i: number) => void;
  onClose: () => void;
};

/** Keyboard-accessible modal lightbox: focus trap, Esc to close, arrow keys / swipe to navigate, focus restore. */
export default function Lightbox({ items, index, onIndex, onClose }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const item = items[index];

  const go = useCallback(
    (dir: 1 | -1) => onIndex((index + dir + items.length) % items.length),
    [index, items.length, onIndex],
  );

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = prevOverflow;
      opener?.focus?.();
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return onClose();
      if (e.key === "ArrowRight") return go(1);
      if (e.key === "ArrowLeft") return go(-1);
      if (e.key !== "Tab") return;
      const f = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>("button:not([disabled])") ?? []);
      if (!f.length) return;
      const first = f[0];
      const last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [go, onClose]);

  if (!item) return null;

  return createPortal(
    <motion.div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={`Gallery image ${index + 1} of ${items.length}`}
      className="on-dark fixed inset-0 z-[110] flex flex-col bg-plum-950/95 text-ivory backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="flex items-center justify-between px-5 py-4">
        <p className="eyebrow text-peach" aria-live="polite">
          {index + 1} / {items.length}
          <span className="sr-only"> {item.caption}</span>
        </p>
        <button ref={closeRef} type="button" onClick={onClose} className="btn btn-ghost-dark !min-h-11 !px-5 !py-2">
          Close
        </button>
      </div>

      <div className="relative flex-1 px-2 sm:px-16" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <motion.div
          key={item.id}
          className="relative mx-auto h-full max-w-6xl"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.25}
          onDragEnd={(_, info) => {
            if (info.offset.x < -80) go(1);
            else if (info.offset.x > 80) go(-1);
          }}
        >
          <Image src={item.image.url} alt={item.image.alt} fill sizes="100vw" className="select-none object-contain" draggable={false} />
        </motion.div>
        {items.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous image"
              className="absolute left-1 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-white/30 bg-plum-950/60 text-xl transition-colors hover:bg-ivory hover:text-plum-950 sm:left-4"
            >
              <span aria-hidden="true">&larr;</span>
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next image"
              className="absolute right-1 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-white/30 bg-plum-950/60 text-xl transition-colors hover:bg-ivory hover:text-plum-950 sm:right-4"
            >
              <span aria-hidden="true">&rarr;</span>
            </button>
          </>
        )}
      </div>

      <div className="px-5 py-5 text-center">
        <p className="font-display text-2xl">{item.caption || item.image.alt}</p>
        <p className="mt-1 text-xs text-ivory/60">
          {item.category}
          {item.illustrative ? " · Illustrative image, not an event we organised" : ""}
        </p>
      </div>
    </motion.div>,
    document.body,
  );
}
