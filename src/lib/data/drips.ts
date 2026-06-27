export type Drip = {
  id: string;
  slug: string;
  icon: string;
  name: string;
  subtitle: string;
  description: string;
  cat: "energy" | "beauty" | "immunity" | "recovery" | "performance" | "cognition";
  price: number;
  duration: string;
  volume: string;
  accentGradient: string;
  ingredients: { name: string; dose: string; barPct: number }[];
  tags: string[];
  popular?: boolean;
};

export const DRIPS: Drip[] = [
  {
    id: "velocity",
    slug: "velocity",
    icon: "\u26A1",
    name: "Velocity",
    subtitle: "Energy & Cognitive Performance",
    description:
      "Our most popular formula. Combines NAD+ precursors, the full B-complex and chelated magnesium to flood your mitochondria with fuel \u2014 delivering hours of sustained, clean energy without the crash.",
    cat: "energy",
    price: 8500,
    duration: "45\u201360 min",
    volume: "250ml",
    accentGradient: "linear-gradient(90deg, #FFD93D, #FF6B35)",
    ingredients: [
      { name: "NAD+ (Nicotinamide)", dose: "500mg", barPct: 90 },
      { name: "B-Complex (B1\u2013B12)", dose: "Full spectrum", barPct: 80 },
      { name: "Magnesium Chloride", dose: "2g", barPct: 70 },
      { name: "Vitamin B12 (Methylcobalamin)", dose: "1mg", barPct: 85 },
    ],
    tags: ["Energy", "Focus", "NAD+", "Anti-fatigue"],
  },
  {
    id: "luminescence",
    slug: "luminescence",
    icon: "\u2726",
    name: "Luminescence",
    subtitle: "Skin Brightening & Detox",
    description:
      "High-dose Glutathione paired with Vitamin C creates a powerful antioxidant cascade that brightens skin tone, reduces pigmentation and detoxifies at the cellular level. Results visible from session 1.",
    cat: "beauty",
    price: 9200,
    duration: "60\u201375 min",
    volume: "500ml",
    accentGradient: "linear-gradient(90deg, #FF9CEE, #FFDDE1)",
    ingredients: [
      { name: "Glutathione", dose: "2,400mg", barPct: 100 },
      { name: "Vitamin C (Ascorbic Acid)", dose: "10g", barPct: 90 },
      { name: "Alpha Lipoic Acid", dose: "300mg", barPct: 65 },
      { name: "Biotin", dose: "10mg", barPct: 55 },
    ],
    tags: ["Skin", "Glow", "Detox", "Antioxidant"],
    popular: true,
  },
  {
    id: "fortress",
    slug: "fortress",
    icon: "\uD83D\uDEE1\uFE0F",
    name: "Fortress",
    subtitle: "Immune Defence & Protection",
    description:
      "A pharmaceutical-grade immune protocol combining Zinc, Selenium, ultra-high-dose Vitamin C and D3 to rapidly activate natural killer cells and restore your body\u2019s first line of defence.",
    cat: "immunity",
    price: 7800,
    duration: "60\u201390 min",
    volume: "500ml",
    accentGradient: "linear-gradient(90deg, #5BB8F5, #1A7EA8)",
    ingredients: [
      { name: "Vitamin C (Ultra-dose)", dose: "25g", barPct: 100 },
      { name: "Zinc Chloride", dose: "5mg", barPct: 75 },
      { name: "Selenium", dose: "200mcg", barPct: 60 },
      { name: "Vitamin D3", dose: "50,000 IU", barPct: 70 },
    ],
    tags: ["Immunity", "Recovery", "Zinc", "Anti-viral"],
  },
  {
    id: "hydraflux",
    slug: "hydraflux",
    icon: "\uD83C\uDF0A",
    name: "Hydraflux",
    subtitle: "Deep Hydration & Recovery",
    description:
      "Go from dehydrated to deeply replenished in under an hour. The perfect reset after travel, intense heat, a night out or exercise. Balanced electrolytes reach every cell directly.",
    cat: "recovery",
    price: 5500,
    duration: "30\u201345 min",
    volume: "1,000ml",
    accentGradient: "linear-gradient(90deg, #43E5F7, #1A7EA8)",
    ingredients: [
      { name: "Normal Saline (0.9% NaCl)", dose: "1,000ml", barPct: 100 },
      { name: "Electrolyte Blend", dose: "Full", barPct: 80 },
      { name: "B-Complex", dose: "Standard", barPct: 65 },
      { name: "Magnesium Sulfate", dose: "1g", barPct: 55 },
    ],
    tags: ["Hydration", "Recovery", "Electrolytes", "Hangover"],
  },
  {
    id: "apex",
    slug: "apex",
    icon: "\uD83C\uDFCB\uFE0F",
    name: "Apex",
    subtitle: "Athletic Performance & Recovery",
    description:
      "Designed for athletes and high-performers. A complete amino acid profile plus L-Carnitine and B12 floods muscles with repair signals, cuts recovery time in half and rebuilds glycogen reserves rapidly.",
    cat: "performance",
    price: 10500,
    duration: "60\u201375 min",
    volume: "500ml",
    accentGradient: "linear-gradient(90deg, #43CBFF, #9708CC)",
    ingredients: [
      { name: "Amino Acid Complex", dose: "10g", barPct: 100 },
      { name: "L-Carnitine", dose: "3g", barPct: 85 },
      { name: "Vitamin B12", dose: "2mg", barPct: 70 },
      { name: "Taurine", dose: "2g", barPct: 60 },
    ],
    tags: ["Performance", "Muscle", "Amino Acids", "Endurance"],
  },
  {
    id: "cognitas",
    slug: "cognitas",
    icon: "\uD83E\uDDE0",
    name: "Cognitas",
    subtitle: "Mental Clarity & Mood",
    description:
      "Our premium nootropic IV. Alpha Lipoic Acid and Taurine protect neurons while NAD+ and Magnesium rebuild neurotransmitter pathways \u2014 delivering sharper memory, cleaner mood and lasting mental edge.",
    cat: "cognition",
    price: 11000,
    duration: "60\u201390 min",
    volume: "500ml",
    accentGradient: "linear-gradient(90deg, #C471F5, #FA71CD)",
    ingredients: [
      { name: "NAD+ (Nicotinamide)", dose: "750mg", barPct: 100 },
      { name: "Alpha Lipoic Acid", dose: "600mg", barPct: 80 },
      { name: "Taurine", dose: "2g", barPct: 70 },
      { name: "Magnesium Threonate", dose: "3g", barPct: 65 },
    ],
    tags: ["Cognition", "Mood", "Nootropic", "Memory"],
  },
];

