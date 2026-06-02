"use client";

import Link from "next/link";
import { DashLayout, StatCard } from "@/components/dashboard/DashLayout";
import {
  DEMO_CLINIC_ORDERS, DEMO_BOOKINGS, DEMO_CLINICS,
  formatDate, formatDateTime, fmtCurrency,
} from "@/lib/data/dashboard-mock";

export default function ClinicDashboard() {
  const clinic = DEMO_CLINICS[0];

  const totalOrdered = DEMO_CLINIC_ORDERS.reduce((s, o) => s + o.amount, 0);
  const pendingOrders = DEMO_CLINIC_ORDERS.filter((o) => o.status === "pending" || o.status === "processing").length;
  const clinicBookings = DEMO_BOOKINGS.filter((b) => b.location === "clinic");
  const totalRevenue = clinicBookings.filter((b) => b.status === "completed").reduce((s, b) => s + b.amount, 0);

  return (
    <DashLayout
      title={<>Partner <em>Clinic</em></>}
      subtitle={`${clinic.name} · ${clinic.location} · Partner since ${formatDate(clinic.partnersSince)}`}
      allowedRoles={["clinic", "admin"]}
    >
      <div className="stat-grid">
        <StatCard icon="📦" label="Active Orders" value={pendingOrders} delta={`${DEMO_CLINIC_ORDERS.length} total this month`} />
        <StatCard icon="💉" label="In-Clinic Sessions (MTD)" value={clinicBookings.length} delta={`${clinic.monthlyVolume} target`} deltaType={clinicBookings.length >= clinic.monthlyVolume ? "up" : "down"} />
        <StatCard icon="💰" label="Revenue (MTD)" value={fmtCurrency(totalRevenue)} delta="+12% vs last month" deltaType="up" />
        <StatCard icon="📈" label="Order Spend (MTD)" value={fmtCurrency(totalOrdered)} delta="4 orders placed" />
      </div>

      <div className="panel">
        <div className="panel-head">
          <div>
            <h3 className="panel-title">Your Orders</h3>
            <p className="panel-sub">IV therapy formulations ordered from NutriDrip central pharmacy.</p>
          </div>
          <Link href="/book-now" className="row-action-btn primary" style={{ textDecoration: "none" }}>+ New Order</Link>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="dash-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Ordered</th>
                <th>Items</th>
                <th>Amount</th>
                <th>Delivery</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {DEMO_CLINIC_ORDERS.map((o) => (
                <tr key={o.id}>
                  <td><code style={{ fontSize: 11, color: "var(--text-3)" }}>{o.id}</code></td>
                  <td>{formatDateTime(o.orderedAt)}</td>
                  <td style={{ color: "var(--text-2)" }}>{o.items}</td>
                  <td style={{ fontWeight: 600, color: "var(--teal)" }}>{fmtCurrency(o.amount)}</td>
                  <td>{o.scheduledDelivery ? formatDate(o.scheduledDelivery) : "—"}</td>
                  <td><span className={`pill ${o.status}`}>{o.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="split-grid">
        <div className="panel">
          <div className="panel-head">
            <div>
              <h3 className="panel-title">In-Clinic Sessions</h3>
              <p className="panel-sub">Patients scheduled at your clinic location.</p>
            </div>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className="dash-table">
              <thead><tr><th>Patient</th><th>Drip</th><th>Date</th><th>Status</th></tr></thead>
              <tbody>
                {clinicBookings.map((b) => (
                  <tr key={b.id}>
                    <td>{b.patientName}</td>
                    <td><strong style={{ color: "var(--teal)" }}>{b.dripName}</strong></td>
                    <td>{formatDateTime(b.scheduledAt)}</td>
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
              <h3 className="panel-title">Billing Summary</h3>
              <p className="panel-sub">Current billing cycle.</p>
            </div>
          </div>
          <table className="dash-table">
            <tbody>
              <tr>
                <td style={{ color: "var(--text-3)" }}>Completed sessions</td>
                <td style={{ textAlign: "right", fontWeight: 600 }}>{clinicBookings.filter((b) => b.status === "completed").length}</td>
              </tr>
              <tr>
                <td style={{ color: "var(--text-3)" }}>Revenue share (70%)</td>
                <td style={{ textAlign: "right", fontWeight: 600, color: "#1A9E6A" }}>{fmtCurrency(Math.round(totalRevenue * 0.7))}</td>
              </tr>
              <tr>
                <td style={{ color: "var(--text-3)" }}>Platform fee (30%)</td>
                <td style={{ textAlign: "right", fontWeight: 600 }}>{fmtCurrency(Math.round(totalRevenue * 0.3))}</td>
              </tr>
              <tr>
                <td style={{ color: "var(--text-3)" }}>Pending orders value</td>
                <td style={{ textAlign: "right", fontWeight: 600 }}>
                  {fmtCurrency(DEMO_CLINIC_ORDERS.filter((o) => o.status !== "delivered").reduce((s, o) => s + o.amount, 0))}
                </td>
              </tr>
              <tr style={{ background: "var(--sky-pale)" }}>
                <td style={{ fontWeight: 600 }}>Next payout</td>
                <td style={{ textAlign: "right", fontWeight: 600, color: "var(--teal)", fontSize: 16 }}>
                  {fmtCurrency(Math.round(totalRevenue * 0.7))}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <div>
            <h3 className="panel-title">Clinic Profile</h3>
            <p className="panel-sub">Your partnership details. Contact platform admin to edit.</p>
          </div>
        </div>
        <div className="split-grid">
          <div>
            <p style={{ fontSize: 11, color: "var(--text-3)", letterSpacing: 0.5, marginBottom: 4 }}>CLINIC NAME</p>
            <p style={{ fontSize: 15, fontWeight: 500, marginBottom: 14 }}>{clinic.name}</p>

            <p style={{ fontSize: 11, color: "var(--text-3)", letterSpacing: 0.5, marginBottom: 4 }}>PRIMARY CONTACT</p>
            <p style={{ fontSize: 14, marginBottom: 14 }}>{clinic.contact}</p>

            <p style={{ fontSize: 11, color: "var(--text-3)", letterSpacing: 0.5, marginBottom: 4 }}>LOCATION</p>
            <p style={{ fontSize: 14, marginBottom: 14 }}>{clinic.location}</p>
          </div>
          <div>
            <p style={{ fontSize: 11, color: "var(--text-3)", letterSpacing: 0.5, marginBottom: 4 }}>PARTNERSHIP STATUS</p>
            <p style={{ fontSize: 14, marginBottom: 14 }}><span className={`pill ${clinic.status}`}>{clinic.status}</span></p>

            <p style={{ fontSize: 11, color: "var(--text-3)", letterSpacing: 0.5, marginBottom: 4 }}>PARTNER SINCE</p>
            <p style={{ fontSize: 14, marginBottom: 14 }}>{formatDate(clinic.partnersSince)}</p>

            <p style={{ fontSize: 11, color: "var(--text-3)", letterSpacing: 0.5, marginBottom: 4 }}>MONTHLY VOLUME TARGET</p>
            <p style={{ fontSize: 14, marginBottom: 14 }}>{clinic.monthlyVolume} sessions</p>
          </div>
        </div>
      </div>
    </DashLayout>
  );
}
