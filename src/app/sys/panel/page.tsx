import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { verifyAdminSession } from "@/lib/adminSession";
import AdminLayout from "@/components/admin/AdminLayout";

export const metadata: Metadata = {
  title: "Admin Panel | 14DaysAccel Dev",
  robots: { index: false, follow: false },
};

export default async function AdminPanelPage() {
  const isAdmin = await verifyAdminSession();

  if (!isAdmin) {
    redirect("/sys/gate");
  }

  return (
    <main className="min-h-screen bg-zinc-50">
      <AdminLayout />
    </main>
  );
}
