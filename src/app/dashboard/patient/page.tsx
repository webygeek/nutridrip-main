"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { DashLayout, StatCard } from "@/components/dashboard/DashLayout";
import { formatDate, formatDateTime, fmtCurrency } from "@/lib/data/dashboard-mock";
import { DRIPS, type Drip } from "@/lib/data/drips";
import UpcomingSession from "./UpcomingSession";

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

const EMPTY_PROFILE: PatientProfile = {
  name: "", dob: "", bloodGroup: "", phone: "", address: "",
  emergencyContact: "", allergies: "", chronicConditions: "",
  currentMedications: "", surgeries: "", familyHistory: "", lifestyleNotes: "",
};

const PROFILE_KEY = "nutridrip_patient_profile";
const REPORTS_KEY = "nutridrip_lab_reports";

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

const PATIENT_BOOKINGS_DEMO = [
  { id: "pbk-001", dripName: "Velocity", scheduledAt: "2026-04-20T10:00:00Z", status: "scheduled" as const, amount: 10700 },
  { id: "pbk-002", dripName: "Fortress", scheduledAt: "2026-04-05T14:30:00Z", status: "completed" as const, amount: 9200 },
  { id: "pbk-003", dripName: "Velocity", scheduledAt: "2026-03-22T10:00:00Z", status: "completed" as const, amount: 10700 },
  { id: "pbk-004", dripName: "Hydraflux", scheduledAt: "2026-03-08T11:00:00Z", status: "completed" as const, amount: 6500 },
];

// Map completed drip names to drip data for the details section
function getDripByName(name: string): Drip | undefined {
  return DRIPS.find((d) => d.name.toLowerCase() === name.toLowerCase());
}

const DRIP_CATEGORY_LABELS: Record<string, string> = {
  energy: "Energy & Performance",
  beauty: "Skin & Beauty",
  immunity: "Immune Defence",
  recovery: "Hydration & Recovery",
  performance: "Athletic Performance",
  cognition: "Mental Clarity",
};

