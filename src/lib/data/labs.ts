export type LabTest = {
  id: string;
  name: string;
  description: string;
  price: number;
  turnaround: string;
  icon: string;
  category: "blood" | "hormone" | "vitamin" | "organ" | "metabolic" | "allergy";
};

export type HealthConcern = {
  id: string;
  label: string;
  icon: string;
  description: string;
  essentialLabs: string[];
  recommendedLabs: string[];
};

export const LAB_TESTS: LabTest[] = [
  {
    id: "cbc",
    name: "Complete Blood Count (CBC)",
    description: "Evaluates overall health — red cells, white cells, haemoglobin, platelets.",
    price: 450,
    turnaround: "4–6 hrs",
    icon: "🩸",
    category: "blood",
  },
  {
    id: "crp",
    name: "C-Reactive Protein (CRP)",
    description: "Measures inflammation levels in the body, useful for infection and autoimmune screening.",
    price: 600,
    turnaround: "6–8 hrs",
    icon: "🔬",
    category: "blood",
  },
  {
    id: "vit-d",
    name: "Vitamin D (25-OH)",
    description: "Checks Vitamin D status — critical for immunity, bone health and energy.",
    price: 900,
    turnaround: "12–24 hrs",
    icon: "☀️",
    category: "vitamin",
  },
  {
    id: "vit-b12",
    name: "Vitamin B12",
    description: "Detects B12 deficiency linked to fatigue, nerve damage and cognitive issues.",
    price: 750,
    turnaround: "12–24 hrs",
    icon: "⚡",
    category: "vitamin",
  },
  {
    id: "iron-panel",
    name: "Iron Studies (Serum Iron, Ferritin, TIBC)",
    description: "Comprehensive iron panel to detect anaemia or iron overload.",
    price: 1100,
    turnaround: "12–24 hrs",
    icon: "🧲",
    category: "blood",
  },
  {
    id: "thyroid",
    name: "Thyroid Panel (TSH, T3, T4)",
    description: "Screens for hypo/hyperthyroidism — affects energy, weight and mood.",
    price: 850,
    turnaround: "12–24 hrs",
    icon: "🦋",
    category: "hormone",
  },
  {
    id: "lft",
    name: "Liver Function Tests (LFT)",
    description: "Assesses liver health — AST, ALT, bilirubin, albumin, ALP.",
    price: 650,
    turnaround: "6–8 hrs",
    icon: "🫁",
    category: "organ",
  },
  {
    id: "kft",
    name: "Kidney Function Tests (KFT)",
    description: "Evaluates kidney function — creatinine, BUN, uric acid, electrolytes.",
    price: 700,
    turnaround: "6–8 hrs",
    icon: "🫘",
    category: "organ",
  },
  {
    id: "hba1c",
    name: "HbA1c (Glycated Haemoglobin)",
    description: "3-month average blood sugar marker — gold standard for diabetes screening.",
    price: 550,
    turnaround: "6–8 hrs",
    icon: "🍬",
    category: "metabolic",
  },
  {
    id: "lipid",
    name: "Lipid Profile",
    description: "Total cholesterol, LDL, HDL, triglycerides — cardiovascular risk assessment.",
    price: 500,
    turnaround: "6–8 hrs",
    icon: "❤️",
    category: "metabolic",
  },
  {
    id: "electrolytes",
    name: "Serum Electrolytes (Na, K, Cl, Ca, Mg)",
    description: "Checks sodium, potassium, calcium, magnesium — essential for IV therapy planning.",
    price: 600,
    turnaround: "4–6 hrs",
    icon: "⚗️",
    category: "metabolic",
  },
  {
    id: "zinc",
    name: "Serum Zinc",
    description: "Zinc levels impact immunity, wound healing and cognitive function.",
    price: 650,
    turnaround: "24–48 hrs",
    icon: "🛡️",
    category: "vitamin",
  },
  {
    id: "folate",
    name: "Serum Folate",
    description: "Folate deficiency causes fatigue, mood changes and megaloblastic anaemia.",
    price: 700,
    turnaround: "24–48 hrs",
    icon: "🧬",
    category: "vitamin",
  },
  {
    id: "homocysteine",
    name: "Homocysteine",
    description: "Elevated levels increase cardiovascular risk — linked to B12/folate status.",
    price: 950,
    turnaround: "24–48 hrs",
    icon: "💓",
    category: "metabolic",
  },
  {
    id: "cortisol",
    name: "Serum Cortisol (AM)",
    description: "Stress hormone level — indicates adrenal function and chronic stress.",
    price: 800,
    turnaround: "12–24 hrs",
    icon: "🧠",
    category: "hormone",
  },
  {
    id: "testosterone",
    name: "Total Testosterone",
    description: "Checks testosterone levels — impacts energy, muscle mass and mood.",
    price: 900,
    turnaround: "24–48 hrs",
    icon: "💪",
    category: "hormone",
  },
  {
    id: "allergy-ige",
    name: "Total IgE (Allergy Screen)",
    description: "Screens for allergic conditions — elevated in asthma, eczema, allergies.",
    price: 700,
    turnaround: "24–48 hrs",
    icon: "🤧",
    category: "allergy",
  },
  {
    id: "esr",
    name: "ESR (Erythrocyte Sedimentation Rate)",
    description: "Non-specific inflammation marker — useful for autoimmune and infection screening.",
    price: 200,
    turnaround: "2–4 hrs",
    icon: "🧪",
    category: "blood",
  },
];

