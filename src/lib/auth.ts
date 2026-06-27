"use client";

import { useEffect, useState } from "react";

// Auth layer — login calls the real API, session stored in HttpOnly cookie
// Token is still cached in localStorage for quick access, but server validates via cookie

const STORAGE_KEY = "nutridrip_user";
const AUTH_COOKIE_NAME = "nutridrip_token";

export type UserRole = "patient" | "doctor" | "admin" | "subadmin" | "clinic" | "nurse";

export const ALL_PERMISSIONS = [
  "manage_drips",
  "manage_patients",
  "manage_doctors",
  "manage_clinics",
  "manage_nurses",
  "manage_assignments",
  "edit_content",
  "edit_quiz",
  "view_analytics",
  "manage_bookings",
] as const;

export type Permission = (typeof ALL_PERMISSIONS)[number];

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  loginAt: string;
  token?: string;
  permissions?: Permission[];
  isLoggedIn?: boolean;
};

export type DemoAccount = {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  description: string;
};

export const DEMO_ACCOUNTS: DemoAccount[] = [
  { email: "demo@nutridrip.in", password: "demo1234", name: "Demo Patient", role: "patient", description: "Patient portal — profile, lab uploads, booking history" },
  { email: "doctor@nutridrip.in", password: "doctor1234", name: "Dr. Kavya Mehra", role: "doctor", description: "Doctor dashboard — protocol approvals, patient queue" },
  { email: "admin@nutridrip.in", password: "admin1234", name: "Super Admin", role: "admin", description: "Super Admin — full platform control, Editor Studio, all dashboards" },
  { email: "subadmin@nutridrip.in", password: "subadmin1234", name: "Sub-Admin (Content)", role: "subadmin", description: "Sub-admin — limited access based on assigned permissions" },
  { email: "clinic@nutridrip.in", password: "clinic1234", name: "Apollo Wellness Centre", role: "clinic", description: "Partner clinic dashboard — orders, billing, referrals" },
  { email: "nurse@nutridrip.in", password: "nurse1234", name: "Nurse R. Kumari", role: "nurse", description: "Nursing staff dashboard — active orders, step-wise infusion checklist" },
];

export const DEMO_CREDENTIALS = DEMO_ACCOUNTS[0];

// Login — calls real backend API with bcrypt verification
// Server sets HttpOnly cookie, we cache user info in localStorage
export async function login(email: string, password: string): Promise<AuthUser | null> {
  if (typeof window === "undefined") return null;

  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
    });

    const data = await res.json();
    if (!data.success || !data.user) return null;

    const user: AuthUser = {
      id: data.user.id,
      email: data.user.email,
      name: data.user.name,
      role: data.user.role as UserRole,
      permissions: data.user.permissions ?? [],
      loginAt: new Date().toISOString(),
      token: data.token ?? undefined,
    };

    // Cache user in localStorage for quick client-side access
    // Token is also in HttpOnly cookie for server validation
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    window.dispatchEvent(new Event("nutridrip_auth_change"));
    return user;
  } catch {
    return null;
  }
}

// Logout — call API to clear cookie, then clear localStorage
export async function logout(): Promise<void> {
  if (typeof window === "undefined") return;

  try {
    // Call logout endpoint to clear cookie
    await fetch("/api/auth/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    // Ignore network errors, clear local state regardless
  } finally {
    window.localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event("nutridrip_auth_change"));
  }
}

// Get cached token (for API calls that need explicit token)
export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return (JSON.parse(raw) as AuthUser).token ?? null;
  } catch {
    return null;
  }
}

// Get cached user from localStorage
export function getCurrentUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthUser;
    if (!parsed.role) parsed.role = "patient";
    return parsed;
  } catch {
    return null;
  }
}

// Check if auth cookie exists (for server-side validation)
export function hasAuthCookie(): boolean {
  if (typeof document === "undefined") return false;
  const cookies = document.cookie.split(";");
  return cookies.some((c) => c.trim().startsWith(`${AUTH_COOKIE_NAME}=`));
}

// React hook for auth state
export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setUser(getCurrentUser());
    setIsReady(true);

    const handleChange = () => setUser(getCurrentUser());
    window.addEventListener("nutridrip_auth_change", handleChange);
    window.addEventListener("storage", handleChange);
    return () => {
      window.removeEventListener("nutridrip_auth_change", handleChange);
      window.removeEventListener("storage", handleChange);
    };
  }, []);

  return { user, isLoggedIn: !!user, isReady, role: user?.role ?? null };
}
