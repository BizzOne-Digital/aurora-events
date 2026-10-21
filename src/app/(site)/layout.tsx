import type { ReactNode } from "react";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { getServices, getSettings } from "@/lib/data";
import { SITE_URL } from "@/lib/site";

// Pages render per request; the data underneath is cached with tags and revalidated by admin changes.
export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: ReactNode }) {
  const [settings, services] = await Promise.all([getSettings(), getServices()]);
  const sameAs = Object.values(settings.social).filter(Boolean);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: settings.businessName,
    url: SITE_URL,
    email: settings.email,
    telephone: settings.phone,
    description: settings.seoDescription,
    contactPoint: [
      { "@type": "ContactPoint", telephone: settings.phone, email: settings.email, contactType: "customer service" },
    ],
    ...(sameAs.length ? { sameAs } : {}),
  };

  return (
    <>
      <a
        href="#main"
        className="fixed left-4 top-4 z-[100] -translate-y-20 rounded-full bg-ivory px-5 py-3 text-sm font-bold text-plum-950 shadow-lg transition-transform focus:translate-y-0"
      >
        Skip to content
      </a>
      <Header services={services.map((s) => ({ title: s.title, slug: s.slug }))} phone={settings.phone} phoneDisplay={settings.phoneDisplay} ctaText={settings.primaryCtaText} />
      <main id="main">{children}</main>
      <Footer settings={settings} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
    </>
  );
}
