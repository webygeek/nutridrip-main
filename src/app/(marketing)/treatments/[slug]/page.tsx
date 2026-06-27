"use client";

import { useState, useMemo, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { DRIPS } from "@/lib/data/drips";
import { DRIP_DETAILS } from "@/lib/data/drip-details";
import { useAuth, logout } from "@/lib/auth";

// ─── Types ───────────────────────────────────────────────────────────────────

type PatientHistory = {
  name: string;
  age: string;
  gender: "male" | "female" | "other" | "";
  conditions: string[];
  medications: string;
  allergies: string;
};

type ApprovalStatus = "none" | "pending" | "approved";

const KNOWN_CONDITIONS = [
  "Diabetes", "Hypertension", "Thyroid disorder", "Kidney disease",
  "Liver disease", "Autoimmune condition", "Pregnancy", "G6PD deficiency",
  "None of the above",
];

// ─── Page CSS ────────────────────────────────────────────────────────────────

const PAGE_CSS = `
  .detail-wrap { background:var(--sky-bg);min-height:100vh; }

  .d-hero { padding:140px 56px 50px;position:relative;overflow:hidden; }
  .d-hero .blob { position:absolute;border-radius:50%;filter:blur(80px);pointer-events:none; }
  .d-hero .b1 { width:380px;height:380px;background:rgba(255,255,255,0.22);top:-80px;right:-60px; }
  .d-hero .b2 { width:240px;height:240px;background:rgba(255,255,255,0.14);bottom:-40px;left:4%; }
  .d-hero-inner { position:relative;z-index:2;max-width:1100px;margin:0 auto; }
  .d-breadcrumb { font-size:12px;color:rgba(255,255,255,0.75);margin-bottom:16px; }
  .d-breadcrumb a { color:rgba(255,255,255,0.75);text-decoration:none; }
  .d-breadcrumb a:hover { color:#fff; }
  .d-header-row { display:flex;align-items:flex-end;gap:28px;flex-wrap:wrap;justify-content:space-between; }
  .d-heading-area { flex:1;min-width:280px; }
  .d-icon-badge {
    width:72px;height:72px;border-radius:20px;
    background:rgba(255,255,255,0.25);backdrop-filter:blur(8px);
    display:flex;align-items:center;justify-content:center;
    font-size:36px;margin-bottom:16px;
    border:1px solid rgba(255,255,255,0.4);
  }
  .d-title { font-size:clamp(36px,5vw,56px);font-weight:600;color:#fff;letter-spacing:-2px;line-height:1.05;margin-bottom:10px; }
  .d-title em { font-style:italic;font-family:var(--font-serif);font-weight:400; }
  .d-subtitle { font-size:16px;color:rgba(255,255,255,0.85);line-height:1.65;max-width:600px; }
  .d-hero-meta { display:flex;gap:12px;flex-wrap:wrap;margin-top:20px; }
  .d-meta-pill {
    background:rgba(255,255,255,0.2);backdrop-filter:blur(8px);
    border:1px solid rgba(255,255,255,0.35);border-radius:50px;
    padding:8px 16px;font-size:12px;color:#fff;font-weight:500;
  }
  .d-price-card {
    background:rgba(255,255,255,0.95);backdrop-filter:blur(12px);
    border-radius:var(--radius);padding:24px 28px;min-width:240px;
    box-shadow:0 12px 48px rgba(10,50,80,0.15);
  }
  .d-price-val { font-size:32px;font-weight:600;color:var(--teal);letter-spacing:-1px; }
  .d-price-sub { font-size:11px;color:var(--text-3);margin-bottom:14px; }
  .d-book-btn {
    display:inline-block;width:100%;text-align:center;
    background:linear-gradient(145deg,var(--teal),var(--sky));color:#fff;
    padding:13px 20px;border-radius:50px;font-size:13px;font-weight:600;
    text-decoration:none;font-family:var(--font-display);
    box-shadow:0 4px 16px rgba(26,126,168,0.25);transition:transform .2s;
  }
  .d-book-btn:hover { transform:translateY(-1px); }

  .d-tabs-wrap { background:var(--white);border-bottom:1px solid var(--border);position:sticky;top:64px;z-index:50; }
  .d-tabs { max-width:1100px;margin:0 auto;padding:0 56px;display:flex;gap:0;overflow-x:auto; }
  .d-tab {
    padding:16px 20px;border:none;background:transparent;
    font-size:13px;font-weight:500;font-family:var(--font-display);
    color:var(--text-3);cursor:pointer;
    border-bottom:2px solid transparent;
    transition:color .15s,border-color .15s;white-space:nowrap;
  }
  .d-tab:hover { color:var(--teal); }
  .d-tab.active { color:var(--teal);border-color:var(--teal); }

  .d-body { max-width:1100px;margin:0 auto;padding:40px 56px 80px; }

  .d-card {
    background:var(--white);border-radius:var(--radius);
    padding:36px;border:1.5px solid var(--border);
    box-shadow:var(--shadow);margin-bottom:24px;
  }
  .d-card-title { font-size:22px;font-weight:600;letter-spacing:-0.4px;margin-bottom:8px; }
  .d-card-title em { font-style:italic;font-family:var(--font-serif);color:var(--teal);font-weight:400; }
  .d-card-sub { font-size:14px;color:var(--text-3);margin-bottom:24px;line-height:1.6; }

  .benefits-grid { display:grid;grid-template-columns:1fr 1fr;gap:16px; }
  .benefit-card { display:flex;gap:14px;padding:18px;background:var(--off-white);border-radius:var(--radius-sm);border:1px solid var(--border); }
  .benefit-icon {
    width:40px;height:40px;border-radius:10px;background:var(--sky-pale);
    display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;
  }
  .benefit-title { font-size:14px;font-weight:600;color:var(--text);margin-bottom:4px; }
  .benefit-desc { font-size:12px;color:var(--text-2);line-height:1.6; }

  .ing-list { display:flex;flex-direction:column;gap:16px; }
  .ing-card { padding:20px;border-radius:var(--radius-sm);background:var(--off-white);border:1.5px solid var(--border); }
  .ing-head { display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px;gap:16px; }
  .ing-name-big { font-size:15px;font-weight:600;color:var(--text); }
  .ing-dose-tag {
    font-size:13px;font-weight:600;color:var(--teal);
    background:var(--sky-pale);padding:4px 12px;border-radius:50px;white-space:nowrap;
  }
  .ing-reasoning { font-size:13px;color:var(--text-2);line-height:1.7;margin-bottom:10px; }
  .ing-forms { font-size:11px;color:var(--text-3);padding-top:10px;border-top:1px dashed var(--border); }
  .ing-forms strong { color:var(--text-2); }

  .protocol-block {
    padding:20px;border-radius:var(--radius-sm);
    background:var(--sky-pale);border-left:3px solid var(--teal);
    margin-bottom:14px;
  }
  .protocol-label { font-size:11px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;color:var(--teal);margin-bottom:8px; }
  .protocol-text { font-size:13px;color:var(--text-2);line-height:1.75; }

  .cond-list { display:flex;flex-direction:column;gap:14px; }
  .cond-card { padding:18px;border-radius:var(--radius-sm);border:1.5px solid var(--border);background:var(--off-white); }
  .cond-name { font-size:15px;font-weight:600;color:var(--teal);margin-bottom:6px; }
  .cond-protocol { font-size:12px;color:var(--text);font-weight:500;margin-bottom:4px; }
  .cond-evidence { font-size:12px;color:var(--text-3);line-height:1.5;font-style:italic; }

  .study-list { display:flex;flex-direction:column;gap:14px; }
  .study-card { padding:18px;border-radius:var(--radius-sm);border:1.5px solid var(--border);background:var(--off-white); }
  .study-route-tag {
    font-size:10px;font-weight:600;padding:3px 10px;border-radius:50px;
    background:rgba(26,126,168,0.12);color:var(--teal);margin-bottom:8px;
    display:inline-block;letter-spacing:0.5px;
  }
  .study-title { font-size:14px;font-weight:600;color:var(--text);margin-bottom:4px;line-height:1.4; }
  .study-authors { font-size:12px;color:var(--text-3);margin-bottom:8px; }
  .study-finding { font-size:12px;color:var(--text-2);line-height:1.65; }

  .story-grid { display:grid;grid-template-columns:1fr 1fr;gap:16px; }
  .story-card { padding:20px;border-radius:var(--radius-sm);background:var(--off-white);border:1.5px solid var(--border); }
  .story-head { display:flex;align-items:center;gap:12px;margin-bottom:12px;padding-bottom:12px;border-bottom:1px dashed var(--border); }
  .story-avatar {
    width:40px;height:40px;border-radius:50%;
    background:linear-gradient(135deg,var(--sky-pale),var(--sky-light));
    display:flex;align-items:center;justify-content:center;
    font-size:13px;font-weight:600;color:var(--teal);
  }
  .story-meta { font-size:12px;color:var(--text-3); }
  .story-condition { font-size:13px;font-weight:500;color:var(--text);margin-bottom:8px;line-height:1.5; }
  .story-outcome { font-size:12px;color:var(--text-2);line-height:1.65;font-style:italic; }
  .story-sessions { margin-top:10px;font-size:11px;color:var(--teal);font-weight:500; }

  .contra-box { padding:16px;border-radius:var(--radius-sm);background:#FFF4E6;border-left:3px solid #D97706; }
  .contra-title { font-size:12px;font-weight:600;color:#D97706;margin-bottom:8px;text-transform:uppercase;letter-spacing:0.5px; }
  .contra-list { margin:0;padding-left:20px;font-size:12px;color:var(--text-2);line-height:1.7; }

  .lab-grid { display:grid;grid-template-columns:1fr 1fr;gap:12px; }
  .lab-card { padding:14px 16px;border-radius:var(--radius-sm);background:var(--off-white);border:1.5px solid var(--border); }
  .lab-row-head { display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:4px; }
  .lab-n { font-size:12px;font-weight:600;color:var(--text); }
  .lab-code { font-size:10px;padding:2px 8px;border-radius:50px;background:var(--sky-pale);color:var(--teal);font-weight:600; }
  .lab-p { font-size:11px;color:var(--text-3);line-height:1.5; }

  .download-prescription-btn {
    display:inline-block;background:var(--teal);color:#fff;border:none;
    padding:12px 24px;border-radius:50px;font-size:13px;font-weight:600;
    font-family:var(--font-display);cursor:pointer;margin-top:18px;
    transition:background .2s;text-decoration:none;
  }
  .download-prescription-btn:hover { background:var(--teal-dark); }

  .quiz-intro {
    padding:18px;border-radius:var(--radius-sm);
    background:var(--sky-pale);border:1px dashed var(--border-strong);
    font-size:13px;color:var(--text-2);line-height:1.7;margin-bottom:24px;
  }
  .quiz-intro strong { color:var(--teal); }

  .quiz-q-block { margin-bottom:24px; }
  .quiz-q-label { font-size:14px;font-weight:600;color:var(--text);margin-bottom:12px; }
  .quiz-options { display:flex;flex-direction:column;gap:8px; }
  .quiz-option-btn {
    display:flex;align-items:center;justify-content:space-between;
    padding:12px 16px;border-radius:var(--radius-sm);
    border:1.5px solid var(--border);background:var(--off-white);
    cursor:pointer;text-align:left;font-family:var(--font-display);
    font-size:13px;color:var(--text-2);transition:all .2s;
  }
  .quiz-option-btn:hover { border-color:var(--sky); }
  .quiz-option-btn.sel { border-color:var(--teal);background:var(--sky-pale);color:var(--teal);font-weight:500; }

  .ph-row { display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px; }
  .ph-field { display:flex;flex-direction:column;gap:6px; }
  .ph-label { font-size:11px;font-weight:500;color:var(--text-2);letter-spacing:0.5px; }
  .ph-input {
    background:var(--off-white);border:1.5px solid var(--border);
    color:var(--text);padding:11px 14px;font-family:var(--font-display);
    font-size:13px;border-radius:var(--radius-sm);outline:none;
    transition:border-color .2s;width:100%;
  }
  .ph-input:focus { border-color:var(--sky); }
  .ph-textarea {
    width:100%;background:var(--off-white);border:1.5px solid var(--border);
    color:var(--text);padding:11px 14px;font-family:var(--font-display);
    font-size:13px;border-radius:var(--radius-sm);outline:none;resize:none;line-height:1.6;
  }
  .cond-chips { display:flex;gap:8px;flex-wrap:wrap;margin-top:6px; }
  .cond-chip {
    padding:8px 14px;border-radius:50px;border:1.5px solid var(--border);
    background:var(--off-white);color:var(--text-2);
    font-size:12px;font-weight:500;cursor:pointer;font-family:var(--font-display);
    transition:all .15s;
  }
  .cond-chip.sel { border-color:var(--teal);background:var(--teal);color:#fff; }

  .score-card {
    padding:24px;border-radius:var(--radius-sm);
    background:linear-gradient(135deg,#E8F5FF 0%,#D6EEFA 100%);
    border:1.5px solid var(--border);margin-top:18px;
  }
  .score-header { display:flex;justify-content:space-between;align-items:center;margin-bottom:12px; }
  .score-value { font-size:36px;font-weight:600;color:var(--teal);letter-spacing:-1px; }
  .score-value span { font-size:15px;color:var(--text-3);font-weight:400; }
  .score-badge { font-size:11px;padding:5px 12px;border-radius:50px;font-weight:600; }
  .score-text { font-size:13px;color:var(--text-2);line-height:1.7; }

  .custom-protocol {
    padding:24px;border-radius:var(--radius-sm);
    background:var(--white);border:2px solid var(--teal);
    margin-top:20px;
  }
  .protocol-head { display:flex;justify-content:space-between;align-items:center;padding-bottom:14px;border-bottom:1px solid var(--border);margin-bottom:14px; }
  .protocol-title-big { font-size:16px;font-weight:600;color:var(--teal); }
  .protocol-ing-row { display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px dashed var(--border); }
  .protocol-ing-row:last-child { border-bottom:none; }
  .protocol-ing-name { font-size:13px;color:var(--text); }
  .protocol-ing-dose { font-size:13px;font-weight:600;color:var(--teal); }
  .protocol-footer { margin-top:14px;padding-top:14px;border-top:1px solid var(--border);font-size:12px;color:var(--text-3);line-height:1.6; }

  .approval-status-row { display:flex;gap:10px;flex-wrap:wrap;margin-top:16px; }
  .approval-btn {
    padding:10px 20px;border-radius:50px;border:none;
    font-size:12px;font-weight:600;font-family:var(--font-display);
    cursor:pointer;transition:all .2s;
  }
  .approval-btn.send { background:linear-gradient(145deg,var(--teal),var(--sky));color:#fff;box-shadow:0 3px 12px rgba(26,126,168,0.25); }
  .approval-btn.send:hover { transform:translateY(-1px); }
  .approval-pending { padding:10px 18px;border-radius:50px;background:#FFF4E6;color:#D97706;font-size:12px;font-weight:600; }
  .approval-approved { padding:10px 18px;border-radius:50px;background:#E5F5F3;color:#0A7B6E;font-size:12px;font-weight:600; }

  .login-gate {
    padding:40px;text-align:center;border-radius:var(--radius-sm);
    background:var(--sky-pale);border:1px dashed var(--border-strong);
  }
  .login-gate-icon { font-size:40px;margin-bottom:12px; }
  .login-gate-title { font-size:18px;font-weight:600;color:var(--text);margin-bottom:8px; }
  .login-gate-sub { font-size:13px;color:var(--text-2);line-height:1.7;max-width:400px;margin:0 auto 20px; }

  .user-bar {
    display:flex;justify-content:flex-end;align-items:center;gap:12px;
    padding:12px 20px;background:rgba(255,255,255,0.8);backdrop-filter:blur(8px);
    border-radius:50px;margin-bottom:20px;border:1px solid var(--border);
  }
  .user-bar-name { font-size:12px;color:var(--text-2); }
  .user-bar-name strong { color:var(--teal); }
  .user-logout-btn { background:transparent;border:none;color:var(--text-3);cursor:pointer;font-size:12px;font-family:var(--font-display);text-decoration:underline; }

  @media print {
    .no-print { display:none !important; }
    .prescription-page { padding:40px;max-width:none;color:#000;background:#fff; }
  }
  .prescription-page { display:none; }
  .prescription-page.show {
    display:block;position:fixed;inset:0;z-index:500;
    background:#fff;color:#000;padding:40px;overflow:auto;
  }
  .rx-header { display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:18px;border-bottom:2px solid #000;margin-bottom:18px; }
  .rx-logo { font-size:22px;font-weight:700;letter-spacing:-0.5px; }
  .rx-clinic { font-size:11px;color:#555;margin-top:4px;line-height:1.5; }
  .rx-meta { font-size:11px;color:#555;text-align:right;line-height:1.6; }
  .rx-patient-block {
    padding:14px;border:1px solid #000;margin-bottom:20px;
    display:grid;grid-template-columns:1fr 1fr;gap:10px;font-size:12px;
  }
  .rx-section-title { font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin:20px 0 10px;padding-bottom:4px;border-bottom:1px solid #000; }
  .rx-lab-list { padding-left:22px;font-size:12px;line-height:1.8; }
  .rx-lab-list li { margin-bottom:4px; }
  .rx-footer { margin-top:50px;display:flex;justify-content:space-between;align-items:flex-end;padding-top:20px;border-top:1px solid #000; }
  .rx-sig { font-size:11px;color:#555; }
  .rx-disclaimer { margin-top:20px;font-size:10px;color:#777;line-height:1.5;font-style:italic; }
  .rx-close-btn { position:fixed;top:20px;right:20px;z-index:600;background:#000;color:#fff;border:none;padding:10px 20px;border-radius:50px;cursor:pointer;font-size:12px;font-family:var(--font-display); }
  .rx-print-btn { position:fixed;top:20px;right:140px;z-index:600;background:var(--teal);color:#fff;border:none;padding:10px 20px;border-radius:50px;cursor:pointer;font-size:12px;font-family:var(--font-display); }

  @media(max-width:1024px){
    .d-hero { padding:100px 24px 40px; }
    .d-tabs { padding:0 24px; }
    .d-body { padding:32px 24px 60px; }
    .d-card { padding:24px; }
    .benefits-grid, .story-grid, .lab-grid { grid-template-columns:1fr; }
    .ph-row { grid-template-columns:1fr; }
    .d-price-card { width:100%; }
  }
  @media(max-width:768px){
    .d-hero { padding:88px 16px 32px; }
    .d-tabs { padding:0 16px; overflow-x:auto; -webkit-overflow-scrolling:touch; flex-wrap:nowrap; }
    .d-tab-btn { white-space:nowrap; flex-shrink:0; }
    .d-body { padding:24px 16px calc(80px + env(safe-area-inset-bottom,0px)); }
    .d-card { padding:18px 16px; }
    .d-header-row { flex-direction:column; gap:16px; }
    .d-price-card { padding:20px 16px; }
    .d-hero-meta { gap:8px; }
    .d-meta-pill { font-size:11px; padding:6px 12px; }
    .d-title { font-size:clamp(28px,8vw,44px); }
    .d-buy-btn { width:100%; text-align:center; }
  }
  @media(max-width:480px){
    .d-hero { padding:76px 12px 28px; }
    .d-body { padding:20px 12px calc(80px + env(safe-area-inset-bottom,0px)); }
    .d-card { padding:14px 12px; }
    .form-input { font-size:16px; }
  }
`;

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "ingredients", label: "Ingredients" },
  { id: "protocol", label: "Protocol & Dosing" },
  { id: "conditions", label: "Conditions" },
  { id: "evidence", label: "Evidence" },
  { id: "stories", label: "Success Stories" },
  { id: "assess", label: "Get Your Protocol" },
];

