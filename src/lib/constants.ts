export const EVENT_TYPES = [
  "Wedding",
  "Corporate event",
  "Cultural celebration",
  "Private party",
  "Intimate gathering",
  "Large celebration",
  "Other",
] as const;

export const BOOKING_STATUSES = ["New", "Contacted", "In Discussion", "Confirmed", "Completed", "Cancelled"] as const;
export const CONTACT_STATUSES = ["New", "Read", "Resolved"] as const;
export const GALLERY_CATEGORIES = ["Wedding", "Corporate", "Cultural", "Party", "Intimate", "Large event"] as const;
export const FAQ_PAGES = ["services", "booking", "contact"] as const;

export const UPLOAD_FOLDERS = ["products", "gallery", "pages", "misc"] as const;
export type UploadFolder = (typeof UPLOAD_FOLDERS)[number];