export type Addon = {
  icon: string;
  name: string;
  description: string;
  price: number;
};

export const ADDONS: Addon[] = [
  { icon: "\uD83C\uDF1E", name: "Vitamin D3 Booster", description: "50,000 IU direct IV push for rapid bone & immune support", price: 800 },
  { icon: "\uD83E\uDDEC", name: "Extra Glutathione", description: "Additional 1,200mg glutathione push at end of infusion", price: 1200 },
  { icon: "\uD83D\uDC8A", name: "Toradol (Pain Relief)", description: "Anti-inflammatory for migraines, headaches and muscle pain", price: 600 },
  { icon: "\uD83C\uDF3F", name: "Zofran (Anti-Nausea)", description: "Physician-prescribed anti-nausea for rapid relief", price: 500 },
  { icon: "\u2764\uFE0F", name: "CoQ10", description: "Coenzyme Q10 for mitochondrial support and heart health", price: 1500 },
  { icon: "\uD83E\uDDEC", name: "Collagen Peptides", description: "Marine collagen for skin elasticity and joint recovery", price: 1800 },
  { icon: "\uD83E\uDEC0", name: "L-Arginine", description: "Cardiovascular support and nitric oxide production", price: 700 },
  { icon: "\uD83D\uDD2C", name: "Selenium Booster", description: "Additional 200mcg selenium for thyroid and antioxidant support", price: 400 },
];
