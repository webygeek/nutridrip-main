"use client";

import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 20px",
          textAlign: "center",
          fontFamily: "system-ui, -apple-system, sans-serif",
          background: "#0a1628",
          color: "#e2e8f0",
        }}
      >
        <div style={{ fontSize: "64px", marginBottom: "16px" }}>💥</div>
        <h1
          style={{
            fontSize: "clamp(24px, 4vw, 36px)",
            fontWeight: "600",
            marginBottom: "12px",
          }}
        >
          Unexpected error
        </h1>
        <p
          style={{
            fontSize: "15px",
            color: "#94a3b8",
            maxWidth: "400px",
            marginBottom: "32px",
            lineHeight: 1.6,
          }}
        >
          Something went critically wrong. We&apos;ve been notified and are working on it.
        </p>
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", justifyContent: "center" }}>
          <button
            onClick={reset}
            style={{
              padding: "12px 28px",
              background: "#3b82f6",
              color: "#fff",
              borderRadius: "50px",
              fontSize: "14px",
              fontWeight: "500",
              border: "none",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
          <Link
            href="/"
            style={{
              padding: "12px 28px",
              background: "transparent",
              color: "#94a3b8",
              borderRadius: "50px",
              fontSize: "14px",
              fontWeight: "500",
              textDecoration: "none",
              border: "1px solid #334155",
            }}
          >
            Go home
          </Link>
        </div>
      </body>
    </html>
  );
}