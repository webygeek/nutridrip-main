// Nursing staff + infusion order data. All synthetic.

export type DashNurse = {
  id: string;
  name: string;
  rnNumber: string;
  shift: "morning" | "evening" | "night";
  status: "available" | "on-duty" | "off-duty";
  activeOrders: number;
  totalCompleted: number;
  rating: number;
  phone: string;
  joinedAt: string;
  certifications: string[];
};

export type ProtocolIngredient = {
  name: string;
  dose: string;
};

export type MixingStep = {
  order: number;
  drug: string;
  dose: string;
  // add-to-bag = added to main IV bag
  // iv-push    = administered as separate IV push (pre or post main infusion)
  // im-separate = given as intramuscular injection, not in IV
  // mix-final  = added last to main bag (oxidation-sensitive, e.g. glutathione)
  method: "add-to-bag" | "iv-push" | "im-separate" | "mix-final";
  rate: string;
  notes: string;
};

export type InfusionOrder = {
  id: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  patientGender: "M" | "F";
  patientPhone: string;
  patientAllergies: string;
  patientConditions: string;
  dripName: string;
  scheduledAt: string;
  location: "home" | "clinic" | "office" | "hotel";
  address: string;
  nurseId: string | null;
  doctorName: string;
  doctorPhone: string;
  doctorNotes: string;
  protocolIngredients: ProtocolIngredient[];
  mixingProtocol: MixingStep[];
  infusionRateMlPerHr: number;
  totalVolumeMl: number;
  status: "pending" | "in-progress" | "completed" | "cancelled";
  consentSigned: boolean;
  historyTaken: boolean;
  checklistCompleted: string[];
  startedAt: string | null;
  completedAt: string | null;
  notes: string;
};

export type ChecklistStep = {
  id: string;
  phase: "pre" | "prep" | "during" | "post";
  label: string;
  description: string;
  mandatory: boolean;
};

export const DEMO_NURSES: DashNurse[] = [
  { id: "n-001", name: "Nurse R. Kumari", rnNumber: "RN-KA-4821", shift: "morning", status: "on-duty", activeOrders: 2, totalCompleted: 184, rating: 4.9, phone: "+91 98111 20001", joinedAt: "2025-06-15T00:00:00Z", certifications: ["BLS", "ACLS", "IV Therapy Cert"] },
  { id: "n-002", name: "Nurse S. Patel", rnNumber: "RN-MH-3312", shift: "morning", status: "on-duty", activeOrders: 1, totalCompleted: 156, rating: 4.8, phone: "+91 98111 20002", joinedAt: "2025-09-10T00:00:00Z", certifications: ["BLS", "IV Therapy Cert"] },
  { id: "n-003", name: "Nurse M. Das", rnNumber: "RN-WB-5678", shift: "evening", status: "on-duty", activeOrders: 1, totalCompleted: 210, rating: 4.9, phone: "+91 98111 20003", joinedAt: "2025-04-20T00:00:00Z", certifications: ["BLS", "ACLS", "IV Therapy Cert", "Paediatric IV"] },
  { id: "n-004", name: "Nurse A. Fernandes", rnNumber: "RN-GA-2109", shift: "evening", status: "available", activeOrders: 0, totalCompleted: 92, rating: 4.7, phone: "+91 98111 20004", joinedAt: "2026-01-05T00:00:00Z", certifications: ["BLS", "IV Therapy Cert"] },
  { id: "n-005", name: "Nurse P. Iyer", rnNumber: "RN-TN-7740", shift: "night", status: "available", activeOrders: 0, totalCompleted: 78, rating: 4.8, phone: "+91 98111 20005", joinedAt: "2026-02-12T00:00:00Z", certifications: ["BLS", "ACLS", "IV Therapy Cert"] },
  { id: "n-006", name: "Nurse J. Khan", rnNumber: "RN-DL-8821", shift: "morning", status: "off-duty", activeOrders: 0, totalCompleted: 120, rating: 4.6, phone: "+91 98111 20006", joinedAt: "2025-11-22T00:00:00Z", certifications: ["BLS", "IV Therapy Cert"] },
];

