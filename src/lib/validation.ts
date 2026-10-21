import { z } from "zod";
import { BOOKING_STATUSES, CONTACT_STATUSES, EVENT_TYPES, FAQ_PAGES, GALLERY_CATEGORIES } from "./constants";

/* ---------- helpers ---------- */

export type FormState = {
  ok?: boolean;
  message?: string;
  errors?: Record<string, string>;
  values?: Record<string, string>;
};

/** Flatten FormData to a plain string record (last value wins, files ignored). */
export function formToObject(fd: FormData): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of fd.entries()) if (typeof v === "string") out[k] = v;
  return out;
}

export function zodErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    if (!errors[key]) errors[key] = issue.message;
  }
  return errors;
}

const checkbox = z.preprocess((v) => v === "on" || v === "true" || v === true, z.boolean());

const json = <T extends z.ZodType>(schema: T) =>
  z.preprocess((v) => {
    if (typeof v !== "string") return v;
    if (!v.trim()) return undefined;
    try {
      return JSON.parse(v);
    } catch {
      return null;
    }
  }, schema);

export const slugify = (input: string) =>
  input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

const text = (label: string, max: number) =>
  z.string().trim().min(1, `${label} is required.`).max(max, `${label} must be ${max} characters or fewer.`);
const optionalText = (max: number) => z.string().trim().max(max, `Must be ${max} characters or fewer.`).default("");

const slugField = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and single hyphens only.")
  .max(80);

