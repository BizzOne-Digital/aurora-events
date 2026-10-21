/** Server-rendered decorative pieces. All motion is CSS (transform/opacity) and honours prefers-reduced-motion. */

export function AuroraBackground({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <div className="aurora-blob blob-a -left-[15%] -top-[25%] h-[60rem] w-[60rem] max-w-[160vw]" />
      <div className="aurora-blob blob-b -right-[20%] top-[5%] h-[52rem] w-[52rem] max-w-[150vw]" />
      <div className="aurora-blob blob-c left-[25%] top-[45%] h-[44rem] w-[44rem]" />
      <div className="aurora-blob blob-d -right-[5%] bottom-[-25%] h-[40rem] w-[40rem]" />
    </div>
  );
}

/** A flowing celebration ribbon: draws itself in, then keeps a dashed highlight travelling along it. */
export function CelebrationRibbon({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1440 220"
      preserveAspectRatio="none"
      className={`pointer-events-none absolute w-full ${className}`}
    >
      <defs>
        <linearGradient id="ribbon-grad" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#d96ad2" />
          <stop offset="0.35" stopColor="#ff6b5b" />
          <stop offset="0.7" stopColor="#ffc8a6" />
          <stop offset="1" stopColor="#d8b56d" />
        </linearGradient>
      </defs>
      <path
        className="ribbon-path"
        pathLength={1400}
        d="M-20 196 C 180 190, 340 214, 540 150 S 900 30, 1100 100 S 1340 180, 1460 96"
        fill="none"
        stroke="url(#ribbon-grad)"
        strokeWidth="3"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        opacity="0.9"
      />
      <path
        className="ribbon-flow"
        d="M-20 206 C 180 200, 340 224, 540 160 S 900 40, 1100 110 S 1340 190, 1460 106"
        fill="none"
        stroke="url(#ribbon-grad)"
        strokeWidth="1.5"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        opacity="0.55"
      />
    </svg>
  );
}

/** Slow scrolling band of event types (CSS only; pauses on hover). */
export function Marquee({ items }: { items: string[] }) {
  const row = (
    <div className="flex shrink-0 items-center" aria-hidden="true">
      {items.map((t, i) => (
        <span key={i} className="flex items-center">
          <span className="font-display px-7 text-[clamp(1.6rem,3.4vw,2.8rem)] italic">{t}</span>
          <span className="inline-block h-2.5 w-2.5 rotate-45 bg-gradient-to-br from-coral to-orchid" />
        </span>
      ))}
    </div>
  );
  return (
    <div className="marquee overflow-hidden" role="presentation">
      <p className="sr-only">{items.join(", ")}</p>
      <div className="marquee-track">
        {row}
        {row}
        {row}
        {row}
      </div>
    </div>
  );
}

export function SectionNumber({ n, className = "" }: { n: string; className?: string }) {
  return (
    <span aria-hidden="true" className={`big-number block ${className}`}>
      {n}
    </span>
  );
}
