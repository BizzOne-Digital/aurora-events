import { connectDB } from "./db";
import { BlogModel, FaqModel, GalleryModel, ServiceModel, SettingsModel, TeamModel, TestimonialModel } from "./models";
import { DEFAULT_FAQS, DEFAULT_GALLERY, DEFAULT_POSTS, DEFAULT_SERVICES } from "@/content/defaults";

export type SeedReport = Record<string, number | string>;

/** Idempotent: only fills collections that are empty, so it never overwrites real content. */
export async function seedStarterContent(options: { demo?: boolean } = {}): Promise<SeedReport> {
  await connectDB();
  const report: SeedReport = {};

  if (!(await SettingsModel.exists({ key: "main" }))) {
    await SettingsModel.create({ key: "main" });
    report.settings = "created";
  }
  if ((await ServiceModel.countDocuments()) === 0) {
    await ServiceModel.insertMany(DEFAULT_SERVICES);
    report.services = DEFAULT_SERVICES.length;
  }
  if ((await FaqModel.countDocuments()) === 0) {
    await FaqModel.insertMany(DEFAULT_FAQS.map((f) => ({ ...f, published: true })));
    report.faqs = DEFAULT_FAQS.length;
  }
  if ((await GalleryModel.countDocuments()) === 0) {
    await GalleryModel.insertMany(DEFAULT_GALLERY.map((x) => ({ ...x, illustrative: true, published: true })));
    report.gallery = DEFAULT_GALLERY.length;
  }
  if ((await BlogModel.countDocuments()) === 0) {
    await BlogModel.insertMany(
      DEFAULT_POSTS.map(({ daysAgo, ...p }) => ({
        ...p,
        published: true,
        publishedAt: new Date(Date.now() - daysAgo * 86_400_000),
      })),
    );
    report.blog = DEFAULT_POSTS.length;
  }
  if (options.demo) {
    if ((await TestimonialModel.countDocuments({ isDemo: true })) === 0) {
      await TestimonialModel.create({
        quote: "[DEMO CONTENT] Replace this with a genuine client testimonial. Demo entries are unpublished by default.",
        authorName: "Demo Author",
        attribution: "Demo attribution",
        published: false,
        isDemo: true,
      });
      report.demoTestimonials = 1;
    }
    if ((await TeamModel.countDocuments({ isDemo: true })) === 0) {
      await TeamModel.create({
        name: "Demo Team Member",
        role: "Demo role",
        bio: "[DEMO CONTENT] Replace with a real team biography. Hidden from the public site until made visible.",
        visible: false,
        isDemo: true,
      });
      report.demoTeam = 1;
    }
  }
  return report;
}
