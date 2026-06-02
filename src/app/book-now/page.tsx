"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { DRIPS, ADDONS, type Drip, type Addon } from "@/lib/data/drips";

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab           = "individual" | "clinic";
type LocationOption = "home" | "office" | "hotel" | "clinic";
type QtyOption     = 1 | 2 | 4;

type IndividualForm = {
  firstName:    string;
  lastName:     string;
  mobile:       string;
  email:        string;
  selectedDrip: Drip | null;
  qty:          QtyOption;
  addons:       string[];
  date:         string;
  timeSlot:     string;
  location:     LocationOption | null;
  notes:        string;
};

type ClinicForm = {
  clinicName:    string;
  contactName:   string;
  contactEmail:  string;
  contactPhone:  string;
  orderType:     string;
  formulas:      string[];
  qty:           number;
  address:       string;
  instructions:  string;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const TIME_SLOTS = [
  "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM",
  "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM",
  "04:00 PM", "05:00 PM", "06:00 PM", "07:00 PM",
];

const LOCATION_OPTIONS: { value: LocationOption; label: string; icon: string; desc: string }[] = [
  { value: "home",   label: "At Home",        icon: "🏠", desc: "Nurse visits your residence"         },
  { value: "office", label: "At Office",       icon: "🏢", desc: "Nurse visits your workplace"         },
  { value: "hotel",  label: "Hotel / Travel",  icon: "🏨", desc: "Any hotel or travel location"        },
  { value: "clinic", label: "Our Clinic",       icon: "🏥", desc: "Visit our clinic (no travel fee)"   },
];

const QTY_OPTIONS: { value: QtyOption; label: string; discount: string }[] = [
  { value: 1, label: "1 Session",   discount: ""         },
  { value: 2, label: "2 Sessions",  discount: "Save 5%"  },
  { value: 4, label: "4 Sessions",  discount: "Save 10%" },
];

const INCLUDES = [
  "Physician approval & protocol review",
  "Certified registered nurse administration",
  "Single-use sterile IV kit",
  "24-hour clinical follow-up call",
];

const VISIT_FEE = 500;
const GST_RATE  = 0.18;

const ORDER_TYPES = ["Regular Supply", "White-Label", "Corporate Wellness", "One-Time Event"];

// ─── Price calculation ────────────────────────────────────────────────────────

function calcPricing(form: IndividualForm) {
  const basePrice    = form.selectedDrip?.price ?? 0;
  const discPct      = form.qty === 2 ? 0.05 : form.qty === 4 ? 0.10 : 0;
  const formulaTotal = basePrice * form.qty;
  const discountAmt  = Math.round(formulaTotal * discPct);
  const visitFee     = form.location === "clinic" ? 0 : VISIT_FEE;
  const addonTotal   = ADDONS.filter((a) => form.addons.includes(a.name)).reduce((s, a) => s + a.price, 0);
  const subtotal     = formulaTotal + visitFee + addonTotal;
  const gstAmt       = Math.round((subtotal - discountAmt) * GST_RATE);
  const total        = subtotal - discountAmt + gstAmt;
  return { formulaTotal, discountAmt, visitFee, addonTotal, subtotal, gstAmt, total };
}

// ─── Page CSS ─────────────────────────────────────────────────────────────────

const PAGE_CSS = `
  /* ── Page wrapper ── */
  .page-wrap { background:var(--sky-bg);min-height:100vh; }

  /* ── Page top (hero) ── */
  .page-top {
    background:linear-gradient(160deg,#C8E9F8 0%,#A4D5F5 40%,#7DC4F0 100%);
    padding:140px 56px 60px;
    position:relative;overflow:hidden;
  }
  .page-top .pt-blob { position:absolute;border-radius:50%;filter:blur(80px);pointer-events:none; }
  .page-top .ptb1 { width:350px;height:350px;background:rgba(255,255,255,0.20);top:-80px;right:-80px; }
  .page-top .ptb2 { width:220px;height:220px;background:rgba(255,255,255,0.12);bottom:0;left:8%; }
  .page-top .pt-inner { position:relative;z-index:2; }

  /* Breadcrumb */
  .breadcrumb      { font-size:12px;color:rgba(255,255,255,0.70);margin-bottom:16px; }
  .breadcrumb a    { color:rgba(255,255,255,0.70);text-decoration:none;transition:color .2s; }
  .breadcrumb a:hover { color:#fff; }

  /* Page title */
  .page-title {
    font-size:clamp(36px,5vw,58px);font-weight:600;
    color:#fff;letter-spacing:-2px;line-height:1.05;margin-bottom:12px;
  }
  .page-title em { font-style:italic;font-family:var(--font-serif);font-weight:400; }
  .page-title-sub { font-size:17px;color:rgba(255,255,255,0.85);max-width:500px;line-height:1.7; }

  /* ── Booking tabs ── */
  .booking-tabs-wrap {
    padding:40px 56px 0;
    display:flex;justify-content:center;
  }
  .booking-tabs {
    display:inline-flex;border-radius:50px;padding:5px;
    background:rgba(91,184,245,0.12);border:1.5px solid var(--border);
  }
  .bt {
    padding:10px 28px;border-radius:50px;border:none;
    font-size:13px;font-weight:500;font-family:var(--font-display);
    cursor:pointer;transition:background .2s,color .2s;
    background:transparent;color:var(--text-2);
  }
  .bt.active { background:var(--teal);color:#fff; }

  /* ── Booking layout ── */
  .booking-layout {
    display:grid;
    grid-template-columns:1fr 380px;
    gap:32px;
    align-items:start;
    max-width:1280px;
    margin:0 auto;
    padding:40px 56px 80px;
  }
  .form-col { display:flex;flex-direction:column;gap:24px; }

  /* ── Form card ── */
  .form-card {
    background:var(--white);
    border-radius:var(--radius);
    padding:32px;
    border:1.5px solid var(--border);
    box-shadow:var(--shadow);
  }

  /* ── Form section ── */
  .form-section + .form-section { margin-top:24px; }
  .fs-title {
    font-size:15px;font-weight:600;color:var(--text);
    letter-spacing:-0.3px;margin-bottom:16px;
  }

  /* ── Form rows ── */
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

  /* ── Drip select grid ── */
  .drip-select-grid { display:grid;grid-template-columns:1fr 1fr;gap:12px; }
  .drip-opt {
    display:flex;align-items:center;gap:12px;
    padding:14px;border-radius:var(--radius-sm);
    border:2px solid var(--border);background:var(--off-white);
    cursor:pointer;text-align:left;font-family:var(--font-display);
    transition:border-color .2s,background .2s,box-shadow .2s,transform .2s;
    width:100%;
  }
  .drip-opt:hover  { transform:translateY(-2px);border-color:var(--sky); }
  .drip-opt.sel    { border-color:var(--teal);background:var(--sky-pale);box-shadow:0 4px 16px rgba(26,126,168,0.12); }
  .do-icon         { width:44px;height:44px;border-radius:10px;background:var(--sky-bg);display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0; }
  .drip-opt.sel .do-icon { background:rgba(26,126,168,0.15); }
  .do-name         { font-size:13px;font-weight:600;color:var(--text);line-height:1.2;margin-bottom:2px; }
  .drip-opt.sel .do-name { color:var(--teal); }
  .do-sub          { font-size:10px;color:var(--text-3);margin-bottom:2px; }
  .do-price        { font-size:13px;font-weight:600;color:var(--text-2); }
  .drip-opt.sel .do-price { color:var(--teal); }

  /* ── Qty pills ── */
  .qty-row { display:flex;flex-wrap:wrap;gap:10px; }
  .qty-pill {
    display:flex;align-items:center;gap:8px;
    padding:10px 20px;border-radius:50px;border:none;
    font-size:13px;font-weight:500;font-family:var(--font-display);
    cursor:pointer;transition:background .2s,color .2s,border-color .2s;
    border:1.5px solid var(--border);background:var(--off-white);color:var(--text-2);
  }
  .qty-pill.sel { background:var(--teal);color:#fff;border-color:var(--teal); }
  .qty-pill-badge {
    font-size:10px;font-weight:600;padding:2px 8px;border-radius:50px;
    background:rgba(26,158,106,0.12);color:#1A9E6A;
  }
  .qty-pill.sel .qty-pill-badge { background:rgba(255,255,255,0.25);color:#fff; }

  /* ── Add-on check grid ── */
  .addon-check-grid { display:grid;grid-template-columns:1fr 1fr;gap:10px; }
  .addon-check {
    display:flex;align-items:flex-start;gap:10px;
    padding:12px;border-radius:var(--radius-sm);
    border:1.5px solid var(--border);background:var(--off-white);
    cursor:pointer;text-align:left;font-family:var(--font-display);
    transition:border-color .2s,background .2s;width:100%;
  }
  .addon-check:hover  { border-color:var(--sky); }
  .addon-check.sel    { border-color:var(--teal);background:var(--sky-pale); }
  .addon-check-icon   { font-size:18px;flex-shrink:0;margin-top:1px; }
  .addon-check-body   { flex:1;min-width:0; }
  .addon-check-row    { display:flex;justify-content:space-between;align-items:flex-start;gap:8px; }
  .addon-check-name   { font-size:12px;font-weight:500;color:var(--text);line-height:1.3; }
  .addon-check.sel .addon-check-name { color:var(--teal); }
  .addon-check-price  { font-size:12px;font-weight:600;color:var(--teal);white-space:nowrap; }
  .addon-check-desc   { font-size:10px;color:var(--text-3);margin-top:2px;line-height:1.4; }

  /* ── Slot grid ── */
  .slot-grid { display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:12px; }
  .slot {
    padding:10px 4px;border-radius:var(--radius-sm);border:none;
    font-size:11px;font-weight:500;font-family:var(--font-display);
    cursor:pointer;transition:background .15s,color .15s,border-color .15s;
    background:var(--off-white);color:var(--text-2);
    border:1.5px solid var(--border);text-align:center;
  }
  .slot:hover { border-color:var(--sky); }
  .slot.sel   { background:var(--teal);color:#fff;border-color:var(--teal); }

  /* ── Location grid ── */
  .loc-grid { display:grid;grid-template-columns:1fr 1fr;gap:12px; }
  .loc-opt {
    display:flex;flex-direction:column;align-items:flex-start;
    padding:16px;border-radius:var(--radius-sm);
    border:2px solid var(--border);background:var(--off-white);
    cursor:pointer;text-align:left;font-family:var(--font-display);
    transition:border-color .2s,background .2s,box-shadow .2s,transform .2s;
    width:100%;
  }
  .loc-opt:hover { transform:translateY(-2px);border-color:var(--sky); }
  .loc-opt.sel   { border-color:var(--teal);background:var(--sky-pale);box-shadow:0 4px 16px rgba(26,126,168,0.12); }
  .loc-opt-icon  { font-size:22px;margin-bottom:8px; }
  .loc-opt-name  { font-size:13px;font-weight:600;color:var(--text);margin-bottom:3px; }
  .loc-opt.sel .loc-opt-name { color:var(--teal); }
  .loc-opt-desc  { font-size:11px;color:var(--text-3); }
  .loc-opt-badge {
    font-size:10px;font-weight:600;padding:3px 10px;border-radius:50px;
    background:rgba(26,158,106,0.12);color:#1A9E6A;margin-top:8px;
  }

  /* ── Summary card ── */
  .summary-card {
    background:var(--white);border-radius:var(--radius);
    padding:28px;border:1.5px solid var(--border);
    box-shadow:0 4px 24px rgba(91,184,245,0.10);
    position:sticky;top:100px;
  }
  .sc-title { font-size:17px;font-weight:600;color:var(--text);letter-spacing:-0.3px;margin-bottom:20px; }

  /* Drip preview in summary */
  .sc-drip {
    display:flex;align-items:center;gap:12px;
    padding:12px;border-radius:var(--radius-sm);
    background:var(--sky-bg);margin-bottom:20px;
  }
  .sc-drip-icon  { font-size:22px; }
  .sc-drip-name  { font-size:13px;font-weight:600;color:var(--text); }
  .sc-drip-sub   { font-size:11px;color:var(--text-3); }
  .sc-drip-empty {
    padding:12px;border-radius:var(--radius-sm);
    background:var(--sky-bg);margin-bottom:20px;
    font-size:12px;color:var(--text-3);text-align:center;
  }

  /* Line items */
  .sc-lines  { display:flex;flex-direction:column;gap:10px;margin-bottom:16px; }
  .sc-line   { display:flex;justify-content:space-between;font-size:13px; }
  .sc-line-label { color:var(--text-2); }
  .sc-line-val   { font-weight:500;color:var(--text); }
  .sc-line-discount { color:#1A9E6A; }
  .sc-divider { border:none;border-top:1px solid var(--border);margin:10px 0; }
  .sc-total-row { display:flex;justify-content:space-between;align-items:center;padding-top:10px;border-top:1.5px solid var(--border); }
  .sc-total-label { font-weight:600;color:var(--text); }
  .sc-total-val   { font-size:22px;font-weight:600;color:var(--teal);letter-spacing:-0.5px; }

  /* Includes box */
  .sc-includes {
    border-radius:var(--radius-sm);padding:14px;margin-bottom:20px;
    background:var(--sky-bg);border:1px solid var(--border);
  }
  .sc-includes-label {
    font-size:10px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;
    color:var(--teal);margin-bottom:10px;
  }
  .sc-include-row { display:flex;align-items:flex-start;gap:8px;margin-bottom:6px; }
  .sc-include-row:last-child { margin-bottom:0; }
  .sc-check { color:var(--teal);font-size:11px;margin-top:1px; }
  .sc-include-text { font-size:11px;color:var(--text-2);line-height:1.45; }

  /* Book button */
  .book-btn {
    width:100%;padding:14px;border-radius:50px;border:none;
    font-size:13px;font-weight:600;font-family:var(--font-display);cursor:pointer;
    background:linear-gradient(145deg,var(--teal),var(--sky));color:#fff;
    box-shadow:0 4px 20px rgba(26,126,168,0.30);
    transition:opacity .2s,transform .2s;
  }
  .book-btn:disabled {
    background:rgba(91,184,245,0.2);color:var(--text-3);
    box-shadow:none;cursor:not-allowed;
  }
  .book-btn:not(:disabled):hover { transform:translateY(-1px);box-shadow:0 8px 28px rgba(26,126,168,0.40); }

  /* Trust pills row */
  .trust-pills { display:flex;flex-wrap:wrap;gap:8px;margin-top:14px;justify-content:center; }
  .trust-pill-sm {
    font-size:10px;font-weight:500;padding:5px 12px;border-radius:50px;
    background:rgba(91,184,245,0.10);color:var(--text-2);
  }

  /* ── Clinic form ── */
  .clinic-wrap { max-width:640px;margin:0 auto;padding:40px 56px 80px; }
  .clinic-form-card {
    background:var(--white);border-radius:var(--radius);
    padding:40px;border:1.5px solid var(--border);box-shadow:var(--shadow);
  }
  .clinic-h2  { font-size:20px;font-weight:600;letter-spacing:-0.4px;margin-bottom:6px; }
  .clinic-sub { font-size:13px;color:var(--text-3);margin-bottom:28px; }
  .clinic-field-group { display:flex;flex-direction:column;gap:20px; }

  /* Clinic formula grid */
  .clinic-formula-grid { display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px; }
  .clinic-formula-btn {
    display:flex;align-items:center;gap:8px;
    padding:10px 12px;border-radius:var(--radius-sm);
    border:1.5px solid var(--border);background:var(--off-white);
    cursor:pointer;font-size:12px;font-weight:500;font-family:var(--font-display);
    color:var(--text-2);transition:background .15s,color .15s,border-color .15s;
  }
  .clinic-formula-btn.sel { background:var(--sky-pale);color:var(--teal);border-color:var(--teal); }

  /* Order type pills */
  .order-type-row { display:flex;flex-wrap:wrap;gap:8px; }
  .order-type-btn {
    padding:8px 16px;border-radius:50px;border:1.5px solid var(--border);
    background:var(--off-white);color:var(--text-2);
    font-size:11px;font-weight:500;font-family:var(--font-display);cursor:pointer;
    transition:background .15s,color .15s,border-color .15s;
  }
  .order-type-btn.sel { background:var(--teal);color:#fff;border-color:var(--teal); }

  /* Clinic success state */
  .clinic-success { text-align:center;padding:24px 0; }
  .clinic-success-icon {
    width:64px;height:64px;border-radius:50%;
    background:linear-gradient(135deg,var(--teal),var(--sky));
    display:flex;align-items:center;justify-content:center;
    font-size:28px;color:#fff;margin:0 auto 20px;
  }
  .clinic-submit-btn {
    width:100%;padding:14px;border-radius:50px;border:none;
    background:linear-gradient(145deg,var(--teal),var(--sky));
    color:#fff;font-size:13px;font-weight:600;
    font-family:var(--font-display);cursor:pointer;
    box-shadow:0 4px 20px rgba(26,126,168,0.30);
    margin-top:8px;
    transition:transform .2s,box-shadow .2s;
  }
  .clinic-submit-btn:hover { transform:translateY(-1px);box-shadow:0 8px 28px rgba(26,126,168,0.40); }

  /* ── Confirmation modal ── */
  .modal-overlay {
    position:fixed;inset:0;z-index:200;
    display:flex;align-items:center;justify-content:center;padding:20px;
    background:rgba(14,34,51,0.55);backdrop-filter:blur(6px);
  }
  .modal-box {
    width:100%;max-width:440px;border-radius:var(--radius);
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
  .modal-sub   { font-size:13px;color:var(--text-2);line-height:1.7;margin-bottom:6px; }
  .modal-hint  { font-size:12px;color:var(--text-3);line-height:1.7;margin-bottom:28px; }
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

  /* ── Date input ── */
  .date-input {
    background:var(--off-white);border:1.5px solid var(--border);
    color:var(--text);padding:11px 14px;font-family:var(--font-display);
    font-size:13px;border-radius:var(--radius-sm);outline:none;
    transition:border-color .2s;
  }
  .date-input:focus { border-color:var(--sky); }

  /* ── Textarea ── */
  .nd-textarea {
    width:100%;background:var(--off-white);border:1.5px solid var(--border);
    color:var(--text);padding:11px 14px;font-family:var(--font-display);
    font-size:13px;border-radius:var(--radius-sm);outline:none;resize:none;
    line-height:1.65;transition:border-color .2s;
  }
  .nd-textarea:focus { border-color:var(--sky); }
  .nd-textarea::placeholder { color:var(--text-3); }

  @media(max-width:1024px){
    .booking-layout { grid-template-columns:1fr;padding:32px 24px 60px; }
    .page-top       { padding:100px 24px 40px; }
    .booking-tabs-wrap { padding:32px 24px 0; }
    .clinic-wrap    { padding:32px 24px 60px; }
    .summary-card   { position:static; }
  }
  @media(max-width:768px){
    .booking-layout { padding:24px 16px 80px; }
    .page-top { padding:88px 16px 32px; }
    .booking-tabs-wrap { padding:24px 16px 0; }
    .summary-card { position:static;margin-top:24px; }
  }
  @media(max-width:640px){
    .drip-select-grid { grid-template-columns:1fr; }
    .addon-check-grid { grid-template-columns:1fr; }
    .slot-grid        { grid-template-columns:repeat(3,1fr); }
    .loc-grid         { grid-template-columns:1fr; }
    .form-row         { grid-template-columns:1fr; }
    .clinic-formula-grid { grid-template-columns:1fr 1fr; }
  }
  @media(max-width:480px){
    .booking-tabs-wrap { padding:20px 12px 0; }
    .booking-layout    { padding:20px 12px 80px; }
    .slot-grid         { grid-template-columns:repeat(2,1fr); }
    .clinic-formula-grid { grid-template-columns:1fr; }
    .qty-grid          { grid-template-columns:1fr; }
    .form-input-sm     { font-size:16px; }
  }
`;

// ─── Confirmation modal ───────────────────────────────────────────────────────

function ConfirmationModal({ onClose, drip }: { onClose: () => void; drip: Drip | null }) {
  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <div className="modal-icon">✓</div>
        <h2 className="modal-title">Booking Confirmed!</h2>
        <p className="modal-sub">
          Your <strong style={{ color: "var(--teal)" }}>{drip?.name ?? "drip"}</strong> session has been submitted.
        </p>
        <p className="modal-hint">
          A physician will review your profile within 2 hours and your nurse will contact you to confirm the appointment.
        </p>
        <button className="modal-done-btn" onClick={onClose}>Done</button>
        <Link href="/" className="modal-home-link">Return to home</Link>
      </div>
    </div>
  );
}

