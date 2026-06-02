"use client";
import { useState, useEffect } from "react";

type SessionStatus = "scheduled" | "nurse_en_route" | "arrived" | "drip_started" | "completed";
type BiometricStep = "idle" | "scanning" | "done";

const NURSE = {
  name: "RN Kavitha Nair",
  phone: "+91 98400 12345",
  rating: 4.9,
  sessions: 312,
  certifications: "PICU · Oncology IV",
};

const DRIP = {
  name: "Velocity Performance",
  tagline: "Engineered for peak athletic output and accelerated recovery",
  duration: "45–60 min",
  description:
    "A high-performance IV formula combining B-complex vitamins, minerals, and amino acids to maximise your performance window, shorten recovery time, and sharpen mental focus.",
  ingredients: [
    { name: "Vitamin B12", dose: "1000 mcg", benefit: "Energy metabolism & nerve conduction" },
    { name: "Magnesium", dose: "800 mg", benefit: "Muscle relaxation & sleep quality" },
    { name: "Vitamin C", dose: "5000 mg", benefit: "Antioxidant defence & collagen synthesis" },
    { name: "B-Complex", dose: "Full spectrum", benefit: "Cellular energy pathways & CNS support" },
    { name: "Zinc", dose: "10 mg", benefit: "Immune defence & hormonal balance" },
    { name: "L-Carnitine", dose: "500 mg", benefit: "Fat metabolism & endurance substrate" },
  ],
  benefits: [
    "Boosts endurance & VO₂ max within 24 hours",
    "Reduces DOMS (muscle soreness) by up to 40%",
    "Replenishes electrolytes depleted by intense training",
    "Supports anabolic recovery pathways",
    "Sharpens mental focus and reduces training fatigue",
  ],
  vitamins: {
    "Vitamin B12":
      "Cobalamin drives DNA synthesis, red blood cell formation, and neurological function. IV delivery achieves ~100% bioavailability vs ~1% from oral supplements.",
    "Magnesium":
      "Involved in 300+ enzymatic reactions — muscle contraction, protein synthesis, and nervous system regulation. Most athletes are chronically deficient.",
    "Vitamin C":
      "Neutralises free radicals generated during intense exercise. Essential for collagen production and immune modulation. High-dose IV bypasses GI absorption limits.",
    "B-Complex":
      "The full B-vitamin spectrum (B1–B9) drives the Krebs cycle, supports neurotransmitter synthesis, and converts macronutrients into usable ATP.",
    "Zinc":
      "Critical for 100+ enzymatic reactions. Supports testosterone production, wound healing, and immune function — particularly after strenuous training.",
    "L-Carnitine":
      "Transports long-chain fatty acids into the mitochondrial matrix for beta-oxidation, improving fat metabolism efficiency and sparing glycogen stores.",
  },
};

const PRE_DRIP = [
  "Drink 500 ml of water 1–2 hours before your session",
  "Eat a light meal at least 1 hour before (avoid heavy or fatty food)",
  "Wear comfortable clothing with easy upper-arm access",
  "Avoid alcohol and caffeine for 4 hours prior",
  "Inform the nurse of any new medications or symptoms since booking",
  "Arrive well-rested — avoid intense exercise 2 hours before",
];

const STATUS_STEPS: { key: SessionStatus; label: string; icon: string }[] = [
  { key: "scheduled", label: "Confirmed", icon: "✅" },
  { key: "nurse_en_route", label: "Nurse En Route", icon: "🚗" },
  { key: "arrived", label: "Arrived", icon: "📍" },
  { key: "drip_started", label: "Drip Started", icon: "💉" },
  { key: "completed", label: "Session Done", icon: "🏁" },
];

const OUTCOMES = [
  { label: "Energy Boost", score: 88, color: "#1A7EA8" },
  { label: "Recovery Speed", score: 92, color: "#16A34A" },
  { label: "Mental Clarity", score: 81, color: "#9333EA" },
  { label: "Muscle Soreness Relief", score: 75, color: "#D97706" },
];

