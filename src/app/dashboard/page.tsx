"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

export default function DashboardRouter() {
  const router = useRouter();
  const { role, isLoggedIn, isReady } = useAuth();

  useEffect(() => {
    if (!isReady) return;
    if (!isLoggedIn) {
      router.replace("/login?redirect=/dashboard");
      return;
    }
    const target =
      role === "admin" ? "/dashboard/admin"
      : role === "subadmin" ? "/dashboard/admin"
      : role === "doctor" ? "/dashboard/doctor"
      : role === "clinic" ? "/dashboard/clinic"
      : role === "nurse" ? "/dashboard/nurse"
      : "/dashboard/patient";
    router.replace(target);
  }, [isReady, isLoggedIn, role, router]);

  return (
    <div style={{ minHeight: "100vh", background: "var(--sky-bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "var(--text-3)", fontSize: 14 }}>Routing to your dashboard...</div>
    </div>
  );
}
