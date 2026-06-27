"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { DashLayout, StatCard } from "@/components/dashboard/DashLayout";
import { useAuth, ALL_PERMISSIONS, type Permission } from "@/lib/auth";
import { DRIPS } from "@/lib/data/drips";
import { DOCTORS } from "@/lib/data/doctors";
import { DEMO_NURSES } from "@/lib/data/nursing-mock";
import {
  CONTENT_REGISTRY, getAllOverrides, getContentText,
  setContent, resetContent, type ScreenConfig,
} from "@/lib/content-store";

const SUBADMIN_KEY = "nutridrip_subadmins";
const ASSIGN_KEY  = "nutridrip_assignments";
const DRIP_EDIT_KEY = "nutridrip_drip_overrides";

type StudioTab = "overview" | "content" | "drips" | "quiz" | "assignments" | "team";

type SubAdmin = {
  id: string; name: string; email: string;
  permissions: Permission[]; createdAt: string; status: "active" | "disabled";
};

type Assignment = {
  id: string; type: "doctor-area" | "nurse-area" | "doctor-nurse";
  personId: string; personName: string; areaOrTarget: string; priority: number;
};

type DripOverride = {
  name?: string; subtitle?: string; price?: number;
  description?: string; duration?: string; tags?: string[];
};

function loadJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : fallback; } catch { return fallback; }
}
function saveJSON(key: string, value: unknown) {
  if (typeof window !== "undefined") localStorage.setItem(key, JSON.stringify(value));
}

const STUDIO_CSS = `
  .studio-tabs{display:flex;gap:0;background:var(--white);border-radius:var(--radius);border:1.5px solid var(--border);padding:4px;margin-bottom:24px;overflow-x:auto}
  .st-btn{padding:12px 20px;border-radius:var(--radius-sm);border:none;font-size:13px;font-weight:500;font-family:var(--font-display);color:var(--text-3);cursor:pointer;background:transparent;transition:all .15s;white-space:nowrap;display:flex;align-items:center;gap:8px}
  .st-btn.active{background:var(--teal);color:#fff}
  .st-btn:not(.active):hover{color:var(--teal)}
  .studio-panel{background:var(--white);border-radius:var(--radius);border:1.5px solid var(--border);padding:28px;margin-bottom:20px}
  .sp-title{font-size:18px;font-weight:600;letter-spacing:-.4px;margin-bottom:6px}
  .sp-title em{font-style:italic;font-family:var(--font-serif);color:var(--teal);font-weight:400}
  .sp-sub{font-size:13px;color:var(--text-3);line-height:1.6;margin-bottom:20px}
  .field-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}
  @media(max-width:768px){.field-grid{grid-template-columns:1fr}.studio-panel{padding:18px 14px}}
  @media(max-width:480px){.field-input{font-size:16px}.st-btn{padding:10px 14px;font-size:12px}}
  .field-group{display:flex;flex-direction:column;gap:5px}
  .field-label{font-size:11px;font-weight:500;color:var(--text-2);letter-spacing:.3px}
  .field-input{padding:10px 14px;border-radius:var(--radius-sm);border:1.5px solid var(--border);background:var(--off-white);font-size:13px;font-family:var(--font-display);outline:none;width:100%}
  .field-input:focus{border-color:var(--sky)}
  .drip-edit-card{padding:18px;border-radius:var(--radius-sm);border:1.5px solid var(--border);background:var(--off-white);margin-bottom:14px}
  .dec-header{display:flex;align-items:center;gap:12px;margin-bottom:0}
  .dec-header.open{margin-bottom:14px}
  .dec-icon{font-size:24px}
  .dec-name{font-size:16px;font-weight:600;color:var(--text);flex:1}
  .dec-toggle{padding:6px 14px;border-radius:50px;border:1.5px solid var(--border);background:var(--white);color:var(--text-2);font-size:11px;font-weight:500;font-family:var(--font-display);cursor:pointer}
  .dec-toggle.open{background:var(--sky-pale);color:var(--teal);border-color:var(--teal)}
  .assign-card{display:flex;align-items:center;gap:14px;padding:14px;border-radius:var(--radius-sm);border:1.5px solid var(--border);background:var(--white);margin-bottom:10px}
  .perm-chips{display:flex;gap:6px;flex-wrap:wrap;margin-top:6px}
  .perm-chip{padding:5px 12px;border-radius:50px;border:1.5px solid var(--border);background:var(--off-white);color:var(--text-2);font-size:10px;font-weight:500;cursor:pointer;font-family:var(--font-display);transition:all .15s}
  .perm-chip.sel{border-color:var(--teal);background:var(--teal);color:#fff}
  .save-btn{padding:10px 24px;border-radius:50px;border:none;background:linear-gradient(145deg,var(--teal),var(--sky));color:#fff;font-size:12px;font-weight:600;font-family:var(--font-display);cursor:pointer;box-shadow:0 3px 12px rgba(26,126,168,.25);transition:transform .2s;margin-top:12px}
  .save-btn:hover{transform:translateY(-1px)}
  .del-btn{padding:6px 14px;border-radius:50px;border:none;background:#FBE7E7;color:#D42C2C;font-size:11px;font-weight:500;font-family:var(--font-display);cursor:pointer}
  .quiz-section-card{padding:16px;border-radius:var(--radius-sm);border:1.5px solid var(--border);background:var(--off-white);margin-bottom:12px}
  .qsc-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px}
  .qsc-title{font-size:14px;font-weight:600;color:var(--text)}
  .qsc-count{font-size:11px;color:var(--text-3)}
  .overview-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:24px}
  @media(max-width:1024px){.overview-grid{grid-template-columns:1fr 1fr}}
  @media(max-width:640px){.overview-grid{grid-template-columns:1fr}}
  .ov-card{padding:20px;border-radius:var(--radius-sm);border:1.5px solid var(--border);background:var(--off-white);cursor:pointer;transition:all .2s;text-align:left;font-family:var(--font-display)}
  .ov-card:hover{border-color:var(--sky);transform:translateY(-2px);box-shadow:var(--shadow)}
  .ov-icon{font-size:28px;margin-bottom:10px}
  .ov-title{font-size:15px;font-weight:600;color:var(--text);margin-bottom:4px}
  .ov-desc{font-size:12px;color:var(--text-3);line-height:1.5}
`;

