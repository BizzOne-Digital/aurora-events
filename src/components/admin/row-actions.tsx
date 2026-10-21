"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import type { ActionResult } from "@/lib/admin-crud";
import { useToast } from "./toast";

type IdAction = (id: string) => Promise<ActionResult>;
type MoveAction = (id: string, direction: "up" | "down") => Promise<ActionResult>;

/** Native <dialog>: gives a real modal with focus trap, Escape to close and focus restoration. */
export function ConfirmDelete({
  id,
  itemName,
  onDelete,
  label = "Delete",
  extraWarning,
  redirectTo,
}: {
  id: string;
  itemName: string;
  onDelete: IdAction;
  label?: string;
  extraWarning?: string;
  redirectTo?: string;
}) {
  const router = useRouter();
  const ref = useRef<HTMLDialogElement>(null);
  const toast = useToast();
  const [pending, start] = useTransition();
  const [error, setError] = useState("");

  function confirm() {
    setError("");
    start(async () => {
      const r = await onDelete(id);
      if (r.ok) {
        ref.current?.close();
        toast(r.message);
        if (redirectTo) router.push(redirectTo);
      } else setError(r.message);
    });
  }

  return (
    <>
      <button type="button" className="adm-btn adm-btn-danger !min-h-9" onClick={() => ref.current?.showModal()} aria-haspopup="dialog">
        {label}
      </button>
      <dialog
        ref={ref}
        aria-labelledby={`del-${id}`}
        className="m-auto w-[min(92vw,28rem)] rounded-2xl p-0 shadow-2xl backdrop:bg-plum-950/60 backdrop:backdrop-blur-sm"
        onClick={(e) => e.target === ref.current && ref.current?.close()}
      >
        <div className="p-6">
          <h2 id={`del-${id}`} className="font-display text-2xl">
            Delete this item?
          </h2>
          <p className="mt-3 text-sm text-[#5a4768]">
            <strong className="break-words">{itemName}</strong> will be permanently deleted. This cannot be undone.
            {extraWarning ? ` ${extraWarning}` : ""}
          </p>
          {error && (
            <p role="alert" className="mt-3 text-sm font-semibold text-[#b3231a]">
              {error}
            </p>
          )}
          <div className="mt-6 flex justify-end gap-2">
            <button type="button" className="adm-btn adm-btn-soft" onClick={() => ref.current?.close()} autoFocus>
              Cancel
            </button>
            <button type="button" className="adm-btn !bg-[#b3231a] !text-white hover:!bg-[#8f1d13]" disabled={pending} onClick={confirm}>
              {pending ? "Deleting..." : "Yes, delete"}
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}

export function RowActions({
  id,
  itemName,
  editHref,
  published,
  publishLabels = ["Publish", "Unpublish"],
  onToggle,
  onMove,
  onDelete,
  isFirst,
  isLast,
  extraWarning,
  children,
}: {
  children?: React.ReactNode;
  id: string;
  itemName: string;
  editHref?: string;
  published?: boolean;
  publishLabels?: [string, string];
  onToggle?: IdAction;
  onMove?: MoveAction;
  onDelete?: IdAction;
  isFirst?: boolean;
  isLast?: boolean;
  extraWarning?: string;
}) {
  const toast = useToast();
  const [pending, start] = useTransition();

  const run = (fn: () => Promise<ActionResult>) =>
    start(async () => {
      const r = await fn();
      toast(r.message, r.ok ? "success" : "error");
    });

  return (
    <div className="flex flex-wrap items-center justify-end gap-1.5">
      {onMove && (
        <>
          <button type="button" className="adm-btn adm-btn-soft !min-h-9 !px-2.5" disabled={pending || isFirst} onClick={() => run(() => onMove(id, "up"))} aria-label={`Move ${itemName} up`}>
            &uarr;
          </button>
          <button type="button" className="adm-btn adm-btn-soft !min-h-9 !px-2.5" disabled={pending || isLast} onClick={() => run(() => onMove(id, "down"))} aria-label={`Move ${itemName} down`}>
            &darr;
          </button>
        </>
      )}
      {onToggle && (
        <button type="button" className="adm-btn adm-btn-soft !min-h-9" disabled={pending} onClick={() => run(() => onToggle(id))}>
          {published ? publishLabels[1] : publishLabels[0]}
        </button>
      )}
      {children}
      {editHref && (
        <Link href={editHref} className="adm-btn adm-btn-primary !min-h-9" aria-label={`Edit ${itemName}`}>
          Edit
        </Link>
      )}
      {onDelete && <ConfirmDelete id={id} itemName={itemName} onDelete={onDelete} extraWarning={extraWarning} />}
    </div>
  );
}

/** Small inline toggle for flags such as Featured. */
export function FlagButton({ id, on, onLabel, offLabel, action }: { id: string; on: boolean; onLabel: string; offLabel: string; action: IdAction }) {
  const toast = useToast();
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      aria-pressed={on}
      disabled={pending}
      className={`adm-badge cursor-pointer ${on ? "bg-[#fff0d6] text-[#7a5200]" : "bg-[#f1ebf6] text-[#6a5a79]"}`}
      onClick={() =>
        start(async () => {
          const r = await action(id);
          toast(r.message, r.ok ? "success" : "error");
        })
      }
    >
      {on ? onLabel : offLabel}
    </button>
  );
}

/** Generic button that runs a server action and reports the result as a toast. */
export function ActionButton({
  action,
  children,
  className = "adm-btn adm-btn-primary",
}: {
  action: () => Promise<ActionResult>;
  children: React.ReactNode;
  className?: string;
}) {
  const toast = useToast();
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      className={className}
      disabled={pending}
      onClick={() =>
        start(async () => {
          const r = await action();
          toast(r.message, r.ok ? "success" : "error");
        })
      }
    >
      {pending ? "Working..." : children}
    </button>
  );
}
