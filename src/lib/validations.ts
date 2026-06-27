import { z } from "zod";

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email("Invalid email format").max(255),
  password: z.string().min(6, "Password must be at least 6 characters").max(128),
});

export const logoutSchema = z.object({
  token: z.string().optional(),
});

// ─── Users ────────────────────────────────────────────────────────────────────

const baseUserSchema = {
  email: z.string().email().max(255),
  name: z.string().min(1).max(100),
  role: z.enum(["patient", "doctor", "admin", "subadmin", "clinic", "nurse"]),
  phone: z.string().max(20).optional(),
  permissions: z.array(z.string()).optional(),
};

export const userCreateSchema = z.object({
  ...baseUserSchema,
  password: z.string().min(6).max(128),
});

export const userUpdateSchema = z.object({
  id: z.string().min(1),
  email: z.string().email().max(255).optional(),
  name: z.string().min(1).max(100).optional(),
  role: z.enum(["patient", "doctor", "admin", "subadmin", "clinic", "nurse"]).optional(),
  phone: z.string().max(20).optional(),
  password: z.string().min(6).max(128).optional(),
  permissions: z.array(z.string()).optional(),
  status: z.enum(["active", "inactive", "suspended"]).optional(),
  // Profile fields
  dob: z.string().optional(),
  bloodGroup: z.string().optional(),
  address: z.string().optional(),
  emergencyContact: z.string().optional(),
  allergies: z.string().optional(),
  chronicConditions: z.string().optional(),
  currentMedications: z.string().optional(),
  surgeries: z.string().optional(),
  familyHistory: z.string().optional(),
  lifestyleNotes: z.string().optional(),
  specialty: z.string().optional(),
  qualifications: z.string().optional(),
  experience: z.string().optional(),
  rnNumber: z.string().optional(),
  shift: z.string().optional(),
  languages: z.array(z.string()).optional(),
});

export const userDeleteSchema = z.object({
  id: z.string().min(1),
});

// ─── Content Blocks ───────────────────────────────────────────────────────────

export const contentBlockSchema = z.object({
  key: z.string().min(1).max(200),
  value: z.string().max(50000),
});

export const contentBlockDeleteSchema = z.object({
  key: z.string().optional(), // If undefined, delete all
});

// ─── Bookings ─────────────────────────────────────────────────────────────────

export const bookingCreateSchema = z.object({
  dripId: z.string().min(1),
  scheduledAt: z.string().datetime(),
  location: z.enum(["home", "clinic", "office", "hotel"]).optional().default("home"),
  address: z.string().max(500).optional(),
  notes: z.string().max(1000).optional(),
});

export const bookingUpdateSchema = z.object({
  id: z.string().cuid(),
  status: z.enum(["scheduled", "in-progress", "completed", "cancelled"]).optional(),
  sessionStatus: z.enum(["scheduled", "nurse-assigned", "in-progress", "completed", "cancelled"]).optional(),
  nurseId: z.string().optional(),
  nurseName: z.string().optional(),
  nursePhone: z.string().optional(),
  doctorNotes: z.string().optional(),
  etaMinutes: z.number().int().min(0).optional(),
  notes: z.string().max(1000).optional(),
  cancellationFee: z.number().int().min(0).optional(),
});

// ─── Approvals ────────────────────────────────────────────────────────────────

export const approvalUpdateSchema = z.object({
  id: z.string().cuid(),
  status: z.enum(["pending", "approved", "rejected"]),
  doctorId: z.string().optional(),
  doctorName: z.string().optional(),
  customNotes: z.string().max(2000).optional(),
  protocol: z.array(z.string()).optional(),
});

// ─── Notifications ────────────────────────────────────────────────────────────

export const notificationCreateSchema = z.object({
  userId: z.string().cuid(),
  title: z.string().min(1).max(200),
  body: z.string().min(1).max(1000),
  type: z.enum(["info", "warning", "success", "error"]).optional().default("info"),
  link: z.string().url().optional().or(z.literal("")),
});

// ─── Lab Reports ──────────────────────────────────────────────────────────────

export const labReportCreateSchema = z.object({
  fileName: z.string().min(1).max(255),
  filePath: z.string().max(500),
  fileSize: z.number().int().min(0).max(10 * 1024 * 1024), // 10MB max
  category: z.string().max(100).optional(),
  notes: z.string().max(500).optional(),
});

// ─── Infusion Orders ──────────────────────────────────────────────────────────

