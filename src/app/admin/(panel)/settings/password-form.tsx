"use client";
import { startTransition, useActionState, useEffect, useId, useState } from "react";
import { useToast } from "@/components/admin/toast";
import type { FormState } from "@/lib/validation";
import { changePasswordAction } from "../../auth-actions";

export function PasswordForm() {
  const toast = useToast();
  const [state, action, pending] = useActionState<FormState, FormData>(changePasswordAction, {});
  const [v, setV] = useState({ current: "", next: "", confirm: "" });
  const uid = useId();
  const [seen, setSeen] = useState(state);
  if (seen !== state) {
    setSeen(state);
    if (state.ok) setV({ current: "", next: "", confirm: "" });
  }

  useEffect(() => {
    if (state.message) toast(state.message, state.ok ? "success" : "error");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const field = (name: "current" | "next" | "confirm", label: string, auto: string) => (
    <div>
      <label htmlFor={`${uid}-${name}`} className="adm-label">
        {label}
      </label>
      <input
        id={`${uid}-${name}`}
        type="password"
        className="adm-field"
        autoComplete={auto}
        value={v[name]}
        aria-invalid={state.errors?.[name] ? true : undefined}
        onChange={(e) => setV((p) => ({ ...p, [name]: e.target.value }))}
      />
      {state.errors?.[name] && <p className="mt-1 text-sm font-semibold text-[#b3231a]">{state.errors[name]}</p>}
    </div>
  );

  return (
    <form
      noValidate
      className="grid gap-5 sm:max-w-md"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData();
        for (const [k, val] of Object.entries(v)) fd.set(k, val);
        startTransition(() => action(fd));
      }}
    >
      {field("current", "Current password", "current-password")}
      {field("next", "New password", "new-password")}
      <p className="-mt-3 text-xs text-[#7a6a89]">At least 12 characters with upper case, lower case and a number.</p>
      {field("confirm", "Confirm new password", "new-password")}
      <div>
        <button type="submit" className="adm-btn adm-btn-primary !min-h-11 !px-6" disabled={pending}>
          {pending ? "Updating..." : "Change password"}
        </button>
      </div>
    </form>
  );
}
