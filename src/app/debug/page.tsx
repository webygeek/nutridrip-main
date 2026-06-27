"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export default function DebugPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const u = getCurrentUser();
    setUser(u);
    setLoading(false);

    if (!u) {
      router.push("/login");
    }
  }, [router]);

  if (loading) {
    return (
      <div style={{ padding: 40, fontFamily: "system-ui" }}>
        Loading...
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ padding: 40, fontFamily: "system-ui" }}>
        <h1>Not logged in</h1>
        <p>Redirecting to login...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 40, fontFamily: "system-ui", maxWidth: 600, margin: "0 auto" }}>
      <h1 style={{ fontSize: 24, marginBottom: 20 }}>Debug Info</h1>

      <div style={{ background: "#f5f5f5", padding: 20, borderRadius: 8, marginBottom: 20 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12 }}>User Data:</h2>
        <pre style={{ fontSize: 12, background: "#fff", padding: 12, borderRadius: 4, overflow: "auto" }}>
          {JSON.stringify(user, null, 2)}
        </pre>
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        <button
          onClick={() => router.push("/dashboard/patient")}
          style={{ padding: "12px 24px", background: "#1A7EA8", color: "white", border: "none", borderRadius: 8, cursor: "pointer" }}
        >
          Go to Patient Dashboard
        </button>
        <button
          onClick={() => router.push("/dashboard")}
          style={{ padding: "12px 24px", background: "#5BB8F5", color: "white", border: "none", borderRadius: 8, cursor: "pointer" }}
        >
          Go to Dashboard (Root)
        </button>
      </div>

      <h2 style={{ marginTop: 32, fontSize: 16 }}>Role: {user.role}</h2>
      <p style={{ color: "#666" }}>Name: {user.name}</p>
      <p style={{ color: "#666" }}>Email: {user.email}</p>
    </div>
  );
}
