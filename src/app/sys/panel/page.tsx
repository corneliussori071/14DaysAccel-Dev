import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { verifyAdminSession } from "@/lib/adminSession";
import AdminDashboard from "@/components/admin/AdminDashboard";

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
      <AdminDashboard />
    </main>
  );
}