/** Images may be bundled assets, admin uploads stored in MongoDB (/api/uploads/...) or Unsplash. */
export const IMAGE_URL_PATTERN = /^(\/images\/[\w./-]+|\/api\/uploads\/(products|gallery|pages|misc)\/[A-Za-z0-9][\w.-]*|https:\/\/images\.unsplash\.com\/[^\s"'<>]+)$/;

export const imageSchema = z.object({
  url: z.string().trim().regex(IMAGE_URL_PATTERN, "Upload an image or use a /images/ path."),
  alt: z.string().trim().max(240).default(""),
  publicId: z.string().trim().max(300).default(""),
});

const requiredImage = json(imageSchema.refine((i) => i.alt.length > 0, { message: "Add alt text describing the image.", path: ["alt"] }));
const optionalImage = json(imageSchema.optional());

/* ---------- public forms ---------- */

const phoneField = z
  .string()
  .trim()
  .regex(/^[+()\-.\s\d]{7,25}$/, "Enter a valid phone number.")
  .refine((v) => v.replace(/\D/g, "").length >= 7, "Enter a valid phone number.");

const todayUtc = () => {
  const d = new Date();
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
};

export const bookingSchema = z.object({
  name: text("Full name", 120),
  email: z.email("Enter a valid email address.").max(200),
  phone: phoneField,
  eventType: z.enum(EVENT_TYPES, { message: "Choose an event type." }),
  eventDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Choose your preferred date.")
    .refine((v) => !Number.isNaN(Date.parse(v)), "Choose a valid date.")
    .refine((v) => new Date(v + "T00:00:00Z").getTime() >= todayUtc().getTime() - 86_400_000, "Please choose today or a future date."),
  guestCount: z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z.coerce
      .number({ message: "Enter an estimated guest count." })
      .int("Use a whole number.")
      .min(1, "Enter at least 1 guest.")
      .max(100000, "That number looks too large."),
  ),
  location: text("Event location or city", 160),
  details: text("Event details", 4000),
  contactPreference: z.enum(["Phone call", "Email", "Either"], { message: "Choose how we should reach you." }),
  consent: z.literal(true, { message: "Please agree to be contacted about your inquiry." }),
});

export const contactSchema = z.object({
  name: text("Name", 120),
  email: z.email("Enter a valid email address.").max(200),
  phone: z.union([z.literal(""), phoneField]).default(""),
  message: text("Message", 4000),
  consent: z.literal(true, { message: "Please agree to be contacted about your message." }),
});

export const loginSchema = z.object({
  email: z.email("Enter a valid email address.").max(200),
  password: z.string().min(1, "Enter your password.").max(200),
});

/* ---------- admin entities ---------- */

export const serviceSchema = z.object({
  title: text("Title", 120),
  slug: slugField,
  summary: text("Summary", 400),
  description: optionalText(8000),
  coverImage: requiredImage,
  gallery: json(z.array(imageSchema.refine((i) => i.alt.length > 0, { message: "Every image needs alt text.", path: ["alt"] })).max(12)).default([]),
  featured: checkbox,
  published: checkbox,
});

export const faqSchema = z.object({
  question: text("Question", 240),
  answer: text("Answer", 3000),
  page: z.enum(FAQ_PAGES),
  published: checkbox,
});

export const testimonialSchema = z.object({
  quote: text("Testimonial", 1500),
  authorName: text("Author name", 120),
  attribution: optionalText(160),
  featured: checkbox,
  published: checkbox,
});

export const galleryItemSchema = z.object({
  image: requiredImage,
  caption: optionalText(200),
  category: z.enum(GALLERY_CATEGORIES),
  illustrative: checkbox,
  published: checkbox,
});

export const blogSchema = z.object({
  title: text("Title", 160),
  slug: slugField,
  excerpt: text("Excerpt", 400),
  coverImage: requiredImage,
  body: text("Article body", 60000),
  authorName: text("Author display name", 120),
  publishedAt: z
    .string()
    .trim()
    .refine((v) => v === "" || !Number.isNaN(Date.parse(v)), "Enter a valid date.")
    .default(""),
  published: checkbox,
  seoTitle: optionalText(70),
  seoDescription: optionalText(170),
});

export const teamSchema = z.object({
  name: text("Name", 120),
  role: text("Role", 120),
  bio: optionalText(1200),
  photo: optionalImage,
  visible: checkbox,
});

const socialUrl = z
  .string()
  .trim()
  .max(300)
  .refine((v) => v === "" || /^https:\/\/[^\s]+$/.test(v), "Use a full https:// link or leave empty.")
  .default("");

export const settingsSchema = z.object({
  businessName: text("Business name", 120),
  email: z.email("Enter a valid email address."),
  phone: z.string().trim().regex(/^\+?[\d]{7,16}$/, "Digits only, e.g. +14377846430 (used for the call link)."),
  phoneDisplay: text("Display phone", 40),
  heroEyebrow: text("Hero eyebrow", 80),
  heroHeadline: text("Hero headline", 120),
  heroSubcopy: text("Hero supporting copy", 400),
  primaryCtaText: text("Primary button text", 40),
  secondaryCtaText: text("Secondary button text", 40),
  consultationHeadline: text("Consultation headline", 120),
  footerBlurb: text("Footer text", 200),
  facebook: socialUrl,
  instagram: socialUrl,
  linkedin: socialUrl,
  tiktok: socialUrl,
  youtube: socialUrl,
  seoTitle: text("Default SEO title", 70),
  seoDescription: text("Default SEO description", 170),
});

export const bookingUpdateSchema = z.object({
  status: z.enum(BOOKING_STATUSES),
  notes: optionalText(6000),
});

export const contactUpdateSchema = z.object({
  status: z.enum(CONTACT_STATUSES),
  notes: optionalText(6000),
});

export const passwordChangeSchema = z
  .object({
    current: z.string().min(1, "Enter your current password."),
    next: z
      .string()
      .min(12, "Use at least 12 characters.")
      .max(200)
      .refine((v) => /[a-z]/.test(v) && /[A-Z]/.test(v) && /\d/.test(v), "Include upper case, lower case and a number."),
    confirm: z.string(),
  })
  .refine((v) => v.next === v.confirm, { message: "Passwords do not match.", path: ["confirm"] });
