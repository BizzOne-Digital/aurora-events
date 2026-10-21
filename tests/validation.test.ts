import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  IMAGE_URL_PATTERN,
  bookingSchema,
  contactSchema,
  passwordChangeSchema,
  serviceSchema,
  settingsSchema,
  slugify,
} from "../src/lib/validation";

const future = new Date(Date.now() + 30 * 86_400_000).toISOString().slice(0, 10);
const validBooking = {
  name: "Test Person",
  email: "person@example.com",
  phone: "(437) 784-6430",
  eventType: "Wedding",
  eventDate: future,
  guestCount: "120",
  location: "Toronto",
  details: "A garden wedding.",
  contactPreference: "Email",
  consent: true,
};

describe("bookingSchema", () => {
  it("accepts a complete inquiry and coerces guest count", () => {
    const r = bookingSchema.safeParse(validBooking);
    assert.equal(r.success, true);
    if (r.success) assert.equal(r.data.guestCount, 120);
  });
  it("requires consent", () => {
    assert.equal(bookingSchema.safeParse({ ...validBooking, consent: false }).success, false);
  });
  it("rejects past dates", () => {
    assert.equal(bookingSchema.safeParse({ ...validBooking, eventDate: "2001-01-01" }).success, false);
  });
  it("rejects bad email, phone, event type and empty guest count", () => {
    assert.equal(bookingSchema.safeParse({ ...validBooking, email: "nope" }).success, false);
    assert.equal(bookingSchema.safeParse({ ...validBooking, phone: "abc" }).success, false);
    assert.equal(bookingSchema.safeParse({ ...validBooking, eventType: "Hacking" }).success, false);
    assert.equal(bookingSchema.safeParse({ ...validBooking, guestCount: "" }).success, false);
    assert.equal(bookingSchema.safeParse({ ...validBooking, guestCount: "0" }).success, false);
  });
});

describe("contactSchema", () => {
  it("allows an empty phone but requires message and consent", () => {
    assert.equal(contactSchema.safeParse({ name: "A", email: "a@b.co", phone: "", message: "Hi", consent: true }).success, true);
    assert.equal(contactSchema.safeParse({ name: "A", email: "a@b.co", message: "", consent: true }).success, false);
    assert.equal(contactSchema.safeParse({ name: "A", email: "a@b.co", message: "Hi", consent: false }).success, false);
  });
});

describe("image URLs", () => {
  it("accepts bundled, uploaded (MongoDB) and Unsplash images only", () => {
    assert.ok(IMAGE_URL_PATTERN.test("/images/wedding-aisle.jpg"));
    assert.ok(IMAGE_URL_PATTERN.test("/api/uploads/pages/1700000000000-a1b2c3d4e5f6.jpg"));
    assert.ok(IMAGE_URL_PATTERN.test("https://images.unsplash.com/photo-1?w=800"));
    for (const bad of ["javascript:alert(1)", "https://res.cloudinary.com/a.jpg", "/api/uploads/evil/x.jpg", "/api/uploads/pages/../x.jpg", "https://evil.test/a.jpg", "data:image/png;base64,AAAA", "//evil.test/a.jpg", "/etc/passwd"]) {
      assert.equal(IMAGE_URL_PATTERN.test(bad), false, bad);
    }
  });
  it("service schema requires a cover image with alt text", () => {
    const base = { title: "T", slug: "t", summary: "S", description: "", featured: "on", published: "on" };
    assert.equal(serviceSchema.safeParse(base).success, false);
    const noAlt = JSON.stringify({ url: "/images/a.jpg", alt: "", publicId: "" });
    assert.equal(serviceSchema.safeParse({ ...base, coverImage: noAlt }).success, false);
    const ok = JSON.stringify({ url: "/images/a.jpg", alt: "Alt", publicId: "" });
    assert.equal(serviceSchema.safeParse({ ...base, coverImage: ok }).success, true);
  });
});

describe("slugify", () => {
  it("makes URL-safe slugs", () => {
    assert.equal(slugify("Holiday Gala Evenings!"), "holiday-gala-evenings");
    assert.equal(slugify("  Café  &  Crème "), "cafe-creme");
  });
});

describe("settingsSchema / passwordChangeSchema", () => {
  const settings = {
    businessName: "B",
    email: "a@b.co",
    phone: "+14377846430",
    phoneDisplay: "(437) 784-6430",
    heroEyebrow: "e",
    heroHeadline: "h",
    heroSubcopy: "s",
    primaryCtaText: "p",
    secondaryCtaText: "s",
    consultationHeadline: "c",
    footerBlurb: "f",
    facebook: "",
    instagram: "https://instagram.com/x",
    linkedin: "",
    tiktok: "",
    youtube: "",
    seoTitle: "t",
    seoDescription: "d",
  };
  it("accepts https social links and rejects other schemes", () => {
    assert.equal(settingsSchema.safeParse(settings).success, true);
    assert.equal(settingsSchema.safeParse({ ...settings, instagram: "javascript:alert(1)" }).success, false);
  });
  it("enforces a strong new password", () => {
    assert.equal(passwordChangeSchema.safeParse({ current: "x", next: "short", confirm: "short" }).success, false);
    assert.equal(passwordChangeSchema.safeParse({ current: "x", next: "Strong-Passphrase-1", confirm: "different" }).success, false);
    assert.equal(passwordChangeSchema.safeParse({ current: "x", next: "Strong-Passphrase-1", confirm: "Strong-Passphrase-1" }).success, true);
  });
});
