"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { login, DEMO_ACCOUNTS } from "@/lib/auth";

const LOGIN_CSS = `
  .login-page {
    min-height: 100vh;
    display: flex;
  }

  .login-brand {
    flex: 1;
    background: linear-gradient(160deg, #0F5C7D 0%, #1A7EA8 40%, #3A9EC4 100%);
    display: none;
    align-items: center;
    justify-content: center;
    padding: 40px;
    position: relative;
    overflow: hidden;
  }

  @media (min-width: 900px) {
    .login-brand {
      display: flex;
    }
  }

  .login-brand::before {
    content: '';
    position: absolute;
    width: 400px;
    height: 400px;
    background: rgba(255,255,255,0.08);
    border-radius: 50%;
    top: -100px;
    right: -100px;
    filter: blur(60px);
  }

  .login-brand::after {
    content: '';
    position: absolute;
    width: 250px;
    height: 250px;
    background: rgba(255,255,255,0.05);
    border-radius: 50%;
    bottom: -50px;
    left: 5%;
    filter: blur(40px);
  }

  .login-brand-content {
    position: relative;
    z-index: 2;
    text-align: center;
    color: white;
    max-width: 400px;
  }

  .login-brand-logo {
    font-size: 48px;
    font-weight: 600;
    margin-bottom: 24px;
  }

  .login-brand-logo em {
    font-style: normal;
    color: #FFD93D;
  }

  .login-brand-tagline {
    font-size: 20px;
    line-height: 1.6;
    opacity: 0.9;
    font-weight: 300;
  }

  .login-brand-stats {
    display: flex;
    justify-content: center;
    gap: 48px;
    margin-top: 48px;
  }

  .login-stat {
    text-align: center;
  }

  .login-stat-value {
    font-size: 32px;
    font-weight: 600;
  }

  .login-stat-label {
    font-size: 12px;
    opacity: 0.7;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-top: 4px;
  }

  .login-form {
    width: 100%;
    max-width: 440px;
    margin: 0 auto;
    padding: 40px 24px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-height: 100vh;
  }

  .login-form-inner {
    width: 100%;
  }

  @media (min-width: 900px) {
    .login-form {
      max-width: 420px;
      padding: 40px;
    }
  }

  .login-header {
    margin-bottom: 32px;
  }

  .login-title {
    font-size: 28px;
    font-weight: 600;
    color: var(--text);
    margin-bottom: 8px;
    letter-spacing: -0.5px;
  }

  .login-subtitle {
    font-size: 14px;
    color: var(--text-3);
    line-height: 1.6;
  }

  .login-field {
    margin-bottom: 20px;
  }

  .login-label {
    display: block;
    font-size: 13px;
    font-weight: 500;
    color: var(--text-2);
    margin-bottom: 6px;
  }

  .login-input {
    width: 100%;
    padding: 12px 14px;
    border: 1.5px solid var(--border);
    border-radius: 10px;
    font-size: 15px;
    font-family: var(--font-display);
    background: var(--white);
    color: var(--text);
    transition: border-color 0.15s ease;
  }

  .login-input:focus {
    outline: none;
    border-color: var(--teal);
  }

  .login-input::placeholder {
    color: var(--text-3);
  }

  .login-btn {
    width: 100%;
    padding: 14px 24px;
    background: var(--teal);
    color: white;
    border: none;
    border-radius: 10px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    margin-top: 8px;
  }

  .login-btn:hover {
    background: var(--teal-dark);
    transform: translateY(-1px);
  }

  .login-btn:active {
    transform: translateY(0);
  }

  .login-btn:disabled {
    background: #ccc;
    cursor: not-allowed;
    transform: none;
  }

  .login-error {
    background: #FEE2E2;
    color: #DC2626;
    padding: 12px 14px;
    border-radius: 8px;
    font-size: 13px;
    margin-bottom: 16px;
  }

  .login-demo-toggle {
    margin-top: 24px;
    padding-top: 24px;
    border-top: 1px solid var(--border);
  }

  .login-demo-btn {
    width: 100%;
    padding: 12px;
    background: var(--sky-pale);
    border: 1px solid var(--border);
    border-radius: 8px;
    font-size: 13px;
    color: var(--text-2);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: all 0.15s ease;
  }

  .login-demo-btn:hover {
    background: var(--sky);
    border-color: var(--teal);
    color: var(--teal);
  }

  .login-demo-list {
    margin-top: 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .login-demo-item {
    padding: 12px;
    background: var(--white);
    border: 1px solid var(--border);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .login-demo-item:hover {
    border-color: var(--teal);
    background: var(--sky-pale);
  }

  .login-demo-name {
    font-size: 14px;
    font-weight: 500;
    color: var(--text);
    margin-bottom: 2px;
  }

  .login-demo-role {
    font-size: 12px;
    color: var(--text-3);
  }

  .login-demo-desc {
    font-size: 11px;
    color: var(--text-3);
    margin-top: 4px;
  }

  .login-back {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: var(--text-3);
    text-decoration: none;
    margin-bottom: 24px;
    transition: color 0.15s ease;
  }

  .login-back:hover {
    color: var(--teal);
  }

  .login-footer {
    margin-top: 32px;
    text-align: center;
    font-size: 12px;
    color: var(--text-3);
  }
`;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showDemo, setShowDemo] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await login(email, password);
      if (user) {
        router.push(redirect);
      } else {
        setError("Invalid email or password. Please try again.");
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function fillDemo(demoEmail: string, demoPassword: string) {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError("");
  }

  return (
    <div className="login-page">
      <style dangerouslySetInnerHTML={{ __html: LOGIN_CSS }} />

      {/* Brand Panel */}
      <div className="login-brand">
        <div className="login-brand-content">
          <div className="login-brand-logo">
            ✨ nutri<em>drip</em>
          </div>
          <p className="login-brand-tagline">
            Physician-formulated IV therapy,<br />delivered to your world.
          </p>

          <div className="login-brand-stats">
            <div className="login-stat">
              <div className="login-stat-value">5,000+</div>
              <div className="login-stat-label">Sessions</div>
            </div>
            <div className="login-stat">
              <div className="login-stat-value">50+</div>
              <div className="login-stat-label">Formulas</div>
            </div>
            <div className="login-stat">
              <div className="login-stat-value">4.9★</div>
              <div className="login-stat-label">Rating</div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Panel */}
      <div className="login-form">
        <div className="login-form-inner">
          <a href="/" className="login-back">
            ← Back to home
          </a>

          <div className="login-header">
            <h1 className="login-title">Sign in to NutriDrip</h1>
            <p className="login-subtitle">
              Access your personalized dashboard, bookings, and health records.
            </p>
          </div>

          {error && (
            <div className="login-error">{error}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="login-field">
              <label className="login-label">Email</label>
              <input
                type="email"
                className="login-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </div>

            <div className="login-field">
              <label className="login-label">Password</label>
              <input
                type="password"
                className="login-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />
            </div>

            <button
              type="submit"
              className="login-btn"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In →"}
            </button>
          </form>

          {/* Demo Accounts */}
          <div className="login-demo-toggle">
            <button
              type="button"
              className="login-demo-btn"
              onClick={() => setShowDemo(!showDemo)}
            >
              Use a demo account {showDemo ? "▲" : "▼"}
            </button>

            {showDemo && (
              <div className="login-demo-list">
                {DEMO_ACCOUNTS.map((account) => (
                  <div
                    key={account.email}
                    className="login-demo-item"
                    onClick={() => fillDemo(account.email, account.password)}
                  >
                    <div className="login-demo-name">{account.name}</div>
                    <div className="login-demo-role">{account.role}</div>
                    <div className="login-demo-desc">{account.description}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="login-footer">
            <p>Need help? Contact support@nutridrip.in</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--sky-bg)"
      }}>
        <div style={{ color: "var(--text-3)" }}>Loading...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
