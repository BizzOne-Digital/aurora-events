"use server";

import { connectDB, isDbConfigured } from "@/lib/db";
import { BookingModel, ContactModel } from "@/lib/models";
import { clientKey, rateLimit, waitMessage } from "@/lib/rate-limit";
import { bookingSchema, contactSchema, formToObject, zodErrors, type FormState } from "@/lib/validation";

const UNAVAILABLE = "This form is temporarily unavailable. Please use the call button on this page and we will gladly help.";
const TOO_QUICK = "That was very quick. Please review your details and send the form again.";

/** Returns a FormState to short-circuit, or null when the submission looks like a real person. */
async function antiSpam(raw: Record<string, string>, bucket: string, values: Record<string, string>): Promise<FormState | null> {
  // Honeypot: real visitors never see or fill this field. Pretend success so bots learn nothing.
  if (raw.website) return { ok: true };

  const started = Number(raw.startedAt);
  if (raw.startedAt && Number.isFinite(started) && Date.now() - started < 2500) {
    return { ok: false, message: TOO_QUICK, values };
  }

  const limit = await rateLimit(`${bucket}:${await clientKey()}`, 5, 60 * 60);
  if (!limit.ok) {
    return {
      ok: false,
      message: `You have sent several messages recently. Please try again in ${waitMessage(limit.retryAfterSeconds)}, or call us directly.`,
      values,
    };
  }
  return null;
}

function echo(raw: Record<string, string>) {
  const { website: _w, startedAt: _s, ...values } = raw;
  void _w;
  void _s;
  return values;
}

export async function submitBooking(_prev: FormState, formData: FormData): Promise<FormState> {
  const raw = formToObject(formData);
  const values = echo(raw);
  if (!isDbConfigured()) return { ok: false, message: UNAVAILABLE, values };

  try {
    const blocked = await antiSpam(raw, "booking", values);
    if (blocked) return blocked;

    const parsed = bookingSchema.safeParse({ ...raw, consent: raw.consent === "on" });
    if (!parsed.success) {
      return { ok: false, message: "Please check the highlighted fields.", errors: zodErrors(parsed.error), values };
    }
    const d = parsed.data;
    await connectDB();
    await BookingModel.create({
      name: d.name,
      email: d.email,
      phone: d.phone,
      eventType: d.eventType,
      eventDate: new Date(d.eventDate + "T00:00:00Z"),
      guestCount: d.guestCount,
      location: d.location,
      details: d.details,
      contactPreference: d.contactPreference,
      consent: true,
      consentAt: new Date(),
    });
    return { ok: true, message: "Thank you. Your inquiry has been received." };
  } catch (err) {
    console.error("[booking] failed:", err instanceof Error ? err.message : err);
    return { ok: false, message: "We could not save your inquiry just now. Your details are still here. Please try again in a moment.", values };
  }
}

export async function submitContact(_prev: FormState, formData: FormData): Promise<FormState> {
  const raw = formToObject(formData);
  const values = echo(raw);
  if (!isDbConfigured()) return { ok: false, message: UNAVAILABLE, values };

  try {
    const blocked = await antiSpam(raw, "contact", values);
    if (blocked) return blocked;

    const parsed = contactSchema.safeParse({ ...raw, consent: raw.consent === "on" });
    if (!parsed.success) {
      return { ok: false, message: "Please check the highlighted fields.", errors: zodErrors(parsed.error), values };
    }
    await connectDB();
    await ContactModel.create({ ...parsed.data, consent: true });
    return { ok: true, message: "Thank you. Your message has been received." };
  } catch (err) {
    console.error("[contact] failed:", err instanceof Error ? err.message : err);
    return { ok: false, message: "We could not send your message just now. Your details are still here. Please try again in a moment.", values };
  }
}
