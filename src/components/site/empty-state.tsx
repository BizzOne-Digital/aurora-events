import Link from "next/link";
import { LogoMark } from "./logo";

export function EmptyState({
  title,
  text,
  cta = { href: "/contact", label: "Get in touch" },
}: {
  title: string;
  text: string;
  cta?: { href: string; label: string } | null;
}) {
  return (
    <div className="grad-border mx-auto max-w-2xl rounded-[2.5rem] px-8 py-16 text-center">
      <LogoMark className="mx-auto h-14 w-14" />
      <h2 className="display-md mt-6">{title}</h2>
      <p className="mx-auto mt-4 max-w-md text-muted">{text}</p>
      {cta && (
        <Link href={cta.href} className="btn btn-primary mt-8">
          {cta.label}
        </Link>
      )}
    </div>
  );
}