export const infusionOrderUpdateSchema = z.object({
  id: z.string().cuid(),
  sessionStatus: z.enum(["scheduled", "in-progress", "completed", "cancelled"]).optional(),
  consentSigned: z.boolean().optional(),
  fingerprintDone: z.boolean().optional(),
  historyTaken: z.boolean().optional(),
  baselineVitals: z.record(z.string(), z.string()).optional(),
  checklistDone: z.array(z.string()).optional(),
  sessionNotes: z.string().max(2000).optional(),
  infusionRate: z.number().int().min(0).optional(),
});

// ─── Type exports ─────────────────────────────────────────────────────────────

export type LoginInput = z.infer<typeof loginSchema>;
export type UserCreateInput = z.infer<typeof userCreateSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
export type ContentBlockInput = z.infer<typeof contentBlockSchema>;
export type BookingCreateInput = z.infer<typeof bookingCreateSchema>;
export type BookingUpdateInput = z.infer<typeof bookingUpdateSchema>;

// ─── Quiz ─────────────────────────────────────────────────────────────────

export const quizSubmitSchema = z.object({
  answers: z.array(z.object({
    questionId: z.string(),
    answer: z.string(),
  })),
  userId: z.string().optional(), // Optional for guests
});

export const quizReviewSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["pending", "reviewed", "approved", "rejected"]),
  doctorId: z.string().optional(),
  doctorName: z.string().optional(),
  notes: z.string().max(2000).optional(),
});

// ─── Lab Reports ─────────────────────────────────────────────────────────

export const labReportUploadSchema = z.object({
  fileName: z.string().min(1).max(255),
  fileSize: z.number().int().min(0).max(10 * 1024 * 1024),
  category: z.string().max(100),
  notes: z.string().max(500).optional(),
});

// ─── Clinic Enquiry ────────────────────────────────────────────────────────

export const clinicEnquirySchema = z.object({
  clinicName: z.string().min(1).max(200),
  contactName: z.string().min(1).max(100),
  contactEmail: z.string().email().max(255),
  contactPhone: z.string().min(1).max(20),
  orderType: z.string().min(1).max(100),
  formulas: z.array(z.string()).default([]),
  qty: z.number().int().min(1).default(1),
  address: z.string().max(500).optional().default(""),
  instructions: z.string().max(1000).optional().default(""),
});

// ─── Consultation ─────────────────────────────────────────────────────────

export const consultationSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email().max(255),
  phone: z.string().min(1).max(20),
  concern: z.string().min(1).max(2000),
  preferredTime: z.string().max(100).optional().default(""),
  userId: z.string().optional(), // Optional for guests
});

// ─── Profile ──────────────────────────────────────────────────────────────

export const profileUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  phone: z.string().max(20).optional(),
  dob: z.string().optional(),
  bloodGroup: z.string().optional(),
  address: z.string().max(500).optional(),
  emergencyContact: z.string().max(100).optional(),
  allergies: z.string().max(2000).optional(),
  chronicConditions: z.string().max(2000).optional(),
  currentMedications: z.string().max(2000).optional(),
  surgeries: z.string().max(2000).optional(),
  familyHistory: z.string().max(2000).optional(),
  lifestyleNotes: z.string().max(2000).optional(),
});

// ─── Feedback ─────────────────────────────────────────────────────────────

export const feedbackSchema = z.object({
  bookingId: z.string().min(1),
  hygieneRating: z.number().int().min(1).max(5),
  behaviourRating: z.number().int().min(1).max(5),
  comfortRating: z.number().int().min(1).max(5),
  overallRating: z.number().int().min(1).max(5).optional(),
  comment: z.string().max(1000).optional().default(""),
});

// ─── Consent ──────────────────────────────────────────────────────────────

export const consentSchema = z.object({
  bookingId: z.string().min(1),
  signatureName: z.string().min(1).max(200),
  fingerprintDone: z.boolean().default(false),
  faceScanDone: z.boolean().default(false),
});

// ─── Booking Create (expanded) ────────────────────────────────────────────

export const bookingCreateFullSchema = z.object({
  dripId: z.string().min(1),
  scheduledAt: z.string().datetime(),
  location: z.enum(["home", "clinic", "office", "hotel"]).default("home"),
  address: z.string().max(500).optional().default(""),
  notes: z.string().max(1000).optional().default(""),
  // Guest user fields
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  mobile: z.string().max(20).optional(),
  email: z.string().email().max(255).optional(),
  // Health info
  healthNotes: z.string().max(2000).optional().default(""),
  allergies: z.string().max(1000).optional().default(""),
  medications: z.string().max(1000).optional().default(""),
  conditions: z.string().max(1000).optional().default(""),
});