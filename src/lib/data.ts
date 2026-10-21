import "server-only";
import { unstable_cache } from "next/cache";
import { connectDB, isDbConfigured } from "./db";
import {
  BlogModel,
  FaqModel,
  GalleryModel,
  ServiceModel,
  SettingsModel,
  TeamModel,
  TestimonialModel,
} from "./models";
import {
  DEFAULT_FAQS,
  DEFAULT_GALLERY,
  DEFAULT_SERVICES,
  DEFAULT_SETTINGS,
} from "@/content/defaults";
import type {
  FaqDTO,
  GalleryDTO,
  ImageDTO,
  PostDTO,
  PostSummaryDTO,
  ServiceDTO,
  SettingsDTO,
  TeamDTO,
  TestimonialDTO,
} from "./types";

/**
 * Public read layer. Every query:
 *  - only returns published/visible documents,
 *  - projects public fields only (never inquiry data),
 *  - is cached with a tag that admin mutations invalidate via updateTag().
 * Cached loaders throw on failure (so failures are never cached); `safe` converts that to a fallback.
 */
const REVALIDATE = 300; // seconds. Admin edits expire tags immediately; this only bounds staleness after a process restart.

async function safe<T>(loader: () => Promise<T>, fallback: T): Promise<T> {
  if (!isDbConfigured()) return fallback;
  try {
    return await loader();
  } catch (err) {
    console.error("[data] load failed:", err instanceof Error ? err.message : err);
    return fallback;
  }
}

const PLACEHOLDER = "/images/placeholder.svg";
/** Legacy disk uploads (/uploads/...) no longer exist on serverless hosts: show a placeholder instead of a broken image. */
const safeUrl = (url: string) => (url.startsWith("/uploads/") ? PLACEHOLDER : url);
const toImage = (i?: { url: string; alt?: string | null } | null): ImageDTO | undefined =>
  i ? { url: safeUrl(i.url), alt: i.alt ?? "" } : undefined;

/* ---------------- settings ---------------- */
const loadSettings = unstable_cache(
  async (): Promise<SettingsDTO> => {
    await connectDB();
    const s = await SettingsModel.findOne({ key: "main" }).lean();
    if (!s) return DEFAULT_SETTINGS;
    return {
      businessName: s.businessName ?? DEFAULT_SETTINGS.businessName,
      email: s.email ?? DEFAULT_SETTINGS.email,
      phone: s.phone ?? DEFAULT_SETTINGS.phone,
      phoneDisplay: s.phoneDisplay ?? DEFAULT_SETTINGS.phoneDisplay,
      heroEyebrow: s.heroEyebrow ?? DEFAULT_SETTINGS.heroEyebrow,
      heroHeadline: s.heroHeadline ?? DEFAULT_SETTINGS.heroHeadline,
      heroSubcopy: s.heroSubcopy ?? DEFAULT_SETTINGS.heroSubcopy,
      primaryCtaText: s.primaryCtaText ?? DEFAULT_SETTINGS.primaryCtaText,
      secondaryCtaText: s.secondaryCtaText ?? DEFAULT_SETTINGS.secondaryCtaText,
      consultationHeadline: s.consultationHeadline ?? DEFAULT_SETTINGS.consultationHeadline,
      footerBlurb: s.footerBlurb ?? DEFAULT_SETTINGS.footerBlurb,
      social: {
        facebook: s.social?.facebook ?? "",
        instagram: s.social?.instagram ?? "",
        linkedin: s.social?.linkedin ?? "",
        tiktok: s.social?.tiktok ?? "",
        youtube: s.social?.youtube ?? "",
      },
      seoTitle: s.seoTitle ?? DEFAULT_SETTINGS.seoTitle,
      seoDescription: s.seoDescription ?? DEFAULT_SETTINGS.seoDescription,
    };
  },
  ["settings"],
  { tags: ["settings"], revalidate: REVALIDATE },
);
export const getSettings = () => safe(loadSettings, DEFAULT_SETTINGS);

/* ---------------- services ---------------- */
const loadServices = unstable_cache(
  async (): Promise<ServiceDTO[]> => {
    await connectDB();
    const docs = await ServiceModel.find({ published: true }).sort({ order: 1, createdAt: 1 }).lean();
    return docs.map((d) => ({
      id: String(d._id),
      title: d.title,
      slug: d.slug,
      summary: d.summary,
      description: d.description ?? "",
      coverImage: toImage(d.coverImage) as ImageDTO,
      gallery: (d.gallery ?? []).map((g) => toImage(g) as ImageDTO),
      featured: Boolean(d.featured),
      order: d.order ?? 0,
    }));
  },
  ["services"],
  { tags: ["services"], revalidate: REVALIDATE },
);
const FALLBACK_SERVICES: ServiceDTO[] = DEFAULT_SERVICES.map((s, i) => ({
  id: `default-${i}`,
  title: s.title,
  slug: s.slug,
  summary: s.summary,
  description: s.description,
  coverImage: s.coverImage,
  gallery: s.gallery,
  featured: s.featured,
  order: s.order,
}));
export const getServices = () => safe(loadServices, isDbConfigured() ? [] : FALLBACK_SERVICES);

