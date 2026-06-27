"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("Page error:", error);
    }
  }, [error]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
        textAlign: "center",
        background: "linear-gradient(160deg, var(--sky-bg) 0%, #DCF0FA 100%)",
      }}
    >
      <div
        style={{
          fontSize: "80px",
          marginBottom: "16px",
        }}
      >
        ⚠️
      </div>
      <h1
        style={{
          fontSize: "clamp(24px, 4vw, 36px)",
          fontWeight: "600",
          color: "var(--text)",
          marginBottom: "12px",
          letterSpacing: "-0.5px",
        }}
      >
        Something went wrong
      </h1>
      <p
        style={{
          fontSize: "15px",
          color: "var(--text-3)",
          maxWidth: "400px",
          marginBottom: "32px",
          lineHeight: 1.6,
        }}
      >
        We encountered an unexpected error. Please try again.
        {error.digest && (
          <span style={{ display: "block", marginTop: "8px", fontSize: "12px", opacity: 0.7 }}>
            Error ID: {error.digest}
          </span>
        )}
      </p>
      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", justifyContent: "center" }}>
        <button
          onClick={reset}
          style={{
            padding: "12px 28px",
            background: "var(--teal)",
            color: "#fff",
            borderRadius: "50px",
            fontSize: "14px",
            fontWeight: "500",
            border: "none",
            cursor: "pointer",
            transition: "background 0.2s",
          }}
        >
          Try again
        </button>
        <Link
          href="/"
          style={{
            padding: "12px 28px",
            background: "var(--white)",
            color: "var(--teal)",
            borderRadius: "50px",
            fontSize: "14px",
            fontWeight: "500",
            textDecoration: "none",
            border: "1.5px solid var(--border)",
          }}
        >
          Go home
        </Link>
      </div>
    </div>
  );
}