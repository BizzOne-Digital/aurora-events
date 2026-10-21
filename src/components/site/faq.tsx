"use client";
import { useId, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { FaqDTO } from "@/lib/types";

export function FaqList({ faqs }: { faqs: Pick<FaqDTO, "id" | "question" | "answer">[] }) {
  const [open, setOpen] = useState<string | null>(null);
  const uid = useId();
  return (
    <ul className="divide-y divide-plum-900/15 border-y border-plum-900/15">
      {faqs.map((f) => {
        const isOpen = open === f.id;
        const panelId = `${uid}-${f.id}`;
        return (
          <li key={f.id}>
            <h3 className="!font-sans !text-base !leading-snug !tracking-normal">
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? null : f.id)}
                className="group flex w-full items-center justify-between gap-6 py-6 text-left"
              >
                <span className="font-display text-xl leading-snug sm:text-2xl">{f.question}</span>
                <span
                  aria-hidden="true"
                  className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border border-plum-900/30 text-lg transition-all duration-500 group-hover:border-transparent group-hover:bg-gradient-to-br group-hover:from-coral group-hover:to-orchid ${
                    isOpen ? "rotate-45 bg-plum-900 text-ivory" : ""
                  }`}
                >
                  +
                </span>
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={panelId}
                  role="region"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <p className="max-w-3xl pb-7 text-muted">{f.answer}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </li>
        );
      })}
    </ul>
  );
}
