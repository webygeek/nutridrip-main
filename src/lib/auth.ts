"use client";

import { useEffect, useState } from "react";

// Auth layer — login calls the real API, session cached in localStorage.
// NOW:   POST /api/auth/login → SQLite (bcrypt verified)
// LATER: Same API, just swap the DB behind it to Supabase/PostgreSQL.

const STORAGE_KEY = "nutridrip_auth";

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
  loginAt: string;
  token?: string;
  permissions?: Permission[];
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

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    window.dispatchEvent(new Event("nutridrip_auth_change"));
    return user;
  } catch {
    return null;
  }
}

export function logout(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event("nutridrip_auth_change"));
}

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