export const DEMO_INFUSION_ORDERS: InfusionOrder[] = [
  {
    id: "ord-901",
    patientId: "p-001",
    patientName: "Arjun Sharma",
    patientAge: 34,
    patientGender: "M",
    patientPhone: "+91 98000 10001",
    patientAllergies: "No known drug allergies. Seasonal pollen allergy.",
    patientConditions: "No chronic conditions. Recent lab — Vit B12 low (186 pg/mL).",
    dripName: "Velocity",
    scheduledAt: "2026-04-17T10:00:00Z",
    location: "home",
    address: "A-402, Oberoi Sky Heights, Andheri West, Mumbai 400058",
    nurseId: "n-001",
    doctorName: "Dr. Kavya Mehra",
    doctorPhone: "+91 98000 50001",
    doctorNotes: "Fatigue score 8/10, B12 deficient. Loading dose approved. Patient reports chest heaviness with rapid NAD+ — infuse slowly over 60 min minimum.",
    protocolIngredients: [
      { name: "NAD+ (Nicotinamide)", dose: "575mg" },
      { name: "Vitamin B12 (Methylcobalamin)", dose: "1mg" },
      { name: "Full B-Complex (B1–B9)", dose: "Full spectrum" },
      { name: "Magnesium Chloride", dose: "2.3g" },
    ],
    mixingProtocol: [
      { order: 1, drug: "Base: Normal Saline 0.9%", dose: "250 ml bag", method: "add-to-bag", rate: "Room temperature", notes: "Start with fresh 250ml NS bag. Confirm clear, no particulates." },
      { order: 2, drug: "Magnesium Chloride", dose: "2.3g (23 ml of 10% soln)", method: "add-to-bag", rate: "Add slowly, invert 3× to mix", notes: "Never give undiluted Mg IV push — causes hypotension & flushing. Must be diluted in the bag." },
      { order: 3, drug: "Full B-Complex (B1, B2, B3, B5, B6, B9)", dose: "Full spectrum ampoule", method: "add-to-bag", rate: "Invert bag 3× after addition", notes: "Protect bag from direct light after adding B-complex — B2 & B12 are photosensitive. Cover with amber sleeve if ambient light >500 lux." },
      { order: 4, drug: "NAD+ (Nicotinamide)", dose: "575mg", method: "add-to-bag", rate: "Add last before starting infusion", notes: "Infuse the FINAL mixed bag over MINIMUM 60 min (never less). Patient has history of chest heaviness with rapid NAD+ — slow to 90 min if any flushing or tightness." },
      { order: 5, drug: "Vitamin B12 (Methylcobalamin)", dose: "1mg", method: "im-separate", rate: "IM deltoid — separate injection", notes: "GIVE SEPARATELY as IM, not in the IV bag. Rationale: high-dose Vit C solutions (not used here but future sessions) can inactivate B12 via redox. Keeps clinical consistency. If IM contraindicated, give as slow IV push 3–5 min AT END of main infusion." },
    ],
    infusionRateMlPerHr: 250,
    totalVolumeMl: 250,
    status: "pending",
    consentSigned: false,
    historyTaken: false,
    checklistCompleted: [],
    startedAt: null,
    completedAt: null,
    notes: "",
  },
  {
    id: "ord-902",
    patientId: "p-003",
    patientName: "Karan Mehta",
    patientAge: 38,
    patientGender: "M",
    patientPhone: "+91 98000 10003",
    patientAllergies: "None reported.",
    patientConditions: "Frequent long-haul traveler. Jet lag recovery protocol. All labs normal.",
    dripName: "Hydraflux",
    scheduledAt: "2026-04-16T16:00:00Z",
    location: "hotel",
    address: "Taj Lands End, Room 1208, Bandstand, Mumbai 400050",
    nurseId: "n-001",
    doctorName: "Dr. Samuel Joseph",
    doctorPhone: "+91 98000 50006",
    doctorNotes: "Standard rehydration protocol. Patient is an experienced client — no first-time precautions needed. Infuse at standard rate.",
    protocolIngredients: [
      { name: "Normal Saline (0.9% NaCl)", dose: "1000ml" },
      { name: "Electrolyte Blend (K, Ca, Mg)", dose: "Balanced" },
      { name: "B-Complex", dose: "Standard" },
      { name: "Magnesium Sulfate", dose: "1g" },
    ],
    mixingProtocol: [
      { order: 1, drug: "Base: Normal Saline 0.9%", dose: "1000 ml bag", method: "add-to-bag", rate: "Room temperature", notes: "Large-volume rehydration. Confirm bag integrity, expiry, no cloudiness." },
      { order: 2, drug: "Electrolyte Blend (K⁺, Ca²⁺, Mg²⁺)", dose: "Balanced ampoule (5–10 ml)", method: "add-to-bag", rate: "Add via medication port, invert 3–4×", notes: "⚠ Confirm patient's baseline K⁺ first (no add if K⁺ >5.0). Never concentrated KCl push — always diluted in bag." },
      { order: 3, drug: "B-Complex Standard", dose: "1 ampoule (~2 ml)", method: "add-to-bag", rate: "Invert after addition", notes: "Light protection optional at this dose; amber sleeve recommended in bright daylight." },
      { order: 4, drug: "Magnesium Sulfate", dose: "1g (2 ml of 50% soln)", method: "add-to-bag", rate: "Add last, invert 3×", notes: "With 1000ml base dilution, Mg concentration is safe. Never undiluted IV push — hypotension risk." },
      { order: 5, drug: "[No separate push required]", dose: "—", method: "add-to-bag", rate: "Single-bag administration", notes: "All ingredients compatible in saline. Infuse over 40–45 min at 1500 ml/hr (standard rehydration rate). Experienced client — standard monitoring." },
    ],
    infusionRateMlPerHr: 1500,
    totalVolumeMl: 1000,
    status: "in-progress",
    consentSigned: true,
    historyTaken: true,
    checklistCompleted: ["verify-identity", "explain-procedure", "obtain-consent", "history-taking", "check-allergies", "baseline-vitals", "verify-prescription", "hand-hygiene", "site-selection", "skin-prep", "cannulation"],
    startedAt: "2026-04-16T15:45:00Z",
    completedAt: null,
    notes: "Left antecubital vein, 22G IV cannula placed on first attempt. Patient tolerating well.",
  },
  {
    id: "ord-903",
    patientId: "p-005",
    patientName: "Sanjay Verma",
    patientAge: 56,
    patientGender: "M",
    patientPhone: "+91 98000 10005",
    patientAllergies: "Penicillin — severe rash. Sulfa drugs.",
    patientConditions: "Hypertension on Amlodipine 5mg OD. Mild diabetes on Metformin 500mg BD. APOE4 family history (cognitive decline screen).",
    dripName: "Apex",
    scheduledAt: "2026-04-19T11:00:00Z",
    location: "clinic",
    address: "NutriDrip Clinic, Bandra Kurla Complex, Mumbai 400051",
    nurseId: "n-001",
    doctorName: "Dr. Aditya Nair",
    doctorPhone: "+91 98000 50004",
    doctorNotes: "Elderly patient, first-time IV client. Check BP before + during. Hold if systolic >160. Amino acid load — ensure adequate hydration. Consent must explicitly cover off-label IV amino acid use.",
    protocolIngredients: [
      { name: "Amino Acid Complex", dose: "10g" },
      { name: "L-Carnitine", dose: "3g" },
      { name: "Vitamin B12", dose: "2mg" },
      { name: "Taurine", dose: "2g" },
    ],
    mixingProtocol: [
      { order: 1, drug: "Base: Normal Saline 0.9%", dose: "500 ml bag", method: "add-to-bag", rate: "Room temperature", notes: "Use 500ml base (not 250ml) — amino acid load requires adequate dilution to reduce osmolarity & vein irritation." },
      { order: 2, drug: "Amino Acid Complex (BCAAs + EAAs)", dose: "10g (~50 ml)", method: "add-to-bag", rate: "Add slowly via med port, invert 5× gently", notes: "Large volume additive — confirm bag total volume stays <600ml. High osmolarity: slow addition prevents foaming." },
      { order: 3, drug: "L-Carnitine", dose: "3g (15 ml of 20% soln)", method: "add-to-bag", rate: "Add after amino acids, invert 3×", notes: "Compatible with amino acids. Patient-specific note: check BP before start (hypertensive on Amlodipine — HOLD if systolic >160)." },
      { order: 4, drug: "Taurine", dose: "2g", method: "add-to-bag", rate: "Add last to main bag, invert 3×", notes: "Stable with amino acid base. Inspect final bag — should be clear, no precipitation. If cloudy → DISCARD and restart." },
      { order: 5, drug: "[Main bag infusion]", dose: "500 ml final volume", method: "add-to-bag", rate: "500 ml/hr × 60 min", notes: "Monitor BP at 15, 30, 45 min (elderly + first-time amino acid patient). Pause infusion if systolic >160 or symptomatic." },
      { order: 6, drug: "Vitamin B12 (Cyanocobalamin)", dose: "2mg", method: "iv-push", rate: "Slow IV push over 5 min AT END", notes: "GIVE SEPARATELY as slow IV push through the cannula AFTER the main infusion completes. Rationale: avoid co-mixing with high amino acid load (pH differential, interaction risk). Flush line with 5ml saline before and after B12 push." },
    ],
    infusionRateMlPerHr: 500,
    totalVolumeMl: 500,
    status: "pending",
    consentSigned: false,
    historyTaken: false,
    checklistCompleted: [],
    startedAt: null,
    completedAt: null,
    notes: "",
  },
];

