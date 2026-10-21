"use client";
import Link from "next/link";
import { startTransition, useActionState, useEffect, useId, useRef, useState } from "react";
import { slugify, type FormState } from "@/lib/validation";
import { ImageField, ImageListField, type ImageValue, type UploadFolder } from "./image-field";
import { useToast } from "./toast";

export type FieldDef =
  | { type: "section"; title: string; text?: string }
  | { type: "text"; name: string; label: string; required?: boolean; hint?: string; maxLength?: number; half?: boolean; placeholder?: string; slugFrom?: string; inputType?: string }
  | { type: "textarea"; name: string; label: string; required?: boolean; hint?: string; maxLength?: number; rows?: number }
  | { type: "markdown"; name: string; label: string; required?: boolean; hint?: string }
  | { type: "select"; name: string; label: string; options: readonly string[]; half?: boolean; required?: boolean; hint?: string }
  | { type: "date"; name: string; label: string; half?: boolean; hint?: string }
  | { type: "checkbox"; name: string; label: string; hint?: string }
  | { type: "image"; name: string; label: string; required?: boolean; hint?: string; folder?: UploadFolder }
  | { type: "images"; name: string; label: string; hint?: string; max?: number; folder?: UploadFolder };

export type FormValues = Record<string, string | boolean | ImageValue | ImageValue[] | null>;
type Action = (prev: FormState, formData: FormData) => Promise<FormState>;

function Err({ id, error }: { id: string; error?: string }) {
  return error ? (
    <p id={id} className="mt-1 text-sm font-semibold text-[#b3231a]">
      {error}
    </p>
  ) : null;
}

const TOOLS = ["H2", "H3", "Bold", "Italic", "Link", "List", "Quote"] as const;

function MarkdownEditor({
  label,
  value,
  onChange,
  error,
  hint,
  required,
  previewAction,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  hint?: string;
  required?: boolean;
  previewAction?: (md: string) => Promise<{ html: string }>;
}) {
  const id = useId();
  const ref = useRef<HTMLTextAreaElement>(null);
  const [tab, setTab] = useState<"write" | "preview">("write");
  const [html, setHtml] = useState("");
  const [loading, setLoading] = useState(false);

  function wrap(before: string, after = "", placeholder = "text") {
    const el = ref.current;
    if (!el) return;
    const { selectionStart: s, selectionEnd: e } = el;
    const picked = value.slice(s, e) || placeholder;
    const next = value.slice(0, s) + before + picked + after + value.slice(e);
    onChange(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(s + before.length, s + before.length + picked.length);
    });
  }
  function linePrefix(prefix: string) {
    const el = ref.current;
    if (!el) return;
    const s = value.lastIndexOf("\n", el.selectionStart - 1) + 1;
    onChange(value.slice(0, s) + prefix + value.slice(s));
    requestAnimationFrame(() => el.focus());
  }

  async function showPreview() {
    setTab("preview");
    if (!previewAction) return;
    setLoading(true);
    try {
      setHtml((await previewAction(value)).html);
    } finally {
      setLoading(false);
    }
  }

  function format(kind: (typeof TOOLS)[number]) {
    if (kind === "H2") linePrefix("## ");
    else if (kind === "H3") linePrefix("### ");
    else if (kind === "Bold") wrap("**", "**");
    else if (kind === "Italic") wrap("*", "*");
    else if (kind === "Link") wrap("[", "](https://)", "link text");
    else if (kind === "List") linePrefix("- ");
    else linePrefix("> ");
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-2">
        <label htmlFor={id} className="adm-label !mb-0">
          {label}
          {required && <span className="text-[#c0261a]"> *</span>}
        </label>
        <div className="flex gap-1" role="tablist" aria-label="Editor mode">
          <button type="button" role="tab" aria-selected={tab === "write"} className={`adm-btn !min-h-8 !px-3 ${tab === "write" ? "adm-btn-primary" : "adm-btn-soft"}`} onClick={() => setTab("write")}>
            Write
          </button>
          <button type="button" role="tab" aria-selected={tab === "preview"} className={`adm-btn !min-h-8 !px-3 ${tab === "preview" ? "adm-btn-primary" : "adm-btn-soft"}`} onClick={showPreview}>
            Preview
          </button>
        </div>
      </div>
      {tab === "write" ? (
        <>
          <div className="mt-2 flex flex-wrap gap-1" role="toolbar" aria-label="Formatting">
            {TOOLS.map((name) => (
              <button key={name} type="button" className="adm-btn adm-btn-soft !min-h-8 !px-3 !text-xs" onClick={() => format(name)}>
                {name}
              </button>
            ))}
          </div>
          <textarea
            id={id}
            ref={ref}
            className="adm-field mt-2 min-h-[22rem] font-mono !text-[0.88rem]"
            value={value}
            aria-invalid={error ? true : undefined}
            maxLength={60000}
            onChange={(e) => onChange(e.target.value)}
          />
        </>
      ) : (
        <div className="mt-2 min-h-[22rem] rounded-xl border border-[#d9cde3] bg-white p-5">
          {loading ? <p className="text-sm text-[#7a6a89]">Rendering preview...</p> : <div className="prose-article !text-base" dangerouslySetInnerHTML={{ __html: html }} />}
        </div>
      )}
      {hint && !error && <p className="mt-1 text-xs text-[#7a6a89]">{hint}</p>}
      <Err id={`${id}-err`} error={error} />
    </div>
  );
}

