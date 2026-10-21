import Link from "next/link";
import { AuroraBackground } from "@/components/site/decor";

export default function NotFound() {
  return (
    <section className="on-dark aurora-deep grain relative flex min-h-[100svh] items-center overflow-hidden text-ivory">
      <AuroraBackground />
      <div className="container-x relative z-10 py-32 text-center">
        <p className="big-number text-ivory/25">404</p>
        <h1 className="display-lg mt-6">This page has <span className="aurora-text">wandered off.</span></h1>
        <p className="mx-auto mt-6 max-w-md text-lg text-ivory/80">
          The page you are looking for does not exist or is no longer published. Let us get you back on track.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href="/" className="btn btn-primary">
            Back to home
          </Link>
          <Link href="/blog" className="btn btn-ghost-dark">
            Read the blog
          </Link>
        </div>
      </div>
    </section>
  );
}
