import Image from "next/image";
import Link from "next/link";
import { ArchImage } from "@/components/motion/arch-image";
import { Reveal } from "@/components/motion/reveal";
import type { ServiceDTO } from "@/lib/types";

/**
 * Service showcase. Desktop: arch-topped panels that expand on hover/focus (pure CSS, keyboard accessible).
 * Mobile/tablet: staggered arch cards.
 */
export function ServicePanels({ services }: { services: ServiceDTO[] }) {
  return (
    <>
      <Reveal className="panels" y={50}>
        {services.map((s, i) => (
          <Link key={s.id} href={`/services#${s.slug}`} data-active={i === 0} className="panel group block bg-plum-800">
            <Image
              src={s.coverImage.url}
              alt={s.coverImage.alt}
              fill
              sizes="(min-width:1024px) 45vw, 100vw"
              className="object-cover transition-transform duration-[1600ms] ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-plum-950/95 via-plum-950/25 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-br from-orchid/0 via-transparent to-coral/0 transition-all duration-700 group-hover:from-orchid/25 group-hover:to-coral/25" />
            <span className="eyebrow absolute left-1/2 top-[18%] -translate-x-1/2 text-peach [writing-mode:vertical-rl]">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span
              className="p-closed font-display absolute bottom-8 left-1/2 -translate-x-1/2 rotate-180 whitespace-nowrap text-2xl text-ivory [writing-mode:vertical-rl]"
              aria-hidden="true"
            >
              {s.title}
            </span>
            <div className="p-open absolute inset-x-0 bottom-0 min-w-[22rem] p-9 text-ivory">
              <h3 className="font-display text-4xl leading-none">{s.title}</h3>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-ivory/85">{s.summary}</p>
              <span className="eyebrow mt-6 inline-flex items-center gap-2 text-peach">
                Discover <span aria-hidden="true">&rarr;</span>
              </span>
            </div>
          </Link>
        ))}
      </Reveal>

      <div className="grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:hidden">
        {services.map((s, i) => (
          <Link key={s.id} href={`/services#${s.slug}`} className={`group block ${i % 2 ? "sm:mt-14" : ""}`}>
            <ArchImage
              src={s.coverImage.url}
              alt={s.coverImage.alt}
              sizes="(min-width:640px) 45vw, 92vw"
              className="arch arch-45 aspect-[4/5]"
            />
            <div className="mt-5 flex items-baseline gap-3">
              <span className="eyebrow text-ember">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="font-display text-3xl leading-none">{s.title}</h3>
            </div>
            <p className="mt-3 text-muted">{s.summary}</p>
          </Link>
        ))}
      </div>
    </>
  );
}
