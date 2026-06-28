"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { StatCard } from "@/components/dashboard/DashLayout";
import { formatDate, formatDateTime, fmtCurrency } from "@/lib/data/dashboard-mock";
import UpcomingSession from "./UpcomingSession";
import { useAuth, getToken } from "@/lib/auth";

type PatientProfile = {
  name: string;
  dob: string;
  bloodGroup: string;
  phone: string;
  address: string;
  emergencyContact: string;
  allergies: string;
  chronicConditions: string;
  currentMedications: string;
  surgeries: string;
  familyHistory: string;
  lifestyleNotes: string;
};

type LabReport = {
  id: string;
  fileName: string;
  uploadedAt: string;
  sizeBytes: number;
  category: string;
  notes: string;
};

type Booking = {
  id: string;
  status: string;
  sessionStatus: string;
  scheduledAt: string;
  amount: number;
  drip: {
    name: string;
    slug: string;
    icon: string;
  };
};

const EMPTY_PROFILE: PatientProfile = {
  name: "", dob: "", bloodGroup: "", phone: "", address: "",
  emergencyContact: "", allergies: "", chronicConditions: "",
  currentMedications: "", surgeries: "", familyHistory: "", lifestyleNotes: "",
};

const REPORT_CATEGORIES = [
  "Complete Blood Count (CBC)",
  "Vitamin D / B12 / Folate",
  "Iron Studies / Ferritin",
  "Thyroid Panel",
  "Liver Function Tests",
  "Kidney Function Tests",
  "HbA1c / Glucose",
  "Lipid Profile",
  "Hormonal Panel",
  "Other",
];

// ─── Stat cards ──────────────────────────────────────────────────────────────

const STATS = [
  { label: "Sessions Completed", value: "0", icon: "✓", color: "teal" },
  { label: "Upcoming Sessions", value: "0", icon: "📅", color: "sky" },
  { label: "Lab Reports", value: "0", icon: "📋", color: "gold" },
  { label: "Health Score", value: "—", icon: "❤️", color: "rose" },
];

// ─── Lab upload modal ────────────────────────────────────────────────────────

function LabUploadModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState("");
  const [notes, setNotes] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleUpload() {
    if (!file || !category) {
      setError("Please select a file and category");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const token = getToken();
      const res = await fetch("/api/lab-reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          fileName: file.name,
          fileSize: file.size,
          category,
          notes,
        }),
      });

      const data = await res.json();
      if (data.success) {
        onSuccess();
        onClose();
      } else {
        setError(data.error || "Upload failed");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000, padding: 20,
    }}>
      <div style={{
        background: "var(--white)", borderRadius: 16, padding: 32,
        maxWidth: 480, width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
      }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 20 }}>Upload Lab Report</h2>

        {error && (
          <div style={{
            background: "#FEE2E2", color: "#DC2626", padding: "10px 14px",
            borderRadius: 8, marginBottom: 16, fontSize: 13,
          }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 13, color: "var(--text-2)", display: "block", marginBottom: 6 }}>
            Report Type
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{
              width: "100%", padding: "10px 12px", borderRadius: 8,
              border: "1.5px solid var(--border)", fontSize: 14,
              background: "var(--white)",
            }}
          >
            <option value="">Select category...</option>
            {REPORT_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 13, color: "var(--text-2)", display: "block", marginBottom: 6 }}>
            Upload File (PDF, PNG, JPG — max 5MB)
          </label>
          <input
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            style={{ fontSize: 13 }}
          />
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 13, color: "var(--text-2)", display: "block", marginBottom: 6 }}>
            Notes (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Fasting blood test, taken in morning..."
            rows={3}
            style={{
              width: "100%", padding: "10px 12px", borderRadius: 8,
              border: "1.5px solid var(--border)", fontSize: 14, resize: "vertical",
            }}
          />
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: "12px 16px", borderRadius: 50,
              border: "1.5px solid var(--border)", background: "var(--white)",
              fontSize: 14, cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={uploading}
            style={{
              flex: 1, padding: "12px 16px", borderRadius: 50,
              background: uploading ? "#ccc" : "var(--teal)", color: "#fff",
              border: "none", fontSize: 14, cursor: uploading ? "not-allowed" : "pointer",
            }}
          >
            {uploading ? "Uploading..." : "Upload Report"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Profile section ─────────────────────────────────────────────────────────

function ProfileSection({ profile, onSave }: { profile: PatientProfile; onSave: (p: PatientProfile) => void }) {
  const [form, setForm] = useState(profile);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    // Load profile from API on mount
    async function loadProfile() {
      const token = getToken();
      if (!token) return;

      try {
        const res = await fetch("/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success && data.data) {
          const p = data.data;
          setForm({
            name: p.name || user?.name || "",
            dob: p.dob || "",
            bloodGroup: p.bloodGroup || "",
            phone: p.phone || "",
            address: p.address || "",
            emergencyContact: p.emergencyContact || "",
            allergies: p.allergies || "",
            chronicConditions: p.chronicConditions || "",
            currentMedications: p.currentMedications || "",
            surgeries: p.surgeries || "",
            familyHistory: p.familyHistory || "",
            lifestyleNotes: p.lifestyleNotes || "",
          });
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
      }
    }
    loadProfile();
  }, []);

  async function handleSave() {
    setSaving(true);
    setSaved(false);

    try {
      const token = getToken();
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (data.success) {
        setSaved(true);
        onSave(form);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (err) {
      console.error("Failed to save profile:", err);
    } finally {
      setSaving(false);
    }
  }

  const FIELDS: { key: keyof PatientProfile; label: string; placeholder: string }[] = [
    { key: "dob", label: "Date of Birth", placeholder: "YYYY-MM-DD" },
    { key: "bloodGroup", label: "Blood Group", placeholder: "e.g. B+" },
    { key: "phone", label: "Phone", placeholder: "+91 98765 43210" },
    { key: "address", label: "Address", placeholder: "Full address" },
    { key: "emergencyContact", label: "Emergency Contact", placeholder: "Name & number" },
    { key: "allergies", label: "Allergies", placeholder: "e.g. Penicillin, peanuts..." },
    { key: "chronicConditions", label: "Chronic Conditions", placeholder: "e.g. Diabetes, hypertension..." },
    { key: "currentMedications", label: "Current Medications", placeholder: "e.g. Metformin 500mg..." },
    { key: "surgeries", label: "Past Surgeries", placeholder: "Any previous surgeries..." },
    { key: "familyHistory", label: "Family Medical History", placeholder: "Hereditary conditions..." },
    { key: "lifestyleNotes", label: "Lifestyle Notes", placeholder: "Smoking, alcohol, exercise..." },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 className="dash-title">Health Profile</h2>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            padding: "8px 20px", borderRadius: 50, background: saved ? "#22C55E" : "var(--teal)",
            color: "#fff", border: "none", fontSize: 13, cursor: saving ? "not-allowed" : "pointer",
            transition: "background 0.2s",
          }}
        >
          {saving ? "Saving..." : saved ? "✓ Saved" : "Save Profile"}
        </button>
      </div>

      <div className="dash-inner-card" style={{ padding: 24 }}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 13, color: "var(--text-2)", display: "block", marginBottom: 6 }}>Full Name</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            style={{
              width: "100%", padding: "10px 12px", borderRadius: 8,
              border: "1.5px solid var(--border)", fontSize: 14,
            }}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {FIELDS.slice(0, 2).map((f) => (
            <div key={f.key}>
              <label style={{ fontSize: 13, color: "var(--text-2)", display: "block", marginBottom: 6 }}>{f.label}</label>
              <input
                type="text"
                value={form[f.key]}
                onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                placeholder={f.placeholder}
                style={{
                  width: "100%", padding: "10px 12px", borderRadius: 8,
                  border: "1.5px solid var(--border)", fontSize: 14,
                }}
              />
            </div>
          ))}
        </div>

        {FIELDS.slice(2).map((f) => (
          <div key={f.key} style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, color: "var(--text-2)", display: "block", marginBottom: 6 }}>{f.label}</label>
            {f.key === "allergies" || f.key === "chronicConditions" || f.key === "currentMedications" ? (
              <textarea
                value={form[f.key]}
                onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                placeholder={f.placeholder}
                rows={2}
                style={{
                  width: "100%", padding: "10px 12px", borderRadius: 8,
                  border: "1.5px solid var(--border)", fontSize: 14, resize: "vertical",
                }}
              />
            ) : (
              <input
                type="text"
                value={form[f.key]}
                onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                placeholder={f.placeholder}
                style={{
                  width: "100%", padding: "10px 12px", borderRadius: 8,
                  border: "1.5px solid var(--border)", fontSize: 14,
                }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Lab reports section ─────────────────────────────────────────────────────

function LabReportsSection({ reports, onRefresh }: { reports: LabReport[]; onRefresh: () => void }) {
  const [showUpload, setShowUpload] = useState(false);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 className="dash-title">Lab Reports</h2>
        <button
          onClick={() => setShowUpload(true)}
          style={{
            padding: "8px 20px", borderRadius: 50, background: "var(--gold)",
            color: "#fff", border: "none", fontSize: 13, cursor: "pointer",
          }}
        >
          + Upload Report
        </button>
      </div>

      {showUpload && <LabUploadModal onClose={() => setShowUpload(false)} onSuccess={onRefresh} />}

      {reports.length === 0 ? (
        <div style={{
          background: "var(--white)", borderRadius: 12, padding: 48, textAlign: "center",
          border: "1.5px solid var(--border)",
        }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>📋</div>
          <p style={{ color: "var(--text-3)", fontSize: 14 }}>
            No lab reports uploaded yet.<br />Upload your blood test results for better recommendations.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {reports.map((report) => (
            <div key={report.id} style={{
              background: "var(--white)", borderRadius: 12, padding: 16,
              border: "1.5px solid var(--border)", display: "flex",
              justifyContent: "space-between", alignItems: "center",
            }}>
              <div>
                <div style={{ fontWeight: 500, fontSize: 14 }}>{report.category}</div>
                <div style={{ fontSize: 12, color: "var(--text-3)" }}>{report.fileName}</div>
                <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 4 }}>
                  Uploaded {formatDate(report.uploadedAt)}
                </div>
              </div>
              <button style={{
                padding: "6px 14px", borderRadius: 50, background: "var(--sky-bg)",
                border: "none", fontSize: 12, cursor: "pointer", color: "var(--teal)",
              }}>
                View
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Bookings list ───────────────────────────────────────────────────────────

function BookingsSection({ bookings }: { bookings: Booking[] }) {
  const upcoming = bookings.filter((b) => b.status !== "completed" && b.status !== "cancelled");
  const past = bookings.filter((b) => b.status === "completed" || b.status === "cancelled");

  return (
    <div>
      <h2 className="dash-title" style={{ marginBottom: 20 }}>Your Sessions</h2>

      {bookings.length === 0 ? (
        <div style={{
          background: "var(--white)", borderRadius: 12, padding: 48, textAlign: "center",
          border: "1.5px solid var(--border)",
        }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>📅</div>
          <p style={{ color: "var(--text-3)", fontSize: 14, marginBottom: 16 }}>
            No bookings yet. Book your first IV therapy session.
          </p>
          <Link
            href="/book-now"
            style={{
              display: "inline-block", padding: "10px 24px", borderRadius: 50,
              background: "var(--teal)", color: "#fff", textDecoration: "none", fontSize: 13,
            }}
          >
            Book Now
          </Link>
        </div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <div style={{ marginBottom: 32 }}>
              <h3 style={{ fontSize: 14, color: "var(--text-2)", marginBottom: 12, fontWeight: 500 }}>
                Upcoming Sessions
              </h3>
              {upcoming.map((booking) => (
                <UpcomingSession key={booking.id} session={booking} />
              ))}
            </div>
          )}

          {past.length > 0 && (
            <div>
              <h3 style={{ fontSize: 14, color: "var(--text-2)", marginBottom: 12, fontWeight: 500 }}>
                Past Sessions
              </h3>
              {past.slice(0, 5).map((booking) => (
                <div key={booking.id} style={{
                  background: "var(--white)", borderRadius: 12, padding: 16,
                  border: "1.5px solid var(--border)", marginBottom: 12,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: 14 }}>{booking.drip?.name || "Session"}</div>
                      <div style={{ fontSize: 12, color: "var(--text-3)" }}>
                        {formatDateTime(booking.scheduledAt)} · {fmtCurrency(booking.amount)}
                      </div>
                    </div>
                    <span style={{
                      padding: "4px 10px", borderRadius: 50, fontSize: 11,
                      background: booking.status === "completed" ? "#DCFCE7" : "#FEE2E2",
                      color: booking.status === "completed" ? "#16A34A" : "#DC2626",
                    }}>
                      {booking.status === "completed" ? "Completed" : "Cancelled"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Page component ───────────────────────────────────────────────────────────

export default function PatientDashboard() {
  const { user, isReady } = useAuth();
  const [profile, setProfile] = useState<PatientProfile>(EMPTY_PROFILE);
  const [reports, setReports] = useState<LabReport[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState(STATS);
  const [loading, setLoading] = useState(true);

  // Load data from APIs
  useEffect(() => {
    if (!isReady) return;

    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    async function loadData() {
      const token = getToken();
      if (!token) return;

      try {
        // Load profile
        const profileRes = await fetch("/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const profileData = await profileRes.json();
        if (profileData.success && profileData.data) {
          const p = profileData.data;
          setProfile({
            name: p.name || "",
            dob: p.dob || "",
            bloodGroup: p.bloodGroup || "",
            phone: p.phone || "",
            address: p.address || "",
            emergencyContact: p.emergencyContact || "",
            allergies: p.allergies || "",
            chronicConditions: p.chronicConditions || "",
            currentMedications: p.currentMedications || "",
            surgeries: p.surgeries || "",
            familyHistory: p.familyHistory || "",
            lifestyleNotes: p.lifestyleNotes || "",
          });
        }

        // Load bookings
        const bookingsRes = await fetch("/api/bookings", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const bookingsData = await bookingsRes.json();
        if (bookingsData.success && bookingsData.data) {
          setBookings(bookingsData.data);

          // Update stats
          const completed = bookingsData.data.filter((b: Booking) => b.status === "completed").length;
          const upcoming = bookingsData.data.filter((b: Booking) => b.status === "scheduled").length;
          setStats([
            { ...STATS[0], value: String(completed) },
            { ...STATS[1], value: String(upcoming) },
            { ...STATS[2], value: String(reports.length) },
            { ...STATS[3], value: "—" },
          ]);
        }

        // Load lab reports
        const reportsRes = await fetch("/api/lab-reports", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const reportsData = await reportsRes.json();
        if (reportsData.success && reportsData.data) {
          setReports(reportsData.data);
        }
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [isReady]);

  if (loading) {
    return (
      <>
        <div style={{ display: "flex", justifyContent: "center", padding: 80 }}>
          <div style={{ color: "var(--text-3)" }}>Loading your dashboard...</div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Stats */}
      <div className="stat-grid">
        {stats.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>

      {/* Quick actions */}
      <div style={{ display: "flex", gap: 12, marginBottom: 32 }}>
        <Link
          href="/book-now"
          style={{
            flex: 1, padding: "14px 20px", borderRadius: 12,
            background: "var(--teal)", color: "#fff", textDecoration: "none",
            fontSize: 14, fontWeight: 500, textAlign: "center",
          }}
        >
          Book New Session
        </Link>
        <Link
          href="/health-quiz"
          style={{
            flex: 1, padding: "14px 20px", borderRadius: 12,
            background: "var(--white)", border: "1.5px solid var(--border)",
            color: "var(--teal)", textDecoration: "none",
            fontSize: 14, fontWeight: 500, textAlign: "center",
          }}
        >
          Take Health Quiz
        </Link>
      </div>

      {/* Bookings */}
      <div style={{ marginBottom: 32 }}>
        <BookingsSection bookings={bookings} />
      </div>

      {/* Two column layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <ProfileSection profile={profile} onSave={setProfile} />
        <LabReportsSection reports={reports} onRefresh={() => {
          const token = getToken();
          if (token) {
            fetch("/api/lab-reports", {
              headers: { Authorization: `Bearer ${token}` },
            })
              .then((res) => res.json())
              .then((data) => {
                if (data.success) setReports(data.data);
              });
          }
        }} />
      </div>
    </>
  );
}