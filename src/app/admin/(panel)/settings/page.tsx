import type { Metadata } from "next";
import { EntityForm, type FieldDef } from "@/components/admin/entity-form";
import { PageHeader } from "@/components/admin/ui";
import { getSettings } from "@/lib/data";
import { requireAdmin } from "@/lib/session";
import { connectDB } from "@/lib/db";
import { SettingsModel } from "@/lib/models";
import { DEFAULT_SETTINGS } from "@/content/defaults";
import { saveSettings } from "./actions";
import { PasswordForm } from "./password-form";

export const metadata: Metadata = { title: "Website settings" };

const FIELDS: FieldDef[] = [
  { type: "section", title: "Business and contact" },
  { type: "text", name: "businessName", label: "Business name", required: true, maxLength: 120, half: true },
  { type: "text", name: "email", label: "Contact email", required: true, half: true, inputType: "email" },
  { type: "text", name: "phone", label: "Phone (for the call link)", required: true, half: true, hint: "Digits with country code, e.g. +14377846430" },
  { type: "text", name: "phoneDisplay", label: "Phone (as displayed)", required: true, half: true, maxLength: 40, hint: "e.g. (437) 784-6430" },
  { type: "textarea", name: "footerBlurb", label: "Footer text", required: true, maxLength: 200, rows: 2 },
  { type: "section", title: "Home page hero" },
  { type: "text", name: "heroEyebrow", label: "Small heading above the headline", required: true, maxLength: 80 },
  { type: "text", name: "heroHeadline", label: "Headline", required: true, maxLength: 120 },
  { type: "textarea", name: "heroSubcopy", label: "Supporting copy", required: true, maxLength: 400, rows: 3 },
  { type: "section", title: "Calls to action" },
  { type: "text", name: "primaryCtaText", label: "Main button text", required: true, maxLength: 40, half: true },
  { type: "text", name: "secondaryCtaText", label: "Secondary button text", required: true, maxLength: 40, half: true },
  { type: "text", name: "consultationHeadline", label: "Consultation banner headline", required: true, maxLength: 120 },
  { type: "section", title: "Social links", text: "Leave empty if you do not have an account. Only filled links are shown on the site." },
  { type: "text", name: "facebook", label: "Facebook URL", half: true, placeholder: "https://" },
  { type: "text", name: "instagram", label: "Instagram URL", half: true, placeholder: "https://" },
  { type: "text", name: "linkedin", label: "LinkedIn URL", half: true, placeholder: "https://" },
  { type: "text", name: "tiktok", label: "TikTok URL", half: true, placeholder: "https://" },
  { type: "text", name: "youtube", label: "YouTube URL", half: true, placeholder: "https://" },
  { type: "section", title: "Default SEO" },
  { type: "text", name: "seoTitle", label: "Default page title", required: true, maxLength: 70 },
  { type: "textarea", name: "seoDescription", label: "Default description", required: true, maxLength: 170, rows: 2 },
];

export default async function SettingsPage() {
  await requireAdmin();
  await connectDB();
  // Make sure the singleton exists so the form always edits persisted data.
  if (!(await SettingsModel.exists({ key: "main" }))) await SettingsModel.create({ key: "main" });
  const s = (await getSettings()) ?? DEFAULT_SETTINGS;

  return (
    <>
      <PageHeader title="Website settings" subtitle="Business details, home page copy, call-to-action text, social links and default SEO." />
      <EntityForm
        fields={FIELDS}
        initial={{
          businessName: s.businessName,
          email: s.email,
          phone: s.phone,
          phoneDisplay: s.phoneDisplay,
          footerBlurb: s.footerBlurb,
          heroEyebrow: s.heroEyebrow,
          heroHeadline: s.heroHeadline,
          heroSubcopy: s.heroSubcopy,
          primaryCtaText: s.primaryCtaText,
          secondaryCtaText: s.secondaryCtaText,
          consultationHeadline: s.consultationHeadline,
          facebook: s.social.facebook,
          instagram: s.social.instagram,
          linkedin: s.social.linkedin,
          tiktok: s.social.tiktok,
          youtube: s.social.youtube,
          seoTitle: s.seoTitle,
          seoDescription: s.seoDescription,
        }}
        action={saveSettings}
        submitLabel="Save settings"
      />

      <section className="adm-card mt-12 p-6" aria-labelledby="pw-h">
        <h2 id="pw-h" className="font-display text-2xl">
          Your password
        </h2>
        <p className="mb-5 mt-1 text-sm text-[#5a4768]">Changing your password signs out every other session.</p>
        <PasswordForm />
      </section>
    </>
  );
}
