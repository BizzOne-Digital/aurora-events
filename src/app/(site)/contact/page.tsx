import type { Metadata } from "next";
import { ContactForm } from "@/components/forms/contact-form";
import { Magnetic } from "@/components/motion/magnetic";
import { Reveal } from "@/components/motion/reveal";
import { FaqList } from "@/components/site/faq";
import { PageHero, SectionHead } from "@/components/site/sections";
import { getFaqs, getSettings } from "@/lib/data";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Call or email 7270020 Canada Ltd. to discuss your event, or send us a message.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  const [settings, faqs] = await Promise.all([getSettings(), getFaqs("contact")]);
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Let us talk about your event."
        accentFrom={3}
        intro="Call us, email us or send a message. We would love to hear what you are planning."
      />

      <section className="section-pad">
        <div className="container-x grid gap-14 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-5">
            <Reveal>
              <div className="on-dark aurora-deep grain relative overflow-hidden rounded-[2rem] p-8 text-ivory sm:p-10">
                <p className="eyebrow relative z-10 text-peach">Call us</p>
                <a href={`tel:${settings.phone}`} className="font-display relative z-10 mt-3 block text-4xl leading-none sm:text-5xl">
                  <span className="aurora-text">{settings.phoneDisplay}</span>
                </a>
                <div className="relative z-10 mt-8">
                  <Magnetic>
                    <a href={`tel:${settings.phone}`} className="btn btn-primary">
                      Call now
                    </a>
                  </Magnetic>
                </div>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="grad-border rounded-[2rem] p-8 sm:p-10">
                <p className="eyebrow text-ember">Email us</p>
                <a href={`mailto:${settings.email}`} className="font-display link-underline mt-3 block break-all text-2xl sm:text-3xl">
                  {settings.email}
                </a>
                <p className="mt-6 text-muted">
                  Planning a specific date? Use the{" "}
                  <a href="/booking" className="font-bold text-ember underline underline-offset-4">
                    event inquiry form
                  </a>{" "}
                  so we have the details we need. Contact for pricing.
                </p>
              </div>
            </Reveal>
          </div>

          <Reveal className="lg:col-span-7" delay={0.1}>
            <h2 className="display-md">Send us a message</h2>
            <p className="mt-3 mb-8 max-w-lg text-muted">
              Questions, ideas or just exploring? Write to us below and we will get back to you.
            </p>
            <ContactForm />
          </Reveal>
        </div>
      </section>

      {faqs.length > 0 && (
        <section className="bg-ivory-deep py-20 sm:py-28">
          <div className="container-x grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <SectionHead eyebrow="Quick answers" title="Contact questions." accentFrom={1} />
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
