import type { Metadata } from "next";
import { GalleryExplorer } from "@/components/gallery/gallery-explorer";
import { EmptyState } from "@/components/site/empty-state";
import { CtaBand, PageHero } from "@/components/site/sections";
import { getGallery, getSettings } from "@/lib/data";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Browse illustrative photography of wedding, corporate, cultural, party and large-event styling inspiration.",
  alternates: { canonical: "/gallery" },
};

export default async function GalleryPage() {
  const [settings, items] = await Promise.all([getSettings(), getGallery()]);
  return (
    <>
      <PageHero
        eyebrow="Gallery"
        title="Moods, colours and moments we love."
        accentFrom={3}
        intro="Browse styling inspiration across weddings, corporate events, cultural celebrations and more. Filter by category and open any image to see it larger."
        image={{ src: "/images/event-candlelit-lounge.jpg", alt: "Event lounge with plum sofa and warm candlelight (illustrative image)" }}
      />
      <section className="section-pad after-hero">
        <div className="container-x">
          {items.length === 0 ? (
            <EmptyState
              title="The gallery is being curated."
              text="New imagery will appear here soon. In the meantime, tell us about your event."
              cta={{ href: "/booking", label: "Request a consultation" }}
            />
          ) : (
            <>
              <GalleryExplorer items={items} />
              <p className="mt-10 max-w-2xl text-sm text-muted">
                Images are illustrative imagery chosen to convey style and atmosphere. They are not
                photographs of events organised by {settings.businessName}
              </p>
            </>
          )}
        </div>
      </section>
      <CtaBand settings={settings} />
    </>
  );
}