const US_CSS = `
  .us-status-track {
    display:flex;align-items:center;overflow-x:auto;padding:4px 0 16px;gap:0;
  }
  .us-status-step {
    display:flex;flex-direction:column;align-items:center;gap:6px;
    min-width:72px;position:relative;flex:1;
  }
  .us-status-step:not(:last-child)::after {
    content:'';position:absolute;top:17px;left:calc(50% + 20px);
    width:calc(100% - 40px);height:2px;background:var(--border);z-index:0;
  }
  .us-status-step.us-done:not(:last-child)::after { background:var(--teal); }
  .us-status-icon {
    width:34px;height:34px;border-radius:50%;border:2px solid var(--border);
    display:flex;align-items:center;justify-content:center;
    font-size:14px;background:var(--white);position:relative;z-index:1;
  }
  .us-status-step.us-done .us-status-icon { border-color:var(--teal);background:var(--sky-pale);color:var(--teal);font-weight:700; }
  .us-status-step.us-active .us-status-icon {
    border-color:var(--teal);background:var(--teal);color:#fff;font-size:10px;font-weight:700;
    box-shadow:0 0 0 5px rgba(11,158,200,0.15);
    animation:us-pulse-ring 1.8s ease-in-out infinite;
  }
  @keyframes us-pulse-ring{0%,100%{box-shadow:0 0 0 5px rgba(11,158,200,0.15);}50%{box-shadow:0 0 0 10px rgba(11,158,200,0.04);}}
  .us-step-label{font-size:9px;color:var(--text-3);text-align:center;font-weight:500;line-height:1.3;}
  .us-status-step.us-done .us-step-label,.us-status-step.us-active .us-step-label{color:var(--teal);font-weight:700;}

  .us-eta-bar{
    display:flex;align-items:center;gap:14px;padding:16px 20px;
    background:linear-gradient(135deg,#EBF8FF,#DCFCE7);
    border:1.5px solid var(--teal);border-radius:var(--radius-sm);
    margin-bottom:16px;flex-wrap:wrap;
  }
  .us-eta-min{font-size:22px;font-weight:700;color:var(--teal);letter-spacing:-0.5px;}
  .us-eta-lbl{font-size:12px;color:var(--text-2);margin-top:2px;}
  .us-eta-track{flex:2;min-width:140px;}
  .us-eta-bg{height:6px;background:rgba(11,158,200,0.12);border-radius:50px;}
  .us-eta-fill{height:100%;border-radius:50px;background:linear-gradient(90deg,var(--teal),var(--sky));transition:width .8s;}

  .us-ing-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px;margin-top:12px;}
  .us-ing-card{padding:12px 14px;border-radius:var(--radius-sm);border:1.5px solid var(--border);background:var(--off-white);}
  .us-ing-name{font-size:13px;font-weight:600;color:var(--teal);margin-bottom:2px;}
  .us-ing-dose{font-size:10px;color:var(--text-3);margin-bottom:4px;}
  .us-ing-benefit{font-size:11px;color:var(--text-2);line-height:1.5;}

  .us-vit-item{
    padding:13px 16px;border-radius:var(--radius-sm);
    border:1.5px solid var(--border);background:var(--white);
    margin-bottom:8px;cursor:pointer;transition:border-color .15s;
  }
  .us-vit-item:hover{border-color:var(--sky);}
  .us-vit-hd{display:flex;justify-content:space-between;align-items:center;}
  .us-vit-nm{font-size:13px;font-weight:600;color:var(--text);}
  .us-vit-body{font-size:12px;color:var(--text-2);line-height:1.65;margin-top:10px;padding-top:10px;border-top:1px solid var(--border);}

  .us-nurse-card{
    display:flex;gap:16px;align-items:center;flex-wrap:wrap;
    padding:18px 20px;border-radius:var(--radius-sm);
    background:linear-gradient(135deg,var(--sky-bg),var(--sky-pale));
    border:1.5px solid rgba(11,158,200,0.2);
  }
  .us-nurse-avatar{
    width:52px;height:52px;border-radius:50%;background:var(--teal);
    color:#fff;font-size:22px;display:flex;align-items:center;justify-content:center;
    flex-shrink:0;box-shadow:0 4px 14px rgba(11,158,200,0.3);
  }
  .us-nurse-name{font-size:15px;font-weight:600;color:var(--text);margin-bottom:2px;}
  .us-nurse-meta{font-size:11px;color:var(--text-3);margin-bottom:8px;}
  .us-nurse-btns{display:flex;gap:8px;flex-wrap:wrap;}
  .us-call-btn{
    padding:8px 18px;border-radius:50px;border:none;
    background:var(--teal);color:#fff;font-size:12px;font-weight:600;
    font-family:var(--font-display);cursor:pointer;text-decoration:none;
    display:inline-block;transition:transform .15s;
  }
  .us-call-btn:hover{transform:translateY(-1px);}
  .us-msg-btn{
    padding:8px 18px;border-radius:50px;border:1.5px solid var(--teal);
    color:var(--teal);background:var(--white);font-size:12px;font-weight:600;
    font-family:var(--font-display);cursor:pointer;transition:transform .15s;
  }
  .us-msg-btn:hover{transform:translateY(-1px);}

  .us-bio-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
  @media(max-width:480px){.us-bio-grid{grid-template-columns:1fr;}}
  .us-bio-box{
    padding:22px 16px;border-radius:var(--radius-sm);
    border:2px dashed var(--border);background:var(--off-white);
    display:flex;flex-direction:column;align-items:center;gap:8px;
    text-align:center;cursor:pointer;transition:all .2s;position:relative;overflow:hidden;
  }
  .us-bio-box:hover:not(.us-bio-done){border-color:var(--teal);background:var(--sky-pale);}
  .us-bio-box.us-bio-done{border:2px solid #16A34A;background:#F0FBF4;cursor:default;}
  .us-bio-box.us-bio-disabled{opacity:0.45;cursor:not-allowed;}
  .us-bio-emoji{font-size:38px;position:relative;display:inline-block;}
  .us-scan-ring{
    position:absolute;inset:-6px;border-radius:50%;border:2px solid var(--teal);
    animation:us-sring 1s ease-out infinite;
  }
  @keyframes us-sring{0%{transform:scale(1);opacity:0.8;}100%{transform:scale(1.6);opacity:0;}}
  .us-scan-sweep{
    position:absolute;bottom:0;left:0;right:0;height:3px;
    background:linear-gradient(90deg,transparent,var(--teal),transparent);
    animation:us-sweep 0.9s linear infinite;
  }
  @keyframes us-sweep{0%{top:0;}100%{top:100%;}}
  .us-bio-lbl{font-size:13px;font-weight:600;color:var(--text-2);}
  .us-bio-sub{font-size:11px;color:var(--text-3);line-height:1.45;}

  .us-star{font-size:26px;cursor:pointer;color:#D1D5DB;transition:transform .1s;line-height:1;}
  .us-star.us-lit{color:#F59E0B;}
  .us-star:hover{transform:scale(1.2);}
  .us-stars-row{display:flex;gap:5px;margin-top:6px;margin-bottom:14px;}
  .us-fb-label{font-size:11px;color:var(--text-2);font-weight:600;letter-spacing:0.3px;display:block;margin-bottom:4px;}

  .us-cancel-btn{
    padding:9px 20px;border-radius:50px;border:1.5px solid #D42C2C;
    color:#D42C2C;background:var(--white);font-size:12px;font-weight:600;
    font-family:var(--font-display);cursor:pointer;transition:all .15s;
  }
  .us-cancel-btn:hover{background:#FBE7E7;}
  .us-resched-btn{
    padding:9px 20px;border-radius:50px;border:1.5px solid var(--teal);
    color:var(--teal);background:var(--white);font-size:12px;font-weight:600;
    font-family:var(--font-display);cursor:pointer;transition:all .15s;
  }
  .us-resched-btn:hover{background:var(--sky-pale);}

  .us-modal-ov{position:fixed;inset:0;z-index:500;background:rgba(0,0,0,0.55);display:flex;align-items:flex-end;justify-content:center;}
  @media(min-width:560px){.us-modal-ov{align-items:center;}}
  .us-modal{
    width:100%;max-width:480px;background:var(--white);
    border-radius:var(--radius) var(--radius) 0 0;padding:28px 22px 40px;
  }
  @media(min-width:560px){.us-modal{border-radius:var(--radius);padding:28px 24px;}}
  .us-modal-title{font-size:17px;font-weight:600;color:var(--text);margin-bottom:6px;}
  .us-modal-sub{font-size:12px;color:var(--text-3);line-height:1.6;margin-bottom:16px;}
  .us-pol-row{display:flex;justify-content:space-between;align-items:center;padding:11px 0;border-bottom:1px solid var(--border);font-size:13px;}
  .us-pol-row:last-of-type{border-bottom:none;}
  .us-badge-free{display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:50px;background:#DCFCE7;color:#16A34A;font-size:11px;font-weight:600;}
  .us-badge-fee{display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:50px;background:#FEF3C7;color:#D97706;font-size:11px;font-weight:600;}
  .us-modal-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:20px;}
  .us-keep-btn{flex:1;padding:12px;border-radius:50px;border:1.5px solid var(--border);color:var(--text);background:var(--white);font-size:13px;font-weight:600;font-family:var(--font-display);cursor:pointer;}
  .us-confirm-cancel-btn{flex:1;padding:12px;border-radius:50px;border:none;background:#D42C2C;color:#fff;font-size:13px;font-weight:600;font-family:var(--font-display);cursor:pointer;}

  .us-outcome-bg{height:8px;background:rgba(0,0,0,0.07);border-radius:50px;margin-top:5px;}
  .us-outcome-fill{height:100%;border-radius:50px;transition:width .9s ease;}

  .us-demo-controls{
    padding:12px 16px;border-radius:var(--radius-sm);
    background:#F8F9FA;border:1px dashed var(--border);margin-top:0;
  }
`;

