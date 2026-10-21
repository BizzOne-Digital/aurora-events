"use client";
import { startTransition, useActionState, useEffect, useId, useState } from "react";
import type { FormState } from "@/lib/validation";
import { useToast } from "./toast";

/** Status + private notes editor shared by booking and contact inquiries. */
export function InquiryUpdateForm({
  statuses,
  status,
  notes,
  action,
}: {
  statuses: readonly string[];
  status: string;
  notes: string;
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
}) {
  const toast = useToast();
  const [state, formAction, pending] = useActionState(action, {} as FormState);
  const [values, setValues] = useState({ status, notes });
  const uid = useId();

  useEffect(() => {
    if (state.message) toast(state.message, state.ok ? "success" : "error");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form
      noValidate
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData();
        fd.set("status", values.status);
        fd.set("notes", values.notes);
        startTransition(() => formAction(fd));
      }}
    >
      <div>
        <label htmlFor={`${uid}-s`} className="adm-label">
          Status
        </label>
        <select id={`${uid}-s`} className="adm-field" value={values.status} onChange={(e) => setValues((v) => ({ ...v, status: e.target.value }))}>
          {statuses.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        {state.errors?.status && <p className="mt-1 text-sm font-semibold text-[#b3231a]">{state.errors.status}</p>}
      </div>
      <div>
        <label htmlFor={`${uid}-n`} className="adm-label">
          Private internal notes
        </label>
        <textarea
          id={`${uid}-n`}
          className="adm-field"
          rows={7}
          maxLength={6000}
          value={values.notes}
          onChange={(e) => setValues((v) => ({ ...v, notes: e.target.value }))}
          aria-describedby={`${uid}-h`}
        />
        <p id={`${uid}-h`} className="mt-1 text-xs text-[#7a6a89]">
          Only administrators can see these notes. They are never shown on the website.
        </p>
        {state.errors?.notes && <p className="mt-1 text-sm font-semibold text-[#b3231a]">{state.errors.notes}</p>}
      </div>
      <button type="submit" className="adm-btn adm-btn-primary !min-h-11 !px-6" disabled={pending}>
        {pending ? "Saving..." : "Save status and notes"}
      </button>
    </form>
  );
}
