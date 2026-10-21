import type { Metadata } from "next";
import Link from "next/link";
import { ActionButton } from "@/components/admin/row-actions";
import { Badge, PageHeader } from "@/components/admin/ui";
import { BOOKING_STATUSES } from "@/lib/constants";
import { connectDB } from "@/lib/db";
import {
  BlogModel,
  BookingModel,
  ContactModel,
  FaqModel,
  GalleryModel,
  ServiceModel,
  TeamModel,
  TestimonialModel,
} from "@/lib/models";
import { requireAdmin } from "@/lib/session";
import { formatDate } from "@/lib/site";
import { loadStarterContent } from "./misc-actions";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const admin = await requireAdmin();
  await connectDB();

  const [services, servicesLive, bookings, newContacts, contacts, faqs, testimonials, testimonialsLive, gallery, posts, postsLive, team, teamLive, byStatus, recentBookings, recentContacts] =
    await Promise.all([
      ServiceModel.countDocuments(),
      ServiceModel.countDocuments({ published: true }),
      BookingModel.countDocuments(),
      ContactModel.countDocuments({ status: "New" }),
      ContactModel.countDocuments(),
      FaqModel.countDocuments(),
      TestimonialModel.countDocuments(),
      TestimonialModel.countDocuments({ published: true }),
      GalleryModel.countDocuments(),
      BlogModel.countDocuments(),
      BlogModel.countDocuments({ published: true }),
      TeamModel.countDocuments(),
      TeamModel.countDocuments({ visible: true }),
      BookingModel.aggregate<{ _id: string; n: number }>([{ $group: { _id: "$status", n: { $sum: 1 } } }]),
      BookingModel.find().sort({ createdAt: -1 }).limit(6).select("name eventType eventDate status createdAt").lean(),
      ContactModel.find().sort({ createdAt: -1 }).limit(5).select("name message status createdAt").lean(),
    ]);

  const statusCount = Object.fromEntries(byStatus.map((s) => [s._id, s.n]));
  const maxStatus = Math.max(1, ...BOOKING_STATUSES.map((s) => statusCount[s] ?? 0));

  const stats = [
    { label: "Booking inquiries", value: bookings, sub: `${statusCount["New"] ?? 0} new`, href: "/admin/bookings" },
    { label: "Contact messages", value: contacts, sub: `${newContacts} new`, href: "/admin/contacts" },
    { label: "Services", value: services, sub: `${servicesLive} published`, href: "/admin/services" },
    { label: "Gallery images", value: gallery, sub: "in gallery", href: "/admin/gallery" },
    { label: "Blog posts", value: posts, sub: `${postsLive} published`, href: "/admin/blog" },
    { label: "FAQs", value: faqs, sub: "questions", href: "/admin/faqs" },
    { label: "Testimonials", value: testimonials, sub: `${testimonialsLive} published`, href: "/admin/testimonials" },
    { label: "Team members", value: team, sub: `${teamLive} visible`, href: "/admin/team" },
  ];

  return (
    <>
      <PageHeader title={`Welcome back${admin.name ? `, ${admin.name.split(" ")[0]}` : ""}`} subtitle="A live snapshot of your website content and incoming inquiries." />

      {services === 0 && (
        <section aria-label="Setup" className="mb-8 space-y-3">
          {services === 0 && (
            <div className="adm-card flex flex-wrap items-center justify-between gap-4 border-l-4 !border-l-coral p-5">
              <div>
                <p className="font-bold">Your site has no content yet.</p>
                <p className="text-sm text-[#5a4768]">Load the starter services, FAQs, gallery and blog posts, then edit them to make them your own.</p>
              </div>
              <ActionButton action={loadStarterContent}>Load starter content</ActionButton>
            </div>
          )}
        </section>
      )}

      <section aria-label="Totals" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="adm-card group p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg">
            <p className="text-sm font-semibold text-[#5a4768]">{s.label}</p>
            <p className="font-display aurora-text-dark mt-2 text-5xl leading-none">{s.value}</p>
            <p className="mt-2 text-xs font-bold text-[#7a6a89]">{s.sub}</p>
          </Link>
        ))}
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-5">
        <section aria-labelledby="status-h" className="adm-card p-6 lg:col-span-2">
          <h2 id="status-h" className="font-display text-2xl">
            Booking status
          </h2>
          <ul className="mt-5 space-y-3.5">
            {BOOKING_STATUSES.map((s) => {
              const n = statusCount[s] ?? 0;
              return (
                <li key={s}>
                  <div className="flex items-center justify-between text-sm">
                    <Link href={`/admin/bookings?status=${encodeURIComponent(s)}`} className="font-semibold hover:underline">
                      {s}
                    </Link>
                    <span className="font-bold">{n}</span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[#f1ebf6]" role="presentation">
                    <div className="h-full rounded-full bg-gradient-to-r from-coral to-orchid" style={{ width: `${(n / maxStatus) * 100}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        <section aria-labelledby="recent-b" className="adm-card p-6 lg:col-span-3">
          <div className="flex items-center justify-between">
            <h2 id="recent-b" className="font-display text-2xl">
              Recent inquiries
            </h2>
            <Link href="/admin/bookings" className="text-sm font-bold text-plum-700 hover:underline">
              View all
            </Link>
          </div>
          {recentBookings.length === 0 ? (
            <p className="mt-6 text-sm text-[#5a4768]">No inquiries yet. They will appear here as soon as someone submits the booking form.</p>
          ) : (
            <ul className="mt-4 divide-y divide-[#f0e8f6]">
              {recentBookings.map((b) => (
                <li key={String(b._id)}>
                  <Link href={`/admin/bookings/${b._id}`} className="flex items-center justify-between gap-3 py-3 hover:bg-[#faf6fd]">
                    <span className="min-w-0">
                      <span className="block truncate font-semibold">{b.name}</span>
                      <span className="block text-xs text-[#7a6a89]">
                        {b.eventType} &middot; event {formatDate(b.eventDate)} &middot; received {formatDate(b.createdAt)}
                      </span>
                    </span>
                    <Badge>{b.status}</Badge>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section aria-labelledby="recent-c" className="adm-card mt-6 p-6">
        <div className="flex items-center justify-between">
          <h2 id="recent-c" className="font-display text-2xl">
            Latest messages
          </h2>
          <Link href="/admin/contacts" className="text-sm font-bold text-plum-700 hover:underline">
            View all
          </Link>
        </div>
        {recentContacts.length === 0 ? (
          <p className="mt-6 text-sm text-[#5a4768]">No messages yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-[#f0e8f6]">
            {recentContacts.map((c) => (
              <li key={String(c._id)}>
                <Link href={`/admin/contacts/${c._id}`} className="flex items-center justify-between gap-3 py-3 hover:bg-[#faf6fd]">
                  <span className="min-w-0">
                    <span className="block truncate font-semibold">{c.name}</span>
                    <span className="block truncate text-xs text-[#7a6a89]">{c.message}</span>
                  </span>
                  <Badge>{c.status}</Badge>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
