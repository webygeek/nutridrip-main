// Synthetic demo data for admin / doctor / clinic dashboards.
// All names, emails, dates and amounts are fake.

export type DashPatient = {
  id: string;
  name: string;
  age: number;
  gender: "M" | "F";
  email: string;
  phone: string;
  joinedAt: string;
  vitalityScore: number;
  lastVisit: string | null;
  totalSessions: number;
  primaryConcern: string;
};

export type DashBooking = {
  id: string;
  patientName: string;
  dripName: string;
  scheduledAt: string;
  status: "scheduled" | "completed" | "cancelled" | "in-progress";
  location: "home" | "clinic" | "office" | "hotel";
  amount: number;
  nurseAssigned: string | null;
};

export type DashApproval = {
  id: string;
  patientName: string;
  dripName: string;
  requestedAt: string;
  severity: "Strongly Recommended" | "Recommended" | "Optional Boost";
  status: "pending" | "approved" | "rejected" | "info-requested";
  customNotes: string;
};

export type DashClinic = {
  id: string;
  name: string;
  location: string;
  contact: string;
  partnersSince: string;
  monthlyVolume: number;
  status: "active" | "pending" | "paused";
};

export type DashDoctor = {
  id: string;
  name: string;
  specialty: string;
  approvalsThisMonth: number;
  avgTurnaroundHrs: number;
  rating: number;
  status: "available" | "on-leave";
};

export type ClinicOrder = {
  id: string;
  orderedAt: string;
  items: string;
  amount: number;
  status: "pending" | "processing" | "delivered" | "cancelled";
  scheduledDelivery: string | null;
};

export const DEMO_PATIENTS: DashPatient[] = [
  { id: "p-001", name: "Arjun Sharma", age: 34, gender: "M", email: "arjun.s@email.com", phone: "+91 98000 10001", joinedAt: "2026-01-12T09:00:00Z", vitalityScore: 52, lastVisit: "2026-04-08T14:30:00Z", totalSessions: 4, primaryConcern: "Chronic fatigue" },
  { id: "p-002", name: "Priya Reddy", age: 42, gender: "F", email: "priya.r@email.com", phone: "+91 98000 10002", joinedAt: "2026-02-05T11:00:00Z", vitalityScore: 68, lastVisit: "2026-04-10T10:00:00Z", totalSessions: 6, primaryConcern: "Post-COVID brain fog" },
  { id: "p-003", name: "Karan Mehta", age: 38, gender: "M", email: "karan.m@email.com", phone: "+91 98000 10003", joinedAt: "2026-03-18T15:30:00Z", vitalityScore: 75, lastVisit: "2026-04-14T08:00:00Z", totalSessions: 12, primaryConcern: "Jet lag / travel recovery" },
  { id: "p-004", name: "Neha Desai", age: 29, gender: "F", email: "neha.d@email.com", phone: "+91 98000 10004", joinedAt: "2026-01-28T13:00:00Z", vitalityScore: 44, lastVisit: "2026-04-11T16:00:00Z", totalSessions: 5, primaryConcern: "Burnout + anxiety" },
  { id: "p-005", name: "Sanjay Verma", age: 56, gender: "M", email: "sanjay.v@email.com", phone: "+91 98000 10005", joinedAt: "2026-02-22T10:30:00Z", vitalityScore: 58, lastVisit: null, totalSessions: 0, primaryConcern: "Cognitive decline screening" },
  { id: "p-006", name: "Sneha Venkat", age: 31, gender: "F", email: "sneha.v@email.com", phone: "+91 98000 10006", joinedAt: "2026-03-01T09:45:00Z", vitalityScore: 61, lastVisit: "2026-04-09T11:30:00Z", totalSessions: 8, primaryConcern: "Melasma" },
  { id: "p-007", name: "Rohit Joshi", age: 47, gender: "M", email: "rohit.j@email.com", phone: "+91 98000 10007", joinedAt: "2026-02-14T16:20:00Z", vitalityScore: 49, lastVisit: "2026-04-12T09:00:00Z", totalSessions: 6, primaryConcern: "Recurrent sinusitis" },
  { id: "p-008", name: "Lakshmi Tiwari", age: 35, gender: "F", email: "lakshmi.t@email.com", phone: "+91 98000 10008", joinedAt: "2026-01-05T12:00:00Z", vitalityScore: 72, lastVisit: "2026-04-13T13:30:00Z", totalSessions: 8, primaryConcern: "Long COVID recovery" },
];