// ─── Order summary sidebar ────────────────────────────────────────────────────

function OrderSummary({ form, onConfirm }: { form: IndividualForm; onConfirm: () => void }) {
  const p     = calcPricing(form);
  const ready = form.selectedDrip !== null && !!form.date && !!form.timeSlot && !!form.location;

  const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;

  return (
    <div className="summary-card">
      <h3 className="sc-title">Order Summary</h3>

      {/* Drip preview */}
      {form.selectedDrip ? (
        <div className="sc-drip">
          <span className="sc-drip-icon">{form.selectedDrip.icon}</span>
          <div>
            <div className="sc-drip-name">{form.selectedDrip.name}</div>
            <div className="sc-drip-sub">{form.selectedDrip.subtitle}</div>
          </div>
        </div>
      ) : (
        <div className="sc-drip-empty">No drip selected yet</div>
      )}

      {/* Line items */}
      <div className="sc-lines">
        <div className="sc-line">
          <span className="sc-line-label">Formula × {form.qty}</span>
          <span className="sc-line-val">{form.selectedDrip ? fmt(p.formulaTotal) : "—"}</span>
        </div>
        <div className="sc-line">
          <span className="sc-line-label">Visit fee</span>
          <span className="sc-line-val">
            {form.location ? (form.location === "clinic" ? "₹0" : fmt(VISIT_FEE)) : "—"}
          </span>
        </div>
        {p.addonTotal > 0 && (
          <div className="sc-line">
            <span className="sc-line-label">Add-ons</span>
            <span className="sc-line-val">{fmt(p.addonTotal)}</span>
          </div>
        )}
        <hr className="sc-divider" />
        <div className="sc-line">
          <span className="sc-line-label">Subtotal</span>
          <span className="sc-line-val">{form.selectedDrip ? fmt(p.subtotal) : "—"}</span>
        </div>
        {p.discountAmt > 0 && (
          <div className="sc-line">
            <span className="sc-line-discount">Multi-session discount</span>
            <span className="sc-line-discount">−{fmt(p.discountAmt)}</span>
          </div>
        )}
        <div className="sc-line">
          <span className="sc-line-label">GST (18%)</span>
          <span className="sc-line-val">{form.selectedDrip ? fmt(p.gstAmt) : "—"}</span>
        </div>
      </div>

      <div className="sc-total-row">
        <span className="sc-total-label">Total</span>
        <span className="sc-total-val">{form.selectedDrip ? fmt(p.total) : "—"}</span>
      </div>

      {/* Includes */}
      <div className="sc-includes" style={{ marginTop: 20 }}>
        <p className="sc-includes-label">Included with every booking</p>
        {INCLUDES.map((item) => (
          <div key={item} className="sc-include-row">
            <span className="sc-check">✓</span>
            <span className="sc-include-text">{item}</span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <button className="book-btn" onClick={onConfirm} disabled={!ready}>
        Confirm Booking →
      </button>

      <div className="trust-pills">
        {["🔒 Secure", "👨‍⚕️ MD Reviewed", "🏆 Certified Nurses"].map((pill) => (
          <span key={pill} className="trust-pill-sm">{pill}</span>
        ))}
      </div>
    </div>
  );
}

// ─── Reusable form field ──────────────────────────────────────────────────────

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

// ─── Inner page (uses useSearchParams) ───────────────────────────────────────

function BookNowInner() {
  const searchParams    = useSearchParams();
  const preselectedName = searchParams.get("drip");

  const [activeTab,  setActiveTab]  = useState<Tab>("individual");
  const [showModal,  setShowModal]  = useState(false);
  const [clinicDone, setClinicDone] = useState(false);

  const initialDrip = preselectedName
    ? (DRIPS.find((d) => d.name.toLowerCase() === preselectedName.toLowerCase()) ?? null)
    : null;

  const [form, setForm] = useState<IndividualForm>({
    firstName: "", lastName: "", mobile: "", email: "",
    selectedDrip: initialDrip,
    qty: 1, addons: [], date: "", timeSlot: "", location: null, notes: "",
  });

  const [clinicForm, setClinicForm] = useState<ClinicForm>({
    clinicName: "", contactName: "", contactEmail: "", contactPhone: "",
    orderType: "Regular Supply", formulas: [], qty: 1, address: "", instructions: "",
  });

  useEffect(() => {
    if (preselectedName) {
      const found = DRIPS.find((d) => d.name.toLowerCase() === preselectedName.toLowerCase());
      if (found) setForm((prev) => ({ ...prev, selectedDrip: found }));
    }
  }, [preselectedName]);

  function setField<K extends keyof IndividualForm>(key: K, value: IndividualForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleAddon(name: string) {
    setForm((prev) => ({
      ...prev,
      addons: prev.addons.includes(name)
        ? prev.addons.filter((a) => a !== name)
        : [...prev.addons, name],
    }));
  }

  function toggleClinicFormula(name: string) {
    setClinicForm((prev) => ({
      ...prev,
      formulas: prev.formulas.includes(name)
        ? prev.formulas.filter((f) => f !== name)
        : [...prev.formulas, name],
    }));
  }

  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: PAGE_CSS }} />

      <div className="page-wrap">
        {showModal && (
          <ConfirmationModal onClose={() => setShowModal(false)} drip={form.selectedDrip} />
        )}

        {/* Hero */}
        <div className="page-top">
          <div className="pt-blob ptb1" />
          <div className="pt-blob ptb2" />
          <div className="pt-inner">
            <div className="breadcrumb">
              <Link href="/">Home</Link> › Book Now
            </div>
            <h1 className="page-title">
              Book Your <em>IV Session</em>
            </h1>
            <p className="page-title-sub">
              Physician-approved, nurse-administered IV therapy delivered to your world.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="booking-tabs-wrap">
          <div className="booking-tabs">
            {(["individual", "clinic"] as Tab[]).map((tab) => (
              <button
                key={tab}
                className={`bt${activeTab === tab ? " active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === "individual" ? "Individual" : "Clinic / B2B"}
              </button>
            ))}
          </div>
        </div>

        {/* ── Individual tab ─────────────────────────────────────────────────── */}
        {activeTab === "individual" && (
          <div className="booking-layout">
            {/* LEFT — form */}
            <div className="form-col">

              {/* Personal Details */}
              <div className="form-card">
                <div className="form-section">
                  <h3 className="fs-title">Personal Details</h3>
                  <div className="form-row">
                    <Field label="First Name"    value={form.firstName} onChange={(v) => setField("firstName", v)} placeholder="Arjun" />
                    <Field label="Last Name"     value={form.lastName}  onChange={(v) => setField("lastName",  v)} placeholder="Sharma" />
                    <Field label="Mobile Number" value={form.mobile}    onChange={(v) => setField("mobile",    v)} type="tel"   placeholder="+91 98000 00000" />
                    <Field label="Email Address" value={form.email}     onChange={(v) => setField("email",     v)} type="email" placeholder="arjun@email.com" />
                  </div>
                </div>
              </div>

              {/* Choose Drip */}
              <div className="form-card">
                <div className="form-section">
                  <h3 className="fs-title">Choose Your Drip</h3>
                  <div className="drip-select-grid">
                    {DRIPS.map((drip) => {
                      const sel = form.selectedDrip?.id === drip.id;
                      return (
                        <button
                          key={drip.id}
                          className={`drip-opt${sel ? " sel" : ""}`}
                          onClick={() => setField("selectedDrip", drip)}
                        >
                          <div className="do-icon">{drip.icon}</div>
                          <div style={{ minWidth: 0 }}>
                            <div className="do-name">{drip.name}</div>
                            <div className="do-sub">{drip.subtitle}</div>
                            <div className="do-price">₹{drip.price.toLocaleString("en-IN")}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Quantity */}
              <div className="form-card">
                <div className="form-section">
                  <h3 className="fs-title">Number of Sessions</h3>
                  <div className="qty-row">
                    {QTY_OPTIONS.map((opt) => {
                      const sel = form.qty === opt.value;
                      return (
                        <button
                          key={opt.value}
                          className={`qty-pill${sel ? " sel" : ""}`}
                          onClick={() => setField("qty", opt.value)}
                        >
                          {opt.label}
                          {opt.discount && (
                            <span className="qty-pill-badge">{opt.discount}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Add-ons */}
              <div className="form-card">
                <div className="form-section">
                  <h3 className="fs-title">Add-ons (Optional)</h3>
                  <div className="addon-check-grid">
                    {ADDONS.map((addon: Addon) => {
                      const sel = form.addons.includes(addon.name);
                      return (
                        <button
                          key={addon.name}
                          className={`addon-check${sel ? " sel" : ""}`}
                          onClick={() => toggleAddon(addon.name)}
                        >
                          <span className="addon-check-icon">{addon.icon}</span>
                          <div className="addon-check-body">
                            <div className="addon-check-row">
                              <span className="addon-check-name">{addon.name}</span>
                              <span className="addon-check-price">+₹{addon.price.toLocaleString("en-IN")}</span>
                            </div>
                            <div className="addon-check-desc">{addon.description}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Date & Time */}
              <div className="form-card">
                <div className="form-section">
                  <h3 className="fs-title">Date & Time</h3>
                  <div className="form-group" style={{ marginBottom: 20 }}>
                    <label className="form-label-sm">Preferred Date</label>
                    <input
                      type="date" value={form.date} min={todayStr}
                      onChange={(e) => setField("date", e.target.value)}
                      className="date-input"
                    />
                  </div>
                  <label className="form-label-sm" style={{ display: "block", marginBottom: 10 }}>
                    Preferred Time Slot
                  </label>
                  <div className="slot-grid">
                    {TIME_SLOTS.map((slot) => {
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
                </div>
              </div>

              {/* Location */}
              <div className="form-card">
                <div className="form-section">
                  <h3 className="fs-title">Drip Location</h3>
                  <div className="loc-grid">
                    {LOCATION_OPTIONS.map((loc) => {
                      const sel = form.location === loc.value;
                      return (
                        <button
                          key={loc.value}
                          className={`loc-opt${sel ? " sel" : ""}`}
                          onClick={() => setField("location", loc.value)}
                        >
                          <span className="loc-opt-icon">{loc.icon}</span>
                          <span className="loc-opt-name">{loc.label}</span>
                          <span className="loc-opt-desc">{loc.desc}</span>
                          {loc.value === "clinic" && (
                            <span className="loc-opt-badge">No travel fee</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Health Notes */}
              <div className="form-card">
                <div className="form-section">
                  <h3 className="fs-title">Health Notes (Optional)</h3>
                  <p style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 10, lineHeight: 1.6 }}>
                    Any allergies, current medications, or health conditions the physician should know about.
                  </p>
                  <textarea
                    className="nd-textarea"
                    rows={4}
                    value={form.notes}
                    onChange={(e) => setField("notes", e.target.value)}
                    placeholder="e.g. Allergic to penicillin, currently on metformin..."
                  />
                </div>
              </div>
            </div>

            {/* RIGHT — sticky summary */}
            <OrderSummary form={form} onConfirm={() => setShowModal(true)} />
          </div>
        )}

        {/* ── Clinic / B2B tab ───────────────────────────────────────────────── */}
        {activeTab === "clinic" && (
          <div className="clinic-wrap">
            <div className="clinic-form-card">
              {clinicDone ? (
                <div className="clinic-success">
                  <div className="clinic-success-icon">✓</div>
                  <h2 className="clinic-h2">Enquiry Submitted</h2>
                  <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.7, marginBottom: 28, maxWidth: 400, margin: "0 auto 28px" }}>
                    Thank you, <strong>{clinicForm.clinicName}</strong>. Our B2B team will contact{" "}
                    <strong>{clinicForm.contactName}</strong> within 24 hours.
                  </p>
                  <button
                    className="clinic-submit-btn"
                    style={{ maxWidth: 240, margin: "0 auto" }}
                    onClick={() => setClinicDone(false)}
                  >
                    Submit another enquiry
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="clinic-h2">Clinic & Business Enquiry</h2>
                  <p className="clinic-sub">
                    Partner with NutriDrip for bulk IV therapy supply, white-label services, or corporate wellness programmes.
                  </p>

                  <div className="clinic-field-group">
                    {/* Names */}
                    <div className="form-row">
                      <Field label="Clinic / Company Name" value={clinicForm.clinicName}   onChange={(v) => setClinicForm((p) => ({ ...p, clinicName:   v }))} placeholder="Apollo Wellness Centre" />
                      <Field label="Contact Name"          value={clinicForm.contactName}  onChange={(v) => setClinicForm((p) => ({ ...p, contactName:  v }))} placeholder="Dr. Kavya Reddy" />
                      <Field label="Email"                 value={clinicForm.contactEmail} onChange={(v) => setClinicForm((p) => ({ ...p, contactEmail: v }))} type="email" placeholder="dr.kavya@clinic.com" />
                      <Field label="Phone"                 value={clinicForm.contactPhone} onChange={(v) => setClinicForm((p) => ({ ...p, contactPhone: v }))} type="tel"   placeholder="+91 99000 00000" />
                    </div>

                    {/* Order type */}
                    <div>
                      <label className="form-label-sm" style={{ display: "block", marginBottom: 8 }}>Order Type</label>
                      <div className="order-type-row">
                        {ORDER_TYPES.map((type) => {
                          const sel = clinicForm.orderType === type;
                          return (
                            <button
                              key={type}
                              className={`order-type-btn${sel ? " sel" : ""}`}
                              onClick={() => setClinicForm((p) => ({ ...p, orderType: type }))}
                            >
                              {type}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Formulas */}
                    <div>
                      <label className="form-label-sm" style={{ display: "block", marginBottom: 10 }}>Formulas Required</label>
                      <div className="clinic-formula-grid">
                        {DRIPS.map((drip) => {
                          const sel = clinicForm.formulas.includes(drip.name);
                          return (
                            <button
                              key={drip.id}
                              className={`clinic-formula-btn${sel ? " sel" : ""}`}
                              onClick={() => toggleClinicFormula(drip.name)}
                            >
                              <span>{drip.icon}</span>
                              <span>{drip.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Qty */}
                    <div>
                      <label className="form-label-sm" style={{ display: "block", marginBottom: 6 }}>
                        Estimated Sessions per Month
                      </label>
                      <input
                        type="number" min={1} value={clinicForm.qty}
                        onChange={(e) => setClinicForm((p) => ({ ...p, qty: Math.max(1, Number(e.target.value)) }))}
                        className="form-input-sm"
                        style={{ maxWidth: 160 }}
                      />
                    </div>

                    {/* Address */}
                    <div>
                      <label className="form-label-sm" style={{ display: "block", marginBottom: 6 }}>
                        Clinic / Delivery Address
                      </label>
                      <textarea
                        className="nd-textarea" rows={3}
                        value={clinicForm.address}
                        onChange={(e) => setClinicForm((p) => ({ ...p, address: e.target.value }))}
                        placeholder="Full address including city and pin code"
                      />
                    </div>

                    {/* Instructions */}
                    <div>
                      <label className="form-label-sm" style={{ display: "block", marginBottom: 6 }}>
                        Additional Instructions
                      </label>
                      <textarea
                        className="nd-textarea" rows={3}
                        value={clinicForm.instructions}
                        onChange={(e) => setClinicForm((p) => ({ ...p, instructions: e.target.value }))}
                        placeholder="Special requirements, branding notes, scheduling preferences..."
                      />
                    </div>

                    <button className="clinic-submit-btn" onClick={() => setClinicDone(true)}>
                      Submit Enquiry →
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// ─── Page export — Suspense required for useSearchParams ──────────────────────

export default function BookNowPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "100vh", background: "var(--sky-bg)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <div style={{ color: "var(--text-3)", fontSize: 14 }}>Loading...</div>
        </div>
      }
    >
      <BookNowInner />
    </Suspense>
  );
}
