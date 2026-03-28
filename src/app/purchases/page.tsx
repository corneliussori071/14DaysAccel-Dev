"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PurchasesPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/profile");
  }, [router]);

  return (
    <div className="mx-auto max-w-4xl px-6 py-20 md:px-12 lg:px-24">
      <p className="text-sm text-zinc-400">Redirecting to your account...</p>
    </div>
  );
}
