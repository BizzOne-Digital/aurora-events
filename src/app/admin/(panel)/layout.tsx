import { AdminNav } from "@/components/admin/nav";
import { ToastProvider } from "@/components/admin/toast";
import { connectDB } from "@/lib/db";
import { BookingModel, ContactModel } from "@/lib/models";
import { requireAdmin } from "@/lib/session";
import { logoutAction } from "../auth-actions";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin(); // server-side authorisation for every page under /admin
  await connectDB();
  const [bookings, contacts] = await Promise.all([
    BookingModel.countDocuments({ status: "New" }),
    ContactModel.countDocuments({ status: "New" }),
  ]);
  return (
    <ToastProvider>
      <div className="min-h-[100svh] bg-ivory text-plum-900">
        <AdminNav adminName={admin.name || admin.email} counts={{ bookings, contacts }} logout={logoutAction} />
        <main id="main" className="lg:pl-64">
          <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8 sm:py-10">{children}</div>
        </main>
      </div>
    </ToastProvider>
  );
}
