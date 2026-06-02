"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { login, DEMO_ACCOUNTS } from "@/lib/auth";

const PAGE_CSS = `
  .login-wrap {
    min-height:100vh;
    background:linear-gradient(160deg,#C8E9F8 0%,#A4D5F5 40%,#7DC4F0 100%);
    display:flex;align-items:center;justify-content:center;
    padding:120px 20px 40px;position:relative;overflow:hidden;
  }
  .login-wrap .lb-blob { position:absolute;border-radius:50%;filter:blur(80px);pointer-events:none; }
  .lb1 { width:420px;height:420px;background:rgba(255,255,255,0.22);top:-120px;right:-120px; }
  .lb2 { width:260px;height:260px;background:rgba(255,255,255,0.14);bottom:-40px;left:6%; }

  .login-card {
    width:100%;max-width:440px;position:relative;z-index:2;
    background:var(--white);border-radius:var(--radius);
    padding:40px;border:1.5px solid var(--border);
    box-shadow:0 20px 60px rgba(14,34,51,0.18);
  }
  .logo-top { text-align:center;margin-bottom:24px; }
  .logo-top a { font-size:24px;font-weight:600;color:var(--teal);text-decoration:none;letter-spacing:-0.5px; }
  .logo-top a em { font-style:normal;color:var(--sky); }

  .login-title { font-size:24px;font-weight:600;letter-spacing:-0.5px;margin-bottom:6px;text-align:center; }
  .login-title em { font-style:italic;font-family:var(--font-serif);color:var(--teal);font-weight:400; }
  .login-sub { font-size:13px;color:var(--text-3);text-align:center;margin-bottom:28px;line-height:1.6; }

  .login-field { display:flex;flex-direction:column;gap:6px;margin-bottom:16px; }
  .login-label { font-size:11px;font-weight:500;color:var(--text-2);letter-spacing:0.5px; }
  .login-input {
    background:var(--off-white);border:1.5px solid var(--border);
    color:var(--text);padding:13px 14px;font-family:var(--font-display);
    font-size:14px;border-radius:var(--radius-sm);outline:none;
    transition:border-color .2s,box-shadow .2s;width:100%;
  }
  .login-input:focus { border-color:var(--sky);box-shadow:0 0 0 3px rgba(91,184,245,0.10); }

  .login-btn {
    width:100%;padding:14px;border-radius:50px;border:none;
    background:linear-gradient(145deg,var(--teal),var(--sky));
    color:#fff;font-size:13px;font-weight:600;
    font-family:var(--font-display);cursor:pointer;
    box-shadow:0 4px 20px rgba(26,126,168,0.30);
    transition:transform .2s,box-shadow .2s;
    margin-top:8px;
  }
  .login-btn:hover { transform:translateY(-1px);box-shadow:0 8px 28px rgba(26,126,168,0.40); }

  .login-error {
    font-size:12px;color:#D97706;background:rgba(217,119,6,0.08);
    padding:10px 14px;border-radius:var(--radius-sm);
    margin-top:14px;text-align:center;
  }

  .demo-hint {
    margin-top:24px;padding:14px;border-radius:var(--radius-sm);
    background:var(--sky-pale);border:1px dashed var(--border-strong);
    font-size:12px;color:var(--text-2);line-height:1.7;
  }
  .demo-hint strong { color:var(--teal); }
  .demo-hint code {
    background:rgba(255,255,255,0.7);padding:2px 8px;border-radius:6px;
    font-family:ui-monospace,Menlo,monospace;font-size:11px;color:var(--teal-dark);
  }
  .demo-fill-btn {
    margin-top:10px;background:var(--teal);color:#fff;border:none;
    padding:8px 16px;border-radius:50px;font-size:11px;font-weight:500;
    cursor:pointer;font-family:var(--font-display);
  }
  .demo-fill-btn:hover { background:var(--teal-dark); }

  .login-footer { margin-top:20px;text-align:center;font-size:12px;color:var(--text-3); }
  .login-footer a { color:var(--teal);text-decoration:none;font-weight:500; }

  @media(max-width:480px){
    .login-wrap { padding:80px 16px 40px; }
    .login-card { padding:28px 20px; border-radius:16px; }
    .login-input { font-size:16px; }
    .login-title { font-size:20px; }
    .demo-hint { padding:12px; }
  }
`;

function LoginInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const user = await login(email, password);
    if (user) {
      router.push(redirect);
    } else {
      setError("Invalid credentials. Use the demo credentials shown below.");
    }
  }

  function fillAccount(accountEmail: string, accountPassword: string) {
    setEmail(accountEmail);
    setPassword(accountPassword);
    setError("");
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: PAGE_CSS }} />
      <div className="login-wrap">
        <div className="lb-blob lb1" />
        <div className="lb-blob lb2" />

        <div className="login-card">
          <div className="logo-top">
            <Link href="/">nutri<em>drip</em></Link>
          </div>

          <h1 className="login-title">Patient <em>Login</em></h1>
          <p className="login-sub">
            Sign in to access your personalised protocol, quiz scores, and downloadable lab prescriptions.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="login-field">
              <label className="login-label">Email</label>
              <input
                type="email" className="login-input"
                value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com" autoComplete="email" required
              />
            </div>
            <div className="login-field">
              <label className="login-label">Password</label>
              <input
                type="password" className="login-input"
                value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" autoComplete="current-password" required
              />
            </div>

            <button type="submit" className="login-btn">Sign In →</button>

            {error && <div className="login-error">{error}</div>}
          </form>

          <div className="demo-hint">
            <strong>Demo accounts</strong> — click any role to auto-fill:
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => fillAccount(acc.email, acc.password)}
                  style={{
                    textAlign: "left",
                    background: "rgba(255,255,255,0.7)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-sm)",
                    padding: "10px 12px",
                    cursor: "pointer",
                    fontFamily: "var(--font-display)",
                    transition: "border-color .15s",
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--teal)", marginBottom: 2 }}>
                    {acc.role.toUpperCase()} — {acc.name}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-3)", lineHeight: 1.5 }}>
                    {acc.description}
                  </div>
                  <div style={{ fontSize: 10, color: "var(--text-2)", marginTop: 4, fontFamily: "ui-monospace,Menlo,monospace" }}>
                    {acc.email} · {acc.password}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="login-footer">
            <Link href="/">← Back to home</Link>
          </div>
        </div>
      </div>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "var(--sky-bg)" }} />}>
      <LoginInner />
    </Suspense>
  );
}
