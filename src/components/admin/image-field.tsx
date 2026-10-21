"use client";
import Image from "next/image";
import { useId, useRef, useState } from "react";
import { IMAGE_URL_PATTERN } from "@/lib/validation";
import { useToast } from "./toast";

export type ImageValue = { url: string; alt: string; publicId: string };
export type UploadFolder = "products" | "gallery" | "pages" | "misc";

const TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const HOST_LIMIT = 4 * 1024 * 1024; // serverless hosts (e.g. Vercel) reject request bodies above ~4.5 MB
const PICK_LIMIT = 25 * 1024 * 1024;

/** Shrinks big photos in the browser so they fit hosting request limits. GIFs are sent untouched. */
async function prepare(file: File): Promise<File> {
  if (file.size <= HOST_LIMIT || file.type === "image/gif") return file;
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 2400 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  for (const q of [0.86, 0.72, 0.58]) {
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/webp", q));
    if (blob && blob.size <= HOST_LIMIT) return new File([blob], file.name.replace(/\.\w+$/, "") + ".webp", { type: "image/webp" });
  }
  return file;
}

async function uploadFile(original: File, folder: UploadFolder): Promise<string> {
  if (!TYPES.includes(original.type)) throw new Error(`${original.name}: use a JPG, PNG, WebP or GIF image.`);
  if (original.size > PICK_LIMIT) throw new Error(`${original.name} is too large (maximum 25 MB).`);
  const file = await prepare(original);
  if (file.size > HOST_LIMIT) throw new Error(`${original.name} is still over 4 MB after shrinking. Please choose a smaller image.`);
  const body = new FormData();
  body.append("file", file);
  body.append("folder", folder);
  const res = await fetch("/api/upload", { method: "POST", body });
  const data = (await res.json().catch(() => ({}))) as { success?: boolean; url?: string; error?: string };
  if (!res.ok || !data.success || !data.url) throw new Error(data.error ?? "Upload failed.");
  return data.url;
}

function Preview({ url, alt }: { url: string; alt: string }) {
  // legacy disk uploads (/uploads/...) no longer exist: show the placeholder instead of a broken image
  const src = url.startsWith("/uploads/") ? "/images/placeholder.svg" : url;
  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-plum-900/10">
      <Image src={src} alt={alt || "Image preview"} fill sizes="320px" className="object-cover" />
    </div>
  );
}

