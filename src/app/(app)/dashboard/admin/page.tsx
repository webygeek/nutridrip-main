"use client";

import Link from "next/link";
import { StatCard } from "@/components/dashboard/DashLayout";
import {
  DEMO_PATIENTS, DEMO_BOOKINGS, DEMO_CLINICS, DEMO_DOCTORS_DASH, DEMO_APPROVALS,
  formatDate, formatDateTime, fmtCurrency,
} from "@/lib/data/dashboard-mock";
import { DEMO_NURSES } from "@/lib/data/nursing-mock";

export default function AdminDashboard() {
  const totalRevenue = DEMO_BOOKINGS
    .filter((b) => b.status === "completed")
    .reduce((s, b) => s + b.amount, 0);
  const pendingApprovals = DEMO_APPROVALS.filter((a) => a.status === "pending").length;
  const activeClinics = DEMO_CLINICS.filter((c) => c.status === "active").length;

  return (
    <>
      <div style={{
        display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap",
      }}>
        <Link href="/dashboard/admin/manage" style={{
          padding: "12px 24px", borderRadius: 50, border: "none",
          background: "linear-gradient(145deg,var(--teal),var(--sky))", color: "#fff",
          fontSize: 13, fontWeight: 600, fontFamily: "var(--font-display)",
          textDecoration: "none", boxShadow: "0 4px 16px rgba(26,126,168,0.25)",
          display: "inline-flex", alignItems: "center", gap: 8,
        }}>
          ⚙️ Manage Resources
        </Link>
        <Link href="/dashboard/admin/studio" style={{
          padding: "12px 24px", borderRadius: 50, border: "none",
          background: "linear-gradient(145deg,#C471F5,#FA71CD)", color: "#fff",
          fontSize: 13, fontWeight: 600, fontFamily: "var(--font-display)",
          textDecoration: "none", boxShadow: "0 4px 16px rgba(196,113,245,0.25)",
          display: "inline-flex", alignItems: "center", gap: 8,
        }}>
          🎨 Editor Studio
        </Link>
        <Link href="/dashboard/admin/manage?tab=patients" style={{
          padding: "12px 20px", borderRadius: 50, border: "1.5px solid var(--border)",
          background: "var(--white)", color: "var(--text-2)",
          fontSize: 12, fontWeight: 500, fontFamily: "var(--font-display)",
          textDecoration: "none",
        }}>
          + Add Patient
        </Link>
        <Link href="/dashboard/admin/manage?tab=doctors" style={{
          padding: "12px 20px", borderRadius: 50, border: "1.5px solid var(--border)",
          background: "var(--white)", color: "var(--text-2)",
          fontSize: 12, fontWeight: 500, fontFamily: "var(--font-display)",
          textDecoration: "none",
        }}>
          + Add Doctor
        </Link>
        <Link href="/dashboard/admin/manage?tab=clinics" style={{
          padding: "12px 20px", borderRadius: 50, border: "1.5px solid var(--border)",
          background: "var(--white)", color: "var(--text-2)",
          fontSize: 12, fontWeight: 500, fontFamily: "var(--font-display)",
          textDecoration: "none",
        }}>
          + Add Clinic
        </Link>
        <Link href="/dashboard/admin/manage?tab=nurses" style={{
          padding: "12px 20px", borderRadius: 50, border: "1.5px solid var(--border)",
          background: "var(--white)", color: "var(--text-2)",
          fontSize: 12, fontWeight: 500, fontFamily: "var(--font-display)",
          textDecoration: "none",
        }}>
          + Add Nurse
        </Link>
      </div>

      <div className="stat-grid">
        <StatCard icon="👥" label="Total Patients" value={DEMO_PATIENTS.length} delta="+12% this month" deltaType="up" />
        <StatCard icon="👨‍⚕️" label="Active Doctors" value={DEMO_DOCTORS_DASH.filter((d) => d.status === "available").length} delta={`${DEMO_DOCTORS_DASH.length} total`} />
        <StatCard icon="🏥" label="Partner Clinics" value={activeClinics} delta={`${DEMO_CLINICS.filter((c) => c.status === "pending").length} pending`} />
        <StatCard icon="💉" label="Nursing Staff" value={DEMO_NURSES.filter((n) => n.status !== "off-duty").length} delta={`${DEMO_NURSES.length} total`} />
      </div>

      <div className="stat-grid">
        <StatCard icon="💰" label="Revenue (MTD)" value={fmtCurrency(totalRevenue)} delta="+18% vs last month" deltaType="up" />
        <StatCard icon="📋" label="Pending Approvals" value={pendingApprovals} delta={pendingApprovals > 3 ? "Action needed" : "All normal"} deltaType={pendingApprovals > 3 ? "down" : "up"} />
        <StatCard icon="📅" label="Bookings This Week" value={DEMO_BOOKINGS.length} />
        <StatCard icon="⭐" label="Avg Rating" value="4.8 / 5" />
      </div>

      <div className="panel">
        <div className="panel-head">
          <div>
            <h3 className="panel-title">Pending Protocol Approvals</h3>
            <p className="panel-sub">Requires physician review. High-severity requests flagged in orange.</p>
          </div>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="dash-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Drip</th>
                <th>Severity</th>
                <th>Requested</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {DEMO_APPROVALS.map((a) => {
                const sevClass = a.severity === "Strongly Recommended" ? "strong" : a.severity === "Recommended" ? "moderate" : "mild";
                return (
                  <tr key={a.id}>
                    <td>{a.patientName}</td>
                    <td><strong style={{ color: "var(--teal)" }}>{a.dripName}</strong></td>
                    <td><span className={`sev-badge ${sevClass}`}>{a.severity}</span></td>
                    <td>{formatDateTime(a.requestedAt)}</td>
                    <td><span className={`pill ${a.status}`}>{a.status}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="split-grid">
        <div className="panel">
          <div className="panel-head">
            <div>
              <h3 className="panel-title">Recent Bookings</h3>
              <p className="panel-sub">Last 5 sessions scheduled or completed.</p>
            </div>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className="dash-table">
              <thead><tr><th>Patient</th><th>Drip</th><th>Date</th><th>Status</th></tr></thead>
              <tbody>
                {DEMO_BOOKINGS.slice(0, 5).map((b) => (
                  <tr key={b.id}>
                    <td>{b.patientName}</td>
                    <td>{b.dripName}</td>
                    <td>{formatDate(b.scheduledAt)}</td>
                    <td><span className={`pill ${b.status}`}>{b.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <div>
              <h3 className="panel-title">Partner Clinics</h3>
              <p className="panel-sub">Monthly volume and partnership status.</p>
            </div>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className="dash-table">
              <thead><tr><th>Clinic</th><th>Location</th><th>Volume/mo</th><th>Status</th></tr></thead>
              <tbody>
                {DEMO_CLINICS.map((c) => (
                  <tr key={c.id}>
                    <td>{c.name}</td>
                    <td>{c.location}</td>
                    <td>{c.monthlyVolume}</td>
                    <td><span className={`pill ${c.status}`}>{c.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <div>
            <h3 className="panel-title">Doctor Performance</h3>
            <p className="panel-sub">Approval volume, turnaround and ratings.</p>
          </div>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="dash-table">
            <thead>
              <tr>
                <th>Doctor</th>
                <th>Specialty</th>
                <th>Approvals (MTD)</th>
                <th>Avg Turnaround</th>
                <th>Rating</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {DEMO_DOCTORS_DASH.map((d) => (
                <tr key={d.id}>
                  <td><strong>{d.name}</strong></td>
                  <td>{d.specialty}</td>
                  <td>{d.approvalsThisMonth}</td>
                  <td>{d.avgTurnaroundHrs} hrs</td>
                  <td>★ {d.rating}</td>
                  <td><span className={`pill ${d.status}`}>{d.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <div>
            <h3 className="panel-title">All Patients</h3>
            <p className="panel-sub">Full patient roster with vitality scores.</p>
          </div>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="dash-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Age/Gender</th>
                <th>Joined</th>
                <th>Sessions</th>
                <th>Vitality</th>
                <th>Primary Concern</th>
              </tr>
            </thead>
            <tbody>
              {DEMO_PATIENTS.map((p) => (
                <tr key={p.id}>
                  <td><strong>{p.name}</strong></td>
                  <td>{p.age} / {p.gender}</td>
                  <td>{formatDate(p.joinedAt)}</td>
                  <td>{p.totalSessions}</td>
                  <td>
                    <span style={{ color: p.vitalityScore >= 70 ? "#1A9E6A" : p.vitalityScore >= 50 ? "var(--teal)" : "#D97706", fontWeight: 600 }}>
                      {p.vitalityScore}
                    </span>
                  </td>
                  <td style={{ color: "var(--text-3)" }}>{p.primaryConcern}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