export default function UpcomingSession() {
  const [status, setStatus] = useState<SessionStatus>("nurse_en_route");
  const [etaMinutes, setEtaMinutes] = useState(18);
  const [expandedVit, setExpandedVit] = useState<string | null>(null);
  const [fpStep, setFpStep] = useState<BiometricStep>("idle");
  const [faceStep, setFaceStep] = useState<BiometricStep>("idle");
  const [consentDone, setConsentDone] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const [fbSubmitted, setFbSubmitted] = useState(false);
  const [hygieneRating, setHygieneRating] = useState(0);
  const [behaviourRating, setBehaviourRating] = useState(0);
  const [comfortRating, setComfortRating] = useState(0);
  const [fbComment, setFbComment] = useState("");

  useEffect(() => {
    if (fpStep === "done" && faceStep === "done") setConsentDone(true);
  }, [fpStep, faceStep]);

  function startScan(type: "fp" | "face") {
    const setter = type === "fp" ? setFpStep : setFaceStep;
    setter("scanning");
    setTimeout(() => setter("done"), 2400);
  }

  function submitFeedback() {
    if (!hygieneRating || !behaviourRating || !comfortRating) {
      alert("Please rate all three areas before submitting.");
      return;
    }
    setFbSubmitted(true);
  }

  const isSameDay = true;
  const stepIdx = STATUS_STEPS.findIndex((s) => s.key === status);
  const etaPct = Math.max(5, Math.min(94, Math.round((1 - etaMinutes / 25) * 100)));

  if (cancelled) {
    return (
      <div className="panel" style={{ textAlign: "center", padding: "40px 24px" }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>❌</div>
        <h3 style={{ fontSize: 18, fontWeight: 600, color: "var(--text)", marginBottom: 8 }}>Session Cancelled</h3>
        <p style={{ fontSize: 13, color: "var(--text-3)", lineHeight: 1.7 }}>
          Your <strong>Velocity Performance</strong> session has been cancelled.
          {isSameDay ? " A cancellation fee of ₹1,500 will be charged per our same-day policy." : " No charge applies — cancelled 24+ hours in advance."}
        </p>
        <a href="/book-now" style={{
          display: "inline-block", marginTop: 20, padding: "11px 30px",
          borderRadius: 50, background: "var(--teal)", color: "#fff",
          fontSize: 13, fontWeight: 600, textDecoration: "none",
        }}>
          Book a New Session →
        </a>
      </div>
    );
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: US_CSS }} />

      {/* Cancellation modal */}
      {showCancelModal && (
        <div className="us-modal-ov" onClick={(e) => { if (e.target === e.currentTarget) setShowCancelModal(false); }}>
          <div className="us-modal">
            <h3 className="us-modal-title">Cancel / Reschedule</h3>
            <p className="us-modal-sub">Review the policy before proceeding.</p>

            <div className="us-pol-row">
              <span style={{ color: "var(--text-2)" }}>Notice period</span>
              <span className={isSameDay ? "us-badge-fee" : "us-badge-free"}>
                {isSameDay ? "⚠ Same day" : "✓ 24+ hours notice"}
              </span>
            </div>
            <div className="us-pol-row">
              <span style={{ color: "var(--text-2)" }}>Cancellation charge</span>
              <strong style={{ color: isSameDay ? "#D97706" : "#16A34A", fontSize: 14 }}>
                {isSameDay ? "₹1,500" : "Free"}
              </strong>
            </div>
            <div className="us-pol-row">
              <span style={{ color: "var(--text-2)" }}>Reschedule charge</span>
              <strong style={{ color: isSameDay ? "#D97706" : "#16A34A", fontSize: 14 }}>
                {isSameDay ? "₹1,500" : "Free"}
              </strong>
            </div>

            <div style={{
              marginTop: 14, padding: "12px 14px", borderRadius: "var(--radius-sm)",
              background: "#FFF8E6", border: "1px solid #F59E0B",
              fontSize: 12, color: "#7C4F00", lineHeight: 1.65,
            }}>
              <strong>Policy:</strong> Cancellations or reschedules made 24+ hours before the session are completely free.
              Same-day changes incur a ₹1,500 charge to cover nurse travel and scheduling costs.
            </div>

            <div className="us-modal-actions">
              <button className="us-keep-btn" onClick={() => setShowCancelModal(false)}>Keep Session</button>
              <button className="us-confirm-cancel-btn" onClick={() => { setCancelled(true); setShowCancelModal(false); }}>
                Cancel{isSameDay ? " (₹1,500)" : " — Free"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── UPCOMING SESSION HEADER ── */}
      <div className="panel">
        <div className="panel-head">
          <div>
            <h3 className="panel-title">Upcoming <em>Session</em></h3>
            <p className="panel-sub">
              <strong style={{ color: "var(--teal)" }}>Velocity Performance</strong>
              {" "}· Today 2:00 PM · Physician: Dr. Rohit Mehra
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button className="us-resched-btn" onClick={() => setShowCancelModal(true)}>Reschedule</button>
            <button className="us-cancel-btn" onClick={() => setShowCancelModal(true)}>Cancel</button>
          </div>
        </div>

        {/* Status tracker */}
        <div className="us-status-track">
          {STATUS_STEPS.map((step, i) => {
            const isDone = i < stepIdx;
            const isActive = i === stepIdx;
            return (
              <div key={step.key} className={`us-status-step${isDone ? " us-done" : ""}${isActive ? " us-active" : ""}`}>
                <div className="us-status-icon">
                  {isDone ? "✓" : isActive ? "●" : step.icon}
                </div>
                <div className="us-step-label">{step.label}</div>
              </div>
            );
          })}
        </div>

        {/* ETA */}
        {status === "nurse_en_route" && (
          <div className="us-eta-bar">
            <span style={{ fontSize: 28 }}>🚗</span>
            <div style={{ flex: 1, minWidth: 110 }}>
              <div className="us-eta-min">{etaMinutes} min away</div>
              <div className="us-eta-lbl">RN Kavitha Nair is on the way to you</div>
            </div>
            <div className="us-eta-track">
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--text-3)", marginBottom: 4 }}>
                <span>Departed</span><span>Your location</span>
              </div>
              <div className="us-eta-bg">
                <div className="us-eta-fill" style={{ width: `${etaPct}%` }} />
              </div>
            </div>
          </div>
        )}

        {status === "arrived" && (
          <div style={{
            padding: "14px 18px", borderRadius: "var(--radius-sm)",
            background: "#F0FBF4", border: "1.5px solid #16A34A",
            fontSize: 13, color: "#16A34A", fontWeight: 600, marginBottom: 16,
          }}>
            📍 Your nurse has arrived! Please let them in and get comfortable.
          </div>
        )}

        {/* Nurse card */}
        <div className="us-nurse-card">
          <div className="us-nurse-avatar">👩‍⚕️</div>
          <div style={{ flex: 1, minWidth: 160 }}>
            <div className="us-nurse-name">{NURSE.name}</div>
            <div className="us-nurse-meta">⭐ {NURSE.rating} · {NURSE.sessions} sessions · {NURSE.certifications}</div>
            <div className="us-nurse-btns">
              <a href={`tel:${NURSE.phone.replace(/\s/g, "")}`} className="us-call-btn">📞 Call</a>
              <button className="us-msg-btn">💬 Message</button>
            </div>
          </div>
          <div style={{ textAlign: "right", fontSize: 11, color: "var(--text-3)" }}>
            <div style={{ fontWeight: 600, fontSize: 13, color: "var(--text)", marginBottom: 2 }}>{NURSE.phone}</div>
            For questions, delays, or directions
          </div>
        </div>
      </div>

      {/* ── PRE-DRIP INSTRUCTIONS ── */}
      <div className="panel">
        <h3 className="panel-title" style={{ marginBottom: 4 }}>Pre-Drip <em>Instructions</em></h3>
        <p className="panel-sub" style={{ marginBottom: 14 }}>Follow these before your nurse arrives for the best experience.</p>
        {PRE_DRIP.map((instr, i) => (
          <div key={i} style={{
            display: "flex", gap: 12, alignItems: "flex-start",
            padding: "11px 0", borderBottom: i < PRE_DRIP.length - 1 ? "1px solid var(--border)" : "none",
          }}>
            <div style={{
              width: 24, height: 24, borderRadius: "50%", background: "var(--sky-pale)",
              color: "var(--teal)", fontSize: 11, fontWeight: 700, flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center", marginTop: 1,
            }}>
              {i + 1}
            </div>
            <div style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.55 }}>{instr}</div>
          </div>
        ))}
      </div>

      {/* ── DRIP DETAILS ── */}
      <div className="panel">
        <div className="panel-head">
          <div>
            <h3 className="panel-title">Your <em>Drip</em> Details</h3>
            <p className="panel-sub">{DRIP.tagline}</p>
          </div>
          <span style={{
            padding: "4px 14px", borderRadius: 50, background: "var(--sky-pale)",
            color: "var(--teal)", fontSize: 11, fontWeight: 600, flexShrink: 0,
          }}>
            ⏱ {DRIP.duration}
          </span>
        </div>

        <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.65, marginBottom: 20 }}>{DRIP.description}</p>

        <h4 style={{ fontSize: 11, fontWeight: 600, color: "var(--text-3)", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 10 }}>
          Ingredients &amp; Effects
        </h4>
        <div className="us-ing-grid">
          {DRIP.ingredients.map((ing) => (
            <div key={ing.name} className="us-ing-card">
              <div className="us-ing-name">{ing.name}</div>
              <div className="us-ing-dose">{ing.dose}</div>
              <div className="us-ing-benefit">{ing.benefit}</div>
            </div>
          ))}
        </div>

        <h4 style={{ fontSize: 11, fontWeight: 600, color: "var(--text-3)", letterSpacing: 0.5, textTransform: "uppercase", margin: "22px 0 10px" }}>
          Expected Benefits
        </h4>
        {DRIP.benefits.map((b) => (
          <div key={b} style={{
            display: "flex", gap: 8, padding: "8px 0", fontSize: 13, color: "var(--text-2)",
            borderBottom: "1px solid var(--border)", alignItems: "flex-start",
          }}>
            <span style={{ color: "var(--teal)", fontWeight: 700, flexShrink: 0, marginTop: 1 }}>✓</span>{b}
          </div>
        ))}

        <h4 style={{ fontSize: 11, fontWeight: 600, color: "var(--text-3)", letterSpacing: 0.5, textTransform: "uppercase", margin: "22px 0 10px" }}>
          About the Vitamins &amp; Nutrients
        </h4>
        {Object.entries(DRIP.vitamins).map(([name, info]) => (
          <div key={name} className="us-vit-item" onClick={() => setExpandedVit(expandedVit === name ? null : name)}>
            <div className="us-vit-hd">
              <span className="us-vit-nm">{name}</span>
              <span style={{
                fontSize: 14, color: "var(--teal)", transition: "transform .2s", display: "inline-block",
                transform: expandedVit === name ? "rotate(180deg)" : "none",
              }}>▾</span>
            </div>
            {expandedVit === name && <div className="us-vit-body">{info}</div>}
          </div>
        ))}
      </div>

      {/* ── PATIENT CONSENT (fingerprint + face scan) ── */}
      <div className="panel">
        <h3 className="panel-title" style={{ marginBottom: 4 }}>Patient <em>Consent</em></h3>
        <p className="panel-sub" style={{ marginBottom: 16 }}>
          Complete biometric verification to confirm your identity and consent to today's procedure.
          Both steps are required before the drip can begin.
        </p>

        {consentDone ? (
          <div style={{
            padding: "24px", borderRadius: "var(--radius-sm)",
            background: "#F0FBF4", border: "2px solid #16A34A", textAlign: "center",
          }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>✅</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#16A34A" }}>Consent Verified</div>
            <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 4 }}>
              Fingerprint &amp; face scan captured · {new Date().toLocaleString("en-IN")}
            </div>
          </div>
        ) : (
          <div className="us-bio-grid">
            {/* Fingerprint */}
            <div
              className={`us-bio-box${fpStep === "done" ? " us-bio-done" : ""}`}
              onClick={() => fpStep === "idle" && startScan("fp")}
            >
              <div className="us-bio-emoji">
                {fpStep === "done" ? "✅" : "👆"}
                {fpStep === "scanning" && <div className="us-scan-ring" />}
              </div>
              {fpStep === "scanning" && (
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, overflow: "hidden" }}>
                  <div className="us-scan-sweep" />
                </div>
              )}
              <div className="us-bio-lbl">
                {fpStep === "idle" && "Tap to Scan Fingerprint"}
                {fpStep === "scanning" && "Scanning…"}
                {fpStep === "done" && "Fingerprint Captured ✓"}
              </div>
              <div className="us-bio-sub">
                {fpStep === "idle" && "Place your index finger"}
                {fpStep === "scanning" && "Hold still, don't move"}
                {fpStep === "done" && "Identity verified"}
              </div>
            </div>

            {/* Face scan */}
            <div
              className={`us-bio-box${faceStep === "done" ? " us-bio-done" : ""}${fpStep !== "done" && faceStep === "idle" ? " us-bio-disabled" : ""}`}
              onClick={() => { if (fpStep === "done" && faceStep === "idle") startScan("face"); }}
            >
              <div className="us-bio-emoji">
                {faceStep === "done" ? "✅" : "🤳"}
                {faceStep === "scanning" && <div className="us-scan-ring" />}
              </div>
              {faceStep === "scanning" && (
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, overflow: "hidden" }}>
                  <div className="us-scan-sweep" />
                </div>
              )}
              <div className="us-bio-lbl">
                {faceStep === "idle" && "Tap to Scan Face"}
                {faceStep === "scanning" && "Scanning Face…"}
                {faceStep === "done" && "Face Verified ✓"}
              </div>
              <div className="us-bio-sub">
                {faceStep === "idle" && (fpStep !== "done" ? "Complete fingerprint first" : "Look straight at camera")}
                {faceStep === "scanning" && "Hold your face steady"}
                {faceStep === "done" && "Match confirmed"}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── LIVE FEEDBACK (during or after drip) ── */}
      {(status === "drip_started" || status === "completed") && (
        <div className="panel">
          <h3 className="panel-title" style={{ marginBottom: 4 }}>
            {status === "drip_started" ? "Live" : "Post-Session"} <em>Feedback</em>
          </h3>
          <p className="panel-sub" style={{ marginBottom: 18 }}>
            {status === "drip_started"
              ? "Rate your experience as it happens. Your nurse and doctor can see this in real time."
              : "How was your overall session?"}
          </p>

          {fbSubmitted ? (
            <div style={{ textAlign: "center", padding: "24px 0" }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>🙏</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: "var(--teal)" }}>Thank you for your feedback!</div>
              <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 4 }}>
                Your ratings help us maintain the highest standards of care.
              </div>
            </div>
          ) : (
            <>
              <StarRow label="Nurse Hygiene &amp; Cleanliness" value={hygieneRating} onChange={setHygieneRating} />
              <StarRow label="Nurse Behaviour &amp; Attitude" value={behaviourRating} onChange={setBehaviourRating} />
              <StarRow label="How Are You Feeling Right Now?" value={comfortRating} onChange={setComfortRating} />
              <div style={{ marginBottom: 16 }}>
                <label className="us-fb-label">ANY COMMENTS OR CONCERNS?</label>
                <textarea
                  rows={3} value={fbComment}
                  onChange={(e) => setFbComment(e.target.value)}
                  placeholder="Share anything about your session — comfort, environment, communication..."
                  style={{
                    width: "100%", padding: "10px 12px", borderRadius: "var(--radius-sm)",
                    border: "1.5px solid var(--border)", background: "var(--off-white)",
                    fontSize: 13, fontFamily: "var(--font-display)",
                    resize: "none", outline: "none", lineHeight: 1.6,
                  }}
                />
              </div>
              <button onClick={submitFeedback} style={{
                padding: "11px 30px", borderRadius: 50, border: "none",
                background: "linear-gradient(145deg,var(--teal),var(--sky))",
                color: "#fff", fontSize: 13, fontWeight: 600,
                fontFamily: "var(--font-display)", cursor: "pointer",
                boxShadow: "0 4px 14px rgba(11,158,200,0.25)",
              }}>
                Submit Feedback →
              </button>
            </>
          )}
        </div>
      )}

      {/* ── POST-SESSION OUTCOMES ── */}
      {status === "completed" && (
        <div className="panel">
          <h3 className="panel-title" style={{ marginBottom: 4 }}>Session <em>Outcomes</em></h3>
          <p className="panel-sub" style={{ marginBottom: 20 }}>
            Estimated benefit scores for your Velocity Performance session. Track improvements over time.
          </p>
          {OUTCOMES.map((o) => (
            <div key={o.label} style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "var(--text)", marginBottom: 4 }}>
                <span style={{ fontWeight: 500 }}>{o.label}</span>
                <span style={{ fontWeight: 700, color: o.color }}>{o.score}%</span>
              </div>
              <div className="us-outcome-bg">
                <div className="us-outcome-fill" style={{ width: `${o.score}%`, background: o.color }} />
              </div>
            </div>
          ))}
          <div style={{
            marginTop: 18, padding: "12px 14px", borderRadius: "var(--radius-sm)",
            background: "var(--sky-pale)", fontSize: 12, color: "var(--text-2)", lineHeight: 1.65,
          }}>
            <strong style={{ color: "var(--teal)" }}>Next recommended session:</strong> 7–10 days to maintain peak performance.
            Dr. Rohit Mehra will review today's outcomes and suggest an updated protocol.
          </div>
        </div>
      )}

      {/* Demo controls */}
      <div className="us-demo-controls">
        <div style={{ fontSize: 10, color: "var(--text-3)", fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 8 }}>
          Demo — simulate session progression
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {STATUS_STEPS.map((s) => (
            <button key={s.key} onClick={() => setStatus(s.key)} style={{
              padding: "4px 12px", borderRadius: 50,
              border: "1px solid var(--border)", fontSize: 11, fontWeight: 500, cursor: "pointer",
              background: status === s.key ? "var(--teal)" : "var(--white)",
              color: status === s.key ? "#fff" : "var(--text-2)",
            }}>
              {s.icon} {s.label}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

function StarRow({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div style={{ marginBottom: 6 }}>
      <label className="us-fb-label" dangerouslySetInnerHTML={{ __html: label.toUpperCase() }} />
      <div className="us-stars-row">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className={`us-star${value >= star ? " us-lit" : ""}`} onClick={() => onChange(star)}>★</span>
        ))}
      </div>
    </div>
  );
}
