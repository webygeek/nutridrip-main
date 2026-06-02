"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth, logout, type UserRole } from "@/lib/auth";

export const DASH_CSS = `
  .dash-wrap { background:var(--sky-bg);min-height:100vh;padding-top:90px; }
  .dash-inner { max-width:1280px;margin:0 auto;padding:32px 56px 80px; }

  .dash-header {
    display:flex;justify-content:space-between;align-items:center;
    margin-bottom:32px;flex-wrap:wrap;gap:16px;
  }
  .dash-title { font-size:clamp(28px,4vw,40px);font-weight:600;letter-spacing:-1px;line-height:1.1;margin-bottom:4px; }
  .dash-title em { font-style:italic;font-family:var(--font-serif);color:var(--teal);font-weight:400; }
  .dash-sub { font-size:14px;color:var(--text-3);line-height:1.6; }
  .dash-user-box {
    display:flex;align-items:center;gap:14px;padding:10px 16px;
    background:var(--white);border-radius:50px;border:1px solid var(--border);
    box-shadow:0 2px 12px rgba(91,184,245,0.08);
  }
  .dash-user-avatar {
    width:34px;height:34px;border-radius:50%;
    background:linear-gradient(135deg,var(--teal),var(--sky));
    display:flex;align-items:center;justify-content:center;
    color:#fff;font-size:13px;font-weight:600;
  }
  .dash-user-name { font-size:13px;font-weight:500;color:var(--text); }
  .dash-user-role { font-size:10px;color:var(--text-3);text-transform:uppercase;letter-spacing:1px; }
  .dash-logout-btn {
    background:transparent;border:none;color:var(--text-3);
    cursor:pointer;font-size:12px;font-family:var(--font-display);
    text-decoration:underline;margin-left:8px;
  }
  .dash-logout-btn:hover { color:var(--teal); }

  .stat-grid { display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:32px; }
  .stat-card {
    background:var(--white);border-radius:var(--radius);padding:24px;
    border:1.5px solid var(--border);box-shadow:var(--shadow);
    transition:transform .2s,box-shadow .2s;
  }
  .stat-card:hover { transform:translateY(-2px);box-shadow:var(--shadow-lg); }
  .stat-icon {
    width:42px;height:42px;border-radius:12px;background:var(--sky-pale);
    display:flex;align-items:center;justify-content:center;
    font-size:20px;margin-bottom:12px;
  }
  .stat-label { font-size:11px;color:var(--text-3);letter-spacing:1px;text-transform:uppercase;margin-bottom:4px; }
  .stat-value { font-size:28px;font-weight:600;color:var(--text);letter-spacing:-0.5px;line-height:1; }
  .stat-delta { font-size:11px;margin-top:8px; }
  .stat-delta.up { color:#1A9E6A; }
  .stat-delta.down { color:#D97706; }

  .panel {
    background:var(--white);border-radius:var(--radius);
    padding:24px;border:1.5px solid var(--border);box-shadow:var(--shadow);
    margin-bottom:20px;
  }
  .panel-head { display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;gap:12px;flex-wrap:wrap; }
  .panel-title { font-size:16px;font-weight:600;color:var(--text);letter-spacing:-0.3px; }
  .panel-sub { font-size:12px;color:var(--text-3); }

  .dash-table { width:100%;border-collapse:collapse; }
  .dash-table thead th {
    text-align:left;font-size:11px;font-weight:600;letter-spacing:0.5px;
    color:var(--text-3);text-transform:uppercase;
    padding:10px 12px;border-bottom:1px solid var(--border);
  }
  .dash-table tbody td {
    padding:14px 12px;font-size:13px;color:var(--text);
    border-bottom:1px dashed var(--border);
  }
  .dash-table tbody tr:hover td { background:var(--off-white); }
  .dash-table tbody tr:last-child td { border-bottom:none; }

  .pill {
    display:inline-block;font-size:10px;font-weight:600;
    padding:3px 10px;border-radius:50px;letter-spacing:0.5px;
    white-space:nowrap;
  }
  .pill.pending { background:#FFF4E6;color:#D97706; }
  .pill.approved, .pill.completed, .pill.delivered, .pill.active, .pill.scheduled, .pill.available {
    background:#E5F5F3;color:#0A7B6E;
  }
  .pill.rejected, .pill.cancelled, .pill.paused { background:#FBE7E7;color:#D42C2C; }
  .pill.info-requested, .pill.processing, .pill.on-leave, .pill.in-progress { background:rgba(91,184,245,0.15);color:var(--teal-dark); }

  .row-action-btn {
    padding:6px 12px;border-radius:50px;border:none;
    font-size:11px;font-weight:500;font-family:var(--font-display);
    cursor:pointer;transition:all .15s;margin-right:6px;
  }
  .row-action-btn.primary { background:var(--teal);color:#fff; }
  .row-action-btn.primary:hover { background:var(--teal-dark); }
  .row-action-btn.secondary { background:var(--sky-pale);color:var(--teal); }
  .row-action-btn.danger { background:#FBE7E7;color:#D42C2C; }

  .split-grid { display:grid;grid-template-columns:1fr 1fr;gap:20px; }
  .empty-state { padding:40px;text-align:center;color:var(--text-3);font-size:13px; }

  .sev-badge { font-size:10px;font-weight:600;padding:3px 10px;border-radius:50px; }
  .sev-badge.strong { background:rgba(217,119,6,0.12);color:#D97706; }
  .sev-badge.moderate { background:rgba(26,126,168,0.12);color:var(--teal); }
  .sev-badge.mild { background:rgba(26,158,106,0.12);color:#1A9E6A; }

  @media(max-width:1024px){
    .dash-inner { padding:24px 20px 60px; }
    .stat-grid { grid-template-columns:1fr 1fr; }
    .split-grid { grid-template-columns:1fr; }
  }
  @media(max-width:768px){
    .dash-wrap { padding-top:72px; }
    .dash-inner { padding:20px 16px calc(80px + env(safe-area-inset-bottom,0px)); }
    .dash-header { flex-direction:column;align-items:flex-start;gap:14px; }
    .dash-user-box { width:100%;justify-content:space-between; }
    .dash-title { font-size:clamp(22px,6vw,32px); }
    .stat-grid { grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px; }
    .stat-card { padding:16px; }
    .stat-value { font-size:22px; }
    .panel { padding:16px;overflow-x:auto;-webkit-overflow-scrolling:touch; }
    .panel-head { flex-direction:column;align-items:flex-start;gap:8px; }
    .split-grid { grid-template-columns:1fr; }
    .dash-table { min-width:480px;font-size:12px; }
    .dash-table thead th { padding:8px 10px; }
    .dash-table tbody td { padding:11px 10px; }
    .row-action-btn { padding:8px 12px;min-height:36px; }
  }
  @media(max-width:480px){
    .dash-inner { padding:14px 12px calc(80px + env(safe-area-inset-bottom,0px)); }
    .stat-grid { gap:8px; }
    .stat-card { padding:12px; }
    .stat-icon { width:36px;height:36px;font-size:16px;border-radius:10px; }
    .stat-value { font-size:20px; }
    .stat-label { font-size:10px; }
  }
`;

