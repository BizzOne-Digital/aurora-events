"use client";
import { useActionState } from "react";
import { loginAction } from "../auth-actions";
import type { FormState } from "@/lib/validation";

export function LoginForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(loginAction, {});
  const field =
    "block w-full rounded-xl border border-white/25 bg-white/10 px-4 py-3 text-ivory placeholder:text-ivory/40 focus:border-peach focus:outline-none focus:ring-4 focus:ring-peach/25";
  return (
    <form action={action} className="space-y-5" aria-label="Administrator sign in">
      {state.message && (
        <div role="alert" className="rounded-xl border border-[#ff8a7c]/50 bg-[#ff6b5b]/15 px-4 py-3 text-sm font-semibold text-[#ffd9d3]">
          {state.message}
        </div>
      )}
      <div>
        <label htmlFor="email" className="mb-2 block text-sm font-bold">
          Email
        </label>
        <input id="email" name="email" type="email" required autoComplete="username" defaultValue={state.values?.email ?? ""} className={field} />
      </div>
      <div>
        <label htmlFor="password" className="mb-2 block text-sm font-bold">
          Password
        </label>
        <input id="password" name="password" type="password" required autoComplete="current-password" className={field} />
      </div>
      <button type="submit" disabled={pending} className="btn btn-primary w-full">
        {pending ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
