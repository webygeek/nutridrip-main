"use client";

import { useState, useMemo } from "react";
import {
  PATIENT_QUIZ,
  NUTRIENT_LABELS,
  CATEGORY_COLORS,
  type PatientQuizResult,
  type CategoryScores,
} from "@/lib/data/patient-quiz-mock";
import { DEMO_PATIENTS } from "@/lib/data/dashboard-mock";

// ─── Brand palette ─────────────────────────────────────────────────────────────
const ND = {
  teal: "#1A7EA8",
  tealDark: "#0F5C7D",
  sky: "#5BB8F5",
  skyBg: "#EEF7FD",
  skyPale: "#D6EEFA",
  text: "#0E2233",
  text2: "#3A5568",
  text3: "#7A9BB0",
};

// ─── AI Summary generator (rule-based, no API key needed) ─────────────────────
function generateAISummary(result: PatientQuizResult, patientName: string): string {
  const { categoryScores, nutrientRisks, vitalityScore } = result;

  const topNutrients = (Object.entries(nutrientRisks) as [keyof typeof nutrientRisks, number][])
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([k]) => NUTRIENT_LABELS[k]);

  const topCategories = (Object.entries(categoryScores) as [keyof CategoryScores, number][])
    .filter(([, v]) => v >= 60)
    .sort((a, b) => b[1] - a[1])
    .map(([k]) => k);

  const severity =
    vitalityScore < 50 ? "significant" : vitalityScore < 65 ? "moderate" : "mild";

  const energyLine =
    categoryScores.Energy >= 65
      ? `${patientName}'s energy profile shows significant mitochondrial stress, with NAD+ and Magnesium emerging as the primary limiting factors. Fatigue appears chronic rather than situational.`
      : `${patientName}'s energy systems appear relatively preserved, though some depletion signals are present.`;

  const immuneLine =
    categoryScores.Immunity >= 65
      ? `Immune resilience is compromised — recurrent infections and slow recovery times are consistent with depleted Vitamin C, Zinc, and Vitamin D reserves.`
      : `Immune markers are within acceptable range. Periodic maintenance dosing would be preventive rather than corrective.`;

  const cogLine =
    categoryScores.Cognitive >= 65
      ? `Cognitive burden is high. Brain fog, concentration deficits, and stress scores indicate a NAD+/Magnesium axis deficiency that is likely driving the neurological symptoms.`
      : `Cognitive function is relatively stable with some early depletion signals worth monitoring.`;

  const skinLine =
    categoryScores.Skin >= 60
      ? `Skin and hair findings indicate elevated oxidative load — Glutathione and Vitamin A should be prioritised. Pigmentation patterns are consistent with chronic sun exposure compounded by antioxidant depletion.`
      : null;

  const hormoneLine =
    categoryScores.Hormonal >= 60
      ? `Hormonal indicators are notable — irregular cycles, libido changes, or reproductive symptoms suggest zinc, folate, and Vitamin D as key interventional targets before considering hormonal therapy.`
      : null;

  const metabolicLine =
    categoryScores.Metabolic >= 55
      ? `Metabolic risk flags are present. Insulin sensitivity markers and electrolyte findings warrant follow-up, particularly in the context of dietary history.`
      : null;

  const suggestionLines: string[] = [];

  if (topNutrients.length > 0) {
    suggestionLines.push(
      `Priority IV/IM supplementation targets: ${topNutrients.join(", ")}.`
    );
  }

  if (topCategories.includes("Cognitive") || topCategories.includes("Energy")) {
    suggestionLines.push(
      "Consider a NAD+ infusion protocol as a first-line intervention — addresses both mitochondrial energy and cognitive clarity simultaneously."
    );
  }

  if (topCategories.includes("Immunity")) {
    suggestionLines.push(
      "High-dose Vitamin C with Zinc IV (Fortress protocol) is indicated. Weekly dosing for 4–6 weeks, then monthly maintenance."
    );
  }

  if (topCategories.includes("Skin")) {
    suggestionLines.push(
      "Glutathione IV combined with Vitamin C shows strongest evidence for pigmentation correction — recommend 8–12 sessions over 6 weeks."
    );
  }

  if (topCategories.includes("Hormonal")) {
    suggestionLines.push(
      "Hormonal support protocol should include Vitamin D optimisation and Zinc loading before introducing any pharmacological intervention."
    );
  }

  if (categoryScores.Energy >= 70 || categoryScores.Cognitive >= 70) {
    suggestionLines.push(
      "Sleep hygiene review recommended — inadequate restorative sleep will blunt the effect of any IV protocol. Consider magnesium glycinate oral supplementation nightly."
    );
  }

  const parts = [
    `**Clinical Overview — ${patientName}**\n\nOverall vitality score: ${vitalityScore}/100 (${severity} nutritional burden).\n`,
    energyLine,
    immuneLine,
    cogLine,
    skinLine,
    hormoneLine,
    metabolicLine,
  ]
    .filter(Boolean)
    .join(" ");

  const suggestions =
    suggestionLines.length > 0
      ? `\n\n**Clinical Suggestions**\n${suggestionLines.map((s, i) => `${i + 1}. ${s}`).join("\n")}`
      : "";

  const disclaimer =
    "\n\n*This summary is AI-generated from questionnaire data and is intended as a clinical aide only. Final treatment decisions remain with the prescribing physician.*";

  return parts + suggestions + disclaimer;
}