export function EntityForm({
  fields,
  initial,
  action,
  submitLabel,
  cancelHref,
  previewAction,
  extraActions,
}: {
  fields: FieldDef[];
  initial: FormValues;
  action: Action;
  submitLabel: string;
  cancelHref?: string;
  previewAction?: (md: string) => Promise<{ html: string }>;
  extraActions?: React.ReactNode;
}) {
  const toast = useToast();
  const [values, setValues] = useState<FormValues>(initial);
  const [slugTouched, setSlugTouched] = useState(Boolean(initial.slug));
  const [state, formAction, pending] = useActionState(action, {} as FormState);
  const uid = useId();

  useEffect(() => {
    if (state.message) toast(state.message, state.ok ? "success" : "error");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const errors = state.errors ?? {};
  const errorFor = (name: string) => errors[name] ?? Object.entries(errors).find(([k]) => k.startsWith(`${name}.`))?.[1];
  const set = (name: string, v: FormValues[string]) => setValues((p) => ({ ...p, [name]: v }));

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData();
    for (const f of fields) {
      if (f.type === "section") continue;
      const v = values[f.name];
      if (f.type === "checkbox") {
        if (v) fd.set(f.name, "on");
      } else if (f.type === "image" || f.type === "images") {
        fd.set(f.name, v ? JSON.stringify(v) : "");
      } else {
        fd.set(f.name, typeof v === "string" ? v : "");
      }
    }
    startTransition(() => formAction(fd));
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      {state.message && !state.ok && (
        <div role="alert" className="rounded-xl border border-[#c0261a]/30 bg-[#fdecea] px-4 py-3 text-sm font-semibold text-[#8f1d13]">
          {state.message}
          {state.errors && Object.keys(state.errors).length > 0 && (
            <ul className="mt-1 list-disc pl-5 font-medium">
              {Object.entries(state.errors).map(([k, m]) => (
                <li key={k}>{m}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        {fields.map((f, idx) => {
          if (f.type === "section") {
            return (
              <div key={`s${idx}`} className="sm:col-span-2 border-t border-[#eadff2] pt-5 first:border-0 first:pt-0">
                <h2 className="text-lg font-bold text-plum-900">{f.title}</h2>
                {f.text && <p className="text-sm text-[#7a6a89]">{f.text}</p>}
              </div>
            );
          }
          const id = `${uid}-${f.name}`;
          const error = errorFor(f.name);
          const full = !("half" in f && f.half);
          const wrapper = `${full ? "sm:col-span-2" : ""}`;
          const required = "required" in f ? f.required : false;
          const label = (
            <label htmlFor={id} className="adm-label">
              {f.label}
              {required && <span className="text-[#c0261a]"> *</span>}
            </label>
          );
          const described = error ? `${id}-err` : undefined;

          switch (f.type) {
            case "text":
              return (
                <div key={f.name} className={wrapper}>
                  {label}
                  <input
                    id={id}
                    className="adm-field"
                    type={f.inputType ?? "text"}
                    value={(values[f.name] as string) ?? ""}
                    maxLength={f.maxLength}
                    placeholder={f.placeholder}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={described}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (f.name === "slug") setSlugTouched(true);
                      setValues((p) => {
                        const next = { ...p, [f.name]: v };
                        const slugField = fields.find((x) => x.type === "text" && x.slugFrom === f.name);
                        if (slugField && slugField.type === "text" && !slugTouched) next[slugField.name] = slugify(v);
                        return next;
                      });
                    }}
                  />
                  {f.hint && !error && <p className="mt-1 text-xs text-[#7a6a89]">{f.hint}</p>}
                  <Err id={`${id}-err`} error={error} />
                </div>
              );
            case "textarea":
              return (
                <div key={f.name} className={wrapper}>
                  {label}
                  <textarea
                    id={id}
                    className="adm-field"
                    rows={f.rows ?? 4}
                    value={(values[f.name] as string) ?? ""}
                    maxLength={f.maxLength}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={described}
                    onChange={(e) => set(f.name, e.target.value)}
                  />
                  {f.hint && !error && <p className="mt-1 text-xs text-[#7a6a89]">{f.hint}</p>}
                  <Err id={`${id}-err`} error={error} />
                </div>
              );
            case "markdown":
              return (
                <div key={f.name} className="sm:col-span-2">
                  <MarkdownEditor
                    label={f.label}
                    value={(values[f.name] as string) ?? ""}
                    onChange={(v) => set(f.name, v)}
                    error={error}
                    hint={f.hint}
                    required={f.required}
                    previewAction={previewAction}
                  />
                </div>
              );
            case "select":
              return (
                <div key={f.name} className={wrapper}>
                  {label}
                  <select id={id} className="adm-field" value={(values[f.name] as string) ?? ""} aria-invalid={error ? true : undefined} onChange={(e) => set(f.name, e.target.value)}>
                    {f.options.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                  {f.hint && !error && <p className="mt-1 text-xs text-[#7a6a89]">{f.hint}</p>}
                  <Err id={`${id}-err`} error={error} />
                </div>
              );
            case "date":
              return (
                <div key={f.name} className={wrapper}>
                  {label}
                  <input id={id} type="date" className="adm-field" value={(values[f.name] as string) ?? ""} aria-invalid={error ? true : undefined} onChange={(e) => set(f.name, e.target.value)} />
                  {f.hint && !error && <p className="mt-1 text-xs text-[#7a6a89]">{f.hint}</p>}
                  <Err id={`${id}-err`} error={error} />
                </div>
              );
            case "checkbox":
              return (
                <div key={f.name} className="sm:col-span-2 sm:col-span-1">
                  <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#eadff2] p-3.5 hover:bg-[#faf6fd]">
                    <input type="checkbox" className="mt-0.5 h-5 w-5 accent-[#a8399f]" checked={Boolean(values[f.name])} onChange={(e) => set(f.name, e.target.checked)} />
                    <span>
                      <span className="block text-sm font-bold">{f.label}</span>
                      {f.hint && <span className="block text-xs text-[#7a6a89]">{f.hint}</span>}
                    </span>
                  </label>
                </div>
              );
            case "image":
              return (
                <div key={f.name} className="sm:col-span-2">
                  <ImageField label={f.label} value={(values[f.name] as ImageValue | null) ?? null} onChange={(v) => set(f.name, v)} error={error} hint={f.hint} required={f.required} folder={f.folder} />
                </div>
              );
            case "images":
              return (
                <div key={f.name} className="sm:col-span-2">
                  <ImageListField label={f.label} value={(values[f.name] as ImageValue[]) ?? []} onChange={(v) => set(f.name, v)} max={f.max} error={error} hint={f.hint} folder={f.folder} />
                </div>
              );
          }
        })}
      </div>

      <div className="sticky bottom-0 -mx-4 flex flex-wrap items-center gap-3 border-t border-[#eadff2] bg-ivory/90 px-4 py-4 backdrop-blur sm:-mx-0 sm:rounded-b-2xl sm:px-0">
        <button type="submit" className="adm-btn adm-btn-primary !min-h-11 !px-6" disabled={pending}>
          {pending ? "Saving..." : submitLabel}
        </button>
        {cancelHref && (
          <Link href={cancelHref} className="adm-btn adm-btn-soft !min-h-11">
            Back to list
          </Link>
        )}
        {extraActions}
        <span className="text-sm text-[#7a6a89]" aria-live="polite">
          {pending ? "Saving your changes..." : ""}
        </span>
      </div>
    </form>
  );
}
