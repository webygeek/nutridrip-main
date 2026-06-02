"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { DashLayout } from "@/components/dashboard/DashLayout";
import { DEMO_INFUSION_ORDERS, INFUSION_CHECKLIST } from "@/lib/data/nursing-mock";
import { formatDateTime } from "@/lib/data/dashboard-mock";

type HistoryForm = {
  lastMeal: string;
  pregnancyStatus: string;
  priorIVExperience: string;
  currentSymptoms: string;
  confirmedAllergies: string;
  currentMedicationsReconfirm: string;
};

type Vitals = {
  bpSystolic: string;
  bpDiastolic: string;
  heartRate: string;
  temperature: string;
  spo2: string;
  weight: string;
};

const EMPTY_HISTORY: HistoryForm = {
  lastMeal: "", pregnancyStatus: "", priorIVExperience: "",
  currentSymptoms: "", confirmedAllergies: "", currentMedicationsReconfirm: "",
};

const EMPTY_VITALS: Vitals = {
  bpSystolic: "", bpDiastolic: "", heartRate: "",
  temperature: "", spo2: "", weight: "",
};

const ORDER_CSS = `
  .ord-back { font-size:13px;color:var(--teal);text-decoration:none;margin-bottom:18px;display:inline-block; }

  .emergency-bar {
    display:flex;justify-content:space-between;align-items:center;
    padding:14px 20px;background:linear-gradient(135deg,#FBE7E7 0%,#FFF4F4 100%);
    border:1.5px solid #F5BEBE;border-radius:var(--radius-sm);
    margin-bottom:20px;flex-wrap:wrap;gap:12px;
  }
  .eb-text { font-size:12px;color:#A62626;font-weight:500;line-height:1.5; }
  .eb-text strong { font-weight:700; }
  .eb-actions { display:flex;gap:8px; }
  .eb-call-btn, .eb-video-btn {
    padding:9px 18px;border-radius:50px;border:none;
    font-size:12px;font-weight:600;font-family:var(--font-display);
    cursor:pointer;white-space:nowrap;text-decoration:none;display:inline-block;
    transition:transform .15s;
  }
  .eb-call-btn { background:#D42C2C;color:#fff; }
  .eb-video-btn { background:#fff;color:#D42C2C;border:1.5px solid #D42C2C; }
  .eb-call-btn:hover, .eb-video-btn:hover { transform:translateY(-1px); }

  .ord-grid { display:grid;grid-template-columns:2fr 1fr;gap:20px;margin-bottom:20px; }
  @media(max-width:1024px){ .ord-grid { grid-template-columns:1fr; } }

  .ord-info-block {
    background:var(--white);border-radius:var(--radius);padding:24px;
    border:1.5px solid var(--border);box-shadow:var(--shadow);
  }
  .oib-title { font-size:15px;font-weight:600;color:var(--text);margin-bottom:12px;letter-spacing:-0.3px; }
  .oib-title em { font-style:italic;font-family:var(--font-serif);color:var(--teal);font-weight:400; }

  .info-row { display:flex;justify-content:space-between;padding:8px 0;font-size:12px;border-bottom:1px dashed var(--border); }
  .info-row:last-child { border-bottom:none; }
  .info-row-label { color:var(--text-3); }
  .info-row-val { color:var(--text);font-weight:500; }

  .allergy-box {
    padding:14px;border-radius:var(--radius-sm);
    background:#FBE7E7;border-left:3px solid #D42C2C;
    font-size:12px;color:#8B1F1F;line-height:1.6;margin-top:10px;
  }
  .allergy-box strong { display:block;margin-bottom:4px;font-weight:700; }

  .protocol-grid { display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px; }
  .proto-row {
    padding:10px 14px;background:var(--sky-pale);border-radius:var(--radius-sm);
    display:flex;justify-content:space-between;align-items:center;
  }
  .proto-ing { font-size:12px;color:var(--text); }
  .proto-dose { font-size:12px;font-weight:600;color:var(--teal); }

  .doctor-notes-box {
    padding:14px;border-radius:var(--radius-sm);
    background:var(--sky-pale);border-left:3px solid var(--teal);
    margin-top:14px;font-size:12px;color:var(--text-2);line-height:1.7;
  }
  .doctor-notes-box strong { color:var(--teal); }

  .phase-section { margin-bottom:28px; }
  .phase-header {
    display:flex;align-items:center;gap:12px;margin-bottom:14px;
    padding-bottom:10px;border-bottom:2px solid var(--border);
  }
  .phase-icon {
    width:36px;height:36px;border-radius:10px;background:var(--sky-pale);
    display:flex;align-items:center;justify-content:center;font-size:18px;
  }
  .phase-title { font-size:15px;font-weight:600;color:var(--text);letter-spacing:-0.3px; }
  .phase-title em { font-style:italic;font-family:var(--font-serif);color:var(--teal);font-weight:400; }
  .phase-count { font-size:11px;color:var(--text-3);margin-left:auto; }

  .step-card {
    display:flex;gap:14px;padding:14px 16px;border-radius:var(--radius-sm);
    border:1.5px solid var(--border);background:var(--white);margin-bottom:10px;
    transition:all .2s;
  }
  .step-card.done { background:#E5F5F3;border-color:#0A7B6E; }
  .step-checkbox {
    width:22px;height:22px;border-radius:6px;border:1.5px solid var(--border);
    display:flex;align-items:center;justify-content:center;flex-shrink:0;
    cursor:pointer;transition:all .15s;background:var(--white);margin-top:1px;
  }
  .step-card.done .step-checkbox { background:#0A7B6E;border-color:#0A7B6E;color:#fff; }
  .step-body { flex:1;min-width:0; }
  .step-label { font-size:13px;font-weight:600;color:var(--text);margin-bottom:3px; }
  .step-card.done .step-label { color:#0A7B6E;text-decoration:line-through;text-decoration-thickness:1px;opacity:0.8; }
  .step-desc { font-size:11px;color:var(--text-3);line-height:1.6; }
  .step-mandatory { font-size:9px;padding:2px 8px;border-radius:50px;background:#FFF4E6;color:#D97706;margin-left:8px;font-weight:600; }

  .consent-card {
    padding:20px;border-radius:var(--radius-sm);
    background:var(--white);border:2px solid var(--border);
  }
  .consent-card.signed { border-color:#0A7B6E;background:#F0FBF9; }
  .consent-body { font-size:12px;color:var(--text-2);line-height:1.75;margin-bottom:14px; }
  .consent-body ul { margin:8px 0 8px 20px;padding:0; }
  .consent-signature {
    padding:14px;background:var(--off-white);border-radius:var(--radius-sm);
    border:1px dashed var(--border-strong);margin-top:10px;
  }
  .consent-sig-input {
    width:100%;padding:10px 14px;border-radius:var(--radius-sm);
    border:1.5px solid var(--border);background:var(--white);
    font-size:13px;font-family:var(--font-display);outline:none;
  }
  .consent-sig-input:focus { border-color:var(--sky); }

  .consent-confirm-btn {
    margin-top:10px;padding:10px 24px;border-radius:50px;border:none;
    background:linear-gradient(145deg,var(--teal),var(--sky));color:#fff;
    font-size:12px;font-weight:600;font-family:var(--font-display);cursor:pointer;
    box-shadow:0 3px 12px rgba(26,126,168,0.25);transition:transform .2s;
  }
  .consent-confirm-btn:hover { transform:translateY(-1px); }
  .consent-confirm-btn:disabled { background:var(--border);cursor:not-allowed;box-shadow:none;transform:none; }

  .history-form { display:grid;grid-template-columns:1fr 1fr;gap:14px; }
  @media(max-width:768px){ .history-form { grid-template-columns:1fr; } }
  .hf-field { display:flex;flex-direction:column;gap:5px; }
  .hf-label { font-size:11px;color:var(--text-2);font-weight:500;letter-spacing:0.3px; }
  .hf-input {
    padding:10px 12px;border-radius:var(--radius-sm);
    border:1.5px solid var(--border);background:var(--off-white);
    font-size:12px;font-family:var(--font-display);outline:none;
  }
  .hf-input:focus { border-color:var(--sky); }
  .hf-textarea { resize:none;line-height:1.6; }

  .vitals-grid { display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:10px; }
  @media(max-width:768px){ .vitals-grid { grid-template-columns:1fr 1fr; } }
  .vt-field {
    padding:12px;background:var(--off-white);border-radius:var(--radius-sm);
    border:1.5px solid var(--border);
  }
  .vt-label { font-size:10px;color:var(--text-3);letter-spacing:0.5px;margin-bottom:4px; }
  .vt-input {
    width:100%;padding:6px 0;border:none;background:transparent;
    font-size:15px;font-weight:600;color:var(--text);outline:none;
  }
  .vt-unit { font-size:10px;color:var(--text-3);margin-left:4px; }

  .close-order-bar {
    padding:24px;border-radius:var(--radius);
    background:linear-gradient(135deg,#F0FBF9 0%,#E5F5F3 100%);
    border:2px solid #0A7B6E;margin-top:24px;
  }
  .close-order-bar.locked { background:var(--off-white);border-color:var(--border);opacity:0.9; }
  .cob-title { font-size:16px;font-weight:600;color:#0A7B6E;margin-bottom:6px; }
  .close-order-bar.locked .cob-title { color:var(--text-3); }
  .cob-sub { font-size:12px;color:var(--text-2);line-height:1.6;margin-bottom:14px; }
  .cob-btn {
    padding:12px 32px;border-radius:50px;border:none;
    background:#0A7B6E;color:#fff;font-size:13px;font-weight:600;
    font-family:var(--font-display);cursor:pointer;box-shadow:0 4px 16px rgba(10,123,110,0.3);
  }
  .cob-btn:disabled { background:var(--border);cursor:not-allowed;box-shadow:none; }
  .cob-locked-text { font-size:12px;color:#D97706;font-weight:600; }

  .noc-open-btn {
    padding:10px 22px;border-radius:50px;border:none;
    background:linear-gradient(145deg,var(--teal),var(--sky));color:#fff;
    font-size:12px;font-weight:600;font-family:var(--font-display);
    cursor:pointer;text-decoration:none;display:inline-block;
    box-shadow:0 3px 12px rgba(26,126,168,0.25);
  }

  .vm-overlay {
    position:fixed;inset:0;z-index:300;
    display:flex;align-items:center;justify-content:center;padding:20px;
    background:rgba(0,0,0,0.85);
  }
  .vm-card {
    width:100%;max-width:720px;background:#111;border-radius:var(--radius);
    padding:28px;color:#fff;
  }
  .vm-title { font-size:18px;font-weight:600;margin-bottom:8px; }
  .vm-title em { font-style:italic;font-family:var(--font-serif);color:#5BB8F5;font-weight:400; }
  .vm-sub { font-size:13px;color:rgba(255,255,255,0.6);margin-bottom:18px;line-height:1.6; }
  .vm-preview {
    width:100%;aspect-ratio:16/10;background:linear-gradient(135deg,#1A7EA8 0%,#0F5C7D 100%);
    border-radius:var(--radius-sm);display:flex;align-items:center;justify-content:center;
    flex-direction:column;gap:14px;margin-bottom:16px;position:relative;overflow:hidden;
  }
  .vm-preview::before {
    content:'';position:absolute;inset:0;
    background:radial-gradient(circle at 30% 30%,rgba(255,255,255,0.15),transparent 50%);
  }
  .vm-avatar {
    width:100px;height:100px;border-radius:50%;
    background:rgba(255,255,255,0.15);backdrop-filter:blur(8px);
    display:flex;align-items:center;justify-content:center;
    font-size:42px;position:relative;z-index:1;
    border:2px solid rgba(255,255,255,0.3);
  }
  .vm-doc-name { font-size:18px;font-weight:600;z-index:1;position:relative; }
  .vm-pulse { font-size:12px;color:#5BB8F5;z-index:1;position:relative;animation:pulse 1.5s ease-in-out infinite; }
  @keyframes pulse { 0%,100% { opacity:0.5; } 50% { opacity:1; } }

  .vm-controls { display:flex;gap:10px;justify-content:center;flex-wrap:wrap; }
  .vm-btn {
    padding:10px 22px;border-radius:50px;border:none;
    font-size:12px;font-weight:600;font-family:var(--font-display);cursor:pointer;
  }
  .vm-btn.mute { background:rgba(255,255,255,0.1);color:#fff; }
  .vm-btn.end { background:#D42C2C;color:#fff; }

  .vm-close-btn {
    background:transparent;border:1px solid rgba(255,255,255,0.3);
    color:#fff;padding:8px 18px;border-radius:50px;cursor:pointer;
    font-size:12px;font-family:var(--font-display);margin-top:10px;
  }
`;