export function DashLayout({
  title,
  subtitle,
  allowedRoles,
  children,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  allowedRoles: UserRole[];
  children: ReactNode;
}) {
  const { user, isLoggedIn, isReady, role } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isReady) return;
    if (!isLoggedIn) {
      router.push("/login?redirect=/dashboard");
      return;
    }
    // subadmin gets access wherever admin is allowed
    const hasAccess = role && (allowedRoles.includes(role) || (role === "subadmin" && allowedRoles.includes("admin")));
    if (role && !hasAccess) {
      router.push("/dashboard");
    }
  }, [isReady, isLoggedIn, role, allowedRoles, router]);

  const canView = role && (allowedRoles.includes(role) || (role === "subadmin" && allowedRoles.includes("admin")));
  if (!isReady || !isLoggedIn || (role && !canView)) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--sky-bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "var(--text-3)", fontSize: 14 }}>Loading dashboard...</div>
      </div>
    );
  }

  const initials = user?.name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase() ?? "U";

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: DASH_CSS }} />
      <div className="dash-wrap">
        <div className="dash-inner">
          <div className="dash-header">
            <div>
              <h1 className="dash-title">{title}</h1>
              {subtitle && <p className="dash-sub">{subtitle}</p>}
            </div>
            <div className="dash-user-box">
              <div className="dash-user-avatar">{initials}</div>
              <div>
                <div className="dash-user-name">{user?.name}</div>
                <div className="dash-user-role">{role}</div>
              </div>
              <button className="dash-logout-btn" onClick={() => { logout(); router.push("/"); }}>Sign out</button>
            </div>
          </div>
          {children}
        </div>
      </div>
    </>
  );
}

export function StatCard({
  icon, label, value, delta, deltaType,
}: {
  icon: string; label: string; value: string | number; delta?: string; deltaType?: "up" | "down";
}) {
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {delta && <div className={`stat-delta ${deltaType ?? "up"}`}>{delta}</div>}
    </div>
  );
}
