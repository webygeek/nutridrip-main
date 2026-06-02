"use client";

import { useState, useEffect } from "react";
import { DashLayout, StatCard } from "@/components/dashboard/DashLayout";
import {
  DEMO_APPROVALS, DEMO_BOOKINGS, DEMO_PATIENTS,
  formatDateTime, formatDate,
} from "@/lib/data/dashboard-mock";
import QuizPanel from "./QuizPanel";

type RouteOfAdmin = "IV Drip in NS" | "IV Drip in RL" | "IV Push/Bolus" | "IM Injection" | "Add to Drip Bag" | "Oral";

type TxComponent = {
  id: string; name: string; dose: string; unit: string;
  route: RouteOfAdmin; carrier: string;
};
type TxSession = {
  id: string; date: string; dripName: string;
  components: TxComponent[]; sessionNotes: string;
};
type TxWeek = { weekNum: number; sessions: TxSession[] };
type TxChart = {
  id: string; patientName: string; patientAge: string; diagnosis: string;
  startDate: string; totalWeeks: number; weeks: TxWeek[];
  createdAt: string; sharedWithNurse: boolean; doctorName: string;
};

const ROUTES: RouteOfAdmin[] = [
  "IV Drip in NS", "IV Drip in RL", "IV Push/Bolus",
  "IM Injection", "Add to Drip Bag", "Oral",
];
const CARRIERS = ["250ml NS", "500ml NS", "100ml NS", "50ml NS", "250ml RL", "500ml RL", "Direct (no carrier)"];
const UNITS = ["mg", "g", "mcg", "ml", "mEq", "IU", "mmol", "units"];
const CHARTS_KEY = "nutridrip_tx_charts";
const LOGO_KEY = "nutridrip_rx_logo";
const COMMON_INGREDIENTS = [
  "Vitamin C", "Vitamin B12", "B-Complex", "Magnesium Sulphate", "Zinc",
  "Glutathione", "Selenium", "Vitamin D3", "NAD+", "Alpha Lipoic Acid",
  "Folic Acid", "Calcium Gluconate", "Taurine", "L-Carnitine", "Biotin",
];

function uid() { return `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`; }
function addDays(iso: string, days: number) {
  const d = new Date(iso); d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}
function fmtPrint(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}
function newComp(): TxComponent {
  return { id: uid(), name: "", dose: "", unit: "mg", route: "IV Drip in NS", carrier: "250ml NS" };
}
function newSession(date: string): TxSession {
  return { id: uid(), date, dripName: "", components: [newComp()], sessionNotes: "" };
}
function makeWeeks(n: number, startDate: string): TxWeek[] {
  return Array.from({ length: n }, (_, i) => ({
    weekNum: i + 1,
    sessions: [newSession(addDays(startDate, i * 7))],
  }));
}

const fl: React.CSSProperties = {
  fontSize: 10, color: "var(--text-3)", letterSpacing: 0.5,
  fontWeight: 600, display: "block", textTransform: "uppercase" as const,
};
const fi: React.CSSProperties = {
  width: "100%", padding: "9px 12px", marginTop: 4, background: "var(--white)",
  border: "1.5px solid var(--border)", borderRadius: "var(--radius-sm)", fontSize: 14,
  fontFamily: "var(--font-display)", color: "var(--text)", outline: "none",
  boxSizing: "border-box" as const,
};
const fis: React.CSSProperties = { ...fi, padding: "6px 8px", fontSize: 12, marginTop: 0 };

