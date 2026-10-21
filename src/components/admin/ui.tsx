import Link from "next/link";

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: { href: string; label: string } | React.ReactNode;
}) {
  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-4xl leading-none sm:text-5xl">{title}</h1>
        {subtitle && <p className="mt-2 max-w-2xl text-[#5a4768]">{subtitle}</p>}
      </div>
      {action && typeof action === "object" && "href" in action ? (
        <Link href={action.href} className="adm-btn adm-btn-primary !min-h-11 !px-5">
          {action.label}
        </Link>
      ) : (
        action
      )}
    </header>
  );
}

const TONES: Record<string, string> = {
  New: "bg-[#ffe3df] text-[#9b1c10]",
  Contacted: "bg-[#e5eefc] text-[#1d4a9b]",
  "In Discussion": "bg-[#f1e4fb] text-[#6a1f9b]",
  Confirmed: "bg-[#dff5e6] text-[#17632f]",
  Completed: "bg-[#e8e4ef] text-[#43185f]",
  Cancelled: "bg-[#eee] text-[#555]",
  Read: "bg-[#e5eefc] text-[#1d4a9b]",
  Resolved: "bg-[#dff5e6] text-[#17632f]",
  Published: "bg-[#dff5e6] text-[#17632f]",
  Draft: "bg-[#fff0d6] text-[#7a5200]",
  Hidden: "bg-[#fff0d6] text-[#7a5200]",
  Visible: "bg-[#dff5e6] text-[#17632f]",
};

export function Badge({ children }: { children: string }) {
  return <span className={`adm-badge ${TONES[children] ?? "bg-[#eee] text-[#444]"}`}>{children}</span>;
}

export function EmptyRow({ title, text, action }: { title: string; text: string; action?: React.ReactNode }) {
  return (
    <div className="adm-card px-6 py-14 text-center">
      <p className="font-display text-2xl">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm text-[#5a4768]">{text}</p>
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  );
}

export function Pager({
  page,
  total,
  pageSize,
  basePath,
  query = {},
}: {
  page: number;
  total: number;
  pageSize: number;
  basePath: string;
  query?: Record<string, string | undefined>;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (pages <= 1) return null;
  const href = (p: number) => {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(query)) if (v) qs.set(k, v);
    qs.set("page", String(p));
    return `${basePath}?${qs.toString()}`;
  };
  const window = Array.from({ length: pages }, (_, i) => i + 1).filter((p) => p === 1 || p === pages || Math.abs(p - page) <= 1);
  return (
    <nav aria-label="Pagination" className="mt-6 flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-[#5a4768]">
        Page {page} of {pages} &middot; {total} total
      </p>
      <ul className="flex items-center gap-1.5">
        <li>
          {page > 1 ? (
            <Link href={href(page - 1)} className="adm-btn adm-btn-soft !min-h-9">
              Previous
            </Link>
          ) : (
            <span className="adm-btn adm-btn-soft !min-h-9 opacity-40" aria-disabled="true">
              Previous
            </span>
          )}
        </li>
        {window.map((p, i) => (
          <li key={p} className="flex items-center">
            {i > 0 && window[i - 1] !== p - 1 && <span className="px-1 text-[#9a8aa8]">&hellip;</span>}
            <Link href={href(p)} aria-current={p === page ? "page" : undefined} className={`adm-btn !min-h-9 !px-3 ${p === page ? "adm-btn-primary" : "adm-btn-soft"}`}>
              {p}
            </Link>
          </li>
        ))}
        <li>
          {page < pages ? (
            <Link href={href(page + 1)} className="adm-btn adm-btn-soft !min-h-9">
              Next
            </Link>
          ) : (
            <span className="adm-btn adm-btn-soft !min-h-9 opacity-40" aria-disabled="true">
              Next
            </span>
          )}
        </li>
      </ul>
    </nav>
  );
}

export function Thumb({ url, alt }: { url?: string; alt?: string }) {
  const src = url?.startsWith("/uploads/") ? "/images/placeholder.svg" : url;
  // eslint-disable-next-line @next/next/no-img-element
  return src ? <img src={src} alt={alt ?? ""} className="h-14 w-20 rounded-lg object-cover" loading="lazy" /> : <div className="h-14 w-20 rounded-lg bg-[#efe6f5]" />;
}
