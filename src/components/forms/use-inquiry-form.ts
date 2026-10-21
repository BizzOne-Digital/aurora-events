"use client";
import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import type { z } from "zod";
import { zodErrors, type FormState } from "@/lib/validation";

type Action = (prev: FormState, formData: FormData) => Promise<FormState>;

/**
 * Shared logic for the public inquiry forms:
 *  - controlled values (kept after any recoverable error),
 *  - the same zod schema on the client as on the server,
 *  - server errors shown until the visitor edits the field,
 *  - progressive enhancement: works as a plain server-action form before hydration.
 */
export function useInquiryForm<V extends Record<string, string | boolean>>(initial: V, schema: z.ZodType, action: Action) {
  const [values, setValues] = useState<V>(initial);
  const [state, formAction, pending] = useActionState(action, {} as FormState);
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});
  const [seen, setSeen] = useState(state);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const stampRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // new server response: reset per-field dismissals (derive-state-during-render pattern)
  if (seen !== state) {
    setSeen(state);
    setDismissed([]);
    setClientErrors({});
  }

  useEffect(() => {
    if (stampRef.current) stampRef.current.value = String(Date.now());
  }, []);

  const set = (key: keyof V & string) => (value: string | boolean) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setDismissed((d) => [...d, key]);
    setClientErrors((e) => {
      const next = { ...e };
      delete next[key];
      return next;
    });
  };

  const serverErrors = Object.fromEntries(Object.entries(state.errors ?? {}).filter(([k]) => !dismissed.includes(k)));
  const errors: Record<string, string> = { ...serverErrors, ...clientErrors };

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      setClientErrors(zodErrors(parsed.error));
      requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
      return;
    }
    const fd = new FormData(e.currentTarget);
    startTransition(() => formAction(fd));
  }

  return { values, set, errors, state, pending, formAction, onSubmit, stampRef, formRef };
}