function scaleDose(dose: string, multiplier: number): string {
  const match = dose.match(/^([\d,]+(?:\.\d+)?)\s*(\w+.*)$/);
  if (!match) return dose;
  const num = parseFloat(match[1].replace(/,/g, ""));
  const unit = match[2];
  if (isNaN(num) || multiplier === 1) return dose;
  const scaled = Math.round(num * multiplier);
  return `${scaled.toLocaleString("en-IN")}${unit.startsWith(" ") ? unit : " " + unit}`;
}

export default function DripDetailPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const { user, isLoggedIn, isReady } = useAuth();

  const slug = params?.slug ?? "";
  const drip = DRIPS.find((d) => d.slug === slug);
  const details = DRIP_DETAILS[slug];

  const [activeTab, setActiveTab] = useState("overview");
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [history, setHistory] = useState<PatientHistory>({
    name: "", age: "", gender: "", conditions: [], medications: "", allergies: "",
  });
  const [showScore, setShowScore] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState<ApprovalStatus>("none");
  const [showPrescription, setShowPrescription] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);

  const maxScore = useMemo(() => {
    if (!details) return 0;
    return details.quickQuiz.reduce((sum, q) => sum + Math.max(...q.options.map((o) => o.score)), 0);
  }, [details]);

  const totalScore = useMemo(() => {
    return Object.values(quizAnswers).reduce((s, v) => s + v, 0);
  }, [quizAnswers]);

  const scorePct = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

  const scoreMeta = useMemo(() => {
    if (scorePct >= 70) return { label: "Strongly Recommended", bg: "rgba(217,119,6,0.12)", color: "#D97706", reasoning: "Your symptoms indicate significant deficiency signals — you'd likely see meaningful benefit from this protocol." };
    if (scorePct >= 40) return { label: "Recommended", bg: "rgba(26,126,168,0.12)", color: "var(--teal)", reasoning: "Your profile shows moderate indicators. This protocol would provide solid support with measurable outcomes." };
    return { label: "Optional Boost", bg: "rgba(26,158,106,0.12)", color: "#1A9E6A", reasoning: "Your baseline is good — this protocol would serve as a wellness optimisation or maintenance boost." };
  }, [scorePct]);

  const customProtocol = useMemo(() => {
    if (!details) return null;
    const multiplier = scorePct >= 70 ? 1.15 : scorePct >= 40 ? 1.0 : 0.85;
    return details.ingredientRationale.map((ing) => ({
      name: ing.name,
      originalDose: ing.dose,
      adjustedDose: scaleDose(ing.dose, multiplier),
    }));
  }, [details, scorePct]);

  function handleAnswer(qId: string, score: number) {
    setQuizAnswers((prev) => ({ ...prev, [qId]: score }));
  }
  function toggleCondition(c: string) {
    setHistory((prev) => {
      if (c === "None of the above") {
        return { ...prev, conditions: prev.conditions.includes("None of the above") ? [] : ["None of the above"] };
      }
      const without = prev.conditions.filter((x) => x !== "None of the above");
      const next = without.includes(c)
        ? without.filter((x) => x !== c)
        : [...without, c];
      return { ...prev, conditions: next };
    });
  }
  function generateProtocol() {
    if (!isLoggedIn) {
      router.push(`/login?redirect=/treatments/${slug}`);
      return;
    }
    setShowScore(true);
    setTimeout(() => topRef.current?.scrollIntoView({ behavior: "smooth" }), 80);
  }
  function sendForApproval() {
    setApprovalStatus("pending");
    setTimeout(() => setApprovalStatus("approved"), 3000);
  }

  if (!drip || !details) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 40 }}>
        <div style={{ textAlign: "center" }}>
          <h1 style={{ fontSize: 24, marginBottom: 12 }}>Drip not found</h1>
          <Link href="/treatments" style={{ color: "var(--teal)" }}>← Back to all treatments</Link>
        </div>
      </div>
    );
  }

  const assessmentReady = history.name && history.age && history.gender && Object.keys(quizAnswers).length >= 3;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: PAGE_CSS }} />

      {showPrescription && (
        <>
          <button className="rx-close-btn no-print" onClick={() => setShowPrescription(false)}>× Close</button>
          <button className="rx-print-btn no-print" onClick={() => window.print()}>🖨 Print / Save PDF</button>
          <div className="prescription-page show">
            <div className="rx-header">
              <div>
                <div className="rx-logo">nutridrip</div>
                <div className="rx-clinic">
                  NutriDrip IV Therapy Clinic<br />
                  Registered under Clinical Establishments Act<br />
                  Physician on record: Dr. Kavya Mehra, MBBS, MD
                </div>
              </div>
              <div className="rx-meta">
                Date: {new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}<br />
                Rx No: NDR/{slug.toUpperCase()}/{Date.now().toString().slice(-6)}<br />
                Protocol: {drip.name}
              </div>
            </div>

            <div className="rx-patient-block">
              <div><strong>Patient:</strong> {history.name || user?.name || "—"}</div>
              <div><strong>Age / Gender:</strong> {history.age || "—"} / {history.gender || "—"}</div>
              <div><strong>Known Conditions:</strong> {history.conditions.length > 0 ? history.conditions.join(", ") : "—"}</div>
              <div><strong>Medications:</strong> {history.medications || "None reported"}</div>
              <div style={{ gridColumn: "1 / -1" }}><strong>Allergies:</strong> {history.allergies || "None reported"}</div>
            </div>

            <div className="rx-section-title">Recommended Lab Investigations — prior to {drip.name} protocol</div>
            <ol className="rx-lab-list">
              {details.labPanel.map((lab) => (
                <li key={lab.code}>
                  <strong>{lab.name}</strong> <span style={{ color: "#777" }}>({lab.code})</span>
                  <br />
                  <span style={{ fontSize: 10, color: "#555", fontStyle: "italic" }}>{lab.purpose}</span>
                </li>
              ))}
            </ol>

            {showScore && (
              <>
                <div className="rx-section-title">Assessment Summary</div>
                <div style={{ fontSize: 12, lineHeight: 1.7 }}>
                  Quick-assessment score: <strong>{totalScore}/{maxScore} ({scorePct}%)</strong> — {scoreMeta.label}<br />
                  {scoreMeta.reasoning}
                </div>

                <div className="rx-section-title">Personalised Infusion Protocol</div>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #000" }}>
                      <th style={{ textAlign: "left", padding: 6 }}>Ingredient</th>
                      <th style={{ textAlign: "left", padding: 6 }}>Dose</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customProtocol?.map((p) => (
                      <tr key={p.name} style={{ borderBottom: "1px dashed #999" }}>
                        <td style={{ padding: 6 }}>{p.name}</td>
                        <td style={{ padding: 6, fontWeight: 600 }}>{p.adjustedDose}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div style={{ fontSize: 11, marginTop: 10, color: "#555" }}>
                  Infusion time: {details.protocolReasoning.infusionTime}
                </div>
              </>
            )}

            <div className="rx-footer">
              <div className="rx-sig">
                Physician signature: _________________________<br />
                Date: _________________________
              </div>
              <div className="rx-sig" style={{ textAlign: "right" }}>
                Clinic stamp
              </div>
            </div>

            <div className="rx-disclaimer">
              This prescription is generated based on patient-reported self-assessment and is intended for clinical review.
              All investigations should be verified by the attending physician prior to infusion. Do not proceed with IV therapy
              without formal physician approval. Contraindications: {details.frequency.contraindications.join("; ")}.
            </div>
          </div>
        </>
      )}

      <div className="detail-wrap">
        <div className="d-hero" style={{ background: `linear-gradient(135deg, var(--teal) 0%, var(--sky) 100%), ${drip.accentGradient}` }}>
          <div className="blob b1" />
          <div className="blob b2" />
          <div className="d-hero-inner">
            <div className="d-breadcrumb">
              <Link href="/">Home</Link> › <Link href="/treatments">Treatments</Link> › {drip.name}
            </div>
            <div className="d-header-row">
              <div className="d-heading-area">
                <div className="d-icon-badge">{drip.icon}</div>
                <h1 className="d-title">{drip.name}</h1>
                <p className="d-subtitle">{details.heroTagline}</p>
                <div className="d-hero-meta">
                  <span className="d-meta-pill">⏱ {drip.duration}</span>
                  <span className="d-meta-pill">💧 {drip.volume}</span>
                  <span className="d-meta-pill">📋 {details.labPanel.length} lab tests</span>
                  <span className="d-meta-pill">📚 {details.studies.length} studies cited</span>
                </div>
              </div>
              <div className="d-price-card">
                <div className="d-price-val">₹{drip.price.toLocaleString("en-IN")}</div>
                <div className="d-price-sub">per session (excl. taxes)</div>
                <Link href={`/book-now?drip=${drip.name}`} className="d-book-btn">Book this Drip →</Link>
              </div>
            </div>
          </div>
        </div>

        <div className="d-tabs-wrap">
          <div className="d-tabs">
            {TABS.map((t) => (
              <button
                key={t.id}
                className={`d-tab${activeTab === t.id ? " active" : ""}`}
                onClick={() => setActiveTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="d-body" ref={topRef}>
          {activeTab === "overview" && (
            <>
              <div className="d-card">
                <h2 className="d-card-title">How it <em>Helps</em></h2>
                <p className="d-card-sub">{drip.description}</p>
                <div className="benefits-grid">
                  {details.benefits.map((b) => (
                    <div key={b.title} className="benefit-card">
                      <div className="benefit-icon">{b.icon}</div>
                      <div>
                        <div className="benefit-title">{b.title}</div>
                        <div className="benefit-desc">{b.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="d-card">
                <h2 className="d-card-title"><em>Frequency</em> &amp; Course</h2>
                <div className="protocol-block">
                  <div className="protocol-label">Acute / Loading Phase</div>
                  <div className="protocol-text">{details.frequency.acute}</div>
                </div>
                <div className="protocol-block">
                  <div className="protocol-label">Maintenance Phase</div>
                  <div className="protocol-text">{details.frequency.maintenance}</div>
                </div>
                <div className="contra-box">
                  <div className="contra-title">⚠ Contraindications — Do NOT proceed if</div>
                  <ul className="contra-list">
                    {details.frequency.contraindications.map((c) => (
                      <li key={c}>{c}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          )}

          {activeTab === "ingredients" && (
            <div className="d-card">
              <h2 className="d-card-title">Ingredient <em>Rationale</em></h2>
              <p className="d-card-sub">
                Each ingredient is chosen based on pharmacokinetic reasoning, clinical evidence, and the specific bioavailability
                advantages of intravenous administration. All ingredients are also available in other forms worldwide — here's why IV is optimal for this protocol.
              </p>
              <div className="ing-list">
                {details.ingredientRationale.map((ing) => (
                  <div key={ing.name} className="ing-card">
                    <div className="ing-head">
                      <div className="ing-name-big">{ing.name}</div>
                      <div className="ing-dose-tag">{ing.dose}</div>
                    </div>
                    <div className="ing-reasoning">{ing.reasoning}</div>
                    <div className="ing-forms">
                      <strong>Forms used globally:</strong> {ing.formsUsed}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "protocol" && (
            <div className="d-card">
              <h2 className="d-card-title">Protocol &amp; <em>Dose Reasoning</em></h2>
              <p className="d-card-sub">
                Why this formulation uses IV over oral, and why the specific mg quantities were chosen.
              </p>

              <div className="protocol-block">
                <div className="protocol-label">Why IV (not oral/IM)</div>
                <div className="protocol-text">{details.protocolReasoning.why}</div>
              </div>
              <div className="protocol-block">
                <div className="protocol-label">Dose Rationale (why these mg?)</div>
                <div className="protocol-text">{details.protocolReasoning.doseRationale}</div>
              </div>
              <div className="protocol-block">
                <div className="protocol-label">Infusion Time &amp; Rate</div>
                <div className="protocol-text">{details.protocolReasoning.infusionTime}</div>
              </div>

              <div style={{ marginTop: 28 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Standard Lab Panel for {drip.name}</h3>
                <p style={{ fontSize: 13, color: "var(--text-3)", marginBottom: 16, lineHeight: 1.6 }}>
                  Required prior to starting this protocol. Log in to download as a formatted prescription for your lab.
                </p>
                <div className="lab-grid">
                  {details.labPanel.map((lab) => (
                    <div key={lab.code} className="lab-card">
                      <div className="lab-row-head">
                        <span className="lab-n">{lab.name}</span>
                        <span className="lab-code">{lab.code}</span>
                      </div>
                      <div className="lab-p">{lab.purpose}</div>
                    </div>
                  ))}
                </div>
                {isLoggedIn ? (
                  <button className="download-prescription-btn" onClick={() => setShowPrescription(true)}>
                    📄 Download Lab Prescription
                  </button>
                ) : (
                  <button
                    className="download-prescription-btn"
                    onClick={() => router.push(`/login?redirect=/treatments/${slug}`)}
                  >
                    🔒 Login to Download Prescription
                  </button>
                )}
              </div>
            </div>
          )}

          {activeTab === "conditions" && (
            <div className="d-card">
              <h2 className="d-card-title">Best Ways to <em>Use</em> for Different Conditions</h2>
              <p className="d-card-sub">
                {drip.name} is tailored differently based on your primary concern. Your physician will select the appropriate protocol.
              </p>
              <div className="cond-list">
                {details.conditions.map((c) => (
                  <div key={c.name} className="cond-card">
                    <div className="cond-name">{c.name}</div>
                    <div className="cond-protocol">Protocol: {c.protocol}</div>
                    <div className="cond-evidence">Evidence: {c.evidence}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "evidence" && (
            <div className="d-card">
              <h2 className="d-card-title">Global <em>Evidence</em> &amp; Studies</h2>
              <p className="d-card-sub">
                These ingredients and protocols are used worldwide in various forms — oral, IV, IM and more.
                Here is the peer-reviewed evidence supporting the components of {drip.name}.
              </p>
              <div className="study-list">
                {details.studies.map((s) => (
                  <div key={s.title} className="study-card">
                    <div className="study-route-tag">Route: {s.route}</div>
                    <div className="study-title">{s.title}</div>
                    <div className="study-authors">{s.authors} · <em>{s.journal}</em> · {s.year}</div>
                    <div className="study-finding">{s.finding}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "stories" && (
            <div className="d-card">
              <h2 className="d-card-title">Client <em>Success Stories</em></h2>
              <p className="d-card-sub">
                Real outcomes from clients who came with specific concerns. Names abbreviated for privacy.
              </p>
              <div className="story-grid">
                {details.successStories.map((s) => (
                  <div key={s.clientInitials} className="story-card">
                    <div className="story-head">
                      <div className="story-avatar">{s.clientInitials}</div>
                      <div>
                        <div className="story-meta">{s.age} / {s.gender === "M" ? "Male" : "Female"}</div>
                        <div className="story-meta">{s.sessions} sessions completed</div>
                      </div>
                    </div>
                    <div className="story-condition"><strong>Presented with:</strong> {s.condition}</div>
                    <div className="story-outcome">&quot;{s.outcome}&quot;</div>
                    <div className="story-sessions">✓ {s.sessions} sessions</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "assess" && (
            <div className="d-card">
              {isReady && isLoggedIn && (
                <div className="user-bar">
                  <span className="user-bar-name">Signed in as <strong>{user?.name}</strong></span>
                  <button className="user-logout-btn" onClick={() => logout()}>Sign out</button>
                </div>
              )}

              <h2 className="d-card-title">Get Your <em>Personalised Protocol</em></h2>
              <p className="d-card-sub">
                Answer {details.quickQuiz.length} quick questions specific to {drip.name} + share basic history.
                We'll generate your score and a custom-dosed protocol for physician review.
              </p>

              <div className="quiz-intro">
                <strong>What happens next:</strong> Your responses generate a severity score. Based on your score,
                we adjust the ingredient doses within clinically safe ranges, then send the protocol to our
                expert doctors for approval before it becomes your finalised Rx.
              </div>

              <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--text)", margin: "24px 0 14px" }}>
                Patient History
              </h3>
              <div className="ph-row">
                <div className="ph-field">
                  <label className="ph-label">Full Name</label>
                  <input type="text" className="ph-input" value={history.name}
                    onChange={(e) => setHistory((p) => ({ ...p, name: e.target.value }))}
                    placeholder="Full name" />
                </div>
                <div className="ph-field">
                  <label className="ph-label">Age</label>
                  <input type="number" className="ph-input" value={history.age}
                    onChange={(e) => setHistory((p) => ({ ...p, age: e.target.value }))}
                    placeholder="e.g. 34" />
                </div>
              </div>
              <div className="ph-field" style={{ marginBottom: 14 }}>
                <label className="ph-label">Gender</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {(["male", "female", "other"] as const).map((g) => (
                    <button key={g} type="button"
                      className={`cond-chip${history.gender === g ? " sel" : ""}`}
                      onClick={() => setHistory((p) => ({ ...p, gender: g }))}
                    >
                      {g[0].toUpperCase() + g.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="ph-field" style={{ marginBottom: 14 }}>
                <label className="ph-label">Known medical conditions (select all that apply)</label>
                <div className="cond-chips">
                  {KNOWN_CONDITIONS.map((c) => (
                    <button key={c} type="button"
                      className={`cond-chip${history.conditions.includes(c) ? " sel" : ""}`}
                      onClick={() => toggleCondition(c)}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <div className="ph-field" style={{ marginBottom: 14 }}>
                <label className="ph-label">Current medications</label>
                <textarea className="ph-textarea" rows={2}
                  value={history.medications}
                  onChange={(e) => setHistory((p) => ({ ...p, medications: e.target.value }))}
                  placeholder="List any regular medications" />
              </div>
              <div className="ph-field" style={{ marginBottom: 20 }}>
                <label className="ph-label">Allergies</label>
                <textarea className="ph-textarea" rows={2}
                  value={history.allergies}
                  onChange={(e) => setHistory((p) => ({ ...p, allergies: e.target.value }))}
                  placeholder="Drug allergies, food allergies, etc." />
              </div>

              <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--text)", margin: "24px 0 14px" }}>
                {drip.name}-Specific Assessment
              </h3>
              {details.quickQuiz.map((q) => (
                <div key={q.id} className="quiz-q-block">
                  <div className="quiz-q-label">{q.label}</div>
                  <div className="quiz-options">
                    {q.options.map((opt) => {
                      const sel = quizAnswers[q.id] === opt.score;
                      return (
                        <button key={opt.value}
                          className={`quiz-option-btn${sel ? " sel" : ""}`}
                          onClick={() => handleAnswer(q.id, opt.score)}
                        >
                          <span>{opt.label}</span>
                          {sel && <span>✓</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              <button
                className="download-prescription-btn"
                disabled={!assessmentReady}
                style={{
                  background: assessmentReady ? "linear-gradient(145deg,var(--teal),var(--sky))" : "var(--border)",
                  cursor: assessmentReady ? "pointer" : "not-allowed",
                }}
                onClick={generateProtocol}
              >
                {isLoggedIn ? "Generate Score & Protocol →" : "🔒 Login to Generate Protocol →"}
              </button>

              {!isLoggedIn && isReady && (
                <div className="login-gate" style={{ marginTop: 24 }}>
                  <div className="login-gate-icon">🔒</div>
                  <div className="login-gate-title">Login Required</div>
                  <p className="login-gate-sub">
                    Your personalised score, protocol, and downloadable prescription are available after sign-in.
                    Use the demo account to explore.
                  </p>
                  <Link href={`/login?redirect=/treatments/${slug}`} className="download-prescription-btn" style={{ textDecoration: "none", marginTop: 0 }}>
                    Sign In →
                  </Link>
                </div>
              )}

              {showScore && isLoggedIn && (
                <>
                  <div className="score-card">
                    <div className="score-header">
                      <div className="score-value">{totalScore}<span> / {maxScore}</span></div>
                      <div className="score-badge" style={{ background: scoreMeta.bg, color: scoreMeta.color }}>
                        {scoreMeta.label}
                      </div>
                    </div>
                    <div className="score-text">{scoreMeta.reasoning}</div>
                  </div>

                  <div className="custom-protocol">
                    <div className="protocol-head">
                      <div className="protocol-title-big">Your Custom {drip.name} Protocol</div>
                      <div style={{ fontSize: 11, color: "var(--text-3)" }}>
                        {scorePct >= 70 ? "Loading doses (+15%)" : scorePct >= 40 ? "Standard doses" : "Maintenance doses (−15%)"}
                      </div>
                    </div>
                    {customProtocol?.map((p) => (
                      <div key={p.name} className="protocol-ing-row">
                        <span className="protocol-ing-name">{p.name}</span>
                        <span className="protocol-ing-dose">{p.adjustedDose}</span>
                      </div>
                    ))}
                    <div className="protocol-footer">
                      Infusion time: <strong>{details.protocolReasoning.infusionTime}</strong>
                      <br />
                      This protocol is based on self-assessment and must be approved by our expert physician before administration.
                    </div>

                    <div className="approval-status-row">
                      {approvalStatus === "none" && (
                        <button className="approval-btn send" onClick={sendForApproval}>
                          📨 Send for Physician Approval
                        </button>
                      )}
                      {approvalStatus === "pending" && (
                        <span className="approval-pending">⏳ Pending review by Dr. Kavya Mehra (usually &lt;2 hrs)</span>
                      )}
                      {approvalStatus === "approved" && (
                        <span className="approval-approved">✓ Approved by Dr. Kavya Mehra — ready to book</span>
                      )}

                      <button className="download-prescription-btn" style={{ marginTop: 0 }} onClick={() => setShowPrescription(true)}>
                        📄 Download Lab Prescription
                      </button>

                      {approvalStatus === "approved" && (
                        <Link href={`/book-now?drip=${drip.name}`} className="download-prescription-btn" style={{ marginTop: 0, textDecoration: "none" }}>
                          Book Your Session →
                        </Link>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
