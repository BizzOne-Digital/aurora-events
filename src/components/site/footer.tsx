import Link from "next/link";
import type { SettingsDTO } from "@/lib/types";
import { NAV_LINKS } from "@/lib/site";
import { AuroraBackground } from "./decor";
import { Logo } from "./logo";

const SOCIAL_LABELS: Record<string, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  linkedin: "LinkedIn",
  tiktok: "TikTok",
  youtube: "YouTube",
};

export function Footer({ settings }: { settings: SettingsDTO }) {
  const socials = Object.entries(settings.social).filter(([, url]) => url);
  return (
    <footer className="on-dark aurora-deep grain relative overflow-hidden text-ivory">
      <AuroraBackground className="opacity-60" />
      <div className="container-x relative z-10 pb-10 pt-20 sm:pt-28">
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <span className="inline-block rounded-2xl bg-ivory px-5 py-3">
              <Logo className="h-11" />
            </span>
            <p className="font-display mt-8 max-w-md text-3xl leading-tight sm:text-4xl">
              {settings.footerBlurb}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/booking" className="btn btn-primary">
                {settings.primaryCtaText}
              </Link>
            </div>
          </div>

          <div className="grid gap-10 sm:grid-cols-3 lg:col-span-7">
            <nav aria-label="Footer">
              <h2 className="eyebrow text-champagne !font-sans">Explore</h2>
              <ul className="mt-5 space-y-2.5">
                {NAV_LINKS.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="link-underline text-ivory/85 hover:text-ivory">
                      {l.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link href="/booking" className="link-underline text-ivory/85 hover:text-ivory">
                    Booking
                  </Link>
                </li>
              </ul>
            </nav>

            <div>
              <h2 className="eyebrow text-champagne !font-sans">Talk to us</h2>
              <ul className="mt-5 space-y-3">
                <li>
                  <a href={`tel:${settings.phone}`} className="link-underline text-lg font-semibold text-ivory">
                    {settings.phoneDisplay}
                  </a>
                </li>
                <li>
                  <a href={`mailto:${settings.email}`} className="link-underline break-all text-ivory/90">
                    {settings.email}
                  </a>
                </li>
                <li className="pt-1 text-sm text-ivory/70">Contact for pricing. Request a consultation.</li>
              </ul>
            </div>

            <div>
              <h2 className="eyebrow text-champagne !font-sans">Follow</h2>
              {socials.length ? (
                <ul className="mt-5 space-y-2.5">
                  {socials.map(([key, url]) => (
                    <li key={key}>
                      <a href={url} target="_blank" rel="noopener noreferrer" className="link-underline text-ivory/85 hover:text-ivory">
                        {SOCIAL_LABELS[key] ?? key}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-5 text-sm text-ivory/70">Social channels will be listed here when available.</p>
              )}
            </div>
          </div>
        </div>

        <div className="grad-rule mt-16" />
        <div className="mt-6 flex flex-col gap-2 text-xs text-ivory/65 sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {new Date().getFullYear()} {settings.businessName} All rights reserved.
          </p>
          <p>Imagery on this site is illustrative, not a portfolio of past events.</p>
        </div>
      </div>
    </footer>
  );
}
