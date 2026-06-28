"use client";

import { useEffect } from "react";
import AppShell from "./AppShell";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

// Page titles by route
const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/admin": "Admin Overview",
  "/dashboard/admin/manage": "Manage Users",
  "/dashboard/admin/studio": "Content Studio",
  "/dashboard/doctor": "Doctor Dashboard",
  "/dashboard/nurse": "Nurse Dashboard",
  "/dashboard/clinic": "Clinic Dashboard",
  "/dashboard/patient": "Patient Dashboard",
};

export default function AppShellWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { isLoggedIn, isReady } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (isReady && !isLoggedIn) {
      router.push("/login");
    }
  }, [isReady, isLoggedIn, router]);

  const title = PAGE_TITLES[pathname] || "Dashboard";

  // Don't render AppShell until auth is ready
  if (!isReady || !isLoggedIn) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--sky-bg)",
        }}
      >
        <div style={{ color: "var(--text-3)" }}>Loading...</div>
      </div>
    );
  }

  return <AppShell title={title}>{children}</AppShell>;
}