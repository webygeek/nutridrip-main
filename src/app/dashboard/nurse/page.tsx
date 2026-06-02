"use client";

import Link from "next/link";
import { DashLayout, StatCard } from "@/components/dashboard/DashLayout";
import { DEMO_INFUSION_ORDERS, DEMO_NURSES, INFUSION_CHECKLIST } from "@/lib/data/nursing-mock";
import { formatDateTime, formatDate } from "@/lib/data/dashboard-mock";

const NURSE_CSS = `
  .nurse-order-card {
    padding:20px;border-radius:var(--radius-sm);
    border:1.5px solid var(--border);background:var(--white);
    margin-bottom:14px;transition:all .2s;
    box-shadow:0 2px 12px rgba(91,184,245,0.06);
  }
  .nurse-order-card:hover { border-color:var(--sky);box-shadow:0 4px 20px rgba(91,184,245,0.12); }
  .noc-top { display:flex;justify-content:space-between;align-items:flex-start;gap:14px;flex-wrap:wrap;margin-bottom:12px; }
  .noc-main { flex:1;min-width:240px; }
  .noc-drip { font-size:18px;font-weight:600;color:var(--teal);letter-spacing:-0.3px;margin-bottom:4px; }
  .noc-patient { font-size:14px;color:var(--text);margin-bottom:2px; }
  .noc-meta { font-size:12px;color:var(--text-3);display:flex;gap:14px;flex-wrap:wrap;margin-top:6px; }

  .noc-progress-track { height:6px;background:rgba(91,184,245,0.15);border-radius:50px;overflow:hidden;margin:12px 0 6px; }
  .noc-progress-fill {
    height:100%;border-radius:50px;
    background:linear-gradient(90deg,var(--teal),var(--sky));
    transition:width .5s ease;
  }
  .noc-progress-label { font-size:11px;color:var(--text-3); }

  .noc-actions { display:flex;gap:8px;flex-wrap:wrap;margin-top:14px; }

  .noc-open-btn {
    padding:10px 22px;border-radius:50px;border:none;
    background:linear-gradient(145deg,var(--teal),var(--sky));color:#fff;
    font-size:12px;font-weight:600;font-family:var(--font-display);
    cursor:pointer;text-decoration:none;display:inline-block;
    box-shadow:0 3px 12px rgba(26,126,168,0.25);
    transition:transform .2s;
  }
  .noc-open-btn:hover { transform:translateY(-1px); }
  .noc-open-btn.resume { background:linear-gradient(145deg,#D97706,#F59E0B); }

  .protocol-summary {
    padding:12px 14px;background:var(--sky-pale);border-radius:8px;
    font-size:11px;color:var(--text-2);line-height:1.6;margin-top:10px;
  }
  .protocol-summary strong { color:var(--teal); }
`;

