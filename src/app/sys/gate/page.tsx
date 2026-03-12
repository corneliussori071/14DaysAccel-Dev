import type { Metadata } from "next";
import AdminLoginForm from "@/components/admin/AdminLoginForm";

export const metadata: Metadata = {
  title: "System Access | 14DaysAccel Dev",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-6">
      <div className="w-full max-w-sm">
        <div className="rounded-lg border border-zinc-200 bg-white p-8">
          <h1 className="text-lg font-semibold text-zinc-900">
            System Access
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Enter your credentials to continue.
          </p>
          <AdminLoginForm />
        </div>
      </div>
    </main>
  );
}
