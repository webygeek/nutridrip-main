"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth, logout, type UserRole } from "@/lib/auth";

// Navigation items by role
const NAV_BY_ROLE: Record<UserRole, { label: string; href: string; icon: string }[]> = {
  admin: [
    { label: "Overview", href: "/dashboard/admin", icon: "📊" },
    { label: "Manage Users", href: "/dashboard/admin/manage", icon: "👥" },
    { label: "Content Studio", href: "/dashboard/admin/studio", icon: "✏️" },
  ],
  subadmin: [
    { label: "Overview", href: "/dashboard/admin", icon: "📊" },
    { label: "Content Studio", href: "/dashboard/admin/studio", icon: "✏️" },
  ],
  doctor: [
    { label: "Overview", href: "/dashboard/doctor", icon: "📊" },
    { label: "Approvals", href: "/dashboard/doctor#approvals", icon: "✅" },
    { label: "Quiz Results", href: "/dashboard/doctor#quiz-results", icon: "📝" },
    { label: "Patients", href: "/dashboard/doctor#patients", icon: "👥" },
  ],
  nurse: [
    { label: "Overview", href: "/dashboard/nurse", icon: "📊" },
    { label: "Active Orders", href: "/dashboard/nurse#orders", icon: "📋" },
  ],
  clinic: [
    { label: "Overview", href: "/dashboard/clinic", icon: "📊" },
    { label: "Orders", href: "/dashboard/clinic#orders", icon: "📋" },
    { label: "Billing", href: "/dashboard/clinic#billing", icon: "💳" },
    { label: "Profile", href: "/dashboard/clinic#profile", icon: "🏥" },
  ],
  patient: [
    { label: "Overview", href: "/dashboard/patient", icon: "📊" },
    { label: "My Profile", href: "/dashboard/patient#profile", icon: "👤" },
    { label: "Medical History", href: "/dashboard/patient#medical-history", icon: "📋" },
    { label: "Lab Reports", href: "/dashboard/patient#lab-reports", icon: "🧪" },
    { label: "My Sessions", href: "/dashboard/patient#sessions", icon: "💉" },
    { label: "Book a Drip", href: "/book-now", icon: "📅" },
    { label: "Health Quiz", href: "/health-quiz", icon: "🩺" },
  ],
};

// App Shell CSS
const APPSHELL_CSS = `
  .app-shell {
    display: flex;
    min-height: 100vh;
    background: var(--sky-bg);
  }

  .app-sidebar {
    width: 248px;
    min-height: 100vh;
    background: var(--white);
    border-right: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    position: fixed;
    left: 0;
    top: 0;
    z-index: 100;
  }

  .app-sidebar-logo {
    padding: 20px 20px 16px;
    border-bottom: 1px solid var(--border);
  }

  .app-sidebar-logo a {
    display: flex;
    align-items: center;
    gap: 10px;
    text-decoration: none;
  }

  .app-sidebar-logo img {
    height: 32px;
    width: auto;
  }

  .app-sidebar-logo .logo-text {
    font-size: 18px;
    font-weight: 600;
    color: var(--teal);
  }

  .app-sidebar-nav {
    flex: 1;
    padding: 16px 12px;
    overflow-y: auto;
  }

  .app-sidebar-section {
    margin-bottom: 20px;
  }

  .app-sidebar-section-title {
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: var(--text-3);
    padding: 0 8px;
    margin-bottom: 6px;
  }

  .app-nav-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border-radius: 8px;
    color: var(--text-2);
    text-decoration: none;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.15s ease;
    margin-bottom: 2px;
  }

  .app-nav-item:hover {
    background: var(--sky-pale);
    color: var(--text);
  }

  .app-nav-item.active {
    background: var(--sky-pale);
    color: var(--teal);
    font-weight: 600;
  }

  .app-nav-item.active::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 3px;
    height: 20px;
    background: var(--teal);
    border-radius: 0 2px 2px 0;
  }

  .app-nav-icon {
    font-size: 16px;
    width: 20px;
    text-align: center;
  }

  .app-sidebar-footer {
    padding: 16px;
    border-top: 1px solid var(--border);
  }

  .app-user-card {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background: var(--sky-pale);
    border-radius: 12px;
    margin-bottom: 12px;
  }

  .app-user-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--teal), var(--sky));
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 14px;
    font-weight: 600;
  }

  .app-user-info {
    flex: 1;
    min-width: 0;
  }

  .app-user-name {
    font-size: 14px;
    font-weight: 600;
    color: var(--text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .app-user-role {
    font-size: 11px;
    color: var(--text-3);
    text-transform: capitalize;
  }

  .app-signout-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    padding: 10px 16px;
    border-radius: 8px;
    background: transparent;
    border: 1px solid var(--border);
    color: var(--text-2);
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .app-signout-btn:hover {
    background: #FEE2E2;
    border-color: #FECACA;
    color: #DC2626;
  }

  .app-main {
    flex: 1;
    margin-left: 248px;
    display: flex;
    flex-direction: column;
  }

  .app-topbar {
    height: 64px;
    background: var(--white);
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 32px;
    position: sticky;
    top: 0;
    z-index: 50;
  }

  .app-topbar-title {
    font-size: 18px;
    font-weight: 600;
    color: var(--text);
  }

  .app-topbar-actions {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .app-topbar-bell {
    position: relative;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: var(--sky-pale);
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    transition: all 0.15s ease;
  }

  .app-topbar-bell:hover {
    background: var(--sky);
  }

  .app-topbar-bell .badge {
    position: absolute;
    top: 6px;
    right: 6px;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #EF4444;
  }

  .app-content {
    flex: 1;
    padding: 32px;
    max-width: 1400px;
  }

  /* Mobile styles */
  @media (max-width: 768px) {
    .app-sidebar {
      transform: translateX(-100%);
      transition: transform 0.3s ease;
    }

    .app-sidebar.open {
      transform: translateX(0);
    }

    .app-main {
      margin-left: 0;
    }

    .app-mobile-header {
      display: flex;
      align-items: center;
      padding: 12px 16px;
      background: var(--white);
      border-bottom: 1px solid var(--border);
      position: sticky;
      top: 0;
      z-index: 50;
    }

    .app-mobile-menu-btn {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      background: var(--sky-pale);
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
    }

    .app-content {
      padding: 20px 16px;
    }
  }

  @media (min-width: 769px) {
    .app-mobile-header {
      display: none;
    }
  }
`;