export default function NurseDashboard() {
  const DEMO_NURSE_ID = "n-001";
  const nurse = DEMO_NURSES.find((n) => n.id === DEMO_NURSE_ID);
  const myOrders = DEMO_INFUSION_ORDERS.filter((o) => o.nurseId === DEMO_NURSE_ID);

  const pending = myOrders.filter((o) => o.status === "pending");
  const inProgress = myOrders.filter((o) => o.status === "in-progress");
  const today = myOrders.filter((o) => {
    const d = new Date(o.scheduledAt);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  });

  const totalSteps = INFUSION_CHECKLIST.length;

  return (
    <DashLayout
      title={<>Nurse <em>Dashboard</em></>}
      subtitle={nurse ? `${nurse.name} · ${nurse.rnNumber} · ${nurse.shift} shift · ${nurse.certifications.join(", ")}` : undefined}
      allowedRoles={["nurse", "admin"]}
    >
      <style dangerouslySetInnerHTML={{ __html: NURSE_CSS }} />

      <div className="stat-grid">
        <StatCard icon="📋" label="Active Orders" value={inProgress.length + pending.length} delta={`${pending.length} pending + ${inProgress.length} in-progress`} />
        <StatCard icon="📅" label="Today's Sessions" value={today.length} />
        <StatCard icon="✅" label="Lifetime Sessions" value={nurse?.totalCompleted ?? 0} delta={`${nurse?.rating ?? 0}★ rating`} deltaType="up" />
        <StatCard icon="🚨" label="Emergency Line" value="24/7" delta="Doctor always on call" />
      </div>

      {inProgress.length > 0 && (
        <div className="panel">
          <div className="panel-head">
            <div>
              <h3 className="panel-title">🟡 In Progress</h3>
              <p className="panel-sub">Active infusions — continue the checklist to complete.</p>
            </div>
          </div>
          {inProgress.map((o) => {
            const progress = Math.round((o.checklistCompleted.length / totalSteps) * 100);
            return (
              <div key={o.id} className="nurse-order-card">
                <div className="noc-top">
                  <div className="noc-main">
                    <div className="noc-drip">{o.dripName}</div>
                    <div className="noc-patient">{o.patientName} · {o.patientAge}/{o.patientGender}</div>
                    <div className="noc-meta">
                      <span>📅 {formatDateTime(o.scheduledAt)}</span>
                      <span>📍 {o.location} · {o.address.slice(0, 30)}...</span>
                    </div>
                  </div>
                  <span className="pill in-progress">In progress</span>
                </div>

                <div className="protocol-summary">
                  <strong>{o.doctorName}:</strong> {o.doctorNotes.slice(0, 160)}{o.doctorNotes.length > 160 ? "..." : ""}
                </div>

                <div className="noc-progress-track">
                  <div className="noc-progress-fill" style={{ width: `${progress}%` }} />
                </div>
                <div className="noc-progress-label">Checklist progress: {o.checklistCompleted.length} / {totalSteps} steps ({progress}%)</div>

                <div className="noc-actions">
                  <Link href={`/dashboard/nurse/order/${o.id}`} className="noc-open-btn resume">
                    Resume Checklist →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="panel">
        <div className="panel-head">
          <div>
            <h3 className="panel-title">📋 Assigned Orders</h3>
            <p className="panel-sub">Upcoming infusions assigned to you. Open each to review patient details and start the checklist.</p>
          </div>
        </div>

        {pending.length === 0 ? (
          <div className="empty-state">No pending orders assigned right now. Great work!</div>
        ) : (
          pending.map((o) => (
            <div key={o.id} className="nurse-order-card">
              <div className="noc-top">
                <div className="noc-main">
                  <div className="noc-drip">{o.dripName}</div>
                  <div className="noc-patient">
                    <strong>{o.patientName}</strong> · {o.patientAge}/{o.patientGender}
                    {(o.patientAllergies.toLowerCase().includes("penicillin") || o.patientAllergies.toLowerCase().includes("severe")) && (
                      <span style={{ marginLeft: 8, fontSize: 11, padding: "2px 8px", borderRadius: 50, background: "#FBE7E7", color: "#D42C2C" }}>
                        ⚠ Drug allergies
                      </span>
                    )}
                  </div>
                  <div className="noc-meta">
                    <span>📅 {formatDateTime(o.scheduledAt)}</span>
                    <span>📍 {o.location}</span>
                    <span>📞 {o.patientPhone}</span>
                  </div>
                </div>
                <span className="pill pending">Pending</span>
              </div>

              <div className="protocol-summary">
                <strong>Protocol:</strong> {o.protocolIngredients.map((i) => `${i.name} ${i.dose}`).join(" · ")}<br />
                <strong>Physician:</strong> {o.doctorName} — {o.doctorNotes.slice(0, 120)}{o.doctorNotes.length > 120 ? "..." : ""}
              </div>

              <div className="noc-actions">
                <Link href={`/dashboard/nurse/order/${o.id}`} className="noc-open-btn">
                  Open Order & Start Checklist →
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="panel">
        <div className="panel-head">
          <div>
            <h3 className="panel-title">Recent Activity</h3>
            <p className="panel-sub">Your recently completed sessions.</p>
          </div>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="dash-table">
            <thead>
              <tr><th>Patient</th><th>Drip</th><th>Date</th><th>Status</th></tr>
            </thead>
            <tbody>
              {myOrders.filter((o) => o.status === "completed").length === 0 ? (
                <tr><td colSpan={4} className="empty-state">No completed sessions yet.</td></tr>
              ) : (
                myOrders.filter((o) => o.status === "completed").map((o) => (
                  <tr key={o.id}>
                    <td>{o.patientName}</td>
                    <td><strong style={{ color: "var(--teal)" }}>{o.dripName}</strong></td>
                    <td>{formatDate(o.scheduledAt)}</td>
                    <td><span className={`pill ${o.status}`}>{o.status}</span></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashLayout>
  );
}