const TABS: { id: StudioTab; label: string; icon: string }[] = [
  { id: "overview", label: "Overview", icon: "📊" },
  { id: "content", label: "Content Editor", icon: "✏️" },
  { id: "drips", label: "Drip Editor", icon: "💧" },
  { id: "quiz", label: "Quiz Editor", icon: "📋" },
  { id: "assignments", label: "Assignments", icon: "📍" },
  { id: "team", label: "Team & Sub-Admins", icon: "👥" },
];

const QUIZ_SECTIONS = [
  { id: 0, name: "Lifestyle Profile", count: 5, desc: "Always shown: age, gender, occupation, climate, sexually active." },
  { id: 1, name: "Energy & Vitality", count: 5, desc: "Fatigue + sleep → if fatigue >6: energy crash + caffeine." },
  { id: 2, name: "Immunity & Recovery", count: 5, desc: "Sick frequency + recovery → gut health, muscle soreness, antibiotics." },
  { id: 3, name: "Skin, Hair & Clinical Signs", count: 14, desc: "Skin + hair → hair loss pattern, scalp, dryness areas, darkening, intimate, breast, nail signs." },
  { id: 4, name: "Physical Performance", count: 4, desc: "Exercise → if active: recovery + plateau. If sedentary: stamina." },
  { id: 5, name: "Cognitive & Mood", count: 10, desc: "Stress + focus + brain fog → anxiety, memory, procrastination, motivation, mindfulness, screen time." },
  { id: 6, name: "Nutrition & Hydration", count: 3, desc: "Always shown: diet type, water intake, fruit/veg servings." },
  { id: 7, name: "Oral & Metabolic Markers", count: 13, desc: "Oral health → tongue, urine, metabolic signs, eye signs, stool, food reactions, bloating, reflux, appetite." },
  { id: 8, name: "Sexual & Reproductive Health", count: 12, desc: "Male: libido, erectile, morning erections, stamina, fertility. Female: menstrual, pain, flow, PCOD, PMS, discharge, fertility." },
];

const AREAS = ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Pune", "Gurgaon", "Ahmedabad"];

