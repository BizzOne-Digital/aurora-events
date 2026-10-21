import type { Metadata } from "next";
import { ArchImage } from "@/components/motion/arch-image";
import { Reveal } from "@/components/motion/reveal";
import { EmptyState } from "@/components/site/empty-state";
import { LogoMark } from "@/components/site/logo";
import { CtaBand, PageHero } from "@/components/site/sections";
import { getSettings, getTeam } from "@/lib/data";

export const metadata: Metadata = {
  title: "Our Team",
  description: "Meet the people behind 7270020 Canada Ltd.",
  alternates: { canonical: "/team" },
};

export default async function TeamPage() {
  const [settings, team] = await Promise.all([getSettings(), getTeam()]);
  return (
    <>
      <PageHero
        eyebrow="Our team"
        title="The people behind your celebration."
        accentFrom={3}
        intro="Planning an event is a personal job. Here are the people you may work with."
      />
      <section className="section-pad">
        <div className="container-x">
          {team.length === 0 ? (
            <EmptyState
              title="Team profiles are on their way."
              text="We are preparing introductions to the people who plan and arrange your events. In the meantime, you are welcome to speak with us directly."
              cta={{ href: "/contact", label: "Contact us" }}
            />
          ) : (
            <ul className="grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
              {team.map((m, i) => (
                <li key={m.id} className={i % 3 === 1 ? "lg:mt-16" : i % 3 === 2 ? "lg:mt-8" : ""}>
                  <Reveal delay={(i % 3) * 0.1}>
                    {m.photo ? (
                      <ArchImage
                        src={m.photo.url}
                        alt={m.photo.alt || `Portrait of ${m.name}`}
                        sizes="(min-width:1024px) 30vw, (min-width:640px) 45vw, 92vw"
                        className="arch arch-45 aspect-[4/5]"
                      />
                    ) : (
                      <div className="grid aspect-[4/5] place-items-center arch arch-45 bg-gradient-to-b from-plum-800 to-plum-950">
                        <LogoMark className="h-20 w-20 opacity-80" />
                      </div>
                    )}
                    <h2 className="font-display mt-6 text-3xl">{m.name}</h2>
                    <p className="eyebrow mt-2 text-ember">{m.role}</p>
                    {m.bio && <p className="mt-4 text-muted">{m.bio}</p>}
                  </Reveal>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
      <CtaBand settings={settings} />
    </>
  );
}