// ─── Score bar ─────────────────────────────────────────────────────────────────
function ScoreBar({ label, value }: { label: string; value: number }) {
  const riskColor =
    value >= 70 ? "#DC2626" : value >= 45 ? "#D97706" : "#16A34A";

  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 13 }}>
        <span style={{ fontWeight: 600, color: ND.text }}>{label}</span>
        <span style={{ fontWeight: 700, color: riskColor }}>{value}%</span>
      </div>
      <div style={{ background: "#E5ECF0", borderRadius: 6, height: 8, overflow: "hidden" }}>
        <div
          style={{
            width: `${value}%`,
            height: "100%",
            background: riskColor,
            borderRadius: 6,
            transition: "width 0.5s ease",
          }}
        />
      </div>
    </div>
  );
}

// ─── Category card ──────────────────────────────────────────────────────────────
function CategoryCard({ label, value }: { label: string; value: number }) {
  const color = CATEGORY_COLORS[label as keyof CategoryScores] ?? ND.teal;
  const risk = value >= 70 ? "High" : value >= 45 ? "Moderate" : "Low";
  const riskColor = value >= 70 ? "#DC2626" : value >= 45 ? "#D97706" : "#16A34A";

  return (
    <div
      style={{
        border: `1.5px solid ${color}22`,
        borderRadius: 10,
        padding: "12px 14px",
        background: `${color}08`,
      }}
    >
      <div style={{ fontSize: 12, fontWeight: 700, color, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        <div style={{ background: "#E5ECF0", borderRadius: 4, flex: 1, height: 6 }}>
          <div style={{ width: `${value}%`, height: "100%", background: riskColor, borderRadius: 4 }} />
        </div>
        <span style={{ fontSize: 13, fontWeight: 700, color: riskColor, minWidth: 28, textAlign: "right" }}>{value}</span>
      </div>
      <div style={{ fontSize: 11, color: riskColor, fontWeight: 600 }}>{risk} Risk</div>
    </div>
  );
}

// ─── QA accordion ──────────────────────────────────────────────────────────────
function QAAccordion({ sections }: { sections: PatientQuizResult["sections"] }) {
  const [openSection, setOpenSection] = useState<number | null>(0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {sections.map((sec, si) => (
        <div key={si} style={{ border: `1px solid ${ND.skyPale}`, borderRadius: 8, overflow: "hidden" }}>
          <button
            onClick={() => setOpenSection(openSection === si ? null : si)}
            style={{
              width: "100%",
              padding: "12px 16px",
              background: openSection === si ? ND.skyBg : "#fff",
              border: "none",
              cursor: "pointer",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              textAlign: "left",
            }}
          >
            <span style={{ fontWeight: 600, color: ND.tealDark, fontSize: 14 }}>{sec.section}</span>
            <span style={{ color: ND.text3, fontSize: 18 }}>{openSection === si ? "▲" : "▼"}</span>
          </button>
          {openSection === si && (
            <div style={{ padding: "0 16px 14px" }}>
              {sec.qa.map((item, qi) => (
                <div
                  key={qi}
                  style={{
                    borderBottom: qi < sec.qa.length - 1 ? `1px solid ${ND.skyPale}` : "none",
                    padding: "10px 0",
                  }}
                >
                  <div style={{ fontSize: 12, color: ND.text3, marginBottom: 3 }}>{item.q}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: ND.text }}>{item.a}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── AI Summary card ────────────────────────────────────────────────────────────
function AISummaryCard({
  summary,
  onUseSuggestions,
}: {
  summary: string;
  onUseSuggestions: (text: string) => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const parts = summary.split("\n\n");

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #EEF7FD 0%, #F0FDF4 100%)",
        border: `1.5px solid ${ND.sky}`,
        borderRadius: 12,
        padding: 20,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 20 }}>🤖</span>
          <span style={{ fontWeight: 700, color: ND.tealDark, fontSize: 15 }}>AI Clinical Summary</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={handleCopy}
            style={{
              padding: "6px 14px",
              borderRadius: 6,
              border: `1px solid ${ND.sky}`,
              background: "#fff",
              color: ND.teal,
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {copied ? "Copied!" : "Copy"}
          </button>
          <button
            onClick={() => onUseSuggestions(summary)}
            style={{
              padding: "6px 14px",
              borderRadius: 6,
              border: "none",
              background: ND.teal,
              color: "#fff",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Use as Notes
          </button>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {parts.map((part, pi) => {
          if (part.startsWith("**") && part.includes("**\n")) {
            const newlineIdx = part.indexOf("\n");
            const heading = part.slice(2, part.indexOf("**", 2));
            const body = part.slice(newlineIdx + 1);
            return (
              <div key={pi}>
                <div style={{ fontWeight: 700, color: ND.tealDark, fontSize: 14, marginBottom: 6, borderBottom: `1px solid ${ND.skyPale}`, paddingBottom: 4 }}>
                  {heading}
                </div>
                <div style={{ fontSize: 13, color: ND.text, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{body}</div>
              </div>
            );
          }
          if (part.startsWith("*") && part.endsWith("*")) {
            return (
              <div key={pi} style={{ fontSize: 11, color: ND.text3, fontStyle: "italic", borderTop: `1px solid ${ND.skyPale}`, paddingTop: 8 }}>
                {part.replace(/\*/g, "")}
              </div>
            );
          }
          return (
            <div key={pi} style={{ fontSize: 13, color: ND.text, lineHeight: 1.7 }}>{part}</div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Patient detail view ────────────────────────────────────────────────────────
function PatientDetail({
  result,
  patientName,
  onBack,
  onUseSuggestions,
}: {
  result: PatientQuizResult;
  patientName: string;
  onBack: () => void;
  onUseSuggestions: (text: string) => void;
}) {
  const [activeTab, setActiveTab] = useState<"scores" | "questionnaire" | "summary">("scores");

  const summary = useMemo(() => generateAISummary(result, patientName), [result, patientName]);

  const sortedNutrients = (Object.entries(result.nutrientRisks) as [keyof typeof result.nutrientRisks, number][])
    .sort((a, b) => b[1] - a[1]);

  const vitalityColor =
    result.vitalityScore >= 70 ? "#16A34A" : result.vitalityScore >= 50 ? "#D97706" : "#DC2626";

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <button
          onClick={onBack}
          style={{
            padding: "6px 14px",
            borderRadius: 6,
            border: `1px solid ${ND.skyPale}`,
            background: "#fff",
            color: ND.teal,
            fontWeight: 600,
            fontSize: 13,
            cursor: "pointer",
          }}
        >
          ← Back
        </button>
        <div>
          <div style={{ fontWeight: 700, color: ND.text, fontSize: 17 }}>{patientName}</div>
          <div style={{ fontSize: 12, color: ND.text3 }}>
            Questionnaire completed{" "}
            {new Date(result.completedAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </div>
        </div>
        <div
          style={{
            marginLeft: "auto",
            background: `${vitalityColor}15`,
            border: `1.5px solid ${vitalityColor}`,
            borderRadius: 8,
            padding: "6px 14px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 11, color: vitalityColor, fontWeight: 600 }}>Vitality Score</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: vitalityColor }}>
            {result.vitalityScore}<span style={{ fontSize: 13, fontWeight: 500 }}>/100</span>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 4, marginBottom: 20 }}>
        {(
          [
            { id: "scores", label: "Section Scores" },
            { id: "questionnaire", label: "Full Q&A" },
            { id: "summary", label: "🤖 AI Summary" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: "8px 16px",
              borderRadius: 6,
              border: `1px solid ${activeTab === tab.id ? ND.teal : ND.skyPale}`,
              background: activeTab === tab.id ? ND.teal : "#fff",
              color: activeTab === tab.id ? "#fff" : ND.text2,
              fontWeight: 600,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "scores" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div>
            <div style={{ fontWeight: 700, color: ND.tealDark, fontSize: 14, marginBottom: 12 }}>
              Category Risk Scores
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 10 }}>
              {Object.entries(result.categoryScores).map(([cat, val]) => (
                <CategoryCard key={cat} label={cat} value={val} />
              ))}
            </div>
          </div>

          <div>
            <div style={{ fontWeight: 700, color: ND.tealDark, fontSize: 14, marginBottom: 12 }}>
              Nutrient Deficiency Risk (ranked highest → lowest)
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "4px 20px" }}>
              {sortedNutrients.map(([key, val]) => (
                <ScoreBar key={key} label={NUTRIENT_LABELS[key]} value={val} />
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "questionnaire" && <QAAccordion sections={result.sections} />}

      {activeTab === "summary" && (
        <AISummaryCard summary={summary} onUseSuggestions={onUseSuggestions} />
      )}
    </div>
  );
}

// ─── Main export ────────────────────────────────────────────────────────────────
interface QuizPanelProps {
  onUseSuggestions?: (patientName: string, text: string) => void;
}

export default function QuizPanel({ onUseSuggestions }: QuizPanelProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const quizById = useMemo(() => {
    const map: Record<string, PatientQuizResult> = {};
    PATIENT_QUIZ.forEach((q) => { map[q.patientId] = q; });
    return map;
  }, []);

  const selectedResult = selectedId ? (quizById[selectedId] ?? null) : null;
  const selectedPatient = DEMO_PATIENTS.find((p) => p.id === selectedId);

  if (selectedResult && selectedPatient) {
    return (
      <div style={{ background: "#fff", borderRadius: 12, padding: 24, border: `1px solid ${ND.skyPale}` }}>
        <PatientDetail
          result={selectedResult}
          patientName={selectedPatient.name}
          onBack={() => setSelectedId(null)}
          onUseSuggestions={(text) => onUseSuggestions?.(selectedPatient.name, text)}
        />
      </div>
    );
  }

  return (
    <div style={{ background: "#fff", borderRadius: 12, padding: 24, border: `1px solid ${ND.skyPale}` }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontWeight: 700, color: ND.tealDark, fontSize: 17 }}>
          Patient Questionnaire Results
        </div>
        <div style={{ fontSize: 13, color: ND.text3, marginTop: 4 }}>
          Click a patient to view section scores, full Q&A answers, and AI-generated clinical summary.
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {DEMO_PATIENTS.map((patient) => {
          const quiz = quizById[patient.id];
          const hasQuiz = !!quiz;
          const vitalityColor = hasQuiz
            ? quiz.vitalityScore >= 70 ? "#16A34A" : quiz.vitalityScore >= 50 ? "#D97706" : "#DC2626"
            : ND.text3;

          const topRisk = hasQuiz
            ? (Object.entries(quiz.nutrientRisks) as [keyof typeof quiz.nutrientRisks, number][])
                .sort((a, b) => b[1] - a[1])
                .slice(0, 2)
                .map(([k]) => NUTRIENT_LABELS[k])
                .join(", ")
            : null;

          return (
            <div
              key={patient.id}
              onClick={() => hasQuiz && setSelectedId(patient.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "14px 16px",
                borderRadius: 10,
                border: `1.5px solid ${hasQuiz ? ND.skyPale : "#E5ECF0"}`,
                background: hasQuiz ? "#FAFCFE" : "#F8F8F8",
                cursor: hasQuiz ? "pointer" : "default",
                transition: "border-color 0.15s, background 0.15s",
              }}
              onMouseEnter={(e) => {
                if (hasQuiz) (e.currentTarget as HTMLDivElement).style.borderColor = ND.sky;
              }}
              onMouseLeave={(e) => {
                if (hasQuiz) (e.currentTarget as HTMLDivElement).style.borderColor = ND.skyPale;
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: hasQuiz ? ND.teal : "#CBD5E1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 15,
                  flexShrink: 0,
                }}
              >
                {patient.name[0]}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, color: hasQuiz ? ND.text : ND.text3, fontSize: 14 }}>
                  {patient.name}
                </div>
                <div style={{ fontSize: 12, color: ND.text3 }}>
                  {patient.age}{patient.gender} · {patient.primaryConcern}
                </div>
                {hasQuiz && topRisk && (
                  <div style={{ fontSize: 11, color: ND.text2, marginTop: 2 }}>
                    Top risks: {topRisk}
                  </div>
                )}
              </div>

              {hasQuiz ? (
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: vitalityColor, lineHeight: 1 }}>
                    {quiz.vitalityScore}
                  </div>
                  <div style={{ fontSize: 10, color: vitalityColor, fontWeight: 600 }}>Vitality</div>
                  <div
                    style={{
                      marginTop: 4,
                      fontSize: 10,
                      background: "#DCFCE7",
                      color: "#16A34A",
                      borderRadius: 4,
                      padding: "1px 6px",
                      fontWeight: 600,
                    }}
                  >
                    Quiz Done
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    fontSize: 11,
                    background: "#F1F5F9",
                    color: ND.text3,
                    borderRadius: 4,
                    padding: "2px 8px",
                    fontWeight: 600,
                  }}
                >
                  Not Completed
                </div>
              )}

              {hasQuiz && <div style={{ color: ND.text3, fontSize: 16 }}>›</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