export default function DoctorDashboard() {
  const [approvals, setApprovals] = useState(DEMO_APPROVALS);
  const [charts, setCharts] = useState<TxChart[]>([]);
  const [building, setBuilding] = useState(false);
  const [header, setHeader] = useState({
    patientName: "", patientAge: "", diagnosis: "",
    doctorName: "Dr. Sarah Chen",
    startDate: new Date().toISOString().slice(0, 10),
    totalWeeks: 4,
  });
  const [weeks, setWeeks] = useState<TxWeek[]>([]);
  const [activeWeek, setActiveWeek] = useState(0);
  const [previewChart, setPreviewChart] = useState<TxChart | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [rxLogo, setRxLogo] = useState<string | null>(null);

  useEffect(() => {
    try {
      const s = localStorage.getItem(CHARTS_KEY);
      if (s) setCharts(JSON.parse(s));
      const logo = localStorage.getItem(LOGO_KEY);
      if (logo) setRxLogo(logo);
    } catch { /* ignore */ }
  }, []);

  function handleApprove(id: string) {
    setApprovals(p => p.map(a => a.id === id ? { ...a, status: "approved" as const } : a));
  }
  function handleReject(id: string) {
    setApprovals(p => p.map(a => a.id === id ? { ...a, status: "rejected" as const } : a));
  }
  function handleRequestInfo(id: string) {
    setApprovals(p => p.map(a => a.id === id ? { ...a, status: "info-requested" as const } : a));
  }

  function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const b64 = reader.result as string;
      setRxLogo(b64);
      localStorage.setItem(LOGO_KEY, b64);
    };
    reader.readAsDataURL(file);
  }

  function removeLogo() {
    setRxLogo(null);
    localStorage.removeItem(LOGO_KEY);
  }

  function startBuilder() {
    const today = new Date().toISOString().slice(0, 10);
    const h = { patientName: "", patientAge: "", diagnosis: "", doctorName: "Dr. Sarah Chen", startDate: today, totalWeeks: 4 };
    setHeader(h);
    setWeeks(makeWeeks(4, today));
    setActiveWeek(0);
    setEditingId(null);
    setBuilding(true);
  }

  function editChart(chart: TxChart) {
    setHeader({
      patientName: chart.patientName,
      patientAge: chart.patientAge,
      diagnosis: chart.diagnosis,
      doctorName: chart.doctorName,
      startDate: chart.startDate,
      totalWeeks: chart.totalWeeks,
    });
    setWeeks(chart.weeks);
    setActiveWeek(0);
    setEditingId(chart.id);
    setBuilding(true);
  }

  function applyWeeks() {
    setWeeks(makeWeeks(header.totalWeeks, header.startDate));
    setActiveWeek(0);
  }

  function updateComp(wI: number, sI: number, cI: number, f: keyof TxComponent, v: string) {
    setWeeks(p => p.map((w, wi) => wi !== wI ? w : {
      ...w, sessions: w.sessions.map((s, si) => si !== sI ? s : {
        ...s, components: s.components.map((c, ci) => ci !== cI ? c : { ...c, [f]: v }),
      }),
    }));
  }

  function addComp(wI: number, sI: number) {
    setWeeks(p => p.map((w, wi) => wi !== wI ? w : {
      ...w, sessions: w.sessions.map((s, si) => si !== sI ? s : {
        ...s, components: [...s.components, newComp()],
      }),
    }));
  }

  function removeComp(wI: number, sI: number, cI: number) {
    setWeeks(p => p.map((w, wi) => wi !== wI ? w : {
      ...w, sessions: w.sessions.map((s, si) => si !== sI ? s : {
        ...s, components: s.components.filter((_, ci) => ci !== cI),
      }),
    }));
  }

  function updateSess(wI: number, sI: number, f: keyof TxSession, v: string) {
    setWeeks(p => p.map((w, wi) => wi !== wI ? w : {
      ...w, sessions: w.sessions.map((s, si) => si !== sI ? s : { ...s, [f]: v }),
    }));
  }

  function addSession(wI: number) {
    const last = weeks[wI].sessions.at(-1)?.date ?? addDays(header.startDate, wI * 7);
    setWeeks(p => p.map((w, wi) => wi !== wI ? w : {
      ...w, sessions: [...w.sessions, newSession(addDays(last, 2))],
    }));
  }

  function saveChart(share: boolean) {
    let next: TxChart[];
    if (editingId) {
      const existing = charts.find(c => c.id === editingId);
      const updated: TxChart = {
        id: editingId, ...header, weeks,
        createdAt: existing?.createdAt ?? new Date().toISOString(),
        sharedWithNurse: share || (existing?.sharedWithNurse ?? false),
      };
      next = charts.map(c => c.id === editingId ? updated : c);
    } else {
      const chart: TxChart = {
        id: uid(), ...header, weeks,
        createdAt: new Date().toISOString(), sharedWithNurse: share,
      };
      next = [chart, ...charts];
    }
    setCharts(next);
    localStorage.setItem(CHARTS_KEY, JSON.stringify(next));
    setEditingId(null);
    setBuilding(false);
  }

  function shareChart(id: string) {
    const next = charts.map(c => c.id === id ? { ...c, sharedWithNurse: true } : c);
    setCharts(next);
    localStorage.setItem(CHARTS_KEY, JSON.stringify(next));
  }

  function deleteChart(id: string) {
    const next = charts.filter(c => c.id !== id);
    setCharts(next);
    localStorage.setItem(CHARTS_KEY, JSON.stringify(next));
  }

  const pending = approvals.filter(a => a.status === "pending");
  const approvedToday = approvals.filter(a => a.status === "approved").length;
  const upcoming = DEMO_BOOKINGS
    .filter(b => b.status === "scheduled" || b.status === "in-progress")
    .slice(0, 5);

  return (
    <DashLayout
      title={<>Doctor <em>Dashboard</em></>}
      subtitle="Review protocol requests, approve custom doses, and build treatment charts."
      allowedRoles={["doctor", "admin"]}
    >
      {previewChart && (
        <>
          <PrintRx chart={previewChart} logo={rxLogo} />
          <PreviewModal
            chart={previewChart}
            logo={rxLogo}
            onClose={() => setPreviewChart(null)}
            onPrint={() => window.print()}
          />
        </>
      )}

      <div className="stat-grid">
        <StatCard icon="📋" label="Pending Reviews" value={pending.length}
          delta={pending.length > 3 ? "Priority queue" : "On track"}
          deltaType={pending.length > 3 ? "down" : "up"} />
        <StatCard icon="✅" label="Approved Today" value={approvedToday} delta="+5 vs yesterday" deltaType="up" />
        <StatCard icon="📊" label="Protocols Created" value={charts.length} delta="Treatment charts" />
        <StatCard icon="⭐" label="Your Rating" value="4.9 / 5" delta="312 reviews" />
      </div>

      {/* ── Treatment Protocol Builder ─────────────────────────────────── */}
      <div className="panel">
        <div className="panel-head">
          <div>
            <h3 className="panel-title">Treatment Protocol Charts</h3>
            <p className="panel-sub">
              Build week-by-week IV drip protocols with ingredients, dosages, and routes.
              Share with nursing staff or download as a clinical prescription.
            </p>
          </div>
          {!building && (
            <button className="row-action-btn primary" onClick={startBuilder}>+ New Protocol</button>
          )}
        </div>

        {/* Logo upload row */}
        <div style={{
          display: "flex", alignItems: "center", gap: 14,
          padding: "12px 14px", background: "var(--off-white)",
          borderRadius: "var(--radius-sm)", border: "1px solid var(--border)",
          marginBottom: 16,
        }}>
          {rxLogo ? (
            <img src={rxLogo} alt="Clinic logo" style={{ height: 48, width: "auto", maxWidth: 120, objectFit: "contain", borderRadius: 4, border: "1px solid var(--border)", padding: 4, background: "#fff" }} />
          ) : (
            <div style={{ width: 48, height: 48, background: "var(--border)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>🏥</div>
          )}
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", marginBottom: 2 }}>Prescription Logo</div>
            <div style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 6 }}>Shown on all printed prescriptions</div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <label style={{ cursor: "pointer" }}>
                <span className="row-action-btn secondary" style={{ fontSize: 11, display: "inline-block" }}>
                  {rxLogo ? "Change Logo" : "Upload Logo"}
                </span>
                <input type="file" accept="image/*" style={{ display: "none" }} onChange={handleLogoUpload} />
              </label>
              {rxLogo && (
                <button onClick={removeLogo} style={{ fontSize: 11, background: "none", border: "none", cursor: "pointer", color: "#EF4444", padding: 0 }}>
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>

        {building && (
          <div style={{
            border: "2px solid var(--teal)", borderRadius: "var(--radius-sm)",
            padding: 20, background: "var(--sky-pale)", marginBottom: 16,
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--teal)", letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 16 }}>
              {editingId ? "✏️ Editing Protocol" : "New Protocol Builder"}
            </div>

            <div className="split-grid" style={{ marginBottom: 10 }}>
              <div>
                <label style={fl}>Patient Name</label>
                <input style={fi} value={header.patientName}
                  onChange={e => setHeader(h => ({ ...h, patientName: e.target.value }))}
                  placeholder="Full name" />
              </div>
              <div>
                <label style={fl}>Age / Gender</label>
                <input style={fi} value={header.patientAge}
                  onChange={e => setHeader(h => ({ ...h, patientAge: e.target.value }))}
                  placeholder="e.g. 34F" />
              </div>
            </div>

            <div style={{ marginBottom: 10 }}>
              <label style={fl}>Diagnosis / Clinical Indication</label>
              <input style={fi} value={header.diagnosis}
                onChange={e => setHeader(h => ({ ...h, diagnosis: e.target.value }))}
                placeholder="e.g. Chronic fatigue, post-surgery recovery, vitamin deficiency" />
            </div>

            <div className="split-grid" style={{ marginBottom: 10 }}>
              <div>
                <label style={fl}>Prescribing Doctor</label>
                <input style={fi} value={header.doctorName}
                  onChange={e => setHeader(h => ({ ...h, doctorName: e.target.value }))} />
              </div>
              <div>
                <label style={fl}>Protocol Start Date</label>
                <input type="date" style={fi} value={header.startDate}
                  onChange={e => setHeader(h => ({ ...h, startDate: e.target.value }))} />
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "flex-end", gap: 10, marginBottom: 20 }}>
              <div style={{ flex: 1 }}>
                <label style={fl}>Total Weeks</label>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                  <button type="button" onClick={() => setHeader(h => ({ ...h, totalWeeks: Math.max(1, h.totalWeeks - 1) }))}
                    style={{ width: 34, height: 38, borderRadius: "var(--radius-sm)", border: "1.5px solid var(--border)", background: "var(--white)", cursor: "pointer", fontSize: 20, fontWeight: 300, color: "var(--teal)", fontFamily: "inherit" }}>−</button>
                  <input type="number" min="1" max="52" style={{ ...fi, width: 70, textAlign: "center", marginTop: 0 }}
                    value={header.totalWeeks}
                    onChange={e => setHeader(h => ({ ...h, totalWeeks: Math.max(1, parseInt(e.target.value) || 1) }))} />
                  <button type="button" onClick={() => setHeader(h => ({ ...h, totalWeeks: h.totalWeeks + 1 }))}
                    style={{ width: 34, height: 38, borderRadius: "var(--radius-sm)", border: "1.5px solid var(--border)", background: "var(--white)", cursor: "pointer", fontSize: 20, fontWeight: 300, color: "var(--teal)", fontFamily: "inherit" }}>+</button>
                  <span style={{ fontSize: 12, color: "var(--text-3)" }}>week{header.totalWeeks !== 1 ? "s" : ""}</span>
                </div>
              </div>
              <button className="row-action-btn secondary" style={{ marginBottom: 1 }} onClick={applyWeeks}>
                Apply / Reset Weeks
              </button>
            </div>

            {weeks.length > 0 && (
              <>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
                  {weeks.map((w, wi) => (
                    <button key={wi} onClick={() => setActiveWeek(wi)} style={{
                      padding: "5px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                      border: "1.5px solid var(--teal)", cursor: "pointer",
                      fontFamily: "var(--font-display)",
                      background: activeWeek === wi ? "var(--teal)" : "transparent",
                      color: activeWeek === wi ? "#fff" : "var(--teal)",
                    }}>
                      Week {w.weekNum}
                    </button>
                  ))}
                </div>

                <div style={{
                  background: "var(--white)", borderRadius: "var(--radius-sm)",
                  padding: 16, border: "1px solid var(--border)",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                    <strong style={{ fontSize: 13, color: "var(--text)" }}>
                      Week {weeks[activeWeek]?.weekNum} — {fmtPrint(addDays(header.startDate, activeWeek * 7))}
                    </strong>
                    <button className="row-action-btn secondary" style={{ fontSize: 11 }}
                      onClick={() => addSession(activeWeek)}>
                      + Add Session
                    </button>
                  </div>

                  {weeks[activeWeek]?.sessions.map((sess, si) => (
                    <div key={sess.id} style={{
                      marginBottom: 16, padding: 14,
                      background: "var(--off-white)", borderRadius: "var(--radius-sm)",
                      border: "1px solid var(--border)",
                    }}>
                      <div style={{
                        fontSize: 11, fontWeight: 700, color: "var(--teal)",
                        marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5,
                      }}>
                        Session {si + 1}
                      </div>

                      <div className="split-grid" style={{ marginBottom: 12 }}>
                        <div>
                          <label style={fl}>Session Date</label>
                          <input type="date" style={fi} value={sess.date}
                            onChange={e => updateSess(activeWeek, si, "date", e.target.value)} />
                        </div>
                        <div>
                          <label style={fl}>Protocol / Drip Name</label>
                          <input style={fi} value={sess.dripName}
                            onChange={e => updateSess(activeWeek, si, "dripName", e.target.value)}
                            placeholder="e.g. Myers Cocktail, Velocity, Custom Detox" />
                        </div>
                      </div>

                      <label style={{ ...fl, marginBottom: 8 }}>Components</label>
                      <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 560 }}>
                          <thead>
                            <tr>
                              {["Ingredient", "Dose", "Unit", "Route of Administration", "Carrier / Vehicle", ""].map((h, i) => (
                                <th key={i} style={{
                                  fontSize: 10, color: "var(--text-3)", fontWeight: 600,
                                  padding: "4px 6px", textAlign: "left",
                                  letterSpacing: 0.4, whiteSpace: "nowrap",
                                }}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {sess.components.map((c, ci) => (
                              <tr key={c.id}>
                                <td style={{ padding: "3px 4px" }}>
                                  <input list={`dl-${si}-${ci}`} style={{ ...fis, minWidth: 140 }}
                                    value={c.name}
                                    onChange={e => updateComp(activeWeek, si, ci, "name", e.target.value)}
                                    placeholder="Vitamin C" />
                                  <datalist id={`dl-${si}-${ci}`}>
                                    {COMMON_INGREDIENTS.map(n => <option key={n} value={n} />)}
                                  </datalist>
                                </td>
                                <td style={{ padding: "3px 4px" }}>
                                  <input style={{ ...fis, width: 64 }} value={c.dose}
                                    onChange={e => updateComp(activeWeek, si, ci, "dose", e.target.value)}
                                    placeholder="2" />
                                </td>
                                <td style={{ padding: "3px 4px" }}>
                                  <select style={{ ...fis, width: 72 }} value={c.unit}
                                    onChange={e => updateComp(activeWeek, si, ci, "unit", e.target.value)}>
                                    {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                                  </select>
                                </td>
                                <td style={{ padding: "3px 4px" }}>
                                  <select style={{ ...fis, minWidth: 155 }} value={c.route}
                                    onChange={e => updateComp(activeWeek, si, ci, "route", e.target.value as RouteOfAdmin)}>
                                    {ROUTES.map(r => <option key={r} value={r}>{r}</option>)}
                                  </select>
                                </td>
                                <td style={{ padding: "3px 4px" }}>
                                  <select style={{ ...fis, minWidth: 140 }} value={c.carrier}
                                    onChange={e => updateComp(activeWeek, si, ci, "carrier", e.target.value)}>
                                    {CARRIERS.map(ca => <option key={ca} value={ca}>{ca}</option>)}
                                  </select>
                                </td>
                                <td style={{ padding: "3px 4px" }}>
                                  <button onClick={() => removeComp(activeWeek, si, ci)} style={{
                                    background: "none", border: "none", cursor: "pointer",
                                    color: "#EF4444", fontSize: 18, lineHeight: 1, padding: "4px 6px",
                                  }}>×</button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <button className="row-action-btn secondary" style={{ fontSize: 11, marginTop: 8 }}
                        onClick={() => addComp(activeWeek, si)}>
                        + Add Component
                      </button>

                      <div style={{ marginTop: 12 }}>
                        <label style={fl}>Session Notes (Optional)</label>
                        <input style={fi} value={sess.sessionNotes}
                          onChange={e => updateSess(activeWeek, si, "sessionNotes", e.target.value)}
                          placeholder="Pre-meds required, monitor vitals, fasting preferred, slow infusion rate…" />
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
              <button className="row-action-btn primary" onClick={() => saveChart(false)}>
                Save Protocol
              </button>
              <button className="row-action-btn primary"
                onClick={() => saveChart(true)}
                style={{ background: "#0f766e" }}>
                💊 Save &amp; Share with Nurse
              </button>
              <button className="row-action-btn secondary" onClick={() => { setBuilding(false); setEditingId(null); }}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {!building && charts.length === 0 && (
          <div className="empty-state">
            No treatment protocols created yet. Click &ldquo;+ New Protocol&rdquo; to get started.
          </div>
        )}

        {!building && charts.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {charts.map(chart => (
              <div key={chart.id} style={{
                padding: 16, borderRadius: "var(--radius-sm)",
                border: "1.5px solid var(--border)", background: "var(--white)",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text)" }}>
                      {chart.patientName || "Unnamed Patient"}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 3 }}>
                      Age: {chart.patientAge || "—"} · {chart.totalWeeks} weeks · Starts {fmtPrint(chart.startDate)}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2 }}>
                      {chart.diagnosis || "No diagnosis entered"}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 3 }}>
                      By {chart.doctorName} · Created {fmtPrint(chart.createdAt)}
                      {chart.sharedWithNurse && (
                        <span style={{ marginLeft: 8, color: "var(--teal)", fontWeight: 600 }}>
                          ✓ Shared with Nursing Team
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <button className="row-action-btn secondary" onClick={() => editChart(chart)}>
                      ✏️ Edit
                    </button>
                    {!chart.sharedWithNurse && (
                      <button className="row-action-btn secondary" onClick={() => shareChart(chart.id)}>
                        Share with Nurse
                      </button>
                    )}
                    <button className="row-action-btn primary" onClick={() => setPreviewChart(chart)}>
                      👁 Preview &amp; Print
                    </button>
                    <button className="row-action-btn danger" onClick={() => deleteChart(chart.id)}>
                      Delete
                    </button>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
                  {chart.weeks.map(w => (
                    <span key={w.weekNum} style={{
                      fontSize: 11, padding: "3px 10px", borderRadius: 20,
                      background: "var(--sky-pale)", color: "var(--teal)",
                      border: "1px solid var(--border)", fontWeight: 600,
                    }}>
                      Wk {w.weekNum}: {w.sessions.flatMap(s => s.components).length} components
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Patient Questionnaire Results ────────────────────────────── */}
      <div className="panel">
        <div className="panel-head">
          <div>
            <h3 className="panel-title">Patient Questionnaire Results</h3>
            <p className="panel-sub">
              View section-wise scores, full answered questionnaire, and AI-generated clinical summary for each patient.
            </p>
          </div>
        </div>
        <QuizPanel
          onUseSuggestions={(patientName, text) => {
            const plain = text.replace(/\*\*/g, "").replace(/\*/g, "");
            navigator.clipboard.writeText(plain).catch(() => undefined);
            alert(`AI summary for ${patientName} copied to clipboard. You can paste it into your protocol notes.`);
          }}
        />
      </div>

      {/* ── Protocol Approval Queue ───────────────────────────────────── */}
      <div className="panel">
        <div className="panel-head">
          <div>
            <h3 className="panel-title">Protocol Approval Queue</h3>
            <p className="panel-sub">Review patient-generated custom protocols. Approve, reject, or request additional info.</p>
          </div>
        </div>
        {pending.length === 0 ? (
          <div className="empty-state">🎉 No pending approvals. You&apos;re all caught up.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {pending.map(a => {
              const sc = a.severity === "Strongly Recommended" ? "strong" : a.severity === "Recommended" ? "moderate" : "mild";
              return (
                <div key={a.id} style={{
                  padding: 18, borderRadius: "var(--radius-sm)",
                  border: "1.5px solid var(--border)", background: "var(--off-white)",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10, gap: 12, flexWrap: "wrap" }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>
                        {a.patientName} · <span style={{ color: "var(--teal)" }}>{a.dripName}</span>
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-3)" }}>Requested {formatDateTime(a.requestedAt)}</div>
                    </div>
                    <span className={`sev-badge ${sc}`}>{a.severity}</span>
                  </div>
                  <div style={{
                    fontSize: 12, color: "var(--text-2)", lineHeight: 1.6,
                    marginBottom: 12, padding: 10, background: "var(--white)", borderRadius: 8,
                  }}>
                    <strong>Clinical notes:</strong> {a.customNotes}
                  </div>
                  <div>
                    <button className="row-action-btn primary" onClick={() => handleApprove(a.id)}>✓ Approve</button>
                    <button className="row-action-btn secondary" onClick={() => handleRequestInfo(a.id)}>Request Info</button>
                    <button className="row-action-btn danger" onClick={() => handleReject(a.id)}>Reject</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="panel">
        <div className="panel-head">
          <div>
            <h3 className="panel-title">Recently Processed</h3>
            <p className="panel-sub">Your recent approval decisions.</p>
          </div>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="dash-table">
            <thead>
              <tr><th>Patient</th><th>Drip</th><th>Severity</th><th>Requested</th><th>Status</th></tr>
            </thead>
            <tbody>
              {approvals.filter(a => a.status !== "pending").map(a => {
                const sc = a.severity === "Strongly Recommended" ? "strong" : a.severity === "Recommended" ? "moderate" : "mild";
                return (
                  <tr key={a.id}>
                    <td>{a.patientName}</td>
                    <td><strong style={{ color: "var(--teal)" }}>{a.dripName}</strong></td>
                    <td><span className={`sev-badge ${sc}`}>{a.severity}</span></td>
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
              <h3 className="panel-title">Upcoming Sessions (Your Patients)</h3>
              <p className="panel-sub">Scheduled infusions where you are the physician of record.</p>
            </div>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className="dash-table">
              <thead><tr><th>Patient</th><th>Drip</th><th>Date</th><th>Location</th></tr></thead>
              <tbody>
                {upcoming.map(b => (
                  <tr key={b.id}>
                    <td>{b.patientName}</td>
                    <td>{b.dripName}</td>
                    <td>{formatDateTime(b.scheduledAt)}</td>
                    <td style={{ textTransform: "capitalize" }}>{b.location}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <div>
              <h3 className="panel-title">High-Priority Patients</h3>
              <p className="panel-sub">Patients with vitality score &lt; 55 — needing attention.</p>
            </div>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className="dash-table">
              <thead><tr><th>Name</th><th>Age</th><th>Score</th><th>Concern</th></tr></thead>
              <tbody>
                {DEMO_PATIENTS.filter(p => p.vitalityScore < 55).map(p => (
                  <tr key={p.id}>
                    <td><strong>{p.name}</strong></td>
                    <td>{p.age}/{p.gender}</td>
                    <td><span style={{ color: "#D97706", fontWeight: 600 }}>{p.vitalityScore}</span></td>
                    <td style={{ color: "var(--text-3)" }}>{p.primaryConcern}</td>
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
            <h3 className="panel-title">All Your Patients</h3>
            <p className="panel-sub">Complete patient list with last visit and total sessions.</p>
          </div>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="dash-table">
            <thead>
              <tr><th>Name</th><th>Age/Gender</th><th>Last Visit</th><th>Sessions</th><th>Concern</th><th>Contact</th></tr>
            </thead>
            <tbody>
              {DEMO_PATIENTS.map(p => (
                <tr key={p.id}>
                  <td><strong>{p.name}</strong></td>
                  <td>{p.age} / {p.gender}</td>
                  <td>{p.lastVisit ? formatDate(p.lastVisit) : "No visits yet"}</td>
                  <td>{p.totalSessions}</td>
                  <td style={{ color: "var(--text-3)" }}>{p.primaryConcern}</td>
                  <td style={{ fontSize: 11, color: "var(--text-3)" }}>{p.phone}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashLayout>
  );
}

// ── Brand palette (hex — works in both screen preview and print) ──────────────
const RX = {
  teal: "#1A7EA8", tealDark: "#0F5C7D", sky: "#5BB8F5",
  skyPale: "#D6EEFA", skyBg: "#EEF7FD",
  text: "#0E2233", text2: "#3A5568", text3: "#7A9BB0",
};

function RxInfoCell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase", color: RX.text3, marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 600, color: RX.text }}>{value}</div>
    </div>
  );
}

// ── Shared prescription layout ────────────────────────────────────────────────

function RxBody({ chart, logo }: { chart: TxChart; logo: string | null }) {
  return (
    <div style={{ fontFamily: "'Segoe UI', Arial, sans-serif", color: RX.text, background: "#fff", maxWidth: 800 }}>

      {/* ── Header gradient ── */}
      <div style={{
        background: `linear-gradient(135deg, ${RX.tealDark} 0%, ${RX.teal} 55%, ${RX.sky} 100%)`,
        padding: "22px 32px", display: "flex", alignItems: "center", gap: 20,
      }}>
        {logo && (
          <div style={{ background: "rgba(255,255,255,0.18)", borderRadius: 10, padding: 8, flexShrink: 0 }}>
            <img src={logo} alt="logo" style={{ height: 58, width: "auto", maxWidth: 120, objectFit: "contain", display: "block" }} />
          </div>
        )}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 30, fontWeight: 800, color: "#fff", letterSpacing: 1.5, textTransform: "uppercase", lineHeight: 1 }}>
            NUTRIDRIP
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.82)", letterSpacing: 3, marginTop: 5, textTransform: "uppercase" }}>
            IV Protocol Prescription
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 32, fontWeight: 800, color: "rgba(255,255,255,0.25)", lineHeight: 1, fontFamily: "serif" }}>Rx</div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.7)", marginTop: 2 }}>Issued {fmtPrint(chart.createdAt)}</div>
        </div>
      </div>

      {/* ── Patient info band ── */}
      <div style={{ background: RX.skyBg, borderBottom: `2px solid ${RX.skyPale}`, padding: "14px 32px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px 24px" }}>
          <RxInfoCell label="Patient" value={chart.patientName || "—"} />
          <RxInfoCell label="Age / Gender" value={chart.patientAge || "—"} />
          <RxInfoCell label="Prescribing Physician" value={chart.doctorName} />
          <RxInfoCell label="Diagnosis / Indication" value={chart.diagnosis || "—"} />
          <RxInfoCell label="Protocol Start Date" value={fmtPrint(chart.startDate)} />
          <RxInfoCell label="Duration" value={`${chart.totalWeeks} week${chart.totalWeeks !== 1 ? "s" : ""}`} />
        </div>
      </div>

      {/* ── Weeks ── */}
      <div style={{ padding: "20px 32px 8px" }}>
        {chart.weeks.map(week => (
          <div key={week.weekNum} style={{ marginBottom: 22, pageBreakInside: "avoid" }}>

            {/* Week label row */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
              <div style={{ background: RX.teal, color: "#fff", padding: "3px 14px", borderRadius: 20, fontSize: 11, fontWeight: 700, letterSpacing: 0.8, whiteSpace: "nowrap" }}>
                WEEK {week.weekNum}
              </div>
              <div style={{ fontSize: 12, color: RX.text3, fontWeight: 500 }}>
                {fmtPrint(addDays(chart.startDate, (week.weekNum - 1) * 7))}
              </div>
              <div style={{ flex: 1, height: 1, background: RX.skyPale }} />
            </div>

            {week.sessions.map((sess, si) => (
              <div key={sess.id} style={{ marginBottom: 12, border: `1px solid ${RX.skyPale}`, borderRadius: 8, overflow: "hidden" }}>

                {/* Session header */}
                <div style={{
                  background: RX.skyBg, padding: "7px 14px",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  borderBottom: `1px solid ${RX.skyPale}`,
                }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: RX.teal }}>
                    Session {si + 1}{sess.dripName ? ` — ${sess.dripName}` : ""}
                  </span>
                  <span style={{ fontSize: 11, color: RX.text3 }}>{fmtPrint(sess.date)}</span>
                </div>

                {/* Components table */}
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                  <thead>
                    <tr style={{ background: RX.teal }}>
                      {["#", "Component / Ingredient", "Dose", "Route of Administration", "Carrier / Vehicle"].map(h => (
                        <th key={h} style={{
                          color: "#fff", padding: "6px 10px", textAlign: "left",
                          fontSize: 10, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase",
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sess.components.filter(c => c.name).map((c, ci) => (
                      <tr key={c.id} style={{ background: ci % 2 === 0 ? "#fff" : RX.skyBg }}>
                        <td style={{ padding: "7px 10px", width: 26, textAlign: "center", color: RX.text3, fontSize: 11, borderBottom: `1px solid ${RX.skyPale}` }}>{ci + 1}</td>
                        <td style={{ padding: "7px 10px", fontWeight: 600, color: RX.text, borderBottom: `1px solid ${RX.skyPale}` }}>{c.name}</td>
                        <td style={{ padding: "7px 10px", whiteSpace: "nowrap", fontWeight: 700, color: RX.teal, borderBottom: `1px solid ${RX.skyPale}` }}>{c.dose} {c.unit}</td>
                        <td style={{ padding: "7px 10px", color: RX.text2, borderBottom: `1px solid ${RX.skyPale}` }}>{c.route}</td>
                        <td style={{ padding: "7px 10px", color: RX.text3, borderBottom: `1px solid ${RX.skyPale}` }}>{c.carrier}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {sess.sessionNotes && (
                  <div style={{ background: "#FFFBEB", borderTop: "1px solid #FDE68A", padding: "6px 14px", fontSize: 11, color: "#92400E" }}>
                    ⚠ Clinical Note: {sess.sessionNotes}
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* ── Authorisation + disclaimer ── */}
      <div style={{ margin: "0 32px 20px", borderTop: `2px solid ${RX.teal}`, paddingTop: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: RX.teal, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 14 }}>Authorisation</div>
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 10, color: RX.text3, marginBottom: 26 }}>Doctor&apos;s Signature</div>
            <div style={{ borderBottom: `1.5px solid ${RX.skyPale}`, marginBottom: 16 }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <div style={{ fontSize: 10, color: RX.text3, marginBottom: 20 }}>Date</div>
              <div style={{ borderBottom: `1.5px solid ${RX.skyPale}` }} />
            </div>
            <div>
              <div style={{ fontSize: 10, color: RX.text3, marginBottom: 20 }}>License / Reg. No.</div>
              <div style={{ borderBottom: `1.5px solid ${RX.skyPale}` }} />
            </div>
          </div>
        </div>
        <div style={{ background: RX.skyBg, border: `1px solid ${RX.skyPale}`, borderRadius: 8, padding: "12px 14px", fontSize: 10, color: RX.text3, lineHeight: 1.7 }}>
          <strong style={{ color: RX.teal, fontSize: 11, display: "block", marginBottom: 6 }}>IMPORTANT NOTICE</strong>
          This prescription is for clinical use only. Administer under direct supervision of a qualified medical professional.
          All infusions must be prepared in a sterile environment. Patient should be assessed prior to each session for contraindications.
          <div style={{ marginTop: 10, paddingTop: 8, borderTop: `1px solid ${RX.skyPale}`, color: RX.text2 }}>
            <strong>NUTRIDRIP IV THERAPY</strong> — For internal clinical use only. Not for patient distribution.
          </div>
        </div>
      </div>

      {/* ── Footer strip ── */}
      <div style={{ background: `linear-gradient(90deg, ${RX.tealDark}, ${RX.teal})`, padding: "8px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 9, color: "rgba(255,255,255,0.7)", letterSpacing: 1, textTransform: "uppercase" }}>NutriDrip IV Therapy · Precision Protocol System</span>
        <span style={{ fontSize: 9, color: "rgba(255,255,255,0.6)" }}>Issued: {fmtPrint(chart.createdAt)}</span>
      </div>
    </div>
  );
}

// ── Hidden print target ───────────────────────────────────────────────────────

function PrintRx({ chart, logo }: { chart: TxChart; logo: string | null }) {
  return (
    <>
      <style>{`
        @media screen { .rx-print-root { display: none; } }
        @media print {
          body * { visibility: hidden; }
          .rx-print-root, .rx-print-root * {
            visibility: visible;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          .rx-print-root {
            display: block;
            position: absolute;
            top: 0; left: 0;
            width: 100%;
          }
          @page { margin: 10mm; size: A4 portrait; }
        }
      `}</style>
      <div className="rx-print-root">
        <RxBody chart={chart} logo={logo} />
      </div>
    </>
  );
}

// ── Preview modal ─────────────────────────────────────────────────────────────

function PreviewModal({ chart, logo, onClose, onPrint }: {
  chart: TxChart; logo: string | null;
  onClose: () => void; onPrint: () => void;
}) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(0,0,0,0.75)", overflowY: "auto",
    }}>
      {/* Sticky toolbar */}
      <div style={{
        position: "sticky", top: 0, zIndex: 1001,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        background: "#1a1a1a", padding: "12px 20px",
      }}>
        <span style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>
          📄 Prescription Preview — {chart.patientName || "Unnamed Patient"}
        </span>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onPrint} style={{
            padding: "8px 22px", background: "#0f766e", color: "#fff",
            border: "none", borderRadius: 6, cursor: "pointer",
            fontWeight: 700, fontSize: 13, fontFamily: "inherit",
          }}>
            🖨 Print
          </button>
          <button onClick={onClose} style={{
            padding: "8px 16px", background: "#444", color: "#fff",
            border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13, fontFamily: "inherit",
          }}>
            ✕ Close
          </button>
        </div>
      </div>

      {/* Paper */}
      <div style={{ maxWidth: 840, margin: "24px auto 48px", background: "#fff", boxShadow: "0 8px 48px rgba(0,0,0,0.4)", borderRadius: 4 }}>
        <RxBody chart={chart} logo={logo} />
      </div>
    </div>
  );
}