export const HEALTH_CONCERNS: HealthConcern[] = [
  {
    id: "fatigue",
    label: "Persistent Fatigue",
    icon: "😴",
    description: "Constant tiredness, low energy, difficulty getting through the day",
    essentialLabs: ["cbc", "vit-b12", "vit-d", "thyroid", "iron-panel"],
    recommendedLabs: ["hba1c", "cortisol", "electrolytes"],
  },
  {
    id: "immunity",
    label: "Weak Immunity",
    icon: "🛡️",
    description: "Frequent infections, slow wound healing, prolonged illness",
    essentialLabs: ["cbc", "vit-d", "zinc", "crp"],
    recommendedLabs: ["iron-panel", "allergy-ige", "esr"],
  },
  {
    id: "skin-hair",
    label: "Skin & Hair Issues",
    icon: "✨",
    description: "Dull skin, hair loss, brittle nails, pigmentation",
    essentialLabs: ["vit-d", "vit-b12", "iron-panel", "thyroid"],
    recommendedLabs: ["zinc", "folate", "lft"],
  },
  {
    id: "stress-mood",
    label: "Stress & Low Mood",
    icon: "🧠",
    description: "Anxiety, brain fog, poor concentration, mood swings",
    essentialLabs: ["thyroid", "vit-b12", "vit-d", "cortisol"],
    recommendedLabs: ["homocysteine", "folate", "electrolytes"],
  },
  {
    id: "fitness",
    label: "Athletic Performance",
    icon: "🏋️",
    description: "Muscle cramps, slow recovery, endurance plateau",
    essentialLabs: ["cbc", "iron-panel", "electrolytes", "vit-d"],
    recommendedLabs: ["testosterone", "cortisol", "lipid"],
  },
  {
    id: "weight",
    label: "Weight Management",
    icon: "⚖️",
    description: "Unexplained weight gain/loss, metabolic sluggishness",
    essentialLabs: ["thyroid", "hba1c", "lipid", "lft"],
    recommendedLabs: ["cortisol", "testosterone", "kft"],
  },
  {
    id: "digestion",
    label: "Digestive Health",
    icon: "🫁",
    description: "Bloating, nutrient malabsorption, gut discomfort",
    essentialLabs: ["cbc", "lft", "kft", "iron-panel"],
    recommendedLabs: ["vit-b12", "folate", "electrolytes"],
  },
  {
    id: "heart",
    label: "Heart & Vascular",
    icon: "❤️",
    description: "Family history of heart disease, cholesterol concerns",
    essentialLabs: ["lipid", "hba1c", "kft", "crp"],
    recommendedLabs: ["homocysteine", "electrolytes", "esr"],
  },
];
