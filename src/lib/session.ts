import "server-only";
import { cache } from "react";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connectDB } from "./db";
import { AdminModel } from "./models";

const isProd = process.env.NODE_ENV === "production";
export const SESSION_COOKIE = isProd ? "__Host-aurora_admin" : "aurora_admin";
const SESSION_HOURS = 8;

export type AdminSession = { id: string; email: string; name: string };

function secretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET must be set to a random string of at least 32 characters.");
  }
  return new TextEncoder().encode(secret);
}

export async function createSession(adminId: string, tokenVersion: number): Promise<void> {
  const token = await new SignJWT({ tv: tokenVersion })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(adminId)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_HOURS}h`)
    .sign(secretKey());
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_HOURS * 3600,
  });
}

export async function destroySession(): Promise<void> {
  (await cookies()).set(SESSION_COOKIE, "", { httpOnly: true, secure: isProd, sameSite: "lax", path: "/", maxAge: 0 });
}

/** Verifies the cookie AND re-checks the administrator record on every request (revocable sessions). */
export const getAdmin = cache(async (): Promise<AdminSession | null> => {
  try {
    const token = (await cookies()).get(SESSION_COOKIE)?.value;
    if (!token) return null;
    const { payload } = await jwtVerify(token, secretKey(), { algorithms: ["HS256"] });
    if (!payload.sub || typeof payload.tv !== "number") return null;
    await connectDB();
    const admin = await AdminModel.findById(payload.sub).select("email name tokenVersion").lean();
    if (!admin || admin.tokenVersion !== payload.tv) return null;
    return { id: String(admin._id), email: admin.email, name: admin.name ?? "Administrator" };
  } catch {
    return null;
  }
});

/** Use at the top of every admin page, server action and layout. Redirects when unauthenticated. */
export async function requireAdmin(): Promise<AdminSession> {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}
