/** Public, serialisable shapes. These intentionally contain no private inquiry data. */

export type ImageDTO = { url: string; alt: string; publicId?: string };

export type ServiceDTO = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  description: string;
  coverImage: ImageDTO;
  gallery: ImageDTO[];
  featured: boolean;
  order: number;
};

export type FaqDTO = { id: string; question: string; answer: string; page: "services" | "booking" | "contact" };

export type TestimonialDTO = {
  id: string;
  quote: string;
  authorName: string;
  attribution: string;
  featured: boolean;
};

export type GalleryDTO = {
  id: string;
  image: ImageDTO;
  caption: string;
  category: string;
  illustrative: boolean;
};

export type PostSummaryDTO = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: ImageDTO;
  authorName: string;
  publishedAt: string;
};

export type PostDTO = PostSummaryDTO & { body: string; seoTitle: string; seoDescription: string };

export type TeamDTO = { id: string; name: string; role: string; bio: string; photo?: ImageDTO };

export type SettingsDTO = {
  businessName: string;
  email: string;
  phone: string;
  phoneDisplay: string;
  heroEyebrow: string;
  heroHeadline: string;
  heroSubcopy: string;
  primaryCtaText: string;
  secondaryCtaText: string;
  consultationHeadline: string;
  footerBlurb: string;
  social: { facebook: string; instagram: string; linkedin: string; tiktok: string; youtube: string };
  seoTitle: string;
  seoDescription: string;
};
