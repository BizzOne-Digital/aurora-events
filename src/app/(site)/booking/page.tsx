import type { Metadata } from "next";
import { BookingForm } from "@/components/forms/booking-form";
import { Reveal } from "@/components/motion/reveal";
import { FaqList } from "@/components/site/faq";
import { PageHero, SectionHead } from "@/components/site/sections";
import { getFaqs, getSettings } from "@/lib/data";

export const metadata: Metadata = {
  title: "Plan Your Event | Booking Inquiry",
  description:
    "Request a consultation for your wedding, corporate event, cultural celebration or private function. Submitting an inquiry does not confirm availability or reserve a date.",
  alternates: { canonical: "/booking" },
};

const NEXT_STEPS = [
  "We read through your details and any traditions or ideas you share.",
  "We contact you by phone or email, whichever you prefer.",
  "We arrange a consultation to talk through your plans, and you can ask about pricing.",
];

export default async function BookingPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const [{ type }, settings, faqs] = await Promise.all([searchParams, getSettings(), getFaqs("booking")]);
  return (
    <>
      <PageHero
        eyebrow="Booking inquiry"
        title="Tell us about your event."
        accentFrom={2}
        intro="Share a few details and we will get in touch to talk about your plans. Contact for pricing: it depends on your event."
      />

      <section className="section-pad">
        <div className="container-x grid gap-14 lg:grid-cols-12">
          <aside className="lg:col-span-4">
            <div className="lg:sticky lg:top-28">
              <Reveal>
                <h2 className="display-md">What happens next</h2>
                <ol className="mt-8 space-y-6">
                  {NEXT_STEPS.map((s, i) => (
                    <li key={s} className="flex gap-4">
                      <span className="aurora-fill font-display grid h-9 w-9 shrink-0 place-items-center rounded-full text-lg text-plum-950">
                        {i + 1}
                      </span>
                      <p className="pt-1 text-muted">{s}</p>
                    </li>
                  ))}
                </ol>
                <p className="mt-8 rounded-2xl bg-ivory-deep p-5 text-sm text-plum-800">
                  <strong>Please note:</strong> submitting an inquiry does not confirm availability or reserve an event date, and no
                  payment is taken online.
                </p>
                <div className="mt-8 border-t border-plum-900/15 pt-6">
                  <p className="eyebrow text-ember">Prefer to talk?</p>
                  <a href={`tel:${settings.phone}`} className="link-underline font-display mt-2 inline-block text-3xl">
                    {settings.phoneDisplay}
                  </a>
                </div>
              </Reveal>
            </div>
          </aside>

          <Reveal className="lg:col-span-8" delay={0.1}>
            <div className="grad-border rounded-[2rem] bg-white/50 p-6 shadow-[0_40px_90px_-50px_rgba(93,38,129,0.5)] sm:p-10" style={{ ["--grad-bg" as string]: "#fffaf3" }}>
              <BookingForm initialType={type} phone={settings.phone} phoneDisplay={settings.phoneDisplay} />
            </div>
          </Reveal>
        </div>
      </section>

      {faqs.length > 0 && (
        <section className="bg-ivory-deep py-20 sm:py-28">
          <div className="container-x grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <SectionHead eyebrow="Before you send" title="Booking questions." accentFrom={1} />
            </div>
            <div className="lg:col-span-8">
              <FaqList faqs={faqs} />
            </div>
          </div>
        </section>
      )}
    </>
  );
}
