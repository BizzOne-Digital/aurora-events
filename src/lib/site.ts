export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/gallery", label: "Gallery" },
  { href: "/testimonials", label: "Testimonials" },
  { href: "/blog", label: "Blog" },
  { href: "/team", label: "Our Team" },
  { href: "/contact", label: "Contact" },
] as const;

export const PUBLIC_PATHS = [...NAV_LINKS.map((l) => l.href), "/booking"];

/** Maps a service title to the closest booking-form event type (used for the "Plan this event" link). */
export function eventTypeForService(title: string): string {
  const t = title.toLowerCase();
  if (t.includes("wedding")) return "Wedding";
  if (t.includes("corporate")) return "Corporate event";
  if (t.includes("cultur")) return "Cultural celebration";
  if (t.includes("private") || t.includes("party") || t.includes("parties")) return "Private party";
  if (t.includes("intimate")) return "Intimate gathering";
  if (t.includes("large")) return "Large celebration";
  return "Other";
}

/** Dates only (calendar dates are stored as UTC midnight); pass timeStyle/hour options to include the time. */
export function formatDate(iso: string | Date, opts?: Intl.DateTimeFormatOptions) {
  const d = new Date(iso);
  if (opts && ("timeStyle" in opts || "hour" in opts)) {
    return d.toLocaleString("en-CA", { timeZone: "America/Toronto", ...opts });
  }
  return d.toLocaleDateString("en-CA", opts ?? { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
}