export default function PatientProfile() {
  const [profile, setProfile] = useState<PatientProfile>(EMPTY_PROFILE);
  const [reports, setReports] = useState<LabReport[]>([]);
  const [saved, setSaved] = useState(false);
  const [uploadCategory, setUploadCategory] = useState(REPORT_CATEGORIES[0]);
  const [uploadNotes, setUploadNotes] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const p = localStorage.getItem(PROFILE_KEY);
      if (p) setProfile({ ...EMPTY_PROFILE, ...JSON.parse(p) });
      const r = localStorage.getItem(REPORTS_KEY);
      if (r) setReports(JSON.parse(r));
    } catch {
      /* ignore */
    }
  }, []);

  function updateField<K extends keyof PatientProfile>(key: K, value: PatientProfile[K]) {
    setProfile((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  function saveProfile() {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const newReport: LabReport = {
      id: `rpt-${Date.now()}`,
      fileName: file.name,
      uploadedAt: new Date().toISOString(),
      sizeBytes: file.size,
      category: uploadCategory,
      notes: uploadNotes,
    };
    const next = [newReport, ...reports];
    setReports(next);
    localStorage.setItem(REPORTS_KEY, JSON.stringify(next));
    setUploadNotes("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function deleteReport(id: string) {
    const next = reports.filter((r) => r.id !== id);
    setReports(next);
    localStorage.setItem(REPORTS_KEY, JSON.stringify(next));
  }

  const totalSessions = PATIENT_BOOKINGS_DEMO.filter((b) => b.status === "completed").length;
  const totalSpent = PATIENT_BOOKINGS_DEMO
    .filter((b) => b.status === "completed")
    .reduce((s, b) => s + b.amount, 0);
  const upcomingCount = PATIENT_BOOKINGS_DEMO.filter((b) => b.status === "scheduled").length;

  function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return (
    <DashLayout
      title={<>My <em>Profile</em></>}
      subtitle="Your medical history, lab reports, and session history. Keep everything up-to-date for best results."
      allowedRoles={["patient", "admin"]}
    >
      <UpcomingSession />

      <div className="stat-grid">
        <StatCard icon="💉" label="Total Sessions" value={totalSessions} delta="Completed" />
        <StatCard icon="📅" label="Upcoming" value={upcomingCount} delta={upcomingCount > 0 ? "Next: in 3 days" : "None scheduled"} />
        <StatCard icon="📄" label="Lab Reports" value={reports.length} delta="Uploaded" />
        <StatCard icon="💰" label="Lifetime Spend" value={fmtCurrency(totalSpent)} />
      </div>

      <div className="panel">
        <div className="panel-head">
          <div>
            <h3 className="panel-title">General Information</h3>
            <p className="panel-sub">Basic personal and contact details.</p>
          </div>
          <button className="row-action-btn primary" onClick={saveProfile}>
            {saved ? "✓ Saved" : "Save Changes"}
          </button>
        </div>
        <div className="split-grid">
          <div>
            <label style={pfLabelFirst}>FULL NAME</label>
            <input type="text" value={profile.name} onChange={(e) => updateField("name", e.target.value)}
              style={pfInputStyle} placeholder="e.g. Arjun Sharma" />

            <label style={pfLabel}>DATE OF BIRTH</label>
            <input type="date" value={profile.dob} onChange={(e) => updateField("dob", e.target.value)}
              style={pfInputStyle} />

            <label style={pfLabel}>BLOOD GROUP</label>
            <select value={profile.bloodGroup} onChange={(e) => updateField("bloodGroup", e.target.value)}
              style={pfInputStyle}>
              <option value="">Select blood group</option>
              {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"].map((bg) => (
                <option key={bg} value={bg}>{bg}</option>
              ))}
            </select>

            <label style={pfLabel}>PHONE</label>
            <input type="tel" value={profile.phone} onChange={(e) => updateField("phone", e.target.value)}
              style={pfInputStyle} placeholder="+91 98000 00000" />
          </div>
          <div>
            <label style={pfLabelFirst}>ADDRESS</label>
            <textarea value={profile.address} onChange={(e) => updateField("address", e.target.value)}
              rows={3} style={pfTextareaStyle} placeholder="Full residential address" />

            <label style={pfLabel}>EMERGENCY CONTACT</label>
            <input type="text" value={profile.emergencyContact}
              onChange={(e) => updateField("emergencyContact", e.target.value)}
              style={pfInputStyle} placeholder="Name + relation + phone" />
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <div>
            <h3 className="panel-title">Medical History</h3>
            <p className="panel-sub">Critical information for physician review before any protocol.</p>
          </div>
        </div>

        <label style={pfLabelFirst}>KNOWN ALLERGIES</label>
        <textarea value={profile.allergies} onChange={(e) => updateField("allergies", e.target.value)}
          rows={2} style={pfTextareaStyle} placeholder="Drug allergies, food allergies, environmental, etc." />

        <label style={pfLabel}>CHRONIC CONDITIONS</label>
        <textarea value={profile.chronicConditions} onChange={(e) => updateField("chronicConditions", e.target.value)}
          rows={2} style={pfTextareaStyle} placeholder="Diabetes, hypertension, thyroid, autoimmune, etc." />

        <label style={pfLabel}>CURRENT MEDICATIONS</label>
        <textarea value={profile.currentMedications} onChange={(e) => updateField("currentMedications", e.target.value)}
          rows={2} style={pfTextareaStyle} placeholder="List all regular medications with doses" />

        <label style={pfLabel}>PAST SURGERIES / HOSPITALISATIONS</label>
        <textarea value={profile.surgeries} onChange={(e) => updateField("surgeries", e.target.value)}
          rows={2} style={pfTextareaStyle} placeholder="Include dates and reasons" />

        <label style={pfLabel}>FAMILY HISTORY</label>
        <textarea value={profile.familyHistory} onChange={(e) => updateField("familyHistory", e.target.value)}
          rows={2} style={pfTextareaStyle} placeholder="Heart disease, diabetes, cancer, autoimmune in immediate family" />

        <label style={pfLabel}>LIFESTYLE NOTES</label>
        <textarea value={profile.lifestyleNotes} onChange={(e) => updateField("lifestyleNotes", e.target.value)}
          rows={2} style={pfTextareaStyle} placeholder="Diet, exercise, smoking, alcohol, sleep patterns" />

        <button className="row-action-btn primary" onClick={saveProfile} style={{ marginTop: 16 }}>
          {saved ? "✓ Saved" : "Save All Changes"}
        </button>
      </div>

      <div className="panel">
        <div className="panel-head">
          <div>
            <h3 className="panel-title">Lab Reports &amp; Investigations</h3>
            <p className="panel-sub">Upload previous lab reports. Our physicians will reference these before creating your protocol.</p>
          </div>
        </div>

        <div style={{
          padding: 20, border: "2px dashed var(--border-strong)", borderRadius: "var(--radius-sm)",
          background: "var(--sky-pale)", marginBottom: 16,
        }}>
          <div className="split-grid" style={{ marginBottom: 14 }}>
            <div>
              <label style={pfLabelFirst}>REPORT CATEGORY</label>
              <select value={uploadCategory} onChange={(e) => setUploadCategory(e.target.value)} style={pfInputStyle}>
                {REPORT_CATEGORIES.map((c) => (<option key={c} value={c}>{c}</option>))}
              </select>
            </div>
            <div>
              <label style={pfLabelFirst}>NOTES (Optional)</label>
              <input type="text" value={uploadNotes} onChange={(e) => setUploadNotes(e.target.value)}
                style={pfInputStyle} placeholder="e.g. Jan 2026 follow-up, post-treatment" />
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            accept=".pdf,.jpg,.jpeg,.png,.heic,.webp"
            style={{
              width: "100%", padding: 10, fontSize: 13,
              background: "var(--white)", border: "1px solid var(--border)",
              borderRadius: "var(--radius-sm)", fontFamily: "var(--font-display)",
            }}
          />
          <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 8, lineHeight: 1.5 }}>
            Accepted formats: PDF, JPG, PNG, HEIC, WebP. Note: This demo stores only filenames and metadata in your browser.
            Production deployment would upload files to secure clinical cloud storage.
          </p>
        </div>

        {reports.length === 0 ? (
          <div className="empty-state">No lab reports uploaded yet.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="dash-table">
              <thead>
                <tr>
                  <th>File</th>
                  <th>Category</th>
                  <th>Size</th>
                  <th>Uploaded</th>
                  <th>Notes</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r) => (
                  <tr key={r.id}>
                    <td><strong>📄 {r.fileName}</strong></td>
                    <td style={{ color: "var(--text-3)" }}>{r.category}</td>
                    <td style={{ color: "var(--text-3)" }}>{formatBytes(r.sizeBytes)}</td>
                    <td>{formatDateTime(r.uploadedAt)}</td>
                    <td style={{ color: "var(--text-3)", fontStyle: "italic" }}>{r.notes || "—"}</td>
                    <td>
                      <button className="row-action-btn danger" onClick={() => deleteReport(r.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="panel">
        <div className="panel-head">
          <div>
            <h3 className="panel-title">My Session History</h3>
            <p className="panel-sub">Past and upcoming IV therapy sessions.</p>
          </div>
          <Link href="/book-now" className="row-action-btn primary" style={{ textDecoration: "none" }}>+ Book New Session</Link>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="dash-table">
            <thead>
              <tr><th>Drip</th><th>Date</th><th>Amount</th><th>Status</th></tr>
            </thead>
            <tbody>
              {PATIENT_BOOKINGS_DEMO.map((b) => {
                const drip = getDripByName(b.dripName);
                return (
                  <tr key={b.id}>
                    <td>
                      <strong style={{ color: "var(--teal)" }}>{b.dripName}</strong>
                      {drip && (
                        <div style={{ fontSize: 10, color: "var(--text-3)" }}>
                          {DRIP_CATEGORY_LABELS[drip.cat] || drip.cat}
                        </div>
                      )}
                    </td>
                    <td>{formatDate(b.scheduledAt)}</td>
                    <td>{fmtCurrency(b.amount)}</td>
                    <td><span className={`pill ${b.status}`}>{b.status}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* DRIP DETAILS SECTION */}
      <DripDetailsPanel />
    </DashLayout>
  );
}

// Drip Details Panel Component
function DripDetailsPanel() {
  const [selectedDrip, setSelectedDrip] = useState<Drip | null>(null);

  return (
    <>
      <style>{`
        .ddp-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
          gap: 12px;
          margin-bottom: 20px;
        }
        .ddp-card {
          padding: 16px;
          border-radius: var(--radius-sm);
          border: 1.5px solid var(--border);
          background: var(--white);
          cursor: pointer;
          transition: all .2s;
        }
        .ddp-card:hover {
          border-color: var(--sky);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(26,126,168,0.12);
        }
        .ddp-card.selected {
          border-color: var(--teal);
          background: var(--sky-bg);
        }
        .ddp-icon {
          font-size: 28px;
          margin-bottom: 8px;
        }
        .ddp-name {
          font-size: 14px;
          font-weight: 600;
          color: var(--text);
          margin-bottom: 2px;
        }
        .ddp-cat {
          font-size: 10px;
          color: var(--text-3);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .ddp-detail-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 16px;
        }
        .ddp-detail-box {
          padding: 14px;
          border-radius: var(--radius-sm);
          background: var(--sky-pale);
          border: 1px solid var(--border);
        }
        .ddp-detail-label {
          font-size: 10px;
          color: var(--text-3);
          letter-spacing: 0.5px;
          text-transform: uppercase;
          margin-bottom: 4px;
        }
        .ddp-detail-value {
          font-size: 18px;
          font-weight: 700;
          color: var(--teal);
        }
        .ddp-ing-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          gap: 10px;
          margin-top: 12px;
        }
        .ddp-ing-card {
          padding: 12px;
          border-radius: var(--radius-sm);
          background: var(--off-white);
          border: 1px solid var(--border);
        }
        .ddp-ing-name {
          font-size: 12px;
          font-weight: 600;
          color: var(--text);
          margin-bottom: 2px;
        }
        .ddp-ing-dose {
          font-size: 11px;
          color: var(--teal);
          font-weight: 600;
        }
        .ddp-ing-bar {
          height: 4px;
          background: var(--border);
          border-radius: 2px;
          margin-top: 6px;
          overflow: hidden;
        }
        .ddp-ing-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--teal), var(--sky));
          border-radius: 2px;
        }
        .ddp-tag {
          display: inline-block;
          padding: 3px 10px;
          border-radius: 50px;
          background: var(--sky-pale);
          color: var(--teal);
          font-size: 10px;
          font-weight: 600;
          margin-right: 6px;
          margin-top: 8px;
        }
      `}</style>

      <div className="panel">
        <div className="panel-head">
          <div>
            <h3 className="panel-title">Drip <em>Details</em></h3>
            <p className="panel-sub">Explore the drips you have used and learn about their ingredients.</p>
          </div>
        </div>

        {/* Drip Selection Cards */}
        <div className="ddp-grid">
          {DRIPS.map((drip) => (
            <div
              key={drip.id}
              className={`ddp-card${selectedDrip?.id === drip.id ? " selected" : ""}`}
              onClick={() => setSelectedDrip(selectedDrip?.id === drip.id ? null : drip)}
            >
              <div className="ddp-icon">{drip.icon}</div>
              <div className="ddp-name">{drip.name}</div>
              <div className="ddp-cat">{DRIP_CATEGORY_LABELS[drip.cat] || drip.cat}</div>
              <div style={{ marginTop: 8, fontSize: 12, color: "var(--text-2)" }}>
                {drip.duration} · {drip.volume}
              </div>
            </div>
          ))}
        </div>

        {/* Selected Drip Details */}
        {selectedDrip && (
          <div style={{
            padding: 20,
            borderRadius: "var(--radius)",
            background: "var(--sky-bg)",
            border: "1.5px solid var(--border)",
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 16 }}>
              <div style={{ fontSize: 36 }}>{selectedDrip.icon}</div>
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: 18, fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>
                  {selectedDrip.name}
                </h4>
                <p style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.6, marginBottom: 8 }}>
                  {selectedDrip.description}
                </p>
                {selectedDrip.tags.map((tag) => (
                  <span key={tag} className="ddp-tag">{tag}</span>
                ))}
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "var(--teal)", whiteSpace: "nowrap" }}>
                {fmtCurrency(selectedDrip.price)}
              </div>
            </div>

            <div className="ddp-detail-grid">
              <div className="ddp-detail-box">
                <div className="ddp-detail-label">Duration</div>
                <div className="ddp-detail-value" style={{ fontSize: 14 }}>{selectedDrip.duration}</div>
              </div>
              <div className="ddp-detail-box">
                <div className="ddp-detail-label">Volume</div>
                <div className="ddp-detail-value" style={{ fontSize: 14 }}>{selectedDrip.volume}</div>
              </div>
            </div>

            <h5 style={{ fontSize: 11, fontWeight: 600, color: "var(--text-3)", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 4 }}>
              Ingredients &amp; Dosages
            </h5>
            <div className="ddp-ing-grid">
              {selectedDrip.ingredients.map((ing) => (
                <div key={ing.name} className="ddp-ing-card">
                  <div className="ddp-ing-name">{ing.name}</div>
                  <div className="ddp-ing-dose">{ing.dose}</div>
                  <div className="ddp-ing-bar">
                    <div className="ddp-ing-fill" style={{ width: `${ing.barPct}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 16 }}>
              <Link
                href={`/treatments/${selectedDrip.slug}`}
                style={{
                  display: "inline-block",
                  padding: "10px 24px",
                  borderRadius: 50,
                  background: "var(--teal)",
                  color: "#fff",
                  fontSize: 12,
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                View Full Details →
              </Link>
            </div>
          </div>
        )}

        {!selectedDrip && (
          <div style={{
            padding: 24,
            textAlign: "center",
            color: "var(--text-3)",
            fontSize: 13,
          }}>
            Click on a drip above to view its details and ingredients
          </div>
        )}
      </div>
    </>
  );
}

const pfLabelFirst: React.CSSProperties = {
  fontSize: 11, color: "var(--text-3)", letterSpacing: 0.5,
  fontWeight: 500, display: "block",
};

const pfLabel: React.CSSProperties = {
  ...pfLabelFirst, marginTop: 14,
};

const pfInputStyle: React.CSSProperties = {
  width: "100%", padding: "11px 14px", marginTop: 6,
  background: "var(--off-white)", border: "1.5px solid var(--border)",
  borderRadius: "var(--radius-sm)", fontSize: 16, fontFamily: "var(--font-display)",
  color: "var(--text)", outline: "none",
};

const pfTextareaStyle: React.CSSProperties = {
  ...pfInputStyle, resize: "none", lineHeight: 1.6,
};
