import Link from "next/link";

export default function NotFound() {
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
          fontSize: "120px",
          fontWeight: "700",
          color: "var(--teal)",
          opacity: 0.15,
          lineHeight: 1,
          marginBottom: "-20px",
          fontFamily: "var(--font-display)",
        }}
      >
        404
      </div>
      <h1
        style={{
          fontSize: "clamp(28px, 5vw, 48px)",
          fontWeight: "600",
          color: "var(--text)",
          marginBottom: "16px",
          letterSpacing: "-1px",
        }}
      >
        Page not found
      </h1>
      <p
        style={{
          fontSize: "16px",
          color: "var(--text-3)",
          maxWidth: "400px",
          marginBottom: "32px",
          lineHeight: 1.6,
        }}
      >
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", justifyContent: "center" }}>
        <Link
          href="/"
          style={{
            padding: "12px 28px",
            background: "var(--teal)",
            color: "#fff",
            borderRadius: "50px",
            fontSize: "14px",
            fontWeight: "500",
            textDecoration: "none",
            transition: "background 0.2s",
          }}
        >
          Go home
        </Link>
        <Link
          href="/dashboard"
          style={{
            padding: "12px 28px",
            background: "var(--white)",
            color: "var(--teal)",
            borderRadius: "50px",
            fontSize: "14px",
            fontWeight: "500",
            textDecoration: "none",
            border: "1.5px solid var(--border)",
            transition: "border-color 0.2s",
          }}
        >
          Dashboard
        </Link>
      </div>
    </div>
  );
}