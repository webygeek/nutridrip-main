"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  LAB_TESTS,
  HEALTH_CONCERNS,
} from "@/lib/data/labs";
import { DOCTORS, type Doctor } from "@/lib/data/doctors";
import { useContent } from "@/lib/content-store";

// ─── Types ───────────────────────────────────────────────────────────────────

type Step = 1 | 2 | 3;

type BookingForm = {
  firstName: string;
  lastName: string;
  mobile: string;
  email: string;
  selectedDoctor: Doctor | null;
  date: string;
  timeSlot: string;
  consultType: "video" | "clinic" | null;
  notes: string;
};

// ─── Constants ───────────────────────────────────────────────────────────────

const CONSULT_TYPES: { value: "video" | "clinic"; label: string; icon: string; desc: string }[] = [
  { value: "video", label: "Video Call", icon: "📹", desc: "Consult from anywhere via secure video" },
  { value: "clinic", label: "In-Clinic Visit", icon: "🏥", desc: "Visit our clinic for in-person consultation" },
];

const GST_RATE = 0.18;

// ─── CSS ─────────────────────────────────────────────────────────────────────

const PAGE_CSS = `
  .consult-wrap { background:var(--sky-bg);min-height:100vh; }

  /* Hero */
  .consult-hero {
    background:linear-gradient(160deg,#0F5C7D 0%,#1A7EA8 40%,#3A9EC4 100%);
    padding:140px 56px 60px;position:relative;overflow:hidden;
  }
  .consult-hero .ch-blob { position:absolute;border-radius:50%;filter:blur(80px);pointer-events:none; }
  .consult-hero .chb1 { width:350px;height:350px;background:rgba(255,255,255,0.10);top:-80px;right:-80px; }
  .consult-hero .chb2 { width:220px;height:220px;background:rgba(255,255,255,0.06);bottom:0;left:8%; }
  .ch-inner { position:relative;z-index:2; }
  .ch-breadcrumb { font-size:12px;color:rgba(255,255,255,0.60);margin-bottom:16px; }
  .ch-breadcrumb a { color:rgba(255,255,255,0.60);text-decoration:none;transition:color .2s; }
  .ch-breadcrumb a:hover { color:#fff; }
  .ch-title {
    font-size:clamp(36px,5vw,58px);font-weight:600;
    color:#fff;letter-spacing:-2px;line-height:1.05;margin-bottom:12px;
  }
  .ch-title em { font-style:italic;font-family:var(--font-serif);font-weight:400; }
  .ch-sub { font-size:17px;color:rgba(255,255,255,0.80);max-width:560px;line-height:1.7; }

  /* Stepper */
  .stepper-wrap { padding:40px 56px 0;display:flex;justify-content:center; }
  .stepper { display:flex;align-items:center;gap:0; }
  .step-item {
    display:flex;align-items:center;gap:10px;padding:10px 20px;
    font-size:13px;font-weight:500;font-family:var(--font-display);color:var(--text-3);
    transition:color .2s;
  }
  .step-item.active { color:var(--teal); }
  .step-item.done { color:var(--teal);opacity:0.7; }
  .step-num {
    width:32px;height:32px;border-radius:50%;
    display:flex;align-items:center;justify-content:center;
    font-size:12px;font-weight:600;
    border:2px solid var(--border);color:var(--text-3);
    transition:background .2s,color .2s,border-color .2s;
  }
  .step-item.active .step-num { background:var(--teal);color:#fff;border-color:var(--teal); }
  .step-item.done .step-num { background:var(--sky-pale);color:var(--teal);border-color:var(--teal); }
  .step-connector { width:48px;height:2px;background:var(--border);transition:background .3s; }
  .step-connector.done { background:var(--teal); }

  /* Content area */
  .consult-content { max-width:1100px;margin:0 auto;padding:40px 56px 80px; }

  /* ─── Step 1: Concerns ─── */
  .concerns-intro { font-size:15px;color:var(--text-2);line-height:1.7;margin-bottom:32px;max-width:600px; }
  .concerns-grid { display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:32px; }
  .concern-card {
    padding:20px;border-radius:var(--radius-sm);
    border:2px solid var(--border);background:var(--white);
    cursor:pointer;text-align:left;font-family:var(--font-display);
    transition:border-color .2s,background .2s,box-shadow .2s,transform .2s;
  }
  .concern-card:hover { transform:translateY(-3px);border-color:var(--sky); }
  .concern-card.sel { border-color:var(--teal);background:var(--sky-pale);box-shadow:0 4px 16px rgba(26,126,168,0.12); }
  .cc-icon { font-size:26px;margin-bottom:10px;display:block; }
  .cc-label { font-size:14px;font-weight:600;color:var(--text);margin-bottom:4px; }
  .concern-card.sel .cc-label { color:var(--teal); }
  .cc-desc { font-size:11px;color:var(--text-3);line-height:1.5; }
  .cc-check {
    width:20px;height:20px;border-radius:50%;border:2px solid var(--border);
    display:flex;align-items:center;justify-content:center;
    font-size:11px;color:transparent;transition:all .2s;float:right;margin-top:-4px;
  }
  .concern-card.sel .cc-check { background:var(--teal);border-color:var(--teal);color:#fff; }

  /* ─── Step 2: Labs ─── */
  .labs-section-title {
    font-size:13px;font-weight:600;letter-spacing:1px;text-transform:uppercase;
    margin-bottom:14px;display:flex;align-items:center;gap:8px;
  }
  .labs-section-title.essential { color:var(--teal); }
  .labs-section-title.recommended { color:#D4880F; }
  .labs-badge {
    font-size:10px;padding:3px 10px;border-radius:50px;font-weight:600;
  }
  .labs-badge.essential { background:rgba(26,126,168,0.12);color:var(--teal); }
  .labs-badge.recommended { background:rgba(212,136,15,0.12);color:#D4880F; }

  .labs-grid { display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:32px; }
  .lab-card {
    display:flex;align-items:flex-start;gap:14px;
    padding:18px;border-radius:var(--radius-sm);
    border:1.5px solid var(--border);background:var(--white);
    cursor:pointer;text-align:left;font-family:var(--font-display);
    transition:border-color .2s,background .2s;
  }
  .lab-card:hover { border-color:var(--sky); }
  .lab-card.sel { border-color:var(--teal);background:var(--sky-pale); }
  .lab-icon { font-size:22px;flex-shrink:0;margin-top:2px; }
  .lab-body { flex:1;min-width:0; }
  .lab-top { display:flex;justify-content:space-between;align-items:flex-start;gap:8px; }
  .lab-name { font-size:13px;font-weight:600;color:var(--text);line-height:1.3; }
  .lab-card.sel .lab-name { color:var(--teal); }
  .lab-price { font-size:12px;font-weight:600;color:var(--teal);white-space:nowrap; }
  .lab-desc { font-size:11px;color:var(--text-3);line-height:1.5;margin-top:4px; }
  .lab-meta { font-size:10px;color:var(--text-3);margin-top:6px;display:flex;gap:12px; }

  .labs-summary-bar {
    display:flex;justify-content:space-between;align-items:center;
    padding:18px 24px;border-radius:var(--radius-sm);
    background:var(--white);border:1.5px solid var(--border);
    margin-bottom:24px;
  }
  .lsb-left { font-size:14px;color:var(--text); }
  .lsb-left strong { color:var(--teal); }
  .lsb-right { font-size:13px;color:var(--text-3); }

  /* ─── Step 3: Doctor booking ─── */
  .booking-layout {
    display:grid;grid-template-columns:1fr 380px;
    gap:32px;align-items:start;
  }
  .form-col { display:flex;flex-direction:column;gap:24px; }
  .form-card {
    background:var(--white);border-radius:var(--radius);
    padding:32px;border:1.5px solid var(--border);box-shadow:var(--shadow);
  }
  .fs-title { font-size:15px;font-weight:600;color:var(--text);letter-spacing:-0.3px;margin-bottom:16px; }
  .form-row { display:grid;grid-template-columns:1fr 1fr;gap:16px; }
  .form-group { display:flex;flex-direction:column;gap:6px; }
  .form-label-sm { font-size:11px;font-weight:500;color:var(--text-2);letter-spacing:0.5px; }
  .form-input-sm {
    background:var(--off-white);border:1.5px solid var(--border);
    color:var(--text);padding:11px 14px;font-family:var(--font-display);
    font-size:13px;border-radius:var(--radius-sm);outline:none;
    transition:border-color .2s,box-shadow .2s;width:100%;
  }
  .form-input-sm:focus { border-color:var(--sky);box-shadow:0 0 0 3px rgba(91,184,245,0.10); }
  .form-input-sm::placeholder { color:var(--text-3); }

  /* Doctor select */
  .doctor-grid { display:grid;grid-template-columns:1fr;gap:12px; }
  .doc-card {
    display:flex;align-items:center;gap:16px;
    padding:18px;border-radius:var(--radius-sm);
    border:2px solid var(--border);background:var(--white);
    cursor:pointer;text-align:left;font-family:var(--font-display);
    transition:border-color .2s,background .2s,box-shadow .2s,transform .2s;
  }
  .doc-card:hover { transform:translateY(-2px);border-color:var(--sky); }
  .doc-card.sel { border-color:var(--teal);background:var(--sky-pale);box-shadow:0 4px 16px rgba(26,126,168,0.12); }
  .doc-avatar {
    width:52px;height:52px;border-radius:50%;
    background:linear-gradient(135deg,var(--sky-pale),var(--sky-light));
    display:flex;align-items:center;justify-content:center;
    font-size:20px;font-weight:600;color:var(--teal);flex-shrink:0;
  }
  .doc-card.sel .doc-avatar { background:linear-gradient(135deg,var(--teal),var(--sky)); color:#fff; }
  .doc-info { flex:1;min-width:0; }
  .doc-name { font-size:14px;font-weight:600;color:var(--text);margin-bottom:2px; }
  .doc-card.sel .doc-name { color:var(--teal); }
  .doc-spec { font-size:11px;color:var(--text-3);margin-bottom:4px; }
  .doc-meta { display:flex;gap:12px;font-size:11px;color:var(--text-3); }
  .doc-meta-item { display:flex;align-items:center;gap:4px; }
  .doc-fee { font-size:14px;font-weight:600;color:var(--teal);white-space:nowrap;text-align:right; }
  .doc-fee-label { font-size:10px;color:var(--text-3);font-weight:400; }

  /* Consult type */
  .consult-type-grid { display:grid;grid-template-columns:1fr 1fr;gap:12px; }
  .ct-card {
    display:flex;flex-direction:column;align-items:center;gap:8px;
    padding:20px;border-radius:var(--radius-sm);
    border:2px solid var(--border);background:var(--white);
    cursor:pointer;font-family:var(--font-display);text-align:center;
    transition:border-color .2s,background .2s,transform .2s;
  }
  .ct-card:hover { transform:translateY(-2px);border-color:var(--sky); }
  .ct-card.sel { border-color:var(--teal);background:var(--sky-pale); }
  .ct-icon { font-size:28px; }
  .ct-label { font-size:13px;font-weight:600;color:var(--text); }
  .ct-card.sel .ct-label { color:var(--teal); }
  .ct-desc { font-size:11px;color:var(--text-3); }

  /* Slot grid */
  .slot-grid { display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:12px; }
  .slot {
    padding:10px 4px;border-radius:var(--radius-sm);border:none;
    font-size:11px;font-weight:500;font-family:var(--font-display);
    cursor:pointer;transition:background .15s,color .15s,border-color .15s;
    background:var(--off-white);color:var(--text-2);
    border:1.5px solid var(--border);text-align:center;
  }
  .slot:hover { border-color:var(--sky); }
  .slot.sel { background:var(--teal);color:#fff;border-color:var(--teal); }

  .date-input {
    background:var(--off-white);border:1.5px solid var(--border);
    color:var(--text);padding:11px 14px;font-family:var(--font-display);
    font-size:13px;border-radius:var(--radius-sm);outline:none;
    transition:border-color .2s;
  }
  .date-input:focus { border-color:var(--sky); }

  .nd-textarea {
    width:100%;background:var(--off-white);border:1.5px solid var(--border);
    color:var(--text);padding:11px 14px;font-family:var(--font-display);
    font-size:13px;border-radius:var(--radius-sm);outline:none;resize:none;
    line-height:1.65;transition:border-color .2s;
  }
  .nd-textarea:focus { border-color:var(--sky); }
  .nd-textarea::placeholder { color:var(--text-3); }

  /* Summary sidebar */
  .summary-card {
    background:var(--white);border-radius:var(--radius);
    padding:28px;border:1.5px solid var(--border);
    box-shadow:0 4px 24px rgba(91,184,245,0.10);
    position:sticky;top:100px;
  }
  .sc-title { font-size:17px;font-weight:600;color:var(--text);letter-spacing:-0.3px;margin-bottom:20px; }
  .sc-section { margin-bottom:16px; }
  .sc-section-label {
    font-size:10px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;
    color:var(--teal);margin-bottom:10px;
  }
  .sc-concern-pill {
    display:inline-flex;align-items:center;gap:4px;
    font-size:11px;padding:4px 10px;border-radius:50px;
    background:var(--sky-pale);color:var(--teal);font-weight:500;
    margin:0 4px 6px 0;
  }
  .sc-lab-row { display:flex;justify-content:space-between;font-size:12px;margin-bottom:6px; }
  .sc-lab-name { color:var(--text-2); }
  .sc-lab-price { font-weight:500;color:var(--text); }
  .sc-divider { border:none;border-top:1px solid var(--border);margin:12px 0; }
  .sc-line { display:flex;justify-content:space-between;font-size:13px;margin-bottom:8px; }
  .sc-line-label { color:var(--text-2); }
  .sc-line-val { font-weight:500;color:var(--text); }
  .sc-total-row {
    display:flex;justify-content:space-between;align-items:center;
    padding-top:12px;border-top:1.5px solid var(--border);margin-top:8px;
  }
  .sc-total-label { font-weight:600;color:var(--text); }
  .sc-total-val { font-size:22px;font-weight:600;color:var(--teal);letter-spacing:-0.5px; }

  .book-btn {
    width:100%;padding:14px;border-radius:50px;border:none;
    font-size:13px;font-weight:600;font-family:var(--font-display);cursor:pointer;
    background:linear-gradient(145deg,var(--teal),var(--sky));color:#fff;
    box-shadow:0 4px 20px rgba(26,126,168,0.30);
    transition:opacity .2s,transform .2s;margin-top:16px;
  }
  .book-btn:disabled {
    background:rgba(91,184,245,0.2);color:var(--text-3);
    box-shadow:none;cursor:not-allowed;
  }
  .book-btn:not(:disabled):hover { transform:translateY(-1px);box-shadow:0 8px 28px rgba(26,126,168,0.40); }

  .trust-pills { display:flex;flex-wrap:wrap;gap:8px;margin-top:14px;justify-content:center; }
  .trust-pill-sm {
    font-size:10px;font-weight:500;padding:5px 12px;border-radius:50px;
    background:rgba(91,184,245,0.10);color:var(--text-2);
  }

  /* Nav buttons */
  .nav-btns { display:flex;gap:12px;justify-content:flex-end;margin-top:8px; }
  .nav-btn {
    padding:12px 28px;border-radius:50px;border:none;
    font-size:13px;font-weight:600;font-family:var(--font-display);
    cursor:pointer;transition:all .2s;
  }
  .nav-btn.primary {
    background:linear-gradient(145deg,var(--teal),var(--sky));color:#fff;
    box-shadow:0 4px 16px rgba(26,126,168,0.25);
  }
  .nav-btn.primary:hover { transform:translateY(-1px);box-shadow:0 8px 24px rgba(26,126,168,0.35); }
  .nav-btn.primary:disabled { background:rgba(91,184,245,0.2);color:var(--text-3);box-shadow:none;cursor:not-allowed; }
  .nav-btn.secondary {
    background:var(--white);color:var(--text-2);border:1.5px solid var(--border);
  }
  .nav-btn.secondary:hover { border-color:var(--sky);color:var(--teal); }

  /* Modal */
  .modal-overlay {
    position:fixed;inset:0;z-index:200;
    display:flex;align-items:center;justify-content:center;padding:20px;
    background:rgba(14,34,51,0.55);backdrop-filter:blur(6px);
  }
  .modal-box {
    width:100%;max-width:480px;border-radius:var(--radius);
    padding:48px;text-align:center;
    background:var(--white);box-shadow:0 20px 60px rgba(14,34,51,0.18);
  }
  .modal-icon {
    width:64px;height:64px;border-radius:50%;
    background:linear-gradient(135deg,var(--teal),var(--sky));
    display:flex;align-items:center;justify-content:center;
    font-size:28px;color:#fff;margin:0 auto 20px;
  }
  .modal-title { font-size:22px;font-weight:600;letter-spacing:-0.5px;margin-bottom:10px; }
  .modal-sub { font-size:13px;color:var(--text-2);line-height:1.7;margin-bottom:6px; }
  .modal-detail { font-size:12px;color:var(--text-3);line-height:1.7;margin-bottom:28px; }
  .modal-done-btn {
    width:100%;padding:13px;border-radius:50px;border:none;
    background:linear-gradient(145deg,var(--teal),var(--sky));
    color:#fff;font-size:13px;font-weight:600;font-family:var(--font-display);
    cursor:pointer;margin-bottom:12px;
  }
  .modal-home-link {
    display:block;font-size:13px;font-weight:500;color:var(--text-3);
    text-decoration:none;transition:color .2s;
  }
  .modal-home-link:hover { color:var(--teal);text-decoration:underline; }

  @media(max-width:1024px){
    .consult-hero { padding:100px 24px 40px; }
    .stepper-wrap { padding:32px 24px 0; }
    .consult-content { padding:32px 24px 60px; }
    .concerns-grid { grid-template-columns:1fr 1fr; }
    .booking-layout { grid-template-columns:1fr; }
    .summary-card { position:static; }
  }
  @media(max-width:768px){
    .consult-hero { padding:88px 16px 32px; }
    .stepper-wrap { padding:24px 16px 0; }
    .consult-content { padding:24px 16px 80px; }
    .summary-card { position:static;margin-top:20px; }
  }
  @media(max-width:640px){
    .concerns-grid { grid-template-columns:1fr; }
    .labs-grid { grid-template-columns:1fr; }
    .slot-grid { grid-template-columns:repeat(3,1fr); }
    .form-row { grid-template-columns:1fr; }
    .consult-type-grid { grid-template-columns:1fr; }
  }
  @media(max-width:480px){
    .slot-grid { grid-template-columns:repeat(2,1fr); }
    .stepper-wrap { overflow-x:auto;-webkit-overflow-scrolling:touch; }
    .form-input { font-size:16px; }
  }
`;

// ─── Field helper ────────────────────────────────────────────────────────────

function Field({
  label, value, onChange, type = "text", placeholder = "",
}: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string;
}) {
  return (
    <div className="form-group">
      <label className="form-label-sm">{label}</label>
      <input
        type={type} value={value} placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="form-input-sm"
      />
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────

export default function ConsultPage() {
  const heroTitle = useContent("consult.hero.title", "Doctor");
  const heroTitleEm = useContent("consult.hero.title_em", "Consultation");
  const heroSubtitle = useContent("consult.hero.subtitle", "Tell us your health concerns, review recommended lab investigations, and book a physician consultation — all in one seamless flow.");

  const [step, setStep] = useState<Step>(1);
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>([]);
  const [selectedLabs, setSelectedLabs] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState<BookingForm>({
    firstName: "", lastName: "", mobile: "", email: "",
    selectedDoctor: null, date: "", timeSlot: "",
    consultType: null, notes: "",
  });

  function setField<K extends keyof BookingForm>(key: K, value: BookingForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  // ── Concern toggle ──
  function toggleConcern(id: string) {
    setSelectedConcerns((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  }

  // ── Derive recommended labs from selected concerns ──
  const { essentialLabIds, recommendedLabIds } = useMemo(() => {
    const essential = new Set<string>();
    const recommended = new Set<string>();
    for (const cId of selectedConcerns) {
      const concern = HEALTH_CONCERNS.find((c) => c.id === cId);
      if (!concern) continue;
      for (const l of concern.essentialLabs) essential.add(l);
      for (const l of concern.recommendedLabs) recommended.add(l);
    }
    for (const e of essential) recommended.delete(e);
    return { essentialLabIds: Array.from(essential), recommendedLabIds: Array.from(recommended) };
  }, [selectedConcerns]);

  const essentialLabs = LAB_TESTS.filter((l) => essentialLabIds.includes(l.id));
  const recommendedLabs = LAB_TESTS.filter((l) => recommendedLabIds.includes(l.id));

  function goToStep2() {
    setSelectedLabs((prev) => {
      const next = new Set(prev);
      for (const id of essentialLabIds) next.add(id);
      return Array.from(next);
    });
    setStep(2);
  }

  function toggleLab(id: string) {
    setSelectedLabs((prev) =>
      prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id]
    );
  }

  // ── Pricing ──
  const selectedLabTests = LAB_TESTS.filter((l) => selectedLabs.includes(l.id));
  const labsTotal = selectedLabTests.reduce((s, l) => s + l.price, 0);
  const consultFee = form.selectedDoctor?.consultFee ?? 0;
  const subtotal = labsTotal + consultFee;
  const gst = Math.round(subtotal * GST_RATE);
  const total = subtotal + gst;

  const bookingReady =
    form.selectedDoctor !== null &&
    !!form.date &&
    !!form.timeSlot &&
    !!form.consultType &&
    !!form.firstName &&
    !!form.mobile;

  const todayStr = new Date().toISOString().split("T")[0];
  const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;

  const STEP_LABELS = ["Select Concerns", "Recommended Labs", "Book Consultation"];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: PAGE_CSS }} />

      <div className="consult-wrap">
        {showModal && (
          <div className="modal-overlay">
            <div className="modal-box">
              <div className="modal-icon">✓</div>
              <h2 className="modal-title">Consultation Booked!</h2>
              <p className="modal-sub">
                Your appointment with{" "}
                <strong style={{ color: "var(--teal)" }}>
                  {form.selectedDoctor?.name ?? "your doctor"}
                </strong>{" "}
                has been confirmed.
              </p>
              <p className="modal-detail">
                {form.consultType === "video" ? "A secure video link" : "Clinic address and directions"} will
                be sent to <strong>{form.mobile}</strong> within 30 minutes.
                {selectedLabs.length > 0 && (
                  <> Your lab investigation orders ({selectedLabs.length} tests) have been shared with the clinic for scheduling.</>
                )}
              </p>
              <button className="modal-done-btn" onClick={() => setShowModal(false)}>Done</button>
              <Link href="/" className="modal-home-link">Return to home</Link>
            </div>
          </div>
        )}

        {/* Hero */}
        <div className="consult-hero">
          <div className="ch-blob chb1" />
          <div className="ch-blob chb2" />
          <div className="ch-inner">
            <div className="ch-breadcrumb">
              <Link href="/">Home</Link> › Consult a Doctor
            </div>
            <h1 className="ch-title">
              {heroTitle} <em>{heroTitleEm}</em>
            </h1>
            <p className="ch-sub">
              {heroSubtitle}
            </p>
          </div>
        </div>

        {/* Stepper */}
        <div className="stepper-wrap">
          <div className="stepper">
            {STEP_LABELS.map((label, i) => {
              const sNum = (i + 1) as Step;
              const isActive = step === sNum;
              const isDone = step > sNum;
              return (
                <div key={label} style={{ display: "flex", alignItems: "center" }}>
                  {i > 0 && <div className={`step-connector${isDone ? " done" : ""}`} />}
                  <div className={`step-item${isActive ? " active" : ""}${isDone ? " done" : ""}`}>
                    <div className="step-num">{isDone ? "✓" : sNum}</div>
                    <span>{label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="consult-content">

          {/* ════════════════════ STEP 1: Health Concerns ════════════════════ */}
          {step === 1 && (
            <>
              <p className="concerns-intro">
                Select one or more health concerns. We will recommend personalised lab
                investigations your doctor will use to create the right treatment protocol.
              </p>
              <div className="concerns-grid">
                {HEALTH_CONCERNS.map((c) => {
                  const sel = selectedConcerns.includes(c.id);
                  return (
                    <button
                      key={c.id}
                      className={`concern-card${sel ? " sel" : ""}`}
                      onClick={() => toggleConcern(c.id)}
                    >
                      <span className="cc-check">{sel ? "✓" : ""}</span>
                      <span className="cc-icon">{c.icon}</span>
                      <div className="cc-label">{c.label}</div>
                      <div className="cc-desc">{c.description}</div>
                    </button>
                  );
                })}
              </div>
              <div className="nav-btns">
                <button
                  className="nav-btn primary"
                  disabled={selectedConcerns.length === 0}
                  onClick={goToStep2}
                >
                  View Recommended Labs →
                </button>
              </div>
            </>
          )}

          {/* ════════════════════ STEP 2: Lab Investigations ════════════════════ */}
          {step === 2 && (
            <>
              <div className="labs-summary-bar">
                <div className="lsb-left">
                  <strong>{essentialLabs.length + recommendedLabs.length}</strong> tests recommended based
                  on {selectedConcerns.length} concern{selectedConcerns.length > 1 ? "s" : ""}
                </div>
                <div className="lsb-right">
                  {selectedLabs.length} selected · {fmt(labsTotal)}
                </div>
              </div>

              {essentialLabs.length > 0 && (
                <>
                  <div className="labs-section-title essential">
                    Essential Investigations
                    <span className="labs-badge essential">Must-have</span>
                  </div>
                  <div className="labs-grid">
                    {essentialLabs.map((lab) => {
                      const sel = selectedLabs.includes(lab.id);
                      return (
                        <button
                          key={lab.id}
                          className={`lab-card${sel ? " sel" : ""}`}
                          onClick={() => toggleLab(lab.id)}
                        >
                          <span className="lab-icon">{lab.icon}</span>
                          <div className="lab-body">
                            <div className="lab-top">
                              <span className="lab-name">{lab.name}</span>
                              <span className="lab-price">{fmt(lab.price)}</span>
                            </div>
                            <div className="lab-desc">{lab.description}</div>
                            <div className="lab-meta">
                              <span>⏱ {lab.turnaround}</span>
                              <span>📋 {lab.category}</span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}

              {recommendedLabs.length > 0 && (
                <>
                  <div className="labs-section-title recommended">
                    Recommended Investigations
                    <span className="labs-badge recommended">Good to have</span>
                  </div>
                  <div className="labs-grid">
                    {recommendedLabs.map((lab) => {
                      const sel = selectedLabs.includes(lab.id);
                      return (
                        <button
                          key={lab.id}
                          className={`lab-card${sel ? " sel" : ""}`}
                          onClick={() => toggleLab(lab.id)}
                        >
                          <span className="lab-icon">{lab.icon}</span>
                          <div className="lab-body">
                            <div className="lab-top">
                              <span className="lab-name">{lab.name}</span>
                              <span className="lab-price">{fmt(lab.price)}</span>
                            </div>
                            <div className="lab-desc">{lab.description}</div>
                            <div className="lab-meta">
                              <span>⏱ {lab.turnaround}</span>
                              <span>📋 {lab.category}</span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}

              <div className="nav-btns">
                <button className="nav-btn secondary" onClick={() => setStep(1)}>
                  ← Back
                </button>
                <button className="nav-btn primary" onClick={() => setStep(3)}>
                  Book Doctor Consultation →
                </button>
              </div>
            </>
          )}

          {/* ════════════════════ STEP 3: Doctor Booking ════════════════════ */}
          {step === 3 && (
            <div className="booking-layout">
              <div className="form-col">

                {/* Personal Details */}
                <div className="form-card">
                  <h3 className="fs-title">Personal Details</h3>
                  <div className="form-row">
                    <Field label="First Name" value={form.firstName} onChange={(v) => setField("firstName", v)} placeholder="Arjun" />
                    <Field label="Last Name" value={form.lastName} onChange={(v) => setField("lastName", v)} placeholder="Sharma" />
                    <Field label="Mobile Number" value={form.mobile} onChange={(v) => setField("mobile", v)} type="tel" placeholder="+91 98000 00000" />
                    <Field label="Email Address" value={form.email} onChange={(v) => setField("email", v)} type="email" placeholder="arjun@email.com" />
                  </div>
                </div>

                {/* Choose Doctor */}
                <div className="form-card">
                  <h3 className="fs-title">Choose Your Doctor</h3>
                  <div className="doctor-grid">
                    {DOCTORS.map((doc) => {
                      const sel = form.selectedDoctor?.id === doc.id;
                      const initials = doc.name.replace("Dr. ", "").split(" ").map((w) => w[0]).join("");
                      return (
                        <button
                          key={doc.id}
                          className={`doc-card${sel ? " sel" : ""}`}
                          onClick={() => setField("selectedDoctor", doc)}
                        >
                          <div className="doc-avatar">{initials}</div>
                          <div className="doc-info">
                            <div className="doc-name">{doc.name}</div>
                            <div className="doc-spec">{doc.specialty} · {doc.experience}</div>
                            <div className="doc-meta">
                              <span className="doc-meta-item">★ {doc.rating}</span>
                              <span className="doc-meta-item">{doc.reviewCount} reviews</span>
                              <span className="doc-meta-item">{doc.languages.join(", ")}</span>
                            </div>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <div className="doc-fee">{fmt(doc.consultFee)}</div>
                            <div className="doc-fee-label">per consult</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Consultation Type */}
                <div className="form-card">
                  <h3 className="fs-title">Consultation Type</h3>
                  <div className="consult-type-grid">
                    {CONSULT_TYPES.map((ct) => {
                      const sel = form.consultType === ct.value;
                      return (
                        <button
                          key={ct.value}
                          className={`ct-card${sel ? " sel" : ""}`}
                          onClick={() => setField("consultType", ct.value)}
                        >
                          <span className="ct-icon">{ct.icon}</span>
                          <span className="ct-label">{ct.label}</span>
                          <span className="ct-desc">{ct.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Date & Time */}
                <div className="form-card">
                  <h3 className="fs-title">Preferred Date & Time</h3>
                  <div className="form-group" style={{ marginBottom: 20 }}>
                    <label className="form-label-sm">Date</label>
                    <input
                      type="date" value={form.date} min={todayStr}
                      onChange={(e) => setField("date", e.target.value)}
                      className="date-input"
                    />
                  </div>
                  {form.selectedDoctor && (
                    <>
                      <label className="form-label-sm" style={{ display: "block", marginBottom: 10 }}>
                        Available Slots — {form.selectedDoctor.name}
                      </label>
                      <div className="slot-grid">
                        {form.selectedDoctor.slots.map((slot) => {
                          const sel = form.timeSlot === slot;
                          return (
                            <button
                              key={slot}
                              className={`slot${sel ? " sel" : ""}`}
                              onClick={() => setField("timeSlot", slot)}
                            >
                              {slot}
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>

                {/* Notes */}
                <div className="form-card">
                  <h3 className="fs-title">Notes for the Doctor (Optional)</h3>
                  <p style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 10, lineHeight: 1.6 }}>
                    Describe your symptoms, current medications, or anything the doctor should review before the consultation.
                  </p>
                  <textarea
                    className="nd-textarea" rows={4}
                    value={form.notes}
                    onChange={(e) => setField("notes", e.target.value)}
                    placeholder="e.g. Fatigue for 3 months, currently taking Thyronorm 50mcg..."
                  />
                </div>

                <div className="nav-btns">
                  <button className="nav-btn secondary" onClick={() => setStep(2)}>
                    ← Back to Labs
                  </button>
                </div>
              </div>

              {/* ── Sticky Summary Sidebar ── */}
              <div className="summary-card">
                <h3 className="sc-title">Booking Summary</h3>

                {selectedConcerns.length > 0 && (
                  <div className="sc-section">
                    <p className="sc-section-label">Health Concerns</p>
                    <div>
                      {selectedConcerns.map((cId) => {
                        const c = HEALTH_CONCERNS.find((x) => x.id === cId);
                        return c ? (
                          <span key={cId} className="sc-concern-pill">
                            {c.icon} {c.label}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}

                {selectedLabTests.length > 0 && (
                  <div className="sc-section">
                    <p className="sc-section-label">Lab Investigations ({selectedLabTests.length})</p>
                    {selectedLabTests.map((lab) => (
                      <div key={lab.id} className="sc-lab-row">
                        <span className="sc-lab-name">{lab.icon} {lab.name}</span>
                        <span className="sc-lab-price">{fmt(lab.price)}</span>
                      </div>
                    ))}
                  </div>
                )}

                <hr className="sc-divider" />

                <div className="sc-line">
                  <span className="sc-line-label">Lab tests</span>
                  <span className="sc-line-val">{labsTotal > 0 ? fmt(labsTotal) : "—"}</span>
                </div>
                <div className="sc-line">
                  <span className="sc-line-label">Consultation fee</span>
                  <span className="sc-line-val">{form.selectedDoctor ? fmt(consultFee) : "—"}</span>
                </div>
                <div className="sc-line">
                  <span className="sc-line-label">GST (18%)</span>
                  <span className="sc-line-val">{subtotal > 0 ? fmt(gst) : "—"}</span>
                </div>

                <div className="sc-total-row">
                  <span className="sc-total-label">Total</span>
                  <span className="sc-total-val">{total > 0 ? fmt(total) : "—"}</span>
                </div>

                <button
                  className="book-btn"
                  disabled={!bookingReady}
                  onClick={() => setShowModal(true)}
                  style={{ marginTop: 20 }}
                >
                  Confirm Consultation →
                </button>

                <div className="trust-pills">
                  {["🔒 Secure", "👨‍⚕️ Verified Doctors", "📋 Lab Reports Shared"].map((pill) => (
                    <span key={pill} className="trust-pill-sm">{pill}</span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
