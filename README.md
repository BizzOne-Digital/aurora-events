# 7270020 Canada Ltd. — Event planning website ("Aurora Celebration")

One Next.js project containing the public website **and** the admin portal. No separate backend.

- Next.js 16 (App Router) · TypeScript (strict) · Tailwind CSS 4 · Motion for React
- MongoDB Atlas via Mongoose · Zod validation on the server (and the same schemas on the client)
- Admin sign-in: signed, httpOnly session cookie (`jose`) + bcrypt password hashing
- Admin image uploads stored in MongoDB (work on read-only / serverless hosts) · Fonts via `next/font` (Cormorant Garamond, Fraunces, Manrope)

## 1. Quick start

```bash
npm install
cp .env.example .env.local        # then fill in the values (see below)
npm run seed                      # optional: starter services, FAQs, gallery, blog posts, settings
npm run admin:create -- --email you@example.com --password "A-Long-Passphrase-1" --name "Your Name"
npm run dev                       # http://localhost:3000   (admin: /admin)
```

Without `MONGODB_URI` the public site still renders from bundled starter content (read-only preview); forms and
the admin portal need the database.

### Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` / `build` / `start` | Development server, production build, production server |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Unit tests (validation, sanitiser, upload file-type detection) |
| `npm run check` | typecheck + lint + tests |
| `npm run seed` | Fills **empty** collections with starter content (never overwrites). `-- --demo` also adds one clearly marked, **unpublished** demo testimonial and team member |
| `npm run admin:create` | Creates the first administrator (see below). `-- --reset` changes an existing admin's password and signs out their sessions |

## 2. Environment variables

All are documented in [.env.example](.env.example). Never commit `.env.local`.