interface AppShellProps {
  children: React.ReactNode;
  title?: string;
}

export default function AppShell({ children, title = "Dashboard" }: AppShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoggedIn, isReady, role } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (isReady && !isLoggedIn) {
      router.push("/login");
    }
  }, [isReady, isLoggedIn, router]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const navItems = role ? NAV_BY_ROLE[role] || [] : [];
  const initials = user?.name?.split(" ").map(p => p[0]).slice(0, 2).join("").toUpperCase() || "U";

  if (!isReady || !isLoggedIn) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--sky-bg)"
      }}>
        <div style={{ color: "var(--text-3)" }}>Loading...</div>
      </div>
    );
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: APPSHELL_CSS }} />

      <div className="app-shell">
        {/* Mobile Header */}
        <div className="app-mobile-header">
          <button
            className="app-mobile-menu-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            ☰
          </button>
          <span style={{ marginLeft: 12, fontWeight: 600, color: "var(--teal)" }}>
            NutriDrip
          </span>
        </div>

        {/* Sidebar Overlay (mobile) */}
        {sidebarOpen && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.5)",
              zIndex: 99
            }}
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`app-sidebar ${sidebarOpen ? "open" : ""}`}>
          {/* Logo */}
          <div className="app-sidebar-logo">
            <Link href="/dashboard">
              <span className="logo-text">✨ NutriDrip</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="app-sidebar-nav">
            {navItems.map((item, i) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={i}
                  href={item.href}
                  className={`app-nav-item ${isActive ? "active" : ""}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="app-nav-icon">{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="app-sidebar-footer">
            <div className="app-user-card">
              <div className="app-user-avatar">{initials}</div>
              <div className="app-user-info">
                <div className="app-user-name">{user?.name}</div>
                <div className="app-user-role">{role}</div>
              </div>
            </div>
            <button className="app-signout-btn" onClick={handleLogout}>
              🚪 Sign out
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="app-main">
          {/* Topbar */}
          <div className="app-topbar">
            <h1 className="app-topbar-title">{title}</h1>
            <div className="app-topbar-actions">
              <button className="app-topbar-bell">
                🔔
                <span className="badge"></span>
              </button>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "linear-gradient(135deg, var(--teal), var(--sky))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer"
              }}>
                {initials}
              </div>
            </div>
          </div>

          {/* Page Content */}
          <div className="app-content">
            {children}
          </div>
        </main>
      </div>
    </>
  );
}