/* ---------------- faqs ---------------- */
const loadFaqs = unstable_cache(
  async (): Promise<FaqDTO[]> => {
    await connectDB();
    const docs = await FaqModel.find({ published: true }).sort({ order: 1, createdAt: 1 }).lean();
    return docs.map((d) => ({ id: String(d._id), question: d.question, answer: d.answer, page: d.page }));
  },
  ["faqs"],
  { tags: ["faqs"], revalidate: REVALIDATE },
);
const FALLBACK_FAQS: FaqDTO[] = DEFAULT_FAQS.map((f, i) => ({ id: `default-${i}`, ...f }));
export const getFaqs = async (page: FaqDTO["page"]) =>
  (await safe(loadFaqs, isDbConfigured() ? [] : FALLBACK_FAQS)).filter((f) => f.page === page);

/* ---------------- testimonials ---------------- */
const loadTestimonials = unstable_cache(
  async (): Promise<TestimonialDTO[]> => {
    await connectDB();
    const docs = await TestimonialModel.find({ published: true }).sort({ featured: -1, order: 1, createdAt: -1 }).lean();
    return docs.map((d) => ({
      id: String(d._id),
      quote: d.quote,
      authorName: d.authorName,
      attribution: d.attribution ?? "",
      featured: Boolean(d.featured),
    }));
  },
  ["testimonials"],
  { tags: ["testimonials"], revalidate: REVALIDATE },
);
export const getTestimonials = () => safe(loadTestimonials, [] as TestimonialDTO[]);

/* ---------------- gallery ---------------- */
const loadGallery = unstable_cache(
  async (): Promise<GalleryDTO[]> => {
    await connectDB();
    const docs = await GalleryModel.find({ published: true }).sort({ order: 1, createdAt: 1 }).lean();
    return docs.map((d) => ({
      id: String(d._id),
      image: toImage(d.image) as ImageDTO,
      caption: d.caption ?? "",
      category: d.category,
      illustrative: Boolean(d.illustrative),
    }));
  },
  ["gallery"],
  { tags: ["gallery"], revalidate: REVALIDATE },
);
const FALLBACK_GALLERY: GalleryDTO[] = DEFAULT_GALLERY.map((x, i) => ({
  id: `default-${i}`,
  image: x.image,
  caption: x.caption,
  category: x.category,
  illustrative: true,
}));
export const getGallery = () => safe(loadGallery, isDbConfigured() ? [] : FALLBACK_GALLERY);

/* ---------------- blog ---------------- */
const loadPosts = unstable_cache(
  async (): Promise<PostSummaryDTO[]> => {
    await connectDB();
    const docs = await BlogModel.find({ published: true, publishedAt: { $lte: new Date() } })
      .select("title slug excerpt coverImage authorName publishedAt")
      .sort({ publishedAt: -1 })
      .lean();
    return docs.map((d) => ({
      id: String(d._id),
      title: d.title,
      slug: d.slug,
      excerpt: d.excerpt,
      coverImage: toImage(d.coverImage) as ImageDTO,
      authorName: d.authorName,
      publishedAt: new Date(d.publishedAt as Date).toISOString(),
    }));
  },
  ["blog-list"],
  { tags: ["blog"], revalidate: REVALIDATE },
);
export const getPosts = () => safe(loadPosts, [] as PostSummaryDTO[]);

const loadPost = unstable_cache(
  async (slug: string): Promise<PostDTO | null> => {
    await connectDB();
    const d = await BlogModel.findOne({ slug, published: true, publishedAt: { $lte: new Date() } }).lean();
    if (!d) return null;
    return {
      id: String(d._id),
      title: d.title,
      slug: d.slug,
      excerpt: d.excerpt,
      coverImage: toImage(d.coverImage) as ImageDTO,
      authorName: d.authorName,
      publishedAt: new Date(d.publishedAt as Date).toISOString(),
      body: d.body,
      seoTitle: d.seoTitle ?? "",
      seoDescription: d.seoDescription ?? "",
    };
  },
  ["blog-post"],
  { tags: ["blog"], revalidate: REVALIDATE },
);
export const getPost = (slug: string) => safe(() => loadPost(slug), null);

/* ---------------- team ---------------- */
const loadTeam = unstable_cache(
  async (): Promise<TeamDTO[]> => {
    await connectDB();
    const docs = await TeamModel.find({ visible: true }).sort({ order: 1, createdAt: 1 }).lean();
    return docs.map((d) => ({
      id: String(d._id),
      name: d.name,
      role: d.role,
      bio: d.bio ?? "",
      photo: toImage(d.photo),
    }));
  },
  ["team"],
  { tags: ["team"], revalidate: REVALIDATE },
);
export const getTeam = () => safe(loadTeam, [] as TeamDTO[]);
