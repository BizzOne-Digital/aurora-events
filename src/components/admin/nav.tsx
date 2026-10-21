"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LogoMark } from "@/components/site/logo";

const ICONS: Record<string, string> = {
  dashboard: "M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z",
  bookings: "M7 2v3M17 2v3M3 8h18M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z",
  contacts: "M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm0 1l8 6 8-6",
  services: "M12 3l2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3 6.4 20.2l1.1-6.2L3 9.6l6.2-.9L12 3z",
  gallery: "M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm0 11l5-5 4 4 3-3 5 5M9 9.5h.01",
  blog: "M5 3h11l3 3v15H5V3zm3 6h8M8 13h8M8 17h5",
  faqs: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zm-.1-5.5v.01M9.6 9.5a2.4 2.4 0 1 1 3.4 2.2c-.7.4-1.1.9-1.1 1.8",
  testimonials: "M7 7h4v4c0 2.5-1.3 4-4 4M15 7h4v4c0 2.5-1.3 4-4 4",
  team: "M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zm-6 9a6 6 0 0 1 12 0M17 11a3 3 0 1 0 0-6M21 19a5 5 0 0 0-4-4.900",
  settings: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm7.4-3a7.5 7.5 0 0 0-.1-1.400l2-1.600-2-3.400-2.400 1a7 7 0 0 0-2.400-1.400L14.100 3H9.900l-.4 2.800A7 7 0 0 0 7.100 7.200l-2.400-1-2 3.400 2 1.600a7.500 7.500 0 0 0 0 2.800l-2 1.600 2 3.400 2.400-1a7 7 0 0 0 2.400 1.400l.4 2.800h4.200l.4-2.800a7 7 0 0 0 2.400-1.400l2.400 1 2-3.400-2-1.600c.1-.5.1-.9.1-1.400z",
};

function Icon({ name }: { name: string }) {
  return (
    <svg viewBox="0 0 24 24" className="h-[1.15rem] w-[1.15rem] shrink-0" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={ICONS[name]} />
    </svg>
  );
}

type Item = { href: string; label: string; icon: string; badge?: number };

export function AdminNav({
  adminName,
  counts,
  logout,
}: {
  adminName: string;
  counts: { bookings: number; contacts: number };
  logout: () => Promise<void>;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const groups: { title: string; items: Item[] }[] = [
    { title: "Overview", items: [{ href: "/admin", label: "Dashboard", icon: "dashboard" }] },
    {
      title: "Inbox",
      items: [
        { href: "/admin/bookings", label: "Booking inquiries", icon: "bookings", badge: counts.bookings },
        { href: "/admin/contacts", label: "Contact messages", icon: "contacts", badge: counts.contacts },
      ],
    },
    {
      title: "Content",
      items: [
        { href: "/admin/services", label: "Services", icon: "services" },
        { href: "/admin/gallery", label: "Gallery", icon: "gallery" },
        { href: "/admin/blog", label: "Blog", icon: "blog" },
        { href: "/admin/faqs", label: "FAQs", icon: "faqs" },
        { href: "/admin/testimonials", label: "Testimonials", icon: "testimonials" },
        { href: "/admin/team", label: "Team", icon: "team" },
      ],
    },
    { title: "Site", items: [{ href: "/admin/settings", label: "Website settings", icon: "settings" }] },
  ];

  const active = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  const body = (
    <>
      <div className="flex items-center gap-3 px-5 pb-6 pt-6">
        <LogoMark className="h-9 w-9" />
        <div className="leading-tight">
          <p className="font-display text-lg">7270020</p>
          <p className="eyebrow !text-[0.58rem] text-peach">Admin portal</p>
        </div>
      </div>
      <nav aria-label="Admin" className="flex-1 overflow-y-auto px-3 pb-4">
        {groups.map((g) => (
          <div key={g.title} className="mb-5">
            <p className="eyebrow px-3 pb-2 !text-[0.6rem] text-ivory/50">{g.title}</p>
            <ul className="space-y-0.5">
              {g.items.map((it) => (
                <li key={it.href}>
                  <Link
                    href={it.href}
                    onClick={() => setOpen(false)}
                    aria-current={active(it.href) ? "page" : undefined}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                      active(it.href) ? "bg-gradient-to-r from-coral/90 to-orchid/90 text-plum-950" : "text-ivory/80 hover:bg-white/10 hover:text-ivory"
                    }`}
                  >
                    <Icon name={it.icon} />
                    <span className="flex-1">{it.label}</span>
                    {it.badge ? (
                      <span className="rounded-full bg-peach px-2 py-0.5 text-[0.68rem] font-bold text-plum-950" aria-label={`${it.badge} new`}>
                        {it.badge}
                      </span>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
      <div className="border-t border-white/10 p-4">
        <p className="truncate text-sm font-semibold">{adminName}</p>
        <div className="mt-3 flex gap-2">
          <a href="/" target="_blank" rel="noopener noreferrer" className="adm-btn !min-h-9 flex-1 bg-white/10 text-ivory hover:bg-white/20">
            View site
          </a>
          <form action={logout}>
            <button type="submit" className="adm-btn !min-h-9 bg-white/10 text-ivory hover:bg-white/20">
              Sign out
            </button>
          </form>
        </div>
      </div>
    </>
  );

  return (
    <>
      <aside className="on-dark fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-plum-950 text-ivory lg:flex">{body}</aside>

      <div className="on-dark sticky top-0 z-30 flex h-14 items-center justify-between bg-plum-950 px-4 text-ivory lg:hidden">
        <div className="flex items-center gap-2.5">
          <LogoMark className="h-7 w-7" />
          <span className="font-display text-lg">Admin</span>
        </div>
        <button type="button" className="adm-btn !min-h-9 bg-white/10 text-ivory" aria-expanded={open} aria-controls="admin-drawer" onClick={() => setOpen((o) => !o)}>
          {open ? "Close" : "Menu"}
        </button>
      </div>
      {open && (
        <div id="admin-drawer" className="on-dark fixed inset-x-0 bottom-0 top-14 z-20 flex flex-col bg-plum-950 text-ivory lg:hidden">
          {body}
        </div>
      )}
    </>
  );
}