export default function NurseOrderDetail() {
  const params = useParams<{ id: string }>();
  const orderId = params?.id ?? "";
  const order = DEMO_INFUSION_ORDERS.find((o) => o.id === orderId);

  const [completedSteps, setCompletedSteps] = useState<string[]>(order?.checklistCompleted ?? []);
  const [consentSigned, setConsentSigned] = useState(order?.consentSigned ?? false);
  const [historyTaken, setHistoryTaken] = useState(order?.historyTaken ?? false);
  const [signatureName, setSignatureName] = useState("");
  const [fpStep, setFpStep] = useState<"idle" | "scanning" | "done">("idle");
  const [history, setHistory] = useState<HistoryForm>(EMPTY_HISTORY);
  const [vitals, setVitals] = useState<Vitals>(EMPTY_VITALS);
  const [finalNotes, setFinalNotes] = useState("");
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [orderClosed, setOrderClosed] = useState(order?.status === "completed");

  const mandatorySteps = useMemo(() => INFUSION_CHECKLIST.filter((s) => s.mandatory), []);
  const allMandatoryDone = mandatorySteps.every((s) => completedSteps.includes(s.id));

  const progress = useMemo(() => {
    const total = INFUSION_CHECKLIST.length;
    return Math.round((completedSteps.length / total) * 100);
  }, [completedSteps]);

  if (!order) {
    return (
      <DashLayout title="Order not found" allowedRoles={["nurse", "admin"]}>
        <div className="panel">
          <div className="empty-state">
            <Link href="/dashboard/nurse" style={{ color: "var(--teal)" }}>← Back to nurse dashboard</Link>
          </div>
        </div>
      </DashLayout>
    );
  }

  // Render pre-phase in two logical halves: patient prep steps (before drip prep)
  // and cannulation steps (after drip prep). This keeps the visual flow:
  //   Patient prep → Drip prep (highlighted) → Cannulation → During → Post.
  const CANNULATION_STEP_IDS = new Set(["hand-hygiene", "site-selection", "skin-prep", "cannulation"]);
  const patientPrepSteps = INFUSION_CHECKLIST.filter((s) => s.phase === "pre" && !CANNULATION_STEP_IDS.has(s.id));
  const cannulationSteps = INFUSION_CHECKLIST.filter((s) => s.phase === "pre" && CANNULATION_STEP_IDS.has(s.id));
  const prepSteps = INFUSION_CHECKLIST.filter((s) => s.phase === "prep");
  const duringSteps = INFUSION_CHECKLIST.filter((s) => s.phase === "during");
  const postSteps = INFUSION_CHECKLIST.filter((s) => s.phase === "post");
  const historyFilled = history.lastMeal && history.priorIVExperience && history.currentSymptoms;

  function toggleStep(stepId: string) {
    if (stepId === "obtain-consent" && !consentSigned) {
      alert("Please sign the informed consent form first (scroll up).");
      return;
    }
    if (stepId === "history-taking" && !historyFilled) {
      alert("Please complete the patient history form first (scroll up).");
      return;
    }
    if (stepId === "baseline-vitals" && !vitals.bpSystolic) {
      alert("Please record baseline vital signs first.");
      return;
    }
    setCompletedSteps((prev) => {
      if (prev.includes(stepId)) return prev.filter((s) => s !== stepId);
      return [...prev, stepId];
    });
  }

  function startFpScan() {
    setFpStep("scanning");
    setTimeout(() => setFpStep("done"), 2400);
  }

  function signConsent() {
    if (!signatureName.trim()) {
      alert("Patient must type their full name to sign.");
      return;
    }
    if (fpStep !== "done") {
      alert("Fingerprint verification is required before signing consent.");
      return;
    }
    setConsentSigned(true);
  }

  function confirmHistory() {
    if (!historyFilled) {
      alert("Please fill in at least: last meal, prior IV experience, and current symptoms.");
      return;
    }
    setHistoryTaken(true);
  }

  function closeOrder() {
    if (!allMandatoryDone) {
      alert("All mandatory checklist steps must be complete before closing the order.");
      return;
    }
    if (!finalNotes.trim()) {
      alert("Please add final session notes before closing.");
      return;
    }
    setOrderClosed(true);
    alert("✓ Order closed. Patient record updated, physician notified.");
  }

  return (
    <DashLayout
      title={<>Infusion <em>Order</em> · {order.id.toUpperCase()}</>}
      subtitle={`${order.patientName} · ${order.dripName} · Scheduled ${formatDateTime(order.scheduledAt)}`}
      allowedRoles={["nurse", "admin"]}
    >
      <style dangerouslySetInnerHTML={{ __html: ORDER_CSS }} />

      <Link href="/dashboard/nurse" className="ord-back">← Back to assigned orders</Link>

      <div className="emergency-bar">
        <div className="eb-text">
          <strong>🚨 Emergency Access</strong> — Any adverse reaction, patient distress, or clinical uncertainty: contact the prescribing physician immediately. {order.doctorName} is on-call for this protocol.
        </div>
        <div className="eb-actions">
          <a href={`tel:${order.doctorPhone.replace(/\s/g, "")}`} className="eb-call-btn">📞 Call Doctor</a>
          <button className="eb-video-btn" onClick={() => setShowVideoModal(true)}>📹 Video Call</button>
        </div>
      </div>

      {showVideoModal && (
        <div className="vm-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowVideoModal(false); }}>
          <div className="vm-card">
            <h3 className="vm-title">Emergency <em>Video Consult</em></h3>
            <p className="vm-sub">
              Connecting to {order.doctorName} · Prescribing physician for this order.
              Describe the clinical situation clearly — duration, symptoms, current vitals.
            </p>
            <div className="vm-preview">
              <div className="vm-avatar">👨‍⚕️</div>
              <div className="vm-doc-name">{order.doctorName}</div>
              <div className="vm-pulse">● Connecting...</div>
            </div>
            <div className="vm-controls">
              <button className="vm-btn mute">🎤 Mute</button>
              <button className="vm-btn mute">📹 Camera</button>
              <button className="vm-btn end" onClick={() => setShowVideoModal(false)}>End Call</button>
            </div>
            <div style={{ textAlign: "center", marginTop: 10 }}>
              <button className="vm-close-btn" onClick={() => setShowVideoModal(false)}>Close without calling</button>
            </div>
          </div>
        </div>
      )}

      <div className="ord-grid">
        <div>
          <div className="ord-info-block">
            <h3 className="oib-title">Patient <em>Details</em></h3>
            <div className="info-row">
              <span className="info-row-label">Name</span>
              <span className="info-row-val">{order.patientName}</span>
            </div>
            <div className="info-row">
              <span className="info-row-label">Age / Gender</span>
              <span className="info-row-val">{order.patientAge} / {order.patientGender}</span>
            </div>
            <div className="info-row">
              <span className="info-row-label">Phone</span>
              <span className="info-row-val">{order.patientPhone}</span>
            </div>
            <div className="info-row">
              <span className="info-row-label">Session location</span>
              <span className="info-row-val" style={{ textTransform: "capitalize" }}>{order.location}</span>
            </div>
            <div className="info-row">
              <span className="info-row-label">Address</span>
              <span className="info-row-val" style={{ textAlign: "right", fontSize: 11 }}>{order.address}</span>
            </div>

            <div className="allergy-box">
              <strong>⚠ ALLERGIES (verify verbally with patient)</strong>
              {order.patientAllergies}
            </div>

            <div style={{ fontSize: 12, color: "var(--text-2)", marginTop: 12, lineHeight: 1.7 }}>
              <strong style={{ color: "var(--teal)" }}>Known conditions:</strong><br />
              {order.patientConditions}
            </div>
          </div>

          <div className="ord-info-block" style={{ marginTop: 20 }}>
            <h3 className="oib-title">Physician's <em>Prescription</em></h3>
            <div className="info-row">
              <span className="info-row-label">Drip</span>
              <span className="info-row-val">{order.dripName}</span>
            </div>
            <div className="info-row">
              <span className="info-row-label">Physician</span>
              <span className="info-row-val">{order.doctorName}</span>
            </div>
            <div className="info-row">
              <span className="info-row-label">Total volume</span>
              <span className="info-row-val">{order.totalVolumeMl} ml</span>
            </div>
            <div className="info-row">
              <span className="info-row-label">Infusion rate</span>
              <span className="info-row-val">{order.infusionRateMlPerHr} ml/hr</span>
            </div>

            <h4 style={{ fontSize: 12, fontWeight: 600, color: "var(--text-2)", marginTop: 14, marginBottom: 8, letterSpacing: 0.3, textTransform: "uppercase" }}>Ingredients</h4>
            <div className="protocol-grid">
              {order.protocolIngredients.map((ing) => (
                <div key={ing.name} className="proto-row">
                  <span className="proto-ing">{ing.name}</span>
                  <span className="proto-dose">{ing.dose}</span>
                </div>
              ))}
            </div>

            <div className="doctor-notes-box">
              <strong>📝 Doctor's notes:</strong><br />
              {order.doctorNotes}
            </div>
          </div>
        </div>

        <div>
          <div className="ord-info-block" style={{ position: "sticky", top: 100 }}>
            <h3 className="oib-title">Progress</h3>
            <div style={{ fontSize: 32, fontWeight: 600, color: "var(--teal)", letterSpacing: -1, marginBottom: 4 }}>
              {progress}%
            </div>
            <div style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 14 }}>
              {completedSteps.length} of {INFUSION_CHECKLIST.length} steps complete
            </div>
            <div style={{ height: 8, background: "rgba(91,184,245,0.15)", borderRadius: 50, overflow: "hidden" }}>
              <div style={{
                height: "100%", borderRadius: 50,
                background: "linear-gradient(90deg,var(--teal),var(--sky))",
                width: `${progress}%`, transition: "width .5s",
              }} />
            </div>

            <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 16, lineHeight: 1.7 }}>
              <div style={{ marginBottom: 6 }}>
                Consent: {consentSigned ? "✓" : "✗ Required"}
              </div>
              <div style={{ marginBottom: 6 }}>
                History: {historyTaken ? "✓" : "✗ Required"}
              </div>
              <div style={{ marginBottom: 6 }}>
                Vitals: {vitals.bpSystolic ? "✓" : "✗ Required"}
              </div>
              <div>
                Mandatory steps: {completedSteps.filter((id) => mandatorySteps.some((s) => s.id === id)).length} / {mandatorySteps.length}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="panel">
        <h3 className="oib-title">1. Informed <em>Consent Form</em></h3>
        <div className={`consent-card${consentSigned ? " signed" : ""}`}>
          <div className="consent-body">
            <strong>I, {order.patientName}, hereby consent to receiving IV therapy with the following understanding:</strong>
            <ul>
              <li>The treatment is <strong>{order.dripName}</strong> — containing: {order.protocolIngredients.map((i) => i.name).join(", ")}</li>
              <li>The procedure involves insertion of an IV cannula, infusion of pharmaceutical-grade nutrients over approximately {Math.round(order.totalVolumeMl / order.infusionRateMlPerHr * 60)} minutes.</li>
              <li>Known possible side effects include: mild flushing, warmth, metallic taste, nausea, dizziness, vein irritation at the cannula site. Rare serious reactions include allergic/anaphylactic response.</li>
              <li>I confirm I have disclosed all my known allergies, current medications, and medical conditions to the attending nurse.</li>
              <li>I understand this is an elective wellness treatment and not a substitute for conventional medical care for active illness.</li>
              <li>I have had the opportunity to ask questions, and they have been answered to my satisfaction.</li>
              <li>I may withdraw consent and stop the infusion at any time.</li>
            </ul>
          </div>
          {consentSigned ? (
            <div className="consent-signature" style={{ background: "#F0FBF9", borderColor: "#0A7B6E" }}>
              <div style={{ fontSize: 12, color: "#0A7B6E", fontWeight: 600 }}>✓ Consent signed by {signatureName || order.patientName}</div>
              <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 4 }}>Signed: {new Date().toLocaleString("en-IN")}</div>
            </div>
          ) : (
            <div className="consent-signature">
              <label style={{ fontSize: 11, color: "var(--text-2)", marginBottom: 6, display: "block" }}>PATIENT SIGNATURE (type full name to sign)</label>
              <input type="text" className="consent-sig-input"
                value={signatureName}
                onChange={(e) => setSignatureName(e.target.value)}
                placeholder={order.patientName} />

              {/* Fingerprint verification */}
              <div style={{ marginTop: 14, marginBottom: 4 }}>
                <label style={{ fontSize: 11, color: "var(--text-2)", fontWeight: 600, letterSpacing: 0.3, display: "block", marginBottom: 10 }}>
                  STEP 2 — PATIENT FINGERPRINT VERIFICATION (required)
                </label>
                {fpStep === "done" ? (
                  <div style={{
                    padding: "12px 16px", borderRadius: "var(--radius-sm)",
                    background: "#F0FBF4", border: "1.5px solid #16A34A",
                    display: "flex", alignItems: "center", gap: 10, fontSize: 13,
                    color: "#16A34A", fontWeight: 600,
                  }}>
                    <span style={{ fontSize: 20 }}>✅</span>
                    Fingerprint captured &amp; verified · {new Date().toLocaleTimeString("en-IN")}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={startFpScan}
                    disabled={fpStep === "scanning"}
                    style={{
                      width: "100%", padding: "18px 0", borderRadius: "var(--radius-sm)",
                      border: `2px dashed ${fpStep === "scanning" ? "var(--teal)" : "var(--border)"}`,
                      background: fpStep === "scanning" ? "var(--sky-pale)" : "var(--off-white)",
                      cursor: fpStep === "scanning" ? "not-allowed" : "pointer",
                      display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                      transition: "all .2s",
                    }}
                  >
                    <span style={{ fontSize: 36, position: "relative" }}>
                      👆
                      {fpStep === "scanning" && (
                        <span style={{
                          position: "absolute", inset: -6, borderRadius: "50%",
                          border: "2px solid var(--teal)",
                          animation: "fp-ring 1s ease-out infinite",
                        }} />
                      )}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: fpStep === "scanning" ? "var(--teal)" : "var(--text-2)" }}>
                      {fpStep === "scanning" ? "Scanning fingerprint… hold still" : "Tap to scan patient fingerprint"}
                    </span>
                    <span style={{ fontSize: 11, color: "var(--text-3)" }}>
                      {fpStep === "scanning" ? "Do not lift finger" : "Patient places index finger on reader"}
                    </span>
                  </button>
                )}
              </div>
              <style>{`@keyframes fp-ring{0%{transform:scale(1);opacity:.8;}100%{transform:scale(1.7);opacity:0;}}`}</style>

              <button className="consent-confirm-btn" onClick={signConsent}
                disabled={!signatureName.trim() || fpStep !== "done"}>
                Sign &amp; Submit Consent →
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="panel">
        <h3 className="oib-title">2. Patient <em>History Taking</em></h3>
        <p style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 16, lineHeight: 1.6 }}>
          Verify and update the patient's history verbally. All fields are required before starting infusion.
        </p>

        <div className="history-form">
          <div className="hf-field">
            <label className="hf-label">LAST MEAL (time + content)</label>
            <input className="hf-input" value={history.lastMeal}
              onChange={(e) => setHistory({ ...history, lastMeal: e.target.value })}
              placeholder="e.g. 10:30 AM, light breakfast" disabled={historyTaken} />
          </div>
          <div className="hf-field">
            <label className="hf-label">PREGNANCY STATUS (if applicable)</label>
            <select className="hf-input" value={history.pregnancyStatus}
              onChange={(e) => setHistory({ ...history, pregnancyStatus: e.target.value })} disabled={historyTaken}>
              <option value="">Select...</option>
              <option value="na">Not applicable (male / postmenopausal)</option>
              <option value="no">No, not pregnant</option>
              <option value="possibly">Possibly — needs confirmation</option>
              <option value="yes">Yes — STOP, consult doctor</option>
            </select>
          </div>
          <div className="hf-field">
            <label className="hf-label">PRIOR IV THERAPY EXPERIENCE</label>
            <select className="hf-input" value={history.priorIVExperience}
              onChange={(e) => setHistory({ ...history, priorIVExperience: e.target.value })} disabled={historyTaken}>
              <option value="">Select...</option>
              <option value="first">First time IV therapy</option>
              <option value="few">Had 1–5 sessions before</option>
              <option value="many">Experienced (5+ sessions)</option>
              <option value="reaction">Had adverse reaction before — STOP and review</option>
            </select>
          </div>
          <div className="hf-field">
            <label className="hf-label">CURRENT SYMPTOMS / COMPLAINTS TODAY</label>
            <input className="hf-input" value={history.currentSymptoms}
              onChange={(e) => setHistory({ ...history, currentSymptoms: e.target.value })}
              placeholder="e.g. Feeling normal, mild fatigue" disabled={historyTaken} />
          </div>
          <div className="hf-field">
            <label className="hf-label">CONFIRMED ALLERGIES (re-verify)</label>
            <textarea className="hf-input hf-textarea" rows={2} value={history.confirmedAllergies}
              onChange={(e) => setHistory({ ...history, confirmedAllergies: e.target.value })}
              placeholder={order.patientAllergies} disabled={historyTaken} />
          </div>
          <div className="hf-field">
            <label className="hf-label">CURRENT MEDICATIONS (re-confirm)</label>
            <textarea className="hf-input hf-textarea" rows={2} value={history.currentMedicationsReconfirm}
              onChange={(e) => setHistory({ ...history, currentMedicationsReconfirm: e.target.value })}
              placeholder="List any medications taken in last 24 hours" disabled={historyTaken} />
          </div>
        </div>

        {historyTaken ? (
          <div style={{ marginTop: 14, fontSize: 12, color: "#0A7B6E", fontWeight: 600 }}>
            ✓ Patient history recorded and verified
          </div>
        ) : (
          <button className="consent-confirm-btn" style={{ marginTop: 16 }} onClick={confirmHistory}>
            Confirm History Taken →
          </button>
        )}
      </div>

      <div className="panel">
        <h3 className="oib-title">3. Baseline <em>Vital Signs</em></h3>
        <p style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 10, lineHeight: 1.6 }}>
          Required before starting infusion. Abort if outside safe ranges (BP &gt;180/110, HR &gt;120, SpO₂ &lt;92%, Temp &gt;38°C).
        </p>
        <div className="vitals-grid">
          <div className="vt-field">
            <div className="vt-label">BP SYSTOLIC</div>
            <input className="vt-input" type="number" value={vitals.bpSystolic}
              onChange={(e) => setVitals({ ...vitals, bpSystolic: e.target.value })} placeholder="120" />
            <span className="vt-unit">mmHg</span>
          </div>
          <div className="vt-field">
            <div className="vt-label">BP DIASTOLIC</div>
            <input className="vt-input" type="number" value={vitals.bpDiastolic}
              onChange={(e) => setVitals({ ...vitals, bpDiastolic: e.target.value })} placeholder="80" />
            <span className="vt-unit">mmHg</span>
          </div>
          <div className="vt-field">
            <div className="vt-label">HEART RATE</div>
            <input className="vt-input" type="number" value={vitals.heartRate}
              onChange={(e) => setVitals({ ...vitals, heartRate: e.target.value })} placeholder="72" />
            <span className="vt-unit">bpm</span>
          </div>
          <div className="vt-field">
            <div className="vt-label">TEMPERATURE</div>
            <input className="vt-input" type="number" step="0.1" value={vitals.temperature}
              onChange={(e) => setVitals({ ...vitals, temperature: e.target.value })} placeholder="36.8" />
            <span className="vt-unit">°C</span>
          </div>
          <div className="vt-field">
            <div className="vt-label">SpO₂</div>
            <input className="vt-input" type="number" value={vitals.spo2}
              onChange={(e) => setVitals({ ...vitals, spo2: e.target.value })} placeholder="98" />
            <span className="vt-unit">%</span>
          </div>
          <div className="vt-field">
            <div className="vt-label">WEIGHT</div>
            <input className="vt-input" type="number" step="0.1" value={vitals.weight}
              onChange={(e) => setVitals({ ...vitals, weight: e.target.value })} placeholder="70" />
            <span className="vt-unit">kg</span>
          </div>
        </div>
      </div>

      <div className="panel">
        <h3 className="oib-title">4. Step-wise <em>Infusion Checklist</em></h3>
        <p style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 20, lineHeight: 1.6 }}>
          Each step must be completed in sequence. All mandatory steps are required before the order can be closed.
        </p>

        {/* ── PATIENT PREP ── */}
        <div className="phase-section">
          <div className="phase-header">
            <div className="phase-icon">🟦</div>
            <div className="phase-title">Patient <em>Preparation</em></div>
            <div className="phase-count">{completedSteps.filter((id) => patientPrepSteps.some((s) => s.id === id)).length} / {patientPrepSteps.length}</div>
          </div>
          {patientPrepSteps.map((step) => {
            const done = completedSteps.includes(step.id);
            return (
              <div key={step.id} className={`step-card${done ? " done" : ""}`}>
                <button
                  type="button"
                  className="step-checkbox"
                  onClick={() => toggleStep(step.id)}
                  aria-label={`Toggle ${step.label}`}
                >
                  {done && <span style={{ fontSize: 14 }}>✓</span>}
                </button>
                <div className="step-body">
                  <div>
                    <span className="step-label">{step.label}</span>
                    {step.mandatory && <span className="step-mandatory">REQUIRED</span>}
                  </div>
                  <div className="step-desc">{step.description}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── DRIP PREPARATION — CRITICAL SAFETY PHASE ── */}
        <div style={{
          padding: "24px 22px",
          borderRadius: "var(--radius)",
          background: "linear-gradient(135deg, #FFF4E6 0%, #FEF3C7 50%, #FFE4BD 100%)",
          border: "2px solid #D97706",
          marginBottom: 28,
          position: "relative",
          boxShadow: "0 8px 32px rgba(217,119,6,0.15)",
        }}>
          <div style={{
            position: "absolute", top: -12, left: 20,
            background: "#D97706", color: "#fff",
            padding: "3px 12px", borderRadius: 50,
            fontSize: 10, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase",
          }}>
            ⚠ Critical Safety Phase
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 10, marginTop: 6 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: "rgba(217,119,6,0.18)", display: "flex",
              alignItems: "center", justifyContent: "center", fontSize: 24,
            }}>
              💊
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: "#7C3E0A", letterSpacing: "-0.3px", marginBottom: 2 }}>
                Drip Preparation
              </h3>
              <p style={{ fontSize: 12, color: "#7C3E0A", opacity: 0.85, lineHeight: 1.5 }}>
                The most important phase — dose errors here are the #1 cause of IV medication incidents. Every step mandatory. No shortcuts.
              </p>
            </div>
            <div style={{
              fontSize: 13, fontWeight: 600, color: "#7C3E0A",
              background: "rgba(255,255,255,0.5)", padding: "6px 12px", borderRadius: 50,
            }}>
              {completedSteps.filter((id) => prepSteps.some((s) => s.id === id)).length} / {prepSteps.length}
            </div>
          </div>

          <div style={{
            padding: "10px 14px",
            background: "rgba(255,255,255,0.55)",
            borderRadius: 8, marginBottom: 14,
            fontSize: 11, color: "#7C3E0A", lineHeight: 1.65,
            borderLeft: "3px solid #D97706",
          }}>
            <strong>The 5 Rights:</strong> Right Drug · Right Dose · Right Patient · Right Route · Right Time.
            Apply every time, for every ingredient. If you are unsure at any point — stop and call the prescribing physician.
          </div>

          {/* ── DRIP-SPECIFIC MIXING PROTOCOL ── */}
          <div style={{
            background: "rgba(255,255,255,0.85)",
            borderRadius: 12,
            padding: "16px 18px",
            marginBottom: 20,
            border: "1.5px solid rgba(217,119,6,0.3)",
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#7C3E0A", marginBottom: 12, letterSpacing: -0.2 }}>
              Mixing Protocol for {order.dripName} — follow in order
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {order.mixingProtocol.map((step) => {
                const methodStyles: Record<string, { label: string; bg: string; color: string; border: string }> = {
                  "add-to-bag":   { label: "ADD TO BAG",     bg: "rgba(26,126,168,0.12)",  color: "#0F5C7D",  border: "#1A7EA8" },
                  "mix-final":    { label: "ADD LAST",       bg: "rgba(217,119,6,0.18)",   color: "#7C3E0A",  border: "#D97706" },
                  "iv-push":      { label: "IV PUSH (sep.)", bg: "rgba(196,113,245,0.18)", color: "#5B2185",  border: "#9E4AE0" },
                  "im-separate":  { label: "IM (separate)",  bg: "rgba(212,44,44,0.15)",   color: "#8B1F1F",  border: "#D42C2C" },
                };
                const m = methodStyles[step.method];
                return (
                  <div key={step.order} style={{
                    display: "grid",
                    gridTemplateColumns: "32px 1fr",
                    gap: 12,
                    padding: "12px 14px",
                    background: "#fff",
                    borderRadius: 10,
                    border: `1.5px solid ${m.border}`,
                    borderLeftWidth: 4,
                    alignItems: "start",
                  }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: "50%",
                      background: m.border, color: "#fff",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 12, fontWeight: 700, flexShrink: 0,
                    }}>
                      {step.order}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>
                          {step.drug}
                        </span>
                        <span style={{
                          fontSize: 10, fontWeight: 700, padding: "2px 10px",
                          borderRadius: 50, background: m.bg, color: m.color,
                          letterSpacing: 0.5,
                        }}>
                          {m.label}
                        </span>
                      </div>
                      {step.dose !== "—" && (
                        <div style={{ fontSize: 12, color: "var(--text-2)", marginBottom: 3 }}>
                          <strong>Dose:</strong> {step.dose}
                        </div>
                      )}
                      <div style={{ fontSize: 12, color: "var(--text-2)", marginBottom: 3 }}>
                        <strong>Rate / Timing:</strong> {step.rate}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-3)", lineHeight: 1.55, marginTop: 4 }}>
                        {step.notes}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div style={{
              marginTop: 14, paddingTop: 12,
              borderTop: "1px dashed rgba(217,119,6,0.3)",
              display: "flex", gap: 16, flexWrap: "wrap",
              fontSize: 10, color: "var(--text-3)",
            }}>
              <span><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 3, background: "#1A7EA8", verticalAlign: "middle", marginRight: 4 }}></span> ADD TO BAG — main IV bag</span>
              <span><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 3, background: "#D97706", verticalAlign: "middle", marginRight: 4 }}></span> ADD LAST — oxidation-sensitive</span>
              <span><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 3, background: "#9E4AE0", verticalAlign: "middle", marginRight: 4 }}></span> IV PUSH — separate push</span>
              <span><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 3, background: "#D42C2C", verticalAlign: "middle", marginRight: 4 }}></span> IM — intramuscular</span>
            </div>
          </div>

          <div style={{
            fontSize: 11, color: "#7C3E0A",
            marginBottom: 14, fontWeight: 600, letterSpacing: 0.3,
            textTransform: "uppercase",
          }}>
            Core safety checks:
          </div>

          {prepSteps.map((step, idx) => {
            const done = completedSteps.includes(step.id);
            return (
              <div key={step.id} className={`step-card${done ? " done" : ""}`} style={{
                background: done ? "#E5F5F3" : "rgba(255,255,255,0.75)",
                borderColor: done ? "#0A7B6E" : "#F59E0B",
              }}>
                <button
                  type="button"
                  className="step-checkbox"
                  onClick={() => toggleStep(step.id)}
                  aria-label={`Toggle ${step.label}`}
                  style={done ? {} : { borderColor: "#D97706" }}
                >
                  {done && <span style={{ fontSize: 14 }}>✓</span>}
                </button>
                <div className="step-body">
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{
                      fontSize: 10, fontWeight: 700, color: "#fff",
                      background: "#D97706", padding: "2px 8px", borderRadius: 50,
                      letterSpacing: 0.5,
                    }}>
                      STEP {idx + 1}
                    </span>
                    <span className="step-label">{step.label}</span>
                    {step.mandatory && (
                      <span className="step-mandatory" style={{ background: "#D97706", color: "#fff" }}>
                        MANDATORY
                      </span>
                    )}
                  </div>
                  <div className="step-desc" style={{ marginTop: 6, color: "#5A3400" }}>
                    {step.description}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── CANNULATION ── */}
        <div className="phase-section">
          <div className="phase-header">
            <div className="phase-icon" style={{ background: "rgba(91,184,245,0.2)" }}>💉</div>
            <div className="phase-title">Cannulation &amp; Site <em>Setup</em></div>
            <div className="phase-count">{completedSteps.filter((id) => cannulationSteps.some((s) => s.id === id)).length} / {cannulationSteps.length}</div>
          </div>
          {cannulationSteps.map((step) => {
            const done = completedSteps.includes(step.id);
            return (
              <div key={step.id} className={`step-card${done ? " done" : ""}`}>
                <button
                  type="button"
                  className="step-checkbox"
                  onClick={() => toggleStep(step.id)}
                  aria-label={`Toggle ${step.label}`}
                >
                  {done && <span style={{ fontSize: 14 }}>✓</span>}
                </button>
                <div className="step-body">
                  <div>
                    <span className="step-label">{step.label}</span>
                    {step.mandatory && <span className="step-mandatory">REQUIRED</span>}
                  </div>
                  <div className="step-desc">{step.description}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="phase-section">
          <div className="phase-header">
            <div className="phase-icon" style={{ background: "rgba(217,119,6,0.15)" }}>🟡</div>
            <div className="phase-title">During <em>Infusion</em></div>
            <div className="phase-count">{completedSteps.filter((id) => duringSteps.some((s) => s.id === id)).length} / {duringSteps.length}</div>
          </div>
          {duringSteps.map((step) => {
            const done = completedSteps.includes(step.id);
            return (
              <div key={step.id} className={`step-card${done ? " done" : ""}`}>
                <button
                  type="button"
                  className="step-checkbox"
                  onClick={() => toggleStep(step.id)}
                  aria-label={`Toggle ${step.label}`}
                >
                  {done && <span style={{ fontSize: 14 }}>✓</span>}
                </button>
                <div className="step-body">
                  <div>
                    <span className="step-label">{step.label}</span>
                    {step.mandatory && <span className="step-mandatory">REQUIRED</span>}
                  </div>
                  <div className="step-desc">{step.description}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="phase-section">
          <div className="phase-header">
            <div className="phase-icon" style={{ background: "rgba(10,123,110,0.15)" }}>🟢</div>
            <div className="phase-title">Post-Infusion <em>Phase</em></div>
            <div className="phase-count">{completedSteps.filter((id) => postSteps.some((s) => s.id === id)).length} / {postSteps.length}</div>
          </div>
          {postSteps.map((step) => {
            const done = completedSteps.includes(step.id);
            return (
              <div key={step.id} className={`step-card${done ? " done" : ""}`}>
                <button
                  type="button"
                  className="step-checkbox"
                  onClick={() => toggleStep(step.id)}
                  aria-label={`Toggle ${step.label}`}
                >
                  {done && <span style={{ fontSize: 14 }}>✓</span>}
                </button>
                <div className="step-body">
                  <div>
                    <span className="step-label">{step.label}</span>
                    {step.mandatory && <span className="step-mandatory">REQUIRED</span>}
                  </div>
                  <div className="step-desc">{step.description}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="panel">
        <h3 className="oib-title">5. Session <em>Notes</em> &amp; Close Order</h3>
        <p style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 10, lineHeight: 1.6 }}>
          Document the session — cannulation site, any reactions, patient's subjective response, any deviations from the protocol.
        </p>
        <textarea
          className="hf-input hf-textarea" rows={4} value={finalNotes}
          onChange={(e) => setFinalNotes(e.target.value)}
          placeholder="e.g. Right antecubital, 22G cannula, single attempt. Patient tolerated infusion well, no adverse reactions. Discharged at 11:45 AM with post-care instructions."
          style={{ width: "100%" }}
        />

        <div className={`close-order-bar${!allMandatoryDone || orderClosed ? " locked" : ""}`} style={{ marginTop: 20 }}>
          {orderClosed ? (
            <>
              <div className="cob-title">✓ Order Closed Successfully</div>
              <div className="cob-sub">Patient record updated. Physician notified via secure clinical notification. Session will appear in patient's history and your completed log.</div>
              <Link href="/dashboard/nurse" className="noc-open-btn" style={{ textDecoration: "none" }}>
                Back to Dashboard →
              </Link>
            </>
          ) : allMandatoryDone ? (
            <>
              <div className="cob-title">✓ All mandatory steps complete — ready to close</div>
              <div className="cob-sub">Review your notes above. Once closed, the order cannot be modified. Emergency contact remains available post-closure for 24 hours.</div>
              <button className="cob-btn" onClick={closeOrder}>Close Order & Submit →</button>
            </>
          ) : (
            <>
              <div className="cob-title">🔒 Order cannot be closed yet</div>
              <div className="cob-sub">
                <div className="cob-locked-text" style={{ marginBottom: 6 }}>
                  {mandatorySteps.length - completedSteps.filter((id) => mandatorySteps.some((s) => s.id === id)).length} mandatory steps remaining.
                </div>
                {!consentSigned && <div style={{ color: "#D97706" }}>→ Informed consent not yet signed</div>}
                {!historyTaken && <div style={{ color: "#D97706" }}>→ History form not completed</div>}
                {!vitals.bpSystolic && <div style={{ color: "#D97706" }}>→ Baseline vitals not recorded</div>}
                {consentSigned && historyTaken && vitals.bpSystolic && <div style={{ color: "var(--text-3)" }}>→ Continue ticking off the checklist steps above</div>}
              </div>
            </>
          )}
        </div>
      </div>
    </DashLayout>
  );
}
