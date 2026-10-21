"use client";
import { useSyncExternalStore } from "react";

/** SSR-safe media query hook (defaults to `false` on the server). */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (notify) => {
      const m = window.matchMedia(query);
      m.addEventListener("change", notify);
      return () => m.removeEventListener("change", notify);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/** Heavy effects (parallax, tilt, magnetic) only on roomy, hover-capable screens. */
export function useDesktopMotion(): boolean {
  return useMediaQuery("(min-width: 1024px) and (hover: hover) and (pointer: fine)");
}
