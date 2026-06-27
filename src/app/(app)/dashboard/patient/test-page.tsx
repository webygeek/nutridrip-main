"use client";

import { useAuth } from "@/lib/auth";
import Link from "next/link";
import AppShell from "@/components/app/AppShell";

export default function TestPatientPage() {
  const { user, isLoggedIn, isReady, role } = useAuth();

  if (!isReady || !isLoggedIn) {
    return (
      <AppShell title="Patient Dashboard">
        <div style={{ textAlign: "center", padding: 40 }}>
          <p>Loading user data...</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Patient Dashboard">
      <div style={{ padding: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>Patient Dashboard</h1>

        <div style={{
          background: "white",
          padding: 24,
          borderRadius: 12,
          border: "1px solid #E2E8F0",
          marginBottom: 24
        }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>User Info</h2>
          <p><strong>Name:</strong> {user?.name}</p>
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>Role:</strong> {user?.role}</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
          <div style={{
            background: "white",
            padding: 20,
            borderRadius: 12,
            border: "1px solid #E2E8F0",
            textAlign: "center"
          }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#1A7EA8" }}>12</div>
            <div style={{ fontSize: 12, color: "#6B7280" }}>Sessions Completed</div>
          </div>
          <div style={{
            background: "white",
            padding: 20,
            borderRadius: 12,
            border: "1px solid #E2E8F0",
            textAlign: "center"
          }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#1A7EA8" }}>3</div>
            <div style={{ fontSize: 12, color: "#6B7280" }}>Upcoming</div>
          </div>
          <div style={{
            background: "white",
            padding: 20,
            borderRadius: 12,
            border: "1px solid #E2E8F0",
            textAlign: "center"
          }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#1A7EA8" }}>1</div>
            <div style={{ fontSize: 12, color: "#6B7280" }}>Lab Reports</div>
          </div>
          <div style={{
            background: "white",
            padding: 20,
            borderRadius: 12,
            border: "1px solid #E2E8F0",
            textAlign: "center"
          }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#1A7EA8" }}>—</div>
            <div style={{ fontSize: 12, color: "#6B7280" }}>Notifications</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, marginBottom: 32 }}>
          <Link
            href="/book-now"
            style={{
              flex: 1,
              padding: "14px 20px",
              background: "#1A7EA8",
              color: "white",
              borderRadius: 12,
              textAlign: "center",
              fontWeight: 600,
              fontSize: 14,
              textDecoration: "none"
            }}
          >
            Book New Session
          </Link>
          <Link
            href="/health-quiz"
            style={{
              flex: 1,
              padding: "14px 20px",
              background: "white",
              color: "#1A7EA8",
              border: "1.5px solid #1A7EA8",
              borderRadius: 12,
              textAlign: "center",
              fontWeight: 600,
              fontSize: 14,
              textDecoration: "none"
            }}
          >
            Take Health Quiz
          </Link>
        </div>

        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>Recent Bookings</h2>
        <div style={{
          background: "white",
          padding: 24,
          borderRadius: 12,
          border: "1px solid #E2E8F0",
          textAlign: "center",
          color: "#6B7280"
        }}>
          No bookings yet. Book your first session!
        </div>
      </div>
    </AppShell>
  );
}
