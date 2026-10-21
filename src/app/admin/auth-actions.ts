"use server";

import { createHash } from "node:crypto";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { connectDB, isDbConfigured } from "@/lib/db";
import { AdminModel } from "@/lib/models";
import { clientKey, rateLimit, resetRateLimit, waitMessage } from "@/lib/rate-limit";
import { createSession, destroySession, requireAdmin } from "@/lib/session";
import { loginSchema, passwordChangeSchema, formToObject, zodErrors, type FormState } from "@/lib/validation";

// Compared against when the email is unknown, so response time does not reveal which emails exist.
let dummyHash: Promise<string> | undefined;
const getDummyHash = () => (dummyHash ??= bcrypt.hash("not-a-real-password-for-timing", 12));

const GENERIC_FAIL = "Incorrect email or password.";

export async function loginAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const raw = formToObject(formData);
  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, message: GENERIC_FAIL, errors: zodErrors(parsed.error), values: { email: raw.email ?? "" } };
  if (!isDbConfigured()) return { ok: false, message: "The database is not configured. Set MONGODB_URI (see README)." };

  const { email, password } = parsed.data;
  const emailKey = `login-email:${createHash("sha256").update(email.toLowerCase()).digest("hex").slice(0, 24)}`;
  try {
    // Login throttling: per client (20 / 15 min) and per account (5 failures / 15 min).
    const [byIp, byEmail] = await Promise.all([
      rateLimit(`login-ip:${await clientKey()}`, 20, 15 * 60),
      rateLimit(emailKey, 5, 15 * 60),
    ]);
    if (!byIp.ok || !byEmail.ok) {
      const wait = Math.max(byIp.ok ? 0 : byIp.retryAfterSeconds, byEmail.ok ? 0 : byEmail.retryAfterSeconds);
      return { ok: false, message: `Too many sign-in attempts. Please try again in ${waitMessage(wait)}.`, values: { email } };
    }

    await connectDB();
    const admin = await AdminModel.findOne({ email: email.toLowerCase() });
    const valid = await bcrypt.compare(password, admin?.passwordHash ?? (await getDummyHash()));
    if (!admin || !valid) return { ok: false, message: GENERIC_FAIL, values: { email } };

    await resetRateLimit(emailKey);
    admin.lastLoginAt = new Date();
    await admin.save();
    await createSession(String(admin._id), admin.tokenVersion);
  } catch (err) {
    console.error("[login] failed:", err instanceof Error ? err.message : err);
    return { ok: false, message: "Sign-in is unavailable right now. Check the server configuration (database and AUTH_SECRET).", values: { email } };
  }
  redirect("/admin");
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/admin/login");
}

export async function changePasswordAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const me = await requireAdmin();
  const parsed = passwordChangeSchema.safeParse(formToObject(formData));
  if (!parsed.success) return { ok: false, message: "Please check the highlighted fields.", errors: zodErrors(parsed.error) };

  await connectDB();
  const admin = await AdminModel.findById(me.id);
  if (!admin || !(await bcrypt.compare(parsed.data.current, admin.passwordHash))) {
    return { ok: false, message: "Your current password is incorrect.", errors: { current: "Incorrect password." } };
  }
  admin.passwordHash = await bcrypt.hash(parsed.data.next, 12);
  admin.tokenVersion += 1; // signs out every other session
  await admin.save();
  await createSession(String(admin._id), admin.tokenVersion); // keep this browser signed in
  return { ok: true, message: "Password updated. Other sessions were signed out." };
}
