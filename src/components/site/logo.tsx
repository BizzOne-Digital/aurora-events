import Image from "next/image";

/** Compact arch mark (used in the admin portal). */
export function LogoMark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="lm" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffc8a6" />
          <stop offset="0.5" stopColor="#ff6b5b" />
          <stop offset="1" stopColor="#d96ad2" />
        </linearGradient>
      </defs>
      <path d="M5 36V20C5 10.6 11.7 4 20 4s15 6.6 15 16v16" fill="none" stroke="url(#lm)" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M12 36V21c0-5.5 3.6-9 8-9s8 3.5 8 9v15" fill="none" stroke="url(#lm)" strokeWidth="2.6" strokeLinecap="round" opacity="0.65" />
      <circle cx="20" cy="27" r="2.6" fill="#d8b56d" />
    </svg>
  );
}

/** The official 7270020 Canada Ltd. logo (transparent PNG, dark lettering: use on light backgrounds). */
export function Logo({ className = "h-12" }: { className?: string }) {
  return <Image src="/logo.png" alt="7270020 Canada Ltd." width={1824} height={464} priority className={`w-auto ${className}`} />;
}
