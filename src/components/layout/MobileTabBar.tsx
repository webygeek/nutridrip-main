"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useEffect } from "react";

const tabs = [
  {
    href: "/",
    label: "Home",
    exact: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/>
        <path d="M9 21V12h6v9"/>
      </svg>
    ),
  },
  {
    href: "/treatments",
    label: "Drips",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2C8 7 6 10 6 13a6 6 0 0012 0c0-3-2-6-6-11z"/>
      </svg>
    ),
  },
  {
    href: "/book-now",
    label: "Book",
    isBook: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2"/>
        <path d="M16 2v4M8 2v4M3 10h18"/>
        <path d="M12 14v4M10 16h4"/>
      </svg>
    ),
  },
  {
    href: "/health-quiz",
    label: "Quiz",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9"/>
        <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/>
        <circle cx="12" cy="17" r=".5" fill="currentColor"/>
      </svg>
    ),
  },
  {
    href: "/dashboard",
    label: "My Care",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4"/>
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
      </svg>
    ),
  },
];

export default function MobileTabBar() {
  const pathname = usePathname();
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    document.body.classList.add("has-tab-bar");
    return () => document.body.classList.remove("has-tab-bar");
  }, []);

  function isActive(tab: typeof tabs[number]) {
    if (tab.exact) return pathname === tab.href;
    if (tab.href === "/dashboard") return pathname?.startsWith("/dashboard") || pathname === "/login";
    return pathname?.startsWith(tab.href);
  }

  return (
    <nav className="mobile-tab-bar" aria-label="Mobile navigation">
      {tabs.map((tab) => {
        const href = tab.href === "/dashboard" && !isLoggedIn ? "/login" : tab.href;
        const active = isActive(tab);
        return (
          <Link
            key={tab.href}
            href={href}
            className={`tab-item${tab.isBook ? " tab-book" : ""}${active ? " active" : ""}`}
            aria-current={active ? "page" : undefined}
          >
            {tab.icon}
            <span className="tab-label">{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
