import mongoose, { Schema, type Model, type InferSchemaType } from "mongoose";
import { BOOKING_STATUSES, CONTACT_STATUSES, EVENT_TYPES, FAQ_PAGES, GALLERY_CATEGORIES, UPLOAD_FOLDERS } from "./constants";

function define<T extends Schema>(name: string, schema: T): Model<InferSchemaType<T>> {
  return (mongoose.models[name] as Model<InferSchemaType<T>>) || mongoose.model<InferSchemaType<T>>(name, schema);
}

const imageSchema = new Schema(
  {
    url: { type: String, required: true, trim: true },
    alt: { type: String, default: "", trim: true, maxlength: 240 },
    publicId: { type: String, default: "" }, // legacy field, kept empty
  },
  { _id: false },
);

export const ServiceModel = define(
  "Service",
  new Schema(
    {
      title: { type: String, required: true, trim: true, maxlength: 120 },
      slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
      summary: { type: String, required: true, trim: true, maxlength: 400 },
      description: { type: String, default: "", trim: true, maxlength: 8000 },
      coverImage: { type: imageSchema, required: true },
      gallery: { type: [imageSchema], default: [] },
      featured: { type: Boolean, default: false },
      published: { type: Boolean, default: true },
      order: { type: Number, default: 0 },
    },
    { timestamps: true },
  ).index({ published: 1, order: 1 }),
);

export const BookingModel = define(
  "BookingInquiry",
  new Schema(
    {
      name: { type: String, required: true, trim: true, maxlength: 120 },
      email: { type: String, required: true, trim: true, lowercase: true, maxlength: 200 },
      phone: { type: String, required: true, trim: true, maxlength: 40 },
      eventType: { type: String, required: true, enum: EVENT_TYPES },
      eventDate: { type: Date, required: true },
      guestCount: { type: Number, required: true, min: 1, max: 100000 },
      location: { type: String, required: true, trim: true, maxlength: 160 },
      details: { type: String, required: true, trim: true, maxlength: 4000 },
      contactPreference: { type: String, required: true, enum: ["Phone call", "Email", "Either"] },
      consent: { type: Boolean, required: true },
      consentAt: { type: Date, required: true },
      status: { type: String, enum: BOOKING_STATUSES, default: "New" },
      notes: { type: String, default: "", maxlength: 6000 },
    },
    { timestamps: true },
  )
    .index({ createdAt: -1 })
    .index({ status: 1, createdAt: -1 })
    .index({ eventType: 1 }),
);

export const ContactModel = define(
  "ContactInquiry",
  new Schema(
    {
      name: { type: String, required: true, trim: true, maxlength: 120 },
      email: { type: String, required: true, trim: true, lowercase: true, maxlength: 200 },
      phone: { type: String, default: "", trim: true, maxlength: 40 },
      message: { type: String, required: true, trim: true, maxlength: 4000 },
      consent: { type: Boolean, required: true },
      status: { type: String, enum: CONTACT_STATUSES, default: "New" },
      notes: { type: String, default: "", maxlength: 6000 },
    },
    { timestamps: true },
  ).index({ createdAt: -1 }),
);

export const FaqModel = define(
  "Faq",
  new Schema(
    {
      question: { type: String, required: true, trim: true, maxlength: 240 },
      answer: { type: String, required: true, trim: true, maxlength: 3000 },
      page: { type: String, enum: FAQ_PAGES, default: "services" },
      published: { type: Boolean, default: true },
      order: { type: Number, default: 0 },
    },
    { timestamps: true },
  ).index({ page: 1, published: 1, order: 1 }),
);

export const TestimonialModel = define(
  "Testimonial",
  new Schema(
    {
      quote: { type: String, required: true, trim: true, maxlength: 1500 },
      authorName: { type: String, required: true, trim: true, maxlength: 120 },
      attribution: { type: String, default: "", trim: true, maxlength: 160 }, // e.g. "Wedding client"
      featured: { type: Boolean, default: false },
      published: { type: Boolean, default: false },
      isDemo: { type: Boolean, default: false },
      order: { type: Number, default: 0 },
    },
    { timestamps: true },
  ).index({ published: 1, featured: -1, order: 1 }),
);

