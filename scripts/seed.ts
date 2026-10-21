/** Usage: npm run seed            (starter services, FAQs, gallery, blog, settings)
 *         npm run seed -- --demo  (also adds UNPUBLISHED, clearly-marked demo testimonial/team entries) */
import mongoose from "mongoose";
import { seedStarterContent } from "../src/lib/seed";

async function main() {
  const report = await seedStarterContent({ demo: process.argv.includes("--demo") });
  console.log(Object.keys(report).length ? "Seeded:" : "Nothing to seed (collections already have content).", report);
}

main()
  .catch((err) => {
    console.error("Seed failed:", err instanceof Error ? err.message : err);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
