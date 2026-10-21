"use client";
import { createContext, useCallback, useContext, useState } from "react";

type Toast = { id: number; message: string; kind: "success" | "error" };
const Ctx = createContext<(message: string, kind?: Toast["kind"]) => void>(() => {});

export const useToast = () => useContext(Ctx);

let counter = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((message: string, kind: Toast["kind"] = "success") => {
    const id = ++counter;
    setToasts((t) => [...t, { id, message, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), kind === "error" ? 7000 : 3800);
  }, []);

  return (
    <Ctx.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[200] flex flex-col items-center gap-2 px-4" aria-live="polite">
        {toasts.map((t) => (
          <div
            key={t.id}
            role={t.kind === "error" ? "alert" : "status"}
            className={`pointer-events-auto flex max-w-md items-start gap-3 rounded-2xl px-5 py-3.5 text-sm font-semibold shadow-xl ${
              t.kind === "error" ? "bg-[#8f1d13] text-white" : "bg-plum-900 text-ivory"
            }`}
          >
            <span aria-hidden="true">{t.kind === "error" ? "!" : "✓"}</span>
            <span>{t.message}</span>
            <button
              type="button"
              aria-label="Dismiss"
              className="ml-2 opacity-70 hover:opacity-100"
              onClick={() => setToasts((all) => all.filter((x) => x.id !== t.id))}
            >
              &times;
            </button>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}
