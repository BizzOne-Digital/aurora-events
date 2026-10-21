"use client";
import { useId } from "react";

type Common = {
  label: string;
  name: string;
  error?: string;
  hint?: string;
  required?: boolean;
};

const base =
  "block w-full rounded-2xl border-[1.5px] border-plum-900/20 bg-white/70 px-4 py-3.5 text-[1rem] text-plum-900 placeholder:text-plum-900/40 transition-[border-color,box-shadow,background-color] duration-300 focus:border-orchid focus:bg-white focus:outline-none focus:ring-4 focus:ring-orchid/25 aria-[invalid=true]:border-[#c0261a] aria-[invalid=true]:ring-[#c0261a]/10";

export function FieldShell({
  id,
  label,
  error,
  hint,
  required,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-bold text-plum-900">
        {label}
        {required && (
          <span aria-hidden="true" className="text-ember">
            {" "}
            *
          </span>
        )}
      </label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-sm font-semibold text-[#b3231a]">
          {error}
        </p>
      )}
    </div>
  );
}

function describedBy(id: string, error?: string, hint?: string) {
  return error ? `${id}-error` : hint ? `${id}-hint` : undefined;
}

export function TextField({
  label,
  name,
  error,
  hint,
  required,
  value,
  onChange,
  type = "text",
  ...rest
}: Common & {
  value: string;
  onChange: (v: string) => void;
  type?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "name" | "type">) {
  const id = useId();
  return (
    <FieldShell id={id} label={label} error={error} hint={hint} required={required}>
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, error, hint)}
        aria-required={required}
        className={base}
        {...rest}
      />
    </FieldShell>
  );
}

export function TextArea({
  label,
  name,
  error,
  hint,
  required,
  value,
  onChange,
  rows = 5,
  ...rest
}: Common & { value: string; onChange: (v: string) => void; rows?: number } & Omit<
    React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    "value" | "onChange" | "name"
  >) {
  const id = useId();
  return (
    <FieldShell id={id} label={label} error={error} hint={hint} required={required}>
      <textarea
        id={id}
        name={name}
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, error, hint)}
        aria-required={required}
        className={`${base} resize-y`}
        {...rest}
      />
    </FieldShell>
  );
}

export function SelectField({
  label,
  name,
  error,
  hint,
  required,
  value,
  onChange,
  options,
  placeholder = "Select an option",
}: Common & { value: string; onChange: (v: string) => void; options: readonly string[]; placeholder?: string }) {
  const id = useId();
  return (
    <FieldShell id={id} label={label} error={error} hint={hint} required={required}>
      <select
        id={id}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, error, hint)}
        aria-required={required}
        className={`${base} appearance-none bg-[url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='14' height='9' fill='none' stroke='%231e0a2e' stroke-width='2'><path d='M1 1l6 6 6-6'/></svg>")] bg-[length:14px] bg-[right_1.1rem_center] bg-no-repeat pr-10`}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

export function ConsentCheckbox({
  name,
  checked,
  onChange,
  error,
  children,
}: {
  name: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  error?: string;
  children: React.ReactNode;
}) {
  const id = useId();
  return (
    <div>
      <div className="flex items-start gap-3">
        <input
          id={id}
          name={name}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          aria-required
          className="mt-1 h-5 w-5 shrink-0 accent-[#c2331f]"
        />
        <label htmlFor={id} className="text-sm leading-relaxed text-plum-800">
          {children}
        </label>
      </div>
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-sm font-semibold text-[#b3231a]">
          {error}
        </p>
      )}
    </div>
  );
}

/** Off-screen honeypot + render-time stamp used by the server-side spam checks. */
export function SpamTraps({ stampRef }: { stampRef: React.RefObject<HTMLInputElement | null> }) {
  return (
    <>
      <div aria-hidden="true" className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden">
        <label>
          Leave this field empty
          <input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>
      <input type="hidden" name="startedAt" ref={stampRef} defaultValue="" />
    </>
  );
}

export function SubmitButton({ pending, children, pendingText = "Sending..." }: { pending: boolean; children: React.ReactNode; pendingText?: string }) {
  return (
    <button type="submit" disabled={pending} className="btn btn-primary w-full sm:w-auto">
      {pending ? (
        <>
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-plum-950/30 border-t-plum-950" aria-hidden="true" />
          {pendingText}
        </>
      ) : (
        children
      )}
    </button>
  );
}