export default function AdminStudio() {
  const { role } = useAuth();
  const isSuperAdmin = role === "admin";
  const [tab, setTab] = useState<StudioTab>("overview");

  const [activeRoute, setActiveRoute] = useState(CONTENT_REGISTRY[0].route);
  const [overrides, setOverrides] = useState<Record<string, string | string[]>>({});
  const [dripEdits, setDripEdits] = useState<Record<string, DripOverride>>({});
  const [expandedDrip, setExpandedDrip] = useState<string | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [newAssignType, setNewAssignType] = useState<Assignment["type"]>("doctor-area");
  const [newAssignPerson, setNewAssignPerson] = useState("");
  const [newAssignTarget, setNewAssignTarget] = useState("");
  const [subadmins, setSubadmins] = useState<SubAdmin[]>([]);
  const [newSAName, setNewSAName] = useState("");
  const [newSAEmail, setNewSAEmail] = useState("");
  const [newSAPerms, setNewSAPerms] = useState<Permission[]>([]);

  useEffect(() => {
    setOverrides(getAllOverrides());
    setDripEdits(loadJSON(DRIP_EDIT_KEY, {}));
    setAssignments(loadJSON(ASSIGN_KEY, []));
    setSubadmins(loadJSON(SUBADMIN_KEY, []));
    const handler = () => setOverrides(getAllOverrides());
    window.addEventListener("nutridrip_content_change", handler);
    return () => window.removeEventListener("nutridrip_content_change", handler);
  }, []);

  const totalOverrides = Object.keys(overrides).length;
  const totalDripEdits = Object.keys(dripEdits).length;
  const activeScreen = CONTENT_REGISTRY.find((s) => s.route === activeRoute);

  function getDripField(slug: string, field: keyof DripOverride, fallback: string | number | string[]) {
    return dripEdits[slug]?.[field] ?? fallback;
  }
  function setDripField(slug: string, field: keyof DripOverride, value: string | number | string[]) {
    const next = { ...dripEdits, [slug]: { ...dripEdits[slug], [field]: value } };
    setDripEdits(next);
    saveJSON(DRIP_EDIT_KEY, next);
  }
  function resetDripEdits(slug: string) {
    const next = { ...dripEdits };
    delete next[slug];
    setDripEdits(next);
    saveJSON(DRIP_EDIT_KEY, next);
  }

  function addAssignment() {
    if (!newAssignPerson || !newAssignTarget) return;
    const a: Assignment = {
      id: `asgn-${Date.now()}`, type: newAssignType,
      personId: newAssignPerson, personName: newAssignPerson,
      areaOrTarget: newAssignTarget,
      priority: assignments.filter((x) => x.type === newAssignType).length + 1,
    };
    const next = [...assignments, a];
    setAssignments(next);
    saveJSON(ASSIGN_KEY, next);
    setNewAssignPerson("");
    setNewAssignTarget("");
  }
  function removeAssignment(id: string) {
    const next = assignments.filter((a) => a.id !== id);
    setAssignments(next);
    saveJSON(ASSIGN_KEY, next);
  }

  function addSubAdmin() {
    if (!newSAName || !newSAEmail) return;
    const sa: SubAdmin = {
      id: `sa-${Date.now()}`, name: newSAName, email: newSAEmail,
      permissions: newSAPerms, createdAt: new Date().toISOString(), status: "active",
    };
    const next = [...subadmins, sa];
    setSubadmins(next);
    saveJSON(SUBADMIN_KEY, next);
    setNewSAName(""); setNewSAEmail(""); setNewSAPerms([]);
  }
  function toggleSAPerm(p: Permission) {
    setNewSAPerms((prev) => prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]);
  }
  function removeSubAdmin(id: string) {
    const next = subadmins.filter((s) => s.id !== id);
    setSubadmins(next);
    saveJSON(SUBADMIN_KEY, next);
  }
  function toggleSubAdminStatus(id: string) {
    const next = subadmins.map((s) => s.id === id ? { ...s, status: (s.status === "active" ? "disabled" : "active") as "active" | "disabled" } : s);
    setSubadmins(next);
    saveJSON(SUBADMIN_KEY, next);
  }

  // Publish / save state
  const [published, setPublished] = useState(false);
  const [discarded, setDiscarded] = useState(false);

  function handlePublish() {
    // Content is already saved on blur — "Publish" confirms it's live
    setPublished(true);
    setTimeout(() => setPublished(false), 3000);
  }

  function handleDiscardAll() {
    if (!confirm("Discard ALL changes? This will reset every edit to defaults across content, drips, and assignments.")) return;
    resetContent();
    setDripEdits({});
    saveJSON(DRIP_EDIT_KEY, {});
    setOverrides({});
    setDiscarded(true);
    setTimeout(() => setDiscarded(false), 3000);
  }

  function countOverridesFor(screen: ScreenConfig): number {
    return screen.sections.reduce((s, sec) => s + sec.blocks.filter((b) => b.key in overrides).length, 0);
  }

  const hasAnyChanges = totalOverrides > 0 || totalDripEdits > 0 || assignments.length > 0;

  return (
    <DashLayout
      title={<>Master <em>Editor Studio</em></>}
      subtitle={isSuperAdmin ? "Super Admin — full platform control across all features and screens." : "Sub-Admin — limited to assigned permissions."}
      allowedRoles={["admin"]}
    >
      <style dangerouslySetInnerHTML={{ __html: STUDIO_CSS }} />

      <Link href="/dashboard/admin" style={{ fontSize: 13, color: "var(--teal)", textDecoration: "none", marginBottom: 14, display: "inline-block" }}>
        ← Back to dashboard
      </Link>

      <div className="studio-tabs">
        {TABS.map((t) => {
          if (t.id === "team" && !isSuperAdmin) return null;
          return (
            <button key={t.id} className={`st-btn${tab === t.id ? " active" : ""}`} onClick={() => setTab(t.id)}>
              <span style={{ fontSize: 16 }}>{t.icon}</span>
              {t.label}
            </button>
          );
        })}
      </div>

      {/* ─── OVERVIEW ─── */}
      {tab === "overview" && (
        <>
          <div className="overview-grid">
            {TABS.filter((t) => t.id !== "overview" && (t.id !== "team" || isSuperAdmin)).map((t) => (
              <button key={t.id} className="ov-card" onClick={() => setTab(t.id)}>
                <div className="ov-icon">{t.icon}</div>
                <div className="ov-title">{t.label}</div>
                <div className="ov-desc">
                  {t.id === "content" && `${totalOverrides} overrides across ${CONTENT_REGISTRY.length} screens`}
                  {t.id === "drips" && `${DRIPS.length} drips · ${totalDripEdits} customised`}
                  {t.id === "quiz" && `${QUIZ_SECTIONS.length} sections · ${QUIZ_SECTIONS.reduce((s, q) => s + q.count, 0)}+ questions`}
                  {t.id === "assignments" && `${assignments.length} assignments · ${AREAS.length} zones`}
                  {t.id === "team" && `${subadmins.length} sub-admins · ${ALL_PERMISSIONS.length} permissions`}
                </div>
              </button>
            ))}
          </div>
          <div className="stat-grid">
            <StatCard icon="✏️" label="Content Overrides" value={totalOverrides} />
            <StatCard icon="💧" label="Drips Configured" value={DRIPS.length} />
            <StatCard icon="📍" label="Assignments" value={assignments.length} />
            <StatCard icon="👥" label="Sub-Admins" value={subadmins.length} />
          </div>
        </>
      )}

      {/* ─── CONTENT EDITOR ─── */}
      {tab === "content" && (
        <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 20 }}>
          <div className="studio-panel" style={{ padding: 16, height: "fit-content", position: "sticky", top: 100 }}>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", color: "var(--text-3)", marginBottom: 12 }}>Screens</div>
            {CONTENT_REGISTRY.map((screen) => {
              const cnt = countOverridesFor(screen);
              return (
                <button key={screen.route} onClick={() => setActiveRoute(screen.route)} style={{
                  display: "flex", alignItems: "center", gap: 8, width: "100%", textAlign: "left",
                  padding: "8px 10px", borderRadius: "var(--radius-sm)", border: "none",
                  background: activeRoute === screen.route ? "var(--sky-pale)" : "transparent",
                  color: activeRoute === screen.route ? "var(--teal)" : "var(--text-2)",
                  fontWeight: activeRoute === screen.route ? 600 : 400,
                  fontSize: 12, cursor: "pointer", fontFamily: "var(--font-display)", marginBottom: 4,
                }}>
                  <span>{screen.icon}</span><span style={{ flex: 1 }}>{screen.label}</span>
                  {cnt > 0 && <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 50, background: "var(--teal)", color: "#fff" }}>{cnt}</span>}
                </button>
              );
            })}
            {totalOverrides > 0 && (
              <button className="del-btn" style={{ marginTop: 12, width: "100%" }} onClick={() => { if (confirm("Reset ALL content?")) resetContent(); }}>Reset All</button>
            )}
          </div>
          <div className="studio-panel">
            {activeScreen && (
              <>
                <div className="sp-title">{activeScreen.icon} {activeScreen.label}</div>
                <p className="sp-sub">
                  Route: <code style={{ fontSize: 11, background: "var(--sky-pale)", padding: "2px 8px", borderRadius: 50 }}>{activeScreen.route}</code>
                  {activeScreen.route !== "/globals" && <> · <a href={activeScreen.route} target="_blank" rel="noopener noreferrer" style={{ color: "var(--teal)", fontSize: 12 }}>Open page ↗</a></>}
                </p>
                {activeScreen.sections.map((section) => (
                  <div key={section.id} style={{ marginBottom: 20, padding: 16, background: "var(--off-white)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: "var(--text)" }}>{section.icon} {section.label}</div>
                    {section.blocks.map((block) => {
                      if (block.type !== "text" && block.type !== "image") return null;
                      const isOvr = block.key in overrides;
                      return (
                        <div key={block.key} style={{ marginBottom: 16 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11, color: "var(--text-2)", marginBottom: 4 }}>
                            <span>{isOvr && <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "var(--teal)", marginRight: 6 }}></span>}{block.label}</span>
                            {isOvr && <button style={{ fontSize: 10, background: "none", border: "none", color: "var(--text-3)", cursor: "pointer", textDecoration: "underline" }} onClick={() => resetContent(block.key)}>Reset</button>}
                          </div>
                          {block.hint && <div style={{ fontSize: 10, color: "var(--text-3)", marginBottom: 6, fontStyle: "italic" }}>{block.hint}</div>}

                          {block.type === "text" && (block.multiline ? (
                            <textarea className="field-input" rows={3} style={{ resize: "vertical", lineHeight: 1.6 }} defaultValue={getContentText(block.key, block.defaultValue)} onBlur={(e) => setContent(block.key, e.target.value)} />
                          ) : (
                            <input type="text" className="field-input" defaultValue={getContentText(block.key, block.defaultValue)} onBlur={(e) => setContent(block.key, e.target.value)} />
                          ))}

                          {block.type === "image" && (
                            <ImageUploadBlock blockKey={block.key} isOverridden={isOvr} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}

      {/* ─── DRIP EDITOR ─── */}
      {tab === "drips" && (
        <div className="studio-panel">
          <div className="sp-title">Drip <em>Editor</em></div>
          <p className="sp-sub">Edit drip names, descriptions, prices, durations, and tags. {totalDripEdits > 0 && <><strong style={{ color: "var(--teal)" }}>{totalDripEdits} drips</strong> customised.</>}</p>
          {DRIPS.map((drip) => {
            const isOpen = expandedDrip === drip.slug;
            const hasEdits = !!dripEdits[drip.slug];
            return (
              <div key={drip.slug} className="drip-edit-card">
                <div className={`dec-header${isOpen ? " open" : ""}`}>
                  <span className="dec-icon">{drip.icon}</span>
                  <span className="dec-name">{String(getDripField(drip.slug, "name", drip.name))}</span>
                  {hasEdits && <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 50, background: "var(--teal)", color: "#fff" }}>edited</span>}
                  <button className={`dec-toggle${isOpen ? " open" : ""}`} onClick={() => setExpandedDrip(isOpen ? null : drip.slug)}>
                    {isOpen ? "Close" : "Edit"}
                  </button>
                </div>
                {isOpen && (
                  <>
                    <div className="field-grid">
                      <div className="field-group"><label className="field-label">DRIP NAME</label><input className="field-input" defaultValue={String(getDripField(drip.slug, "name", drip.name))} onBlur={(e) => setDripField(drip.slug, "name", e.target.value)} /></div>
                      <div className="field-group"><label className="field-label">SUBTITLE</label><input className="field-input" defaultValue={String(getDripField(drip.slug, "subtitle", drip.subtitle))} onBlur={(e) => setDripField(drip.slug, "subtitle", e.target.value)} /></div>
                      <div className="field-group"><label className="field-label">PRICE (INR)</label><input className="field-input" type="number" defaultValue={Number(getDripField(drip.slug, "price", drip.price))} onBlur={(e) => setDripField(drip.slug, "price", parseInt(e.target.value) || drip.price)} /></div>
                      <div className="field-group"><label className="field-label">DURATION</label><input className="field-input" defaultValue={String(getDripField(drip.slug, "duration", drip.duration))} onBlur={(e) => setDripField(drip.slug, "duration", e.target.value)} /></div>
                    </div>
                    <div className="field-group" style={{ marginTop: 14 }}>
                      <label className="field-label">DESCRIPTION</label>
                      <textarea className="field-input" rows={3} style={{ resize: "vertical", lineHeight: 1.6 }} defaultValue={String(getDripField(drip.slug, "description", drip.description))} onBlur={(e) => setDripField(drip.slug, "description", e.target.value)} />
                    </div>
                    <div className="field-group" style={{ marginTop: 14 }}>
                      <label className="field-label">TAGS (comma-separated)</label>
                      <input className="field-input" defaultValue={(getDripField(drip.slug, "tags", drip.tags) as string[]).join(", ")} onBlur={(e) => setDripField(drip.slug, "tags", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))} />
                    </div>
                    <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                      <Link href={`/treatments/${drip.slug}`} target="_blank" className="save-btn" style={{ textDecoration: "none", marginTop: 0 }}>View Live ↗</Link>
                      {hasEdits && <button className="del-btn" onClick={() => resetDripEdits(drip.slug)}>Reset to Default</button>}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ─── QUIZ EDITOR ─── */}
      {tab === "quiz" && (
        <div className="studio-panel">
          <div className="sp-title">Questionnaire <em>Editor</em></div>
          <p className="sp-sub">{QUIZ_SECTIONS.length} sections with {QUIZ_SECTIONS.reduce((s, q) => s + q.count, 0)}+ adaptive questions. 16 nutrient scoring axes. Dynamic branching by previous answers.</p>
          <div style={{ padding: 16, background: "var(--sky-pale)", borderRadius: "var(--radius-sm)", border: "1px dashed var(--border-strong)", marginBottom: 20, fontSize: 12, color: "var(--text-2)", lineHeight: 1.7 }}>
            <strong style={{ color: "var(--teal)" }}>Scoring axes (16):</strong> Vitamin D, B12, Iron, Vitamin C, Zinc, Magnesium, Glutathione, NAD+, Amino Acids, Electrolytes, Vitamin A, B2, Omega-3, Insulin Resistance, Hormone Balance, Folate.
          </div>
          {QUIZ_SECTIONS.map((section) => (
            <div key={section.id} className="quiz-section-card">
              <div className="qsc-header">
                <div className="qsc-title">Section {section.id}: {section.name}</div>
                <div className="qsc-count">{section.count} questions</div>
              </div>
              <div style={{ fontSize: 12, color: "var(--text-3)", lineHeight: 1.5 }}>{section.desc}</div>
            </div>
          ))}
          <div style={{ padding: 16, background: "#FFF4E6", borderRadius: "var(--radius-sm)", border: "1px solid #D97706", fontSize: 12, color: "#7C3E0A", lineHeight: 1.7 }}>
            <strong>🔧 To modify questions:</strong> Edit <code style={{ fontSize: 11, background: "rgba(255,255,255,.5)", padding: "1px 6px", borderRadius: 4 }}>src/app/health-quiz/page.tsx</code> — add entries to <code>ALL_QUESTIONS</code>, update branching in <code>getSectionQuestions</code>, update scoring in <code>calcNutrientRisks</code>. In production, these would be stored in a database with a full visual editor.
          </div>
        </div>
      )}

      {/* ─── ASSIGNMENTS ─── */}
      {tab === "assignments" && (
        <div className="studio-panel">
          <div className="sp-title">Assignment <em>Manager</em></div>
          <p className="sp-sub">Map doctors and nurses to service areas. Assign preferred nurses to specific doctors. Location-based assignments ensure clients see nearest staff first.</p>
          <div style={{ padding: 18, background: "var(--off-white)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 12 }}>Create Assignment</div>
            <div className="field-grid">
              <div className="field-group">
                <label className="field-label">TYPE</label>
                <select className="field-input" value={newAssignType} onChange={(e) => setNewAssignType(e.target.value as Assignment["type"])}>
                  <option value="doctor-area">Doctor → Service Area</option>
                  <option value="nurse-area">Nurse → Service Area</option>
                  <option value="doctor-nurse">Doctor → Preferred Nurse</option>
                </select>
              </div>
              <div className="field-group">
                <label className="field-label">{newAssignType === "nurse-area" ? "NURSE" : "DOCTOR"}</label>
                <select className="field-input" value={newAssignPerson} onChange={(e) => setNewAssignPerson(e.target.value)}>
                  <option value="">Select...</option>
                  {(newAssignType === "nurse-area" ? DEMO_NURSES : DOCTORS).map((p) => (<option key={p.id} value={p.name}>{p.name}</option>))}
                </select>
              </div>
              <div className="field-group">
                <label className="field-label">{newAssignType === "doctor-nurse" ? "PREFERRED NURSE" : "SERVICE AREA"}</label>
                {newAssignType === "doctor-nurse" ? (
                  <select className="field-input" value={newAssignTarget} onChange={(e) => setNewAssignTarget(e.target.value)}>
                    <option value="">Select...</option>
                    {DEMO_NURSES.map((n) => (<option key={n.id} value={n.name}>{n.name}</option>))}
                  </select>
                ) : (
                  <select className="field-input" value={newAssignTarget} onChange={(e) => setNewAssignTarget(e.target.value)}>
                    <option value="">Select...</option>
                    {AREAS.map((a) => (<option key={a} value={a}>{a}</option>))}
                  </select>
                )}
              </div>
            </div>
            <button className="save-btn" onClick={addAssignment}>+ Add Assignment</button>
          </div>
          {(["doctor-area", "nurse-area", "doctor-nurse"] as const).map((type) => {
            const filtered = assignments.filter((a) => a.type === type);
            const title = type === "doctor-area" ? "Doctors → Areas" : type === "nurse-area" ? "Nurses → Areas" : "Doctors → Preferred Nurses";
            const icon = type === "doctor-area" ? "👨‍⚕️" : type === "nurse-area" ? "💉" : "🤝";
            return (
              <div key={type} style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", marginBottom: 10 }}>{icon} {title} ({filtered.length})</div>
                {filtered.length === 0 ? (
                  <div style={{ padding: 14, textAlign: "center", color: "var(--text-3)", fontSize: 12, background: "var(--off-white)", borderRadius: "var(--radius-sm)" }}>No assignments.</div>
                ) : filtered.map((a) => (
                  <div key={a.id} className="assign-card">
                    <span style={{ fontSize: 14, fontWeight: 500 }}>{a.personName}</span>
                    <span style={{ fontSize: 12, color: "var(--text-3)" }}>→</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "var(--teal)" }}>{a.areaOrTarget}</span>
                    <span className="pill active" style={{ marginLeft: "auto" }}>#{a.priority}</span>
                    <button className="del-btn" onClick={() => removeAssignment(a.id)}>Remove</button>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {/* ─── TEAM & SUB-ADMINS ─── */}
      {tab === "team" && isSuperAdmin && (
        <div className="studio-panel">
          <div className="sp-title">Team &amp; <em>Sub-Admins</em></div>
          <p className="sp-sub">Create sub-admin accounts with granular permissions. Only Super Admin can access this section.</p>
          <div style={{ padding: 18, background: "var(--off-white)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", marginBottom: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 12 }}>Create Sub-Admin</div>
            <div className="field-grid">
              <div className="field-group"><label className="field-label">FULL NAME</label><input className="field-input" value={newSAName} onChange={(e) => setNewSAName(e.target.value)} placeholder="e.g. Rahul Operations" /></div>
              <div className="field-group"><label className="field-label">EMAIL</label><input className="field-input" type="email" value={newSAEmail} onChange={(e) => setNewSAEmail(e.target.value)} placeholder="e.g. rahul@nutridrip.in" /></div>
            </div>
            <div style={{ marginTop: 14 }}>
              <label className="field-label" style={{ marginBottom: 8, display: "block" }}>ASSIGN PERMISSIONS</label>
              <div className="perm-chips">
                {ALL_PERMISSIONS.map((p) => (
                  <button key={p} className={`perm-chip${newSAPerms.includes(p) ? " sel" : ""}`} onClick={() => toggleSAPerm(p)}>
                    {p.replace(/_/g, " ")}
                  </button>
                ))}
              </div>
            </div>
            <button className="save-btn" onClick={addSubAdmin} style={{ marginTop: 16 }}>+ Create Sub-Admin</button>
          </div>

          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Active Sub-Admins ({subadmins.length})</div>
          {subadmins.length === 0 ? (
            <div style={{ padding: 24, textAlign: "center", color: "var(--text-3)", fontSize: 12, background: "var(--off-white)", borderRadius: "var(--radius-sm)" }}>No sub-admins yet.</div>
          ) : subadmins.map((sa) => (
            <div key={sa.id} style={{ padding: 16, marginBottom: 12, borderRadius: "var(--radius-sm)", border: "1.5px solid var(--border)", background: "var(--white)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{sa.name}</div>
                  <div style={{ fontSize: 12, color: "var(--text-3)" }}>{sa.email}</div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <span className={`pill ${sa.status === "active" ? "active" : "paused"}`}>{sa.status}</span>
                  <button className="del-btn" style={{ fontSize: 10, padding: "4px 10px" }} onClick={() => toggleSubAdminStatus(sa.id)}>
                    {sa.status === "active" ? "Disable" : "Enable"}
                  </button>
                  <button className="del-btn" style={{ fontSize: 10, padding: "4px 10px" }} onClick={() => removeSubAdmin(sa.id)}>Delete</button>
                </div>
              </div>
              <div className="perm-chips">
                {sa.permissions.length === 0 ? (
                  <span style={{ fontSize: 11, color: "var(--text-3)", fontStyle: "italic" }}>No permissions</span>
                ) : sa.permissions.map((p) => (
                  <span key={p} className="perm-chip sel" style={{ cursor: "default" }}>{p.replace(/_/g, " ")}</span>
                ))}
              </div>
            </div>
          ))}

          <div style={{ marginTop: 24, padding: 16, background: "var(--sky-pale)", borderRadius: "var(--radius-sm)", border: "1px dashed var(--border-strong)", fontSize: 12, color: "var(--text-2)", lineHeight: 1.7 }}>
            <strong style={{ color: "var(--teal)" }}>Permission Reference:</strong>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 20px", marginTop: 8 }}>
              {ALL_PERMISSIONS.map((p) => {
                const descs: Record<string, string> = {
                  manage_drips: "Edit drip formulations & pricing",
                  manage_patients: "View/edit patient records",
                  manage_doctors: "Add/edit/remove doctors",
                  manage_clinics: "Partner clinic management",
                  manage_nurses: "Nursing staff management",
                  manage_assignments: "Area & nurse assignments",
                  edit_content: "Content Editor access",
                  edit_quiz: "Questionnaire Editor access",
                  view_analytics: "Revenue & performance data",
                  manage_bookings: "View/modify all bookings",
                };
                return <div key={p}><code style={{ fontSize: 10 }}>{p}</code> — {descs[p]}</div>;
              })}
            </div>
          </div>
        </div>
      )}
      {/* ─── STICKY BOTTOM ACTION BAR ─── */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100,
        background: "var(--white)", borderTop: "2px solid var(--border)",
        boxShadow: "0 -4px 24px rgba(14,34,51,0.10)",
        padding: "14px 56px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        gap: 16, flexWrap: "wrap",
      }}>
        <div style={{ fontSize: 13, color: "var(--text-2)" }}>
          {hasAnyChanges ? (
            <>
              <span style={{
                display: "inline-block", width: 8, height: 8, borderRadius: "50%",
                background: "#D97706", marginRight: 8, animation: "pulse 1.5s ease-in-out infinite",
              }} />
              <strong style={{ color: "var(--text)" }}>{totalOverrides + totalDripEdits}</strong> unsaved change{(totalOverrides + totalDripEdits) === 1 ? "" : "s"} pending
            </>
          ) : (
            <span style={{ color: "var(--text-3)" }}>No changes — all content matches defaults.</span>
          )}
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {hasAnyChanges && (
            <button onClick={handleDiscardAll} style={{
              padding: "10px 22px", borderRadius: 50, border: "1.5px solid var(--border)",
              background: "var(--white)", color: "#D42C2C",
              fontSize: 12, fontWeight: 600, fontFamily: "var(--font-display)", cursor: "pointer",
            }}>
              Discard All
            </button>
          )}
          <button onClick={handlePublish} style={{
            padding: "12px 32px", borderRadius: 50, border: "none",
            background: hasAnyChanges
              ? "linear-gradient(145deg, #1A9E6A, #22C55E)"
              : "var(--border)",
            color: hasAnyChanges ? "#fff" : "var(--text-3)",
            fontSize: 13, fontWeight: 700, fontFamily: "var(--font-display)",
            cursor: hasAnyChanges ? "pointer" : "default",
            boxShadow: hasAnyChanges ? "0 4px 16px rgba(26,158,106,0.30)" : "none",
            transition: "transform .2s",
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <span style={{ fontSize: 16 }}>🚀</span>
            Save & Publish
          </button>
        </div>
      </div>

      {/* ─── SUCCESS TOAST ─── */}
      {published && (
        <div style={{
          position: "fixed", bottom: 80, right: 40, zIndex: 200,
          background: "#0A7B6E", color: "#fff",
          padding: "14px 24px", borderRadius: "var(--radius-sm)",
          boxShadow: "0 8px 32px rgba(10,123,110,0.30)",
          fontSize: 13, fontWeight: 600, fontFamily: "var(--font-display)",
          display: "flex", alignItems: "center", gap: 10,
          animation: "slideUp .3s ease",
        }}>
          <span style={{ fontSize: 18 }}>✓</span>
          Changes published! Live on the site now.
        </div>
      )}

      {discarded && (
        <div style={{
          position: "fixed", bottom: 80, right: 40, zIndex: 200,
          background: "#D97706", color: "#fff",
          padding: "14px 24px", borderRadius: "var(--radius-sm)",
          boxShadow: "0 8px 32px rgba(217,119,6,0.30)",
          fontSize: 13, fontWeight: 600, fontFamily: "var(--font-display)",
          display: "flex", alignItems: "center", gap: 10,
          animation: "slideUp .3s ease",
        }}>
          <span style={{ fontSize: 18 }}>↺</span>
          All changes discarded. Defaults restored.
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
      ` }} />

      {/* bottom bar spacer so content isn't hidden */}
      <div style={{ height: 70 }} />
    </DashLayout>
  );
}

// ─── Image upload with fit mode + crop tool ─────────────────────────────────

const FIT_MODES = [
  { value: "cover", label: "Cover", desc: "Fill area, may crop edges", icon: "🔳" },
  { value: "contain", label: "Contain", desc: "Fit inside, may letterbox", icon: "🖼️" },
  { value: "fill", label: "Stretch", desc: "Stretch to fill exactly", icon: "↔️" },
  { value: "none", label: "Center", desc: "Original size, centered", icon: "🎯" },
] as const;

function ImageUploadBlock({ blockKey, isOverridden }: { blockKey: string; isOverridden: boolean }) {
  const [preview, setPreview] = useState("");
  const [fitMode, setFitMode] = useState("cover");
  const [showCrop, setShowCrop] = useState(false);
  const [cropX, setCropX] = useState(10);
  const [cropY, setCropY] = useState(10);
  const [cropW, setCropW] = useState(80);
  const [cropH, setCropH] = useState(80);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPreview(getContentText(blockKey, ""));
    setFitMode(getContentText(blockKey + ".fit", "cover"));
    const handler = () => {
      setPreview(getContentText(blockKey, ""));
      setFitMode(getContentText(blockKey + ".fit", "cover"));
    };
    window.addEventListener("nutridrip_content_change", handler);
    return () => window.removeEventListener("nutridrip_content_change", handler);
  }, [blockKey]);

  function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("Image too large (max 2MB).");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      if (dataUrl) { setPreview(dataUrl); setContent(blockKey, dataUrl); }
    };
    reader.readAsDataURL(file);
  }

  function handleRemove() {
    setPreview(""); resetContent(blockKey); resetContent(blockKey + ".fit");
    if (fileRef.current) fileRef.current.value = "";
  }

  function handleFitChange(mode: string) {
    setFitMode(mode); setContent(blockKey + ".fit", mode);
  }

  function applyCrop() {
    if (!preview) return;
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const sx = Math.round((cropX / 100) * img.width);
      const sy = Math.round((cropY / 100) * img.height);
      const sw = Math.max(1, Math.round((cropW / 100) * img.width));
      const sh = Math.max(1, Math.round((cropH / 100) * img.height));
      canvas.width = sw; canvas.height = sh;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
      const cropped = canvas.toDataURL("image/jpeg", 0.85);
      setPreview(cropped); setContent(blockKey, cropped); setShowCrop(false);
    };
    img.src = preview;
  }

  const btnStyle = (active: boolean): React.CSSProperties => ({
    padding: "6px 14px", borderRadius: 50, cursor: "pointer",
    border: active ? "1.5px solid var(--teal)" : "1.5px solid var(--border)",
    background: active ? "var(--sky-pale)" : "var(--white)",
    color: active ? "var(--teal)" : "var(--text-3)",
    fontSize: 10, fontWeight: 600, fontFamily: "var(--font-display)",
    transition: "all .15s", display: "flex", alignItems: "center", gap: 4,
  });

  const actionBtn = (bg: string, color: string, border?: string): React.CSSProperties => ({
    padding: "8px 18px", borderRadius: 50, border: border || "none",
    background: bg, color, fontSize: 11, fontWeight: 600,
    fontFamily: "var(--font-display)", cursor: "pointer",
  });

  return (
    <div style={{
      padding: 16, borderRadius: "var(--radius-sm)",
      border: "2px dashed var(--border-strong)", background: "var(--white)",
    }}>
      {preview ? (
        <>
          {/* Preview with current fit mode */}
          <div style={{
            width: "100%", height: 180, borderRadius: 8, overflow: "hidden",
            background: "var(--off-white)", marginBottom: 12,
            display: "flex", alignItems: "center", justifyContent: "center",
            border: "1px solid var(--border)", position: "relative",
          }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Preview" style={{
              width: "100%", height: "100%",
              objectFit: fitMode as "cover" | "contain" | "fill" | "none",
              objectPosition: "center", borderRadius: 8,
            }} />
          </div>

          {/* Fit mode selector */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: "var(--text-3)", letterSpacing: 0.5, marginBottom: 6, textTransform: "uppercase" }}>
              Image Fit
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {FIT_MODES.map((fm) => (
                <button key={fm.value} type="button" onClick={() => handleFitChange(fm.value)} style={btnStyle(fitMode === fm.value)} title={fm.desc}>
                  <span>{fm.icon}</span> {fm.label}
                </button>
              ))}
            </div>
          </div>

          {/* Crop tool */}
          {showCrop && (
            <div style={{
              padding: 16, background: "var(--off-white)", borderRadius: 8,
              border: "1.5px solid var(--teal)", marginBottom: 12,
            }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--teal)", marginBottom: 10 }}>
                ✂️ Crop Tool — adjust the region to keep
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                <div>
                  <label style={{ fontSize: 10, color: "var(--text-3)" }}>Left offset (%)</label>
                  <input type="range" min={0} max={80} value={cropX} onChange={(e) => setCropX(+e.target.value)} style={{ width: "100%" }} />
                  <span style={{ fontSize: 11, color: "var(--text-2)" }}>{cropX}%</span>
                </div>
                <div>
                  <label style={{ fontSize: 10, color: "var(--text-3)" }}>Top offset (%)</label>
                  <input type="range" min={0} max={80} value={cropY} onChange={(e) => setCropY(+e.target.value)} style={{ width: "100%" }} />
                  <span style={{ fontSize: 11, color: "var(--text-2)" }}>{cropY}%</span>
                </div>
                <div>
                  <label style={{ fontSize: 10, color: "var(--text-3)" }}>Width (%)</label>
                  <input type="range" min={10} max={100 - cropX} value={cropW} onChange={(e) => setCropW(+e.target.value)} style={{ width: "100%" }} />
                  <span style={{ fontSize: 11, color: "var(--text-2)" }}>{cropW}%</span>
                </div>
                <div>
                  <label style={{ fontSize: 10, color: "var(--text-3)" }}>Height (%)</label>
                  <input type="range" min={10} max={100 - cropY} value={cropH} onChange={(e) => setCropH(+e.target.value)} style={{ width: "100%" }} />
                  <span style={{ fontSize: 11, color: "var(--text-2)" }}>{cropH}%</span>
                </div>
              </div>
              {/* Crop preview */}
              <div style={{
                width: "100%", height: 160, position: "relative",
                overflow: "hidden", borderRadius: 8, background: "#000", marginBottom: 10,
              }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview} alt="Crop source" style={{
                  position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
                  objectFit: "contain", opacity: 0.3,
                }} />
                <div style={{
                  position: "absolute",
                  left: `${cropX}%`, top: `${cropY}%`,
                  width: `${cropW}%`, height: `${cropH}%`,
                  border: "2px solid var(--teal)",
                  boxShadow: "0 0 0 9999px rgba(0,0,0,0.5)",
                  borderRadius: 4,
                }} />
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button type="button" onClick={applyCrop} style={actionBtn("var(--teal)", "#fff")}>
                  Apply Crop
                </button>
                <button type="button" onClick={() => setShowCrop(false)} style={actionBtn("var(--white)", "var(--text-3)", "1.5px solid var(--border)")}>
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
            <button type="button" onClick={() => { setShowCrop(!showCrop); setCropX(10); setCropY(10); setCropW(80); setCropH(80); }} style={actionBtn(showCrop ? "var(--sky-pale)" : "var(--white)", showCrop ? "var(--teal)" : "var(--text-2)", "1.5px solid var(--border)")}>
              ✂️ {showCrop ? "Cancel Crop" : "Crop"}
            </button>
            <button type="button" onClick={() => fileRef.current?.click()} style={actionBtn("var(--teal)", "#fff")}>
              Replace
            </button>
            <button type="button" onClick={handleRemove} style={actionBtn("var(--white)", "#D42C2C", "1.5px solid var(--border)")}>
              Remove
            </button>
          </div>
        </>
      ) : (
        <div style={{ textAlign: "center", padding: 20 }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>📤</div>
          <div style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 10, lineHeight: 1.5 }}>
            No image uploaded. Click below to upload (PNG, SVG, JPG, WebP — max 2MB).
          </div>
          <button type="button" onClick={() => fileRef.current?.click()} style={{
            padding: "10px 22px", borderRadius: 50, border: "none",
            background: "linear-gradient(145deg, var(--teal), var(--sky))", color: "#fff",
            fontSize: 12, fontWeight: 600, fontFamily: "var(--font-display)", cursor: "pointer",
            boxShadow: "0 3px 12px rgba(26,126,168,0.25)",
          }}>
            Upload Image
          </button>
        </div>
      )}
      <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/svg+xml,image/webp" onChange={handleUpload} style={{ display: "none" }} />
    </div>
  );
}