export const INFUSION_CHECKLIST: ChecklistStep[] = [
  // ─── PATIENT PREPARATION ─────────────────────────────────────────────
  { id: "verify-identity", phase: "pre", label: "Verify Patient Identity", description: "Confirm full name + DOB + phone. Match with booking record. Two-identifier rule.", mandatory: true },
  { id: "explain-procedure", phase: "pre", label: "Explain Procedure to Patient", description: "Walk through what will happen, duration, sensations, and possible side effects in patient's language.", mandatory: true },
  { id: "obtain-consent", phase: "pre", label: "Obtain Signed Informed Consent", description: "Patient must sign consent form electronically. Consent covers IV administration, specific ingredients, and known risks.", mandatory: true },
  { id: "history-taking", phase: "pre", label: "Complete Patient History Form", description: "Allergies, current medications, last meal, pregnancy status (if applicable), prior IV therapy experience.", mandatory: true },
  { id: "check-allergies", phase: "pre", label: "Cross-Check Allergies vs Protocol", description: "Verify no drug-drug interactions or allergic risk with the prescribed ingredients. Escalate to physician if any concern.", mandatory: true },
  { id: "baseline-vitals", phase: "pre", label: "Record Baseline Vital Signs", description: "BP, HR, Temp, SpO₂, Weight. Abort if vitals are outside safe ranges (BP >180/110, HR >120, SpO₂ <92%, Temp >38°C).", mandatory: true },
  { id: "verify-prescription", phase: "pre", label: "Verify Physician Prescription", description: "Read back the approved protocol: drip name, each ingredient & dose, infusion rate, total volume. Sign off against Rx.", mandatory: true },

  // ─── DRIP PREPARATION (CRITICAL SAFETY PHASE) ─────────────────────────
  // Core safety checks. The drip-specific mixing protocol (drugs, doses,
  // order of addition, infusion rate, which go IV push/IM separately)
  // is rendered from the order's own mixingProtocol data.
  { id: "prep-gather-verify", phase: "prep", label: "Gather & Verify Every Vial — 5 Rights", description: "For EVERY ingredient: right drug, right dose, right patient, right route, right time. Check expiry on every vial. Visual inspect — reject if discoloured / damaged seal / precipitate.", mandatory: true },
  { id: "prep-aseptic", phase: "prep", label: "Sterile Field + Sterile Gloves", description: "Alcohol-clean surface, sterile drape, surgical hand wash 60s, STERILE gloves. Touch only the sterile field.", mandatory: true },
  { id: "prep-follow-protocol", phase: "prep", label: "Follow Drip-Specific Mixing Protocol (below)", description: "Mix in the EXACT ORDER shown below. Each ingredient has specific method (add-to-bag / IV push / IM), rate, and timing. Do NOT deviate from the order.", mandatory: true },
  { id: "prep-no-shake", phase: "prep", label: "Mix by Inversion (never shake)", description: "Gentle invert 3× after each addition. Shaking denatures NAD+/glutathione, causes foaming. Hold bag to light after each addition — discard if colour change / cloudiness.", mandatory: true },
  { id: "prep-label-bag", phase: "prep", label: "Label the Bag", description: "Patient name + ID, every additive with dose, total volume, rate, prep time, nurse initials. Unlabelled bag = do NOT administer.", mandatory: true },
  { id: "prep-prime-line", phase: "prep", label: "Prime Tubing — No Air Bubbles", description: "Fill drip chamber ½, run to distal end, clear side-ports. Verify zero air in line before connecting.", mandatory: true },
  { id: "prep-final-check", phase: "prep", label: "Final Visual Check — label, clarity, rate", description: "Label matches Rx · No precipitation · Rate correctly calculated · Separate IV-push / IM doses drawn up & labelled. If ANY doubt → discard and restart.", mandatory: true },

  // ─── CANNULATION & SITE PREP ─────────────────────────────────────────
  { id: "hand-hygiene", phase: "pre", label: "Hand Hygiene + Fresh Gloves (Pre-Cannulation)", description: "After drip prep, perform fresh hand hygiene for 20 seconds and don a fresh pair of clean gloves before approaching the IV site.", mandatory: true },
  { id: "site-selection", phase: "pre", label: "Select IV Site", description: "Prefer non-dominant hand. Antecubital fossa for larger volumes. Avoid mastectomy side, AV fistula side.", mandatory: true },
  { id: "skin-prep", phase: "pre", label: "Skin Preparation", description: "Clean with 2% chlorhexidine or 70% isopropyl alcohol. Allow to dry 30 seconds. Do NOT re-touch site.", mandatory: true },
  { id: "cannulation", phase: "pre", label: "Cannulation & Flush Test", description: "Insert IV cannula (22G for most, 20G for high-volume). Confirm flashback. Saline flush 3–5 ml — check for pain, swelling, leakage.", mandatory: true },

  { id: "start-infusion", phase: "during", label: "Start Infusion at Prescribed Rate", description: "Set infusion pump or drip chamber to the exact rate specified by physician. Note start time.", mandatory: true },
  { id: "vitals-15min", phase: "during", label: "Monitor Vitals at 15 Minutes", description: "Recheck BP, HR, SpO₂. Ask patient about any discomfort, flushing, chest tightness, nausea, dizziness.", mandatory: true },
  { id: "vitals-midway", phase: "during", label: "Monitor Vitals at Midway Point", description: "Full vitals recheck. Inspect IV site for phlebitis, infiltration, leakage. Document findings.", mandatory: true },
  { id: "patient-comfort", phase: "during", label: "Patient Comfort & Communication Check", description: "Ask patient how they feel. Position adjustment if needed. Ensure emergency call button accessible.", mandatory: true },

  { id: "stop-infusion", phase: "post", label: "Stop Infusion & Final Flush", description: "Close the roller clamp, flush with 5ml saline, document end time and total volume infused.", mandatory: true },
  { id: "remove-cannula", phase: "post", label: "Remove Cannula", description: "Apply pressure with sterile gauze for 2 minutes. Apply pressure dressing. Check for hematoma.", mandatory: true },
  { id: "post-vitals", phase: "post", label: "Post-Infusion Vital Signs", description: "Complete vitals set. Monitor for 15 minutes. Abort discharge if vitals unstable.", mandatory: true },
  { id: "observation-period", phase: "post", label: "Post-Observation Period (Minimum 15 min)", description: "Patient must remain seated/supine for at least 15 minutes post-infusion. Offer water/light snack.", mandatory: true },
  { id: "discharge-criteria", phase: "post", label: "Verify Discharge Criteria", description: "Patient is alert, ambulatory, vitals stable, no active adverse reaction, understands post-infusion instructions.", mandatory: true },
  { id: "documentation", phase: "post", label: "Complete Documentation", description: "Session record: all vitals, times, volume infused, adverse events (if any), patient's subjective response.", mandatory: true },
  { id: "patient-feedback", phase: "post", label: "Collect Patient Feedback", description: "Brief 3-point feedback: How did you feel during? How do you feel now? Any concerns?", mandatory: false },
];

export function getChecklistByPhase(phase: "pre" | "during" | "post"): ChecklistStep[] {
  return INFUSION_CHECKLIST.filter((s) => s.phase === phase);
}