export const GalleryModel = define(
  "GalleryItem",
  new Schema(
    {
      image: { type: imageSchema, required: true },
      caption: { type: String, default: "", trim: true, maxlength: 200 },
      category: { type: String, enum: GALLERY_CATEGORIES, default: "Wedding" },
      illustrative: { type: Boolean, default: true },
      published: { type: Boolean, default: true },
      order: { type: Number, default: 0 },
    },
    { timestamps: true },
  ).index({ published: 1, order: 1 }),
);

export const BlogModel = define(
  "BlogPost",
  new Schema(
    {
      title: { type: String, required: true, trim: true, maxlength: 160 },
      slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
      excerpt: { type: String, required: true, trim: true, maxlength: 400 },
      coverImage: { type: imageSchema, required: true },
      body: { type: String, required: true, maxlength: 60000 }, // Markdown, sanitised when rendered
      authorName: { type: String, required: true, trim: true, maxlength: 120 },
      publishedAt: { type: Date, default: () => new Date() },
      published: { type: Boolean, default: false },
      seoTitle: { type: String, default: "", trim: true, maxlength: 70 },
      seoDescription: { type: String, default: "", trim: true, maxlength: 170 },
    },
    { timestamps: true },
  ).index({ published: 1, publishedAt: -1 }),
);

export const TeamModel = define(
  "TeamMember",
  new Schema(
    {
      name: { type: String, required: true, trim: true, maxlength: 120 },
      role: { type: String, required: true, trim: true, maxlength: 120 },
      bio: { type: String, default: "", trim: true, maxlength: 1200 },
      photo: { type: imageSchema, default: undefined },
      visible: { type: Boolean, default: false },
      isDemo: { type: Boolean, default: false },
      order: { type: Number, default: 0 },
    },
    { timestamps: true },
  ).index({ visible: 1, order: 1 }),
);

export const SettingsModel = define(
  "SiteSettings",
  new Schema(
    {
      key: { type: String, default: "main", unique: true },
      businessName: { type: String, default: "7270020 Canada Ltd." },
      email: { type: String, default: "hightec.can@gmail.com" },
      phone: { type: String, default: "+14377846430" },
      phoneDisplay: { type: String, default: "(437) 784-6430" },
      heroEyebrow: { type: String, default: "Thoughtfully planned. Beautifully celebrated." },
      heroHeadline: { type: String, default: "Beautiful gatherings. Unforgettable moments." },
      heroSubcopy: { type: String, default: "From intimate celebrations to remarkable events, we bring your vision to life." },
      primaryCtaText: { type: String, default: "Plan Your Event" },
      secondaryCtaText: { type: String, default: "Explore Services" },
      consultationHeadline: { type: String, default: "Let us talk about your celebration." },
      footerBlurb: {
        type: String,
        default: "Thoughtfully planned weddings, corporate events, cultural celebrations and private functions.",
      },
      social: {
        facebook: { type: String, default: "" },
        instagram: { type: String, default: "" },
        linkedin: { type: String, default: "" },
        tiktok: { type: String, default: "" },
        youtube: { type: String, default: "" },
      },
      seoTitle: { type: String, default: "7270020 Canada Ltd. | Event Planning and Arrangement" },
      seoDescription: {
        type: String,
        default:
          "Event planning and arrangement for weddings, corporate events, cultural celebrations, private functions and gatherings of every size. Request a consultation.",
      },
    },
    { timestamps: true },
  ),
);

export const AdminModel = define(
  "AdminUser",
  new Schema(
    {
      email: { type: String, required: true, unique: true, lowercase: true, trim: true },
      name: { type: String, default: "Administrator", trim: true },
      passwordHash: { type: String, required: true },
      tokenVersion: { type: Number, default: 0 }, // bump to invalidate all existing sessions
      lastLoginAt: { type: Date },
    },
    { timestamps: true },
  ),
);

/** Fixed-window counters shared across instances. Documents expire automatically (TTL index). */
export const RateLimitModel = define(
  "RateLimit",
  new Schema({
    key: { type: String, required: true, unique: true },
    count: { type: Number, default: 0 },
    expiresAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } },
  }),
);

/** Uploaded images live in MongoDB so they survive redeploys on read-only / serverless hosts. */
export const StoredUploadModel = define(
  "StoredUpload",
  new Schema(
    {
      folder: { type: String, enum: UPLOAD_FOLDERS, required: true },
      filename: { type: String, required: true },
      mimeType: { type: String, required: true },
      size: { type: Number, required: true },
      data: { type: Buffer, required: true },
    },
    { timestamps: true },
  ).index({ folder: 1, filename: 1 }, { unique: true }),
);
