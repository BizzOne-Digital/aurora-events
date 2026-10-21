import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuroraBackground } from "@/components/site/decor";
import { LogoMark } from "@/components/site/logo";
import { getAdmin } from "@/lib/session";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage() {
  if (await getAdmin()) redirect("/admin");
  return (
    <main className="on-dark aurora-deep grain relative grid min-h-[100svh] place-items-center overflow-hidden px-4 py-16 text-ivory">
      <AuroraBackground />
      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <LogoMark className="h-14 w-14" />
          <h1 className="font-display mt-5 text-4xl">Admin portal</h1>
          <p className="mt-2 text-sm text-ivory/70">7270020 Canada Ltd. Authorised staff only.</p>
        </div>
        <div className="rounded-[2rem] border border-white/15 bg-plum-950/70 p-7 shadow-2xl backdrop-blur-md sm:p-9">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