| Variable | Required | Purpose |
| --- | --- | --- |
| `MONGODB_URI` | yes | MongoDB Atlas connection string |
| `AUTH_SECRET` | yes | 32+ random characters used to sign admin sessions |
| `NEXT_PUBLIC_SITE_URL` | yes (production) | Public URL, used for sitemap, canonical and Open Graph URLs |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME` | only for `admin:create` | Alternative to CLI arguments. Remove the password afterwards |

Generate a secret: `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`

## 3. MongoDB Atlas setup

1. Create a free account at <https://www.mongodb.com/cloud/atlas> and create a cluster (M0 is enough to start).
2. **Database Access** → *Add New Database User* → username + strong password (role: *Read and write to any database*).
3. **Network Access** → *Add IP Address*. For local development add your IP. For serverless hosting (e.g. Vercel) use
   `0.0.0.0/0`, which is safe only because the database user has a strong password.
4. **Database** → *Connect* → *Drivers* → copy the connection string and put it in `MONGODB_URI`, adding a database
   name before the `?`, e.g. `mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/aurora-events?retryWrites=true&w=majority`.
   URL-encode special characters in the password.
5. Collections and indexes (unique slugs, TTL index for rate limits) are created automatically on first use.

## 4. Image uploads (no extra service)

Images uploaded in the admin portal are stored **in MongoDB** (collection `StoredUpload`) and served by
`GET /api/uploads/<folder>/<filename>` with a one-year immutable cache, so they survive redeploys and work on Vercel or
any host with a read-only filesystem. Nothing is written to `public/`.

- Endpoint: `POST /api/upload` (admin session required; fields `file`, `folder` = products | gallery | pages | misc).
- Allowed: JPG, PNG, WebP, GIF, max 8 MB, type verified from the file's bytes. The admin form shrinks photos over 4 MB in the
  browser first, because serverless hosts such as Vercel reject request bodies above about 4.5 MB.
- Only the URL string is saved on services, gallery items, blog posts and team members. Replacing or removing an image, or
  deleting its item, deletes the stored binary.
- Old `/uploads/...` URLs (from a disk-based setup) show a placeholder image instead of a broken link.

## 5. Creating the administrator

There is **no** public registration. The only way to create an admin is the command line, on a machine that has the
production `MONGODB_URI`:

```bash
npm run admin:create -- --email owner@yourdomain.com --password "A-Long-Passphrase-1" --name "Owner"
```

Passwords need 12+ characters with upper case, lower case and a number. Sign in at `/admin/login`. Passwords can be
changed in **Admin → Website settings**, which also signs out every other session.

## 6. Admin portal (`/admin`)

Dashboard (live counts, booking status summary, recent inquiries) · Booking inquiries (search, filter by event type /
event date / status, status workflow New → Contacted → In Discussion → Confirmed → Completed / Cancelled, private notes) ·
Contact messages (New / Read / Resolved, notes) · Services (create, edit, delete, publish/unpublish, feature, reorder,
cover + gallery images with alt text) · Gallery · Blog (Markdown, draft / publish / schedule, full preview, SEO fields) ·
FAQs (per page: Services, Booking, Contact) · Testimonials · Team · Website settings (business details, hero copy, CTA text,
social links, default SEO).

Public pages read published content through tagged caches that admin changes expire immediately.

## 7. Public pages (10 — limit is 12)

Home · About · Services · Gallery · Testimonials · Blog · Blog article (`/blog/[slug]`) · Booking · Our Team · Contact.
FAQs are sections on Services, Booking and Contact. Unknown or unpublished articles return a proper 404.

## 8. Security summary

- Every admin page, layout, server action, and the upload endpoint re-verifies the signed session **and** the
  administrator record on the server (`requireAdmin()` / `getAdmin()` in `src/lib/session.ts`). `src/proxy.ts` is only an
  optimistic redirect, not the security boundary.
- Session cookie: httpOnly, `SameSite=Lax`, `Secure` + `__Host-` prefix in production, 8 hours, revocable
  (`tokenVersion`).
- Login throttling: 5 failures / 15 min per account and 20 attempts / 15 min per client, stored in MongoDB (shared by
  all server instances). Unknown emails take the same time as wrong passwords.
- Public forms: server-side Zod validation, honeypot field, minimum fill time, 5 submissions / hour / client
  (MongoDB-backed). Stored client IP data is only a salted hash used as a rate-limit key.
- Rich text: Markdown is converted to HTML and sanitised with an allow-list (`sanitize-html`) — no scripts, iframes,
  event handlers or `javascript:` URLs.
- Uploads: authorised, same-origin, rate-limited, size-limited, file type verified from bytes; served with `nosniff` and a locked-down CSP.
- Public data layer (`src/lib/data.ts`) only returns published fields; inquiry data is never queried by public pages.
- Errors shown to users are generic; details go to server logs only. Security headers are set in `next.config.ts`.

## 9. Content rules followed

No invented prices, packages, addresses, service areas, years in business, awards, client logos, team biographies, reviews
or statistics. Pricing says "Contact for pricing" / "Request a consultation". Imagery in `public/images` is the supplied
**AI-generated illustrative event imagery** (see `public/images/SOURCES.md`) and is labelled as illustrative on the
site. Testimonials and team members show elegant empty states until real, published entries exist.
The three starter blog posts are general planning advice, editable or deletable in the portal.

## 10. Deployment notes

- Set all environment variables on the host. Set `NEXT_PUBLIC_SITE_URL` to the final https URL.
- Run `npm run build` then `npm start`, or deploy to Vercel (no extra configuration needed).
- Create the admin with `npm run admin:create` pointing at the production database.
- Inquiries are stored in MongoDB and shown in the portal. There is no email notification; check the dashboard badge, or add
  an email service later (hook in `src/app/(site)/actions.ts`).

## 11. Project layout

```
src/app/(site)/        public pages, template (page transitions), server actions for public forms
src/app/admin/         login + (panel)/ admin pages and server actions
src/app/api/upload + api/uploads/   authorised upload + image serving from MongoDB
src/components/        motion/ (animation primitives) · site/ · forms/ · gallery/ · admin/
src/lib/               db, models, validation, session, rate-limit, uploads, sanitize, data (public reads)
src/content/defaults.ts   starter content + fallback
scripts/               seed.ts, create-admin.ts
tests/                 unit tests
```