export function ImageField({
  label,
  value,
  onChange,
  error,
  hint,
  required,
  folder = "pages",
}: {
  label: string;
  value: ImageValue | null;
  onChange: (v: ImageValue | null) => void;
  error?: string;
  hint?: string;
  required?: boolean;
  folder?: UploadFolder;
}) {
  const id = useId();
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [urlDraft, setUrlDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [localError, setError] = useState("");

  async function onFile(file?: File) {
    if (!file) return;
    setError("");
    setBusy(true);
    try {
      const url = await uploadFile(file, folder);
      onChange({ url, alt: value?.alt ?? "", publicId: "" });
      toast("Image uploaded.");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Upload failed.";
      setError(msg);
      toast(msg, "error");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function applyUrl() {
    const url = urlDraft.trim();
    if (!IMAGE_URL_PATTERN.test(url)) return setError("Use a /images/ or /api/uploads/ path, or an Unsplash https URL.");
    setError("");
    onChange({ url, alt: value?.alt ?? "", publicId: "" });
    setUrlDraft("");
  }

  return (
    <fieldset className="rounded-2xl border border-[#e3d6ee] p-4">
      <legend className="adm-label !mb-0 px-1">
        {label}
        {required && <span className="text-[#c0261a]"> *</span>}
      </legend>
      <div className="mt-3 grid gap-4 sm:grid-cols-[14rem_1fr]">
        <div>
          {value ? (
            <Preview url={value.url} alt={value.alt} />
          ) : (
            <div className="grid aspect-[4/3] place-items-center rounded-xl border-2 border-dashed border-[#d9cde3] text-xs text-[#7a6a89]">No image</div>
          )}
        </div>
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <button type="button" className="adm-btn adm-btn-soft" disabled={busy} onClick={() => fileRef.current?.click()}>
              {busy ? "Uploading..." : value ? "Replace image" : "Upload image"}
            </button>
            {value && (
              <button type="button" className="adm-btn adm-btn-danger" disabled={busy} onClick={() => onChange(null)}>
                Remove
              </button>
            )}
            <input
              ref={fileRef}
              id={id}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="sr-only"
              aria-label={`${label} file`}
              onChange={(e) => onFile(e.target.files?.[0])}
            />
          </div>
          <div>
            <label htmlFor={`${id}-alt`} className="adm-label">
              Alt text (describe the image) {required && <span className="text-[#c0261a]">*</span>}
            </label>
            <input
              id={`${id}-alt`}
              className="adm-field"
              value={value?.alt ?? ""}
              maxLength={240}
              disabled={!value}
              onChange={(e) => value && onChange({ ...value, alt: e.target.value })}
              placeholder="e.g. A flower-lined wedding aisle"
            />
          </div>
          <details className="text-sm">
            <summary className="cursor-pointer font-semibold text-plum-700">Use an image URL instead</summary>
            <div className="mt-2 flex gap-2">
              <input className="adm-field" value={urlDraft} onChange={(e) => setUrlDraft(e.target.value)} placeholder="/images/name.jpg or https://images.unsplash.com/..." aria-label="Image URL" />
              <button type="button" className="adm-btn adm-btn-soft" onClick={applyUrl}>
                Use
              </button>
            </div>
          </details>
          {hint && <p className="text-xs text-[#7a6a89]">{hint}</p>}
          {(localError || error) && (
            <p role="alert" className="text-sm font-semibold text-[#b3231a]">
              {localError || error}
            </p>
          )}
        </div>
      </div>
    </fieldset>
  );
}

export function ImageListField({
  label,
  value,
  onChange,
  max = 12,
  error,
  hint,
  folder = "pages",
}: {
  label: string;
  value: ImageValue[];
  onChange: (v: ImageValue[]) => void;
  max?: number;
  error?: string;
  hint?: string;
  folder?: UploadFolder;
}) {
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [localError, setError] = useState("");

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    setError("");
    setBusy(true);
    const added: ImageValue[] = [];
    try {
      for (const f of Array.from(files).slice(0, max - value.length)) {
        const url = await uploadFile(f, folder);
        added.push({ url, alt: "", publicId: "" });
      }
      toast(`${added.length} image${added.length === 1 ? "" : "s"} uploaded.`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Upload failed.";
      setError(msg);
      toast(msg, "error");
    } finally {
      if (added.length) onChange([...value, ...added]);
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  const update = (i: number, patch: Partial<ImageValue>) => onChange(value.map((v, k) => (k === i ? { ...v, ...patch } : v)));
  const move = (i: number, d: -1 | 1) => {
    const next = [...value];
    const j = i + d;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  return (
    <fieldset className="rounded-2xl border border-[#e3d6ee] p-4">
      <legend className="adm-label !mb-0 px-1">{label}</legend>
      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        {value.map((img, i) => (
          <div key={`${img.url}-${i}`} className="rounded-xl border border-[#eadff2] p-3">
            <Preview url={img.url} alt={img.alt} />
            <input
              className="adm-field mt-2"
              value={img.alt}
              maxLength={240}
              placeholder="Alt text (required)"
              aria-label={`Alt text for image ${i + 1}`}
              onChange={(e) => update(i, { alt: e.target.value })}
            />
            <div className="mt-2 flex gap-1.5">
              <button type="button" className="adm-btn adm-btn-soft !min-h-9 !px-3" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Move image ${i + 1} earlier`}>
                &larr;
              </button>
              <button type="button" className="adm-btn adm-btn-soft !min-h-9 !px-3" onClick={() => move(i, 1)} disabled={i === value.length - 1} aria-label={`Move image ${i + 1} later`}>
                &rarr;
              </button>
              <button type="button" className="adm-btn adm-btn-danger !min-h-9 ml-auto" onClick={() => onChange(value.filter((_, k) => k !== i))}>
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button type="button" className="adm-btn adm-btn-soft" disabled={busy || value.length >= max} onClick={() => fileRef.current?.click()}>
          {busy ? "Uploading..." : `Add images (${value.length}/${max})`}
        </button>
        <input ref={fileRef} type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif" className="sr-only" aria-label={`${label} files`} onChange={(e) => onFiles(e.target.files)} />
        {hint && <span className="text-xs text-[#7a6a89]">{hint}</span>}
      </div>
      {(localError || error) && (
        <p role="alert" className="mt-2 text-sm font-semibold text-[#b3231a]">
          {localError || error}
        </p>
      )}
    </fieldset>
  );
}