export const DEMO_APPROVALS: DashApproval[] = [
  { id: "apr-001", patientName: "Arjun Sharma", dripName: "Velocity", requestedAt: "2026-04-16T08:15:00Z", severity: "Strongly Recommended", status: "pending", customNotes: "Fatigue score 8/10, B12 deficient, loading dose requested" },
  { id: "apr-002", patientName: "Neha Desai", dripName: "Cognitas", requestedAt: "2026-04-16T07:40:00Z", severity: "Recommended", status: "pending", customNotes: "Anxiety + burnout, magnesium deficit suspected" },
  { id: "apr-003", patientName: "Sanjay Verma", dripName: "Cognitas", requestedAt: "2026-04-15T18:20:00Z", severity: "Strongly Recommended", status: "pending", customNotes: "Age 56, APOE4 family history, cognitive screening" },
  { id: "apr-004", patientName: "Sneha Venkat", dripName: "Luminescence", requestedAt: "2026-04-15T14:00:00Z", severity: "Recommended", status: "approved", customNotes: "Melasma × 3 years, standard protocol" },
  { id: "apr-005", patientName: "Rohit Joshi", dripName: "Fortress", requestedAt: "2026-04-15T11:30:00Z", severity: "Strongly Recommended", status: "approved", customNotes: "Recurrent sinusitis, winter maintenance course" },
  { id: "apr-006", patientName: "Priya Reddy", dripName: "Velocity", requestedAt: "2026-04-14T16:45:00Z", severity: "Recommended", status: "info-requested", customNotes: "Asked patient for recent creatinine values" },
];

export const DEMO_BOOKINGS: DashBooking[] = [
  { id: "bk-001", patientName: "Arjun Sharma", dripName: "Velocity", scheduledAt: "2026-04-17T10:00:00Z", status: "scheduled", location: "home", amount: 10700, nurseAssigned: "Nurse R. Kumari" },
  { id: "bk-002", patientName: "Priya Reddy", dripName: "Fortress", scheduledAt: "2026-04-17T14:30:00Z", status: "scheduled", location: "clinic", amount: 9200, nurseAssigned: "Nurse S. Patel" },
  { id: "bk-003", patientName: "Karan Mehta", dripName: "Hydraflux", scheduledAt: "2026-04-16T16:00:00Z", status: "in-progress", location: "hotel", amount: 6500, nurseAssigned: "Nurse R. Kumari" },
  { id: "bk-004", patientName: "Sneha Venkat", dripName: "Luminescence", scheduledAt: "2026-04-16T11:00:00Z", status: "completed", location: "clinic", amount: 10900, nurseAssigned: "Nurse M. Das" },
  { id: "bk-005", patientName: "Neha Desai", dripName: "Cognitas", scheduledAt: "2026-04-18T09:00:00Z", status: "scheduled", location: "home", amount: 12900, nurseAssigned: null },
  { id: "bk-006", patientName: "Rohit Joshi", dripName: "Fortress", scheduledAt: "2026-04-15T15:00:00Z", status: "completed", location: "office", amount: 9300, nurseAssigned: "Nurse S. Patel" },
  { id: "bk-007", patientName: "Lakshmi Tiwari", dripName: "Velocity", scheduledAt: "2026-04-14T10:30:00Z", status: "completed", location: "home", amount: 10700, nurseAssigned: "Nurse M. Das" },
  { id: "bk-008", patientName: "Sanjay Verma", dripName: "Apex", scheduledAt: "2026-04-19T11:00:00Z", status: "scheduled", location: "clinic", amount: 12400, nurseAssigned: null },
];

