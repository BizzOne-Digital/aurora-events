/**
 * Creates (or resets the password of) an administrator. There is deliberately no public registration endpoint.
 *
 *   npm run admin:create -- --email you@example.com --password "A-Long-Passphrase-1" --name "Your Name"
 *
 * Or set ADMIN_EMAIL / ADMIN_PASSWORD / ADMIN_NAME in .env.local. Add --reset to change an existing admin's password.
 */
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { connectDB } from "../src/lib/db";
import { AdminModel } from "../src/lib/models";

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : undefined;
}

async function main() {
  const email = (arg("email") ?? process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
  const password = arg("password") ?? process.env.ADMIN_PASSWORD ?? "";
  const name = arg("name") ?? process.env.ADMIN_NAME ?? "Administrator";
  const reset = process.argv.includes("--reset");

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Provide a valid --email.");
  if (password.length < 12 || !/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password)) {
    throw new Error("Password must be at least 12 characters and include upper case, lower case and a number.");
  }

  await connectDB();
  const passwordHash = await bcrypt.hash(password, 12);
  const existing = await AdminModel.findOne({ email });
  if (existing) {
    if (!reset) throw new Error(`An admin with ${email} already exists. Re-run with --reset to change the password.`);
    existing.passwordHash = passwordHash;
    existing.tokenVersion += 1; // signs out any existing sessions
    await existing.save();
    console.log(`Password updated for ${email}. Existing sessions were signed out.`);
  } else {
    await AdminModel.create({ email, name, passwordHash });
    console.log(`Administrator created: ${email}. Sign in at /admin/login.`);
  }
}

main()
  .catch((err) => {
    console.error("Failed:", err instanceof Error ? err.message : err);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
