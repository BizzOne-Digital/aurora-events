"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

// Module state lives in the browser only: the first page load never plays a curtain (no intro loader);
// every later client-side navigation gets a short gradient wipe plus a content rise.
let firstLoadDone = false;

export function PageTransition({ children }: { children: React.ReactNode }) {
  const [animate] = useState(() => firstLoadDone);
  const [curtain, setCurtain] = useState(animate);

  useEffect(() => {
    firstLoadDone = true;
  }, []);

  return (
    <>
      <AnimatePresence>
        {curtain && (
          <motion.div
            key="curtain"
            className="curtain"
            aria-hidden="true"
            initial={{ scaleY: 1 }}
            animate={{ scaleY: 0 }}
            transition={{ duration: 0.85, ease: [0.76, 0, 0.24, 1], delay: 0.05 }}
            onAnimationComplete={() => setCurtain(false)}
          />
        )}
      </AnimatePresence>
      <motion.div
        initial={animate ? { opacity: 0, y: 28 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: animate ? 0.35 : 0, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </motion.div>
    </>
  );
}