export const DEMO_CLINICS: DashClinic[] = [
  { id: "cln-001", name: "Apollo Wellness Centre", location: "Mumbai", contact: "Dr. Rakesh Iyer", partnersSince: "2025-08-15T00:00:00Z", monthlyVolume: 45, status: "active" },
  { id: "cln-002", name: "Fortis Cosmetic & Aesthetic", location: "Delhi", contact: "Dr. Meena Kapoor", partnersSince: "2025-11-20T00:00:00Z", monthlyVolume: 32, status: "active" },
  { id: "cln-003", name: "Manipal IVF & Wellness", location: "Bangalore", contact: "Dr. Amit Shetty", partnersSince: "2026-01-08T00:00:00Z", monthlyVolume: 28, status: "active" },
  { id: "cln-004", name: "CMC Hyderabad - Integrative", location: "Hyderabad", contact: "Dr. Kiran Rao", partnersSince: "2026-02-14T00:00:00Z", monthlyVolume: 18, status: "active" },
  { id: "cln-005", name: "Max Aesthetics — Gurgaon", location: "Gurgaon", contact: "Dr. Suresh Gupta", partnersSince: "2026-03-22T00:00:00Z", monthlyVolume: 0, status: "pending" },
];

export const DEMO_DOCTORS_DASH: DashDoctor[] = [
  { id: "dr-001", name: "Dr. Kavya Mehra", specialty: "Internal Medicine & IV Therapy", approvalsThisMonth: 87, avgTurnaroundHrs: 1.2, rating: 4.9, status: "available" },
  { id: "dr-002", name: "Dr. Tarun Reddy", specialty: "Preventive Medicine & Nutrition", approvalsThisMonth: 64, avgTurnaroundHrs: 1.8, rating: 4.8, status: "available" },
  { id: "dr-003", name: "Dr. Priya Singh", specialty: "Dermatology & Aesthetic Medicine", approvalsThisMonth: 42, avgTurnaroundHrs: 2.1, rating: 4.9, status: "available" },
  { id: "dr-004", name: "Dr. Aditya Nair", specialty: "Sports Medicine & Rehabilitation", approvalsThisMonth: 31, avgTurnaroundHrs: 1.5, rating: 4.7, status: "on-leave" },
  { id: "dr-005", name: "Dr. Sneha Gupta", specialty: "Endocrinology & Metabolic Health", approvalsThisMonth: 28, avgTurnaroundHrs: 2.5, rating: 4.8, status: "available" },
  { id: "dr-006", name: "Dr. Samuel Joseph", specialty: "General Medicine & Wellness", approvalsThisMonth: 95, avgTurnaroundHrs: 0.9, rating: 4.6, status: "available" },
];

export const DEMO_CLINIC_ORDERS: ClinicOrder[] = [
  { id: "ord-001", orderedAt: "2026-04-15T10:00:00Z", items: "Velocity × 10, Fortress × 8", amount: 148600, status: "processing", scheduledDelivery: "2026-04-17T00:00:00Z" },
  { id: "ord-002", orderedAt: "2026-04-12T09:30:00Z", items: "Luminescence × 12", amount: 110400, status: "delivered", scheduledDelivery: "2026-04-13T00:00:00Z" },
  { id: "ord-003", orderedAt: "2026-04-08T14:15:00Z", items: "Velocity × 5, Cognitas × 6, Hydraflux × 15", amount: 190000, status: "delivered", scheduledDelivery: "2026-04-10T00:00:00Z" },
  { id: "ord-004", orderedAt: "2026-04-16T11:45:00Z", items: "Apex × 8", amount: 84000, status: "pending", scheduledDelivery: null },
];

export function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });
}

export function formatDateTime(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function fmtCurrency(n: number): string {
  return `₹${n.toLocaleString("en-IN")}`;
}
