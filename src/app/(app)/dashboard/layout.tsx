"use client";

import AppShell from "@/components/app/AppShell";
import { usePathname } from "next/navigation";

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

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const title = PAGE_TITLES[pathname] || "Dashboard";

  return (
    <AppShell title={title}>
      {children}
    </AppShell>
  );
}
