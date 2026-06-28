export const dynamic = "force-dynamic";

import AppShellWrapper from "@/components/app/AppShellWrapper";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShellWrapper>{children}</AppShellWrapper>;
}
