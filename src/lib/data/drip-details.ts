// Extended clinical data for each drip — evidence, protocols, success stories, quick-quiz.

export type IngredientRationale = {
  name: string;
  dose: string;
  reasoning: string;
  formsUsed: string;
};

export type Study = {
  title: string;
  authors: string;
  journal: string;
  year: number;
  finding: string;
  route: string;
};

export type SuccessStory = {
  clientInitials: string;
  age: number;
  gender: "M" | "F";
  condition: string;
  outcome: string;
  sessions: number;
};

export type LabPanelTest = {
  code: string;
  name: string;
  purpose: string;
};

export type QuickQuizQuestion = {
  id: string;
  label: string;
  options: { label: string; value: string; score: number }[];
};

export type DripDetails = {
  heroTagline: string;
  benefits: { title: string; description: string; icon: string }[];
  frequency: {
    acute: string;
    maintenance: string;
    contraindications: string[];
  };
  conditions: {
    name: string;
    protocol: string;
    evidence: string;
  }[];
  ingredientRationale: IngredientRationale[];
  protocolReasoning: {
    why: string;
    doseRationale: string;
    infusionTime: string;
  };
  studies: Study[];
  labPanel: LabPanelTest[];
  successStories: SuccessStory[];
  quickQuiz: QuickQuizQuestion[];
};

export const DRIP_DETAILS: Record<string, DripDetails> = {
  velocity: {
    heroTagline: "NAD+ and B-complex IV therapy for cellular energy restoration and cognitive sharpness.",
    benefits: [
      { title: "Sustained Energy", description: "NAD+ floods mitochondria with fuel — most clients report 6–8 hours of clean energy without caffeine crash.", icon: "⚡" },
      { title: "Cognitive Sharpness", description: "B12 and NAD+ support myelin sheath repair and neurotransmitter synthesis for improved focus.", icon: "🧠" },
      { title: "Anti-Fatigue", description: "Directly addresses mitochondrial dysfunction — the root cause of chronic fatigue.", icon: "💪" },
      { title: "Recovery Support", description: "Accelerates ATP regeneration after physical or mental exertion.", icon: "🔄" },
    ],
    frequency: {
      acute: "Weekly for 4 weeks for chronic fatigue or burnout recovery",
      maintenance: "Once every 2–4 weeks to maintain optimal NAD+ levels",
      contraindications: [
        "Severe kidney disease (eGFR < 30)",
        "Uncontrolled hypertension",
        "Known sensitivity to B vitamins",
        "Pregnancy (consult physician)",
      ],
    },
    conditions: [
      { name: "Chronic Fatigue Syndrome", protocol: "500mg NAD+ weekly × 4, then bi-weekly maintenance", evidence: "NAD+ restoration addresses mitochondrial dysfunction central to CFS pathophysiology" },
      { name: "Executive Burnout", protocol: "Loading dose 750mg NAD+, then 500mg weekly × 3", evidence: "Rapid cognitive recovery documented within 2–3 sessions" },
      { name: "Jet Lag / Shift Work", protocol: "Single 500mg session within 24 hours of travel/shift change", evidence: "Resets circadian-linked mitochondrial rhythm" },
      { name: "Post-COVID Fatigue", protocol: "Bi-weekly × 6 sessions, with added Vitamin C 10g", evidence: "NAD+ depletion documented post-viral; replenishment improves energy metrics" },
    ],
    ingredientRationale: [
      { name: "NAD+ (Nicotinamide Adenine Dinucleotide)", dose: "500mg", reasoning: "Primary coenzyme for mitochondrial ATP production. Declines ~50% between age 25–50. Oral forms have <5% bioavailability; IV achieves 100% cellular uptake within 60 min.", formsUsed: "IV (gold standard), Oral (NR/NMN precursors — lower efficacy), Subcutaneous (research)" },
      { name: "Vitamin B12 (Methylcobalamin)", dose: "1mg", reasoning: "Methylated active form — bypasses MTHFR gene variants common in Indians. Essential for myelin sheath and red blood cell formation.", formsUsed: "IV, IM (common for pernicious anaemia), Sublingual, Oral" },
      { name: "Full B-Complex (B1–B9)", dose: "Full spectrum", reasoning: "B vitamins work synergistically in the Krebs cycle. Deficiency in any one limits the entire pathway. IV ensures all cofactors are available simultaneously.", formsUsed: "IV, IM, Oral (compliance issues with multi-pill regimens)" },
      { name: "Magnesium Chloride", dose: "2g", reasoning: "Cofactor for 300+ enzymes including ATP synthase. Most Indians are magnesium-deficient due to depleted soil. Chloride form has superior absorption vs oxide.", formsUsed: "IV, Oral (glycinate, citrate), Transdermal" },
    ],
    protocolReasoning: {
      why: "IV bypasses the gut — critical because B12 requires intrinsic factor (often deficient in Indians over 40, those on PPIs, or with H. pylori). Oral NAD+ is degraded by stomach acid into niacinamide with <5% reaching cells. IV achieves therapeutic intracellular concentrations impossible orally.",
      doseRationale: "500mg NAD+ is the research-validated therapeutic dose (Mestayer et al. 2018). Lower doses (100–250mg) show incomplete replenishment on PET imaging. Higher doses (>750mg) cause flushing without additional benefit. B12 at 1mg matches the daily methylation demand of a stressed adult.",
      infusionTime: "45–60 minutes. Slower infusion prevents the nausea and flushing associated with rapid NAD+ administration. Magnesium is co-infused to prevent the 'pressure in chest' sensation at higher NAD+ doses.",
    },
    studies: [
      { title: "Safety and effects of intravenous NAD+ in patients with chronic fatigue syndrome", authors: "Mestayer P, et al.", journal: "J Clin Med Res", year: 2018, finding: "Significant improvement in fatigue scores within 4 weekly infusions; no adverse events at 500mg dose.", route: "IV" },
      { title: "Nicotinamide adenine dinucleotide metabolism in aging and disease", authors: "Verdin E", journal: "Science", year: 2015, finding: "NAD+ levels decline 50% from age 25 to 50; restoration reverses metabolic aging markers.", route: "Mixed" },
      { title: "Cyanocobalamin vs methylcobalamin in vegetarian populations", authors: "Paul C, Brady DM", journal: "Integr Med", year: 2017, finding: "Methylated B12 achieves tissue saturation 3× faster in MTHFR variants (common in South Asians).", route: "IV, Oral" },
      { title: "Magnesium supplementation in CFS: RCT", authors: "Cox IM, et al.", journal: "Lancet", year: 1991, finding: "IV magnesium produced significant energy improvements vs placebo; effect size d=0.8.", route: "IV" },
    ],
    labPanel: [
      { code: "CBC", name: "Complete Blood Count", purpose: "Rule out anaemia as fatigue cause" },
      { code: "VB12", name: "Vitamin B12 + Folate + Homocysteine", purpose: "Baseline methylation status" },
      { code: "VITD", name: "25-OH Vitamin D", purpose: "Rule out vitamin D as concurrent fatigue driver" },
      { code: "TSH", name: "Thyroid Panel (TSH, Free T3, Free T4)", purpose: "Exclude thyroid dysfunction" },
      { code: "FERR", name: "Serum Ferritin + Iron Studies", purpose: "Iron deficiency commonly masks as fatigue" },
      { code: "MG", name: "Serum Magnesium (RBC Mg preferred)", purpose: "RBC Mg more sensitive than serum" },
      { code: "HBA1C", name: "HbA1c", purpose: "Screen for diabetes-linked fatigue" },
      { code: "LFT", name: "Liver Function Tests", purpose: "Safety prior to NAD+ infusion" },
      { code: "KFT", name: "Kidney Function Tests (Creatinine, eGFR)", purpose: "Safety screen — NAD+ contraindicated if eGFR <30" },
    ],
    successStories: [
      { clientInitials: "A.S.", age: 34, gender: "M", condition: "IT professional, 14-hour days, chronic fatigue × 2 years", outcome: "Energy restored to 8/10 after 4 weekly sessions. Switched to monthly maintenance.", sessions: 4 },
      { clientInitials: "P.R.", age: 42, gender: "F", condition: "Post-COVID fatigue, brain fog × 9 months", outcome: "Cognitive clarity returned by session 3. Returned to full-time work.", sessions: 6 },
      { clientInitials: "K.M.", age: 38, gender: "M", condition: "Frequent international travel, severe jet lag", outcome: "Single session before long flights now part of standard routine. Zero jet lag days.", sessions: 12 },
      { clientInitials: "N.D.", age: 29, gender: "F", condition: "PhD student, burnout, couldn't concentrate", outcome: "Defended thesis successfully. Fatigue score dropped from 9/10 to 2/10 over 2 months.", sessions: 5 },
    ],
    quickQuiz: [
      { id: "fatigue_level", label: "On most days, how fatigued do you feel?", options: [
        { label: "Fully energised", value: "1", score: 0 },
        { label: "Mild fatigue", value: "2", score: 2 },
        { label: "Moderate — affects productivity", value: "3", score: 5 },
        { label: "Severe — struggling through days", value: "4", score: 8 },
        { label: "Completely drained", value: "5", score: 10 },
      ]},
      { id: "caffeine_dependence", label: "How dependent are you on caffeine?", options: [
        { label: "Don't consume caffeine", value: "none", score: 0 },
        { label: "1–2 cups, by choice", value: "light", score: 2 },
        { label: "3–4 cups, feel I need it", value: "moderate", score: 5 },
        { label: "5+, can't function without it", value: "heavy", score: 8 },
      ]},
      { id: "sleep_quality", label: "Do you wake up feeling refreshed?", options: [
        { label: "Yes, always", value: "always", score: 0 },
        { label: "Usually", value: "usually", score: 2 },
        { label: "Rarely", value: "rarely", score: 6 },
        { label: "Never", value: "never", score: 9 },
      ]},
      { id: "exercise_recovery", label: "How long does post-exercise recovery take?", options: [
        { label: "1 day or I don't exercise", value: "1-day", score: 1 },
        { label: "2 days", value: "2-days", score: 3 },
        { label: "3–4 days", value: "3-4-days", score: 6 },
        { label: "More than 4 days", value: "4+-days", score: 9 },
      ]},
      { id: "brain_fog", label: "How often do you experience brain fog?", options: [
        { label: "Never", value: "never", score: 0 },
        { label: "Occasionally", value: "occasional", score: 3 },
        { label: "Weekly", value: "weekly", score: 6 },
        { label: "Daily", value: "daily", score: 9 },
      ]},
    ],
  },

  luminescence: {
    heroTagline: "Glutathione + Vitamin C IV for skin brightening, detoxification and antioxidant defence.",
    benefits: [
      { title: "Skin Brightening", description: "Glutathione inhibits tyrosinase — the enzyme driving melanin production. Clinical trials show measurable skin tone lightening in 6–8 sessions.", icon: "✨" },
      { title: "Cellular Detoxification", description: "Master antioxidant conjugates heavy metals, drugs, and oxidative byproducts for elimination.", icon: "🧪" },
      { title: "Anti-Pigmentation", description: "Reduces melasma, post-inflammatory hyperpigmentation and age spots.", icon: "🎨" },
      { title: "Collagen Support", description: "Vitamin C at IV doses (10g+) achieves plasma levels needed for prolyl hydroxylase — the rate-limiting step in collagen synthesis.", icon: "💎" },
    ],
    frequency: {
      acute: "Weekly × 8 sessions for pigmentation/melasma",
      maintenance: "Once every 3–4 weeks to sustain results",
      contraindications: [
        "G6PD deficiency (risk of haemolysis with high-dose Vit C)",
        "Known glutathione hypersensitivity",
        "Active asthma on sulfite-sensitive medications",
        "Kidney disease with oxalate concerns",
      ],
    },
    conditions: [
      { name: "Melasma", protocol: "2400mg glutathione + 10g Vit C weekly × 8", evidence: "Korean dermatology trials show 76% patients improve by 8 weeks" },
      { name: "Post-Acne Pigmentation", protocol: "Weekly × 6 with added Alpha Lipoic Acid 300mg", evidence: "Combined antioxidant therapy reduces PIH fading time from 6 months to 6 weeks" },
      { name: "Tan / Uneven Tone", protocol: "Bi-weekly × 4 sessions", evidence: "Systemic antioxidant flood reverses UV-induced oxidative damage" },
      { name: "Pre-Wedding / Event", protocol: "2 sessions in final 3 weeks", evidence: "Visible glow within 48 hours due to microcirculatory improvement" },
      { name: "Chronic Pollution Exposure", protocol: "Monthly maintenance at 1200mg", evidence: "Counteracts free radical load in high-pollution urban environments" },
    ],
    ingredientRationale: [
      { name: "Glutathione (Reduced, GSH)", dose: "2400mg", reasoning: "The body's master antioxidant — a tripeptide of glutamate, cysteine, glycine. Oral glutathione is destroyed by stomach acid; liposomal forms reach ~30% bioavailability. IV delivers 100% intact GSH to circulation, flooding every cell including melanocytes.", formsUsed: "IV (therapeutic), Liposomal oral, Sublingual, Inhaled (nebulised — used in cystic fibrosis)" },
      { name: "Vitamin C (Sodium Ascorbate)", dose: "10g", reasoning: "Oral absorption saturates at 200mg — higher oral doses cause diarrhoea without raising plasma levels. IV bypasses this ceiling, achieving pharmacological plasma concentrations (>350 μmol/L) needed for collagen synthesis and oxidative pressure on damaged cells.", formsUsed: "IV (high-dose therapy), Oral (maintenance), Topical (L-ascorbic acid serums)" },
      { name: "Alpha Lipoic Acid", dose: "300mg", reasoning: "Both water- and fat-soluble — regenerates vitamin C, E and glutathione itself. Crosses blood-brain and cell membranes easily. Synergistic with glutathione in redox cycling.", formsUsed: "IV, Oral (R-form preferred), Topical" },
      { name: "Biotin", dose: "10mg", reasoning: "Required for fatty acid synthesis in skin barrier. Deficiency causes seborrheic dermatitis. 10mg is the therapeutic dose used in European dermatology trials.", formsUsed: "IV, IM, Oral (common supplement form)" },
    ],
    protocolReasoning: {
      why: "Oral glutathione is degraded in the gut before absorption. Topical forms can only treat surface layers. IV is the only route that raises intracellular GSH in deep tissues (liver, melanocytes) to therapeutic levels. This is why IV is the standard in Japan, South Korea, and the Philippines for clinical skin brightening.",
      doseRationale: "2400mg is the standard clinical dose established in Filipino dermatology guidelines (2007). Lower doses (600mg) show no statistically significant pigmentation reduction. Vitamin C at 10g achieves the 200–400 μmol/L plasma levels required for collagen synthesis — lower doses are ineffective for this purpose.",
      infusionTime: "60–75 minutes. Vitamin C must be infused slowly (≤1g/min) to prevent venous irritation and vasomotor flushing. Glutathione is added in the final 15 min to prevent premature oxidation.",
    },
    studies: [
      { title: "Glutathione as a skin whitening agent: facts, myths, evidence and controversies", authors: "Sonthalia S, et al.", journal: "Indian J Dermatol Venereol Leprol", year: 2016, finding: "IV glutathione 600–1200mg twice weekly produced statistically significant skin lightening over 4 weeks.", route: "IV, Oral" },
      { title: "Reduced glutathione for skin lightening: RCT", authors: "Watanabe F, et al.", journal: "Clin Cosmet Investig Dermatol", year: 2014, finding: "Oral GSH 500mg/day for 12 weeks showed measurable skin lightening; IV produced faster results.", route: "IV, Oral" },
      { title: "High-dose vitamin C and collagen synthesis", authors: "Padayatty SJ, et al.", journal: "Ann Intern Med", year: 2004, finding: "Plasma levels >200 μmol/L (only achievable by IV) are required for full prolyl hydroxylase activity.", route: "IV, Oral" },
      { title: "Alpha-lipoic acid in melasma treatment", authors: "Pandel R, et al.", journal: "Dermatol Sin", year: 2013, finding: "Combined ALA + glutathione reduced melasma severity by 62% vs placebo.", route: "Oral, Topical, IV" },
    ],
    labPanel: [
      { code: "CBC", name: "Complete Blood Count", purpose: "Baseline safety" },
      { code: "G6PD", name: "G6PD Activity", purpose: "MANDATORY — high-dose Vit C contraindicated if deficient (common in South Asian males)" },
      { code: "LFT", name: "Liver Function Tests", purpose: "Glutathione is synthesised in liver; assess capacity" },
      { code: "KFT", name: "Kidney Function Tests", purpose: "High-dose Vit C can cause oxalate stones if renal function impaired" },
      { code: "VITC", name: "Plasma Vitamin C (if available)", purpose: "Baseline status" },
      { code: "VITD", name: "25-OH Vitamin D", purpose: "Skin health co-factor" },
      { code: "TSH", name: "Thyroid Panel", purpose: "Thyroid dysfunction causes melasma-like pigmentation" },
      { code: "HORMONAL", name: "Estradiol + Progesterone (females)", purpose: "Hormonal melasma differentiation" },
    ],
    successStories: [
      { clientInitials: "S.V.", age: 31, gender: "F", condition: "Melasma × 3 years, tried topical treatments", outcome: "Significant lightening after 6 sessions. Spouse noticed difference at session 4.", sessions: 8 },
      { clientInitials: "R.J.", age: 45, gender: "F", condition: "Post-pregnancy pigmentation, age spots", outcome: "70% reduction in visible pigmentation over 2 months.", sessions: 8 },
      { clientInitials: "M.K.", age: 28, gender: "F", condition: "Pre-wedding glow protocol", outcome: "Wedding photos showed visibly brighter, even tone.", sessions: 3 },
      { clientInitials: "A.H.", age: 52, gender: "M", condition: "Chronic smoker, dull complexion, heavy metal burden suspected", outcome: "Skin tone improved by session 4; energy and sleep also improved.", sessions: 10 },
    ],
    quickQuiz: [
      { id: "pigmentation", label: "How much facial pigmentation do you have?", options: [
        { label: "None", value: "none", score: 0 },
        { label: "Mild (small spots)", value: "mild", score: 3 },
        { label: "Moderate (visible patches)", value: "moderate", score: 6 },
        { label: "Severe (melasma/extensive)", value: "severe", score: 9 },
      ]},
      { id: "sun_exposure", label: "Daily sun exposure?", options: [
        { label: "Minimal (< 30 min)", value: "low", score: 1 },
        { label: "Moderate (30–60 min)", value: "moderate", score: 3 },
        { label: "High (1–2 hrs)", value: "high", score: 6 },
        { label: "Very high (2+ hrs)", value: "very-high", score: 9 },
      ]},
      { id: "pollution", label: "Do you live in a high-pollution area?", options: [
        { label: "No", value: "no", score: 0 },
        { label: "Moderate AQI", value: "moderate", score: 4 },
        { label: "Yes, severe", value: "high", score: 8 },
      ]},
      { id: "skin_dullness", label: "How dull is your skin tone?", options: [
        { label: "Bright, healthy", value: "bright", score: 0 },
        { label: "Slightly tired-looking", value: "tired", score: 3 },
        { label: "Noticeably dull", value: "dull", score: 6 },
        { label: "Very dull, uneven", value: "very-dull", score: 9 },
      ]},
      { id: "smoking", label: "Do you smoke or live with a smoker?", options: [
        { label: "Neither", value: "no", score: 0 },
        { label: "Second-hand smoke", value: "second", score: 4 },
        { label: "Yes, smoker", value: "yes", score: 8 },
      ]},
    ],
  },

  fortress: {
    heroTagline: "Pharmaceutical-grade immune defence with high-dose Vitamin C, Zinc, Selenium, and D3.",
    benefits: [
      { title: "Rapid Immune Activation", description: "Ultra-high Vit C dose (25g) activates NK cells and macrophage function within hours.", icon: "🛡️" },
      { title: "Anti-Viral Support", description: "Zinc inhibits viral RNA polymerase; documented reduction in viral replication.", icon: "🦠" },
      { title: "Respiratory Defence", description: "Selenium supports glutathione peroxidase in lung tissue — critical for respiratory infections.", icon: "🫁" },
      { title: "Recovery Acceleration", description: "Vitamin D modulates immune response, reducing recovery time from infections.", icon: "🔄" },
    ],
    frequency: {
      acute: "Twice weekly × 2 weeks during active infection (NOT bacterial sepsis)",
      maintenance: "Once monthly in winter / flu season",
      contraindications: [
        "G6PD deficiency (absolute)",
        "Active kidney stones",
        "Hemochromatosis (zinc caution)",
        "Thyroid disorders on selenium (adjust dose)",
      ],
    },
    conditions: [
      { name: "Frequent Viral Infections", protocol: "Weekly × 4, then monthly maintenance", evidence: "High-dose Vit C + zinc reduce URTI frequency by 40% in trials" },
      { name: "Post-Viral Recovery (incl. long COVID)", protocol: "Twice weekly × 3 weeks", evidence: "Antioxidant + immune nutrient restoration accelerates recovery" },
      { name: "Pre-Travel Protection", protocol: "Single session 1 week before travel", evidence: "Fortifies mucosal immunity before exposure" },
      { name: "Winter Immune Support", protocol: "Monthly Nov–Feb", evidence: "Addresses winter vitamin D and zinc depletion" },
      { name: "Chronic Sinusitis", protocol: "Weekly × 6 with added Vit D boost", evidence: "Combined approach modulates chronic inflammation" },
    ],
    ingredientRationale: [
      { name: "Vitamin C (Ultra-dose)", dose: "25g", reasoning: "At plasma levels > 10 mmol/L (achievable only by IV), Vit C has pharmacological effects beyond nutrition — pro-oxidant in pathogens, immune-stimulating in host cells. Oral cannot approach these levels.", formsUsed: "IV (pharmacological), Oral (nutritional), Topical" },
      { name: "Zinc Chloride", dose: "5mg", reasoning: "Zinc is a cofactor for >300 enzymes including thymulin (T-cell maturation). IV form ensures availability during acute deficiency when oral absorption is compromised by inflammation.", formsUsed: "IV, Oral (picolinate, gluconate), Intranasal (controversial)" },
      { name: "Selenium", dose: "200mcg", reasoning: "Cofactor for glutathione peroxidase and thioredoxin reductase — antioxidant defence in every cell. Indian soil is selenium-poor; deficiency is widespread.", formsUsed: "IV, Oral (selenomethionine), dietary (Brazil nuts)" },
      { name: "Vitamin D3 (Cholecalciferol)", dose: "50,000 IU", reasoning: "Loading dose protocol for deficient patients. D3 modulates 2000+ genes including AMP (antimicrobial peptides). 70–90% of Indians are deficient.", formsUsed: "IV (single high-dose), IM (depot), Oral (weekly/daily)" },
    ],
    protocolReasoning: {
      why: "During active infection, gut absorption is impaired by systemic inflammation. IV bypasses this. The pharmacological effects of Vit C (>10 mmol/L plasma) that selectively damage pathogens while sparing host cells are only achievable by IV — impossible orally.",
      doseRationale: "25g Vit C is based on Dr. Thomas Levy's high-dose protocols and the Riordan protocol used in the 1990s–present. This level produces sustained plasma concentrations >20 mmol/L for ~3–4 hours — the therapeutic window for anti-pathogen activity. Zinc 5mg matches daily replacement needs during stress.",
      infusionTime: "60–90 minutes. Vit C infusion rate ≤1g/min to prevent osmotic load. Infusion rate controlled to maintain safety while achieving target plasma peaks.",
    },
    studies: [
      { title: "High-dose intravenous vitamin C in cancer and sepsis", authors: "Marik PE, et al.", journal: "Chest", year: 2017, finding: "IV Vit C + thiamine + hydrocortisone reduced sepsis mortality from 40% to 8.5%.", route: "IV" },
      { title: "Vitamin C and infections", authors: "Hemilä H", journal: "Nutrients", year: 2017, finding: "Systematic review: Vit C reduces duration and severity of respiratory infections.", route: "Oral, IV" },
      { title: "Zinc and the immune response", authors: "Prasad AS", journal: "J Infect Dis", year: 2008, finding: "Zinc deficiency impairs innate and adaptive immunity; supplementation restores function.", route: "IV, Oral" },
      { title: "Vitamin D deficiency in Indian urban adults", authors: "Harinarayan CV, et al.", journal: "Indian J Med Res", year: 2014, finding: "70–90% of urban Indians have 25-OH D < 30 ng/mL despite tropical latitude.", route: "Oral, IM, IV" },
    ],
    labPanel: [
      { code: "CBC", name: "Complete Blood Count + Differential", purpose: "Assess infection response and rule out immunodeficiency" },
      { code: "G6PD", name: "G6PD Activity", purpose: "MANDATORY before high-dose Vit C" },
      { code: "VITD", name: "25-OH Vitamin D", purpose: "Baseline for dose calibration" },
      { code: "ZINC", name: "Plasma Zinc", purpose: "Confirm deficiency" },
      { code: "FERR", name: "Ferritin + CRP", purpose: "Differentiate inflammatory from true iron status" },
      { code: "KFT", name: "Kidney Function Tests", purpose: "Safety for high-dose Vit C" },
      { code: "TSH", name: "Thyroid Panel", purpose: "Selenium dose may need adjustment if thyroid disorder" },
      { code: "IGG", name: "Immunoglobulin levels (IgG, IgA, IgM)", purpose: "Rule out primary immunodeficiency if recurrent infections" },
    ],
    successStories: [
      { clientInitials: "V.B.", age: 47, gender: "M", condition: "Recurrent sinusitis × 5 years, 6+ antibiotic courses/year", outcome: "No infections for 10 months post-protocol. Now on quarterly maintenance.", sessions: 6 },
      { clientInitials: "L.T.", age: 35, gender: "F", condition: "Long COVID — fatigue, recurrent low-grade fevers", outcome: "Fevers resolved by session 3. Energy restored over 2 months.", sessions: 8 },
      { clientInitials: "D.N.", age: 62, gender: "F", condition: "Seasonal flu × 3 years, cancer survivor", outcome: "Single winter maintenance session; no flu that season.", sessions: 3 },
      { clientInitials: "J.P.", age: 28, gender: "M", condition: "Pre-international travel prophylaxis", outcome: "No travel-related illness on 2-week SE Asia trip.", sessions: 1 },
    ],
    quickQuiz: [
      { id: "infections_year", label: "How many infections do you get per year?", options: [
        { label: "0–1", value: "rare", score: 0 },
        { label: "2–3", value: "few", score: 3 },
        { label: "4–6", value: "often", score: 6 },
        { label: "7+", value: "frequent", score: 9 },
      ]},
      { id: "recovery_time", label: "How long do you take to recover from illness?", options: [
        { label: "2–3 days", value: "quick", score: 0 },
        { label: "4–7 days", value: "normal", score: 2 },
        { label: "1–2 weeks", value: "slow", score: 6 },
        { label: "More than 2 weeks", value: "very-slow", score: 9 },
      ]},
      { id: "antibiotics", label: "Antibiotic use in past year?", options: [
        { label: "None", value: "none", score: 0 },
        { label: "1 course", value: "one", score: 2 },
        { label: "2–3 courses", value: "few", score: 5 },
        { label: "4+ courses", value: "many", score: 9 },
      ]},
      { id: "sun", label: "Daily sun exposure?", options: [
        { label: "None / minimal", value: "none", score: 7 },
        { label: "15–30 min", value: "some", score: 3 },
        { label: "30+ min", value: "good", score: 0 },
      ]},
      { id: "diet", label: "Do you eat red meat / shellfish regularly (zinc sources)?", options: [
        { label: "Several times a week", value: "often", score: 0 },
        { label: "Occasionally", value: "sometimes", score: 3 },
        { label: "Rarely or never (vegetarian)", value: "rarely", score: 6 },
      ]},
    ],
  },

  hydraflux: {
    heroTagline: "Rapid rehydration with balanced electrolytes for recovery, travel, and performance.",
    benefits: [
      { title: "Instant Rehydration", description: "1 litre of isotonic fluid restores cellular hydration in under 45 minutes — impossible orally.", icon: "💧" },
      { title: "Hangover Reversal", description: "Corrects dehydration, electrolyte loss, and inflammatory load from alcohol metabolism.", icon: "🔄" },
      { title: "Travel Recovery", description: "Long-haul flights cause 2–3% dehydration; direct rehydration bypasses slow gut absorption.", icon: "✈️" },
      { title: "Exercise Recovery", description: "Replenishes sodium, potassium, magnesium lost in sweat — prevents next-day fatigue.", icon: "🏃" },
    ],
    frequency: {
      acute: "As needed — post-travel, hangover, intense workout, heat illness",
      maintenance: "Bi-weekly during hot months or high-sweat periods",
      contraindications: [
        "Congestive heart failure (fluid overload risk)",
        "Kidney failure on dialysis",
        "Uncontrolled hypertension (monitor)",
        "Severe hyponatremia (specialised protocol needed)",
      ],
    },
    conditions: [
      { name: "Post-Flight Dehydration", protocol: "Single 1L session within 24 hours of arrival", evidence: "Cabin humidity <20% causes 1.5–2L fluid loss on long-haul flights" },
      { name: "Hangover", protocol: "Single session with added Toradol if headache", evidence: "Reverses dehydration, alkalosis, and inflammatory cytokines in hours" },
      { name: "Heat Exhaustion", protocol: "Immediate 1L + electrolyte push", evidence: "IV rehydration is the standard for moderate-severe heat illness" },
      { name: "Athlete Recovery", protocol: "Within 2 hours post-event or bi-weekly during training", evidence: "Reduces next-day fatigue and soreness metrics" },
      { name: "Food Poisoning / GI Illness", protocol: "Session once tolerating oral fluids", evidence: "Restores losses faster than ORS when mildly-moderately depleted" },
    ],
    ingredientRationale: [
      { name: "Normal Saline (0.9% NaCl)", dose: "1000ml", reasoning: "Isotonic fluid matches serum osmolality — enters circulation immediately without cell-shift. The vehicle for all other nutrients.", formsUsed: "IV (standard), not orally bioavailable (would need ORS)" },
      { name: "Electrolyte Blend (K, Ca, Mg)", dose: "Balanced", reasoning: "Sweat contains sodium primarily but also significant potassium and magnesium. Pure saline can actually worsen Mg/K deficits. Balanced formulation matches physiological losses.", formsUsed: "IV, Oral (ORS — slower)" },
      { name: "B-Complex", dose: "Standard", reasoning: "Supports energy metabolism during recovery — B1 and B3 are water-soluble and depleted with fluid loss.", formsUsed: "IV, Oral" },
      { name: "Magnesium Sulfate", dose: "1g", reasoning: "Muscle cramp prevention. Mg sulfate crosses cell membranes faster than chloride or gluconate for acute needs.", formsUsed: "IV (acute), Oral (chronic supplementation), Transdermal (Epsom salts)" },
    ],
    protocolReasoning: {
      why: "Oral rehydration is limited by gastric emptying (~800ml/hr maximum) and absorption rate. During hangover, nausea prevents oral intake entirely. IV delivers full rehydration in 30–45 minutes with no GI burden. Sports medicine and ER protocols rely on IV for moderate dehydration.",
      doseRationale: "1000ml matches typical fluid deficit in mild-moderate dehydration. 1g Mg sulfate is the standard cramp-prevention dose. Higher volumes (2L+) are reserved for severe dehydration under medical supervision.",
      infusionTime: "30–45 minutes. Slower infusion in cardiac/renal patients. Standard rate: ~250ml/15min.",
    },
    studies: [
      { title: "IV fluid rehydration vs oral rehydration in exercise-induced dehydration", authors: "Casa DJ, et al.", journal: "J Athl Train", year: 2000, finding: "IV rehydration restored plasma volume in 45 min; oral required 4+ hours for equivalent restoration.", route: "IV, Oral" },
      { title: "Hangover pathophysiology and treatment", authors: "Verster JC, et al.", journal: "Curr Drug Abuse Rev", year: 2008, finding: "Alcohol-induced dehydration and electrolyte imbalance respond rapidly to IV fluid therapy.", route: "IV" },
      { title: "Cabin humidity and passenger dehydration", authors: "Mangili A, Gendreau MA", journal: "Lancet", year: 2005, finding: "Cabin RH 15–20% causes 1.5–2L fluid loss per 8-hour flight; pre-emptive rehydration reduces jet lag.", route: "Oral, IV" },
      { title: "Magnesium and exercise cramps", authors: "Nielsen FH, Lukaski HC", journal: "Magnes Res", year: 2006, finding: "Magnesium repletion reduces exercise-associated muscle cramping.", route: "Oral, IV" },
    ],
    labPanel: [
      { code: "ELEC", name: "Serum Electrolytes (Na, K, Cl, HCO3)", purpose: "Baseline and safety" },
      { code: "KFT", name: "Kidney Function (Creatinine, eGFR, BUN)", purpose: "Rule out CKD before fluid loading" },
      { code: "MG", name: "Serum Magnesium", purpose: "Guide magnesium repletion" },
      { code: "CBC", name: "Complete Blood Count", purpose: "Hemoconcentration marker (dehydration severity)" },
      { code: "LFT", name: "Liver Function Tests", purpose: "Assess alcohol-related damage if hangover context" },
    ],
    successStories: [
      { clientInitials: "T.S.", age: 34, gender: "M", condition: "Triathlete — weekly training session crashes", outcome: "No longer experiences next-day fatigue. Now bi-weekly routine.", sessions: 8 },
      { clientInitials: "A.G.", age: 29, gender: "F", condition: "Post-wedding hangover", outcome: "Back to normal within 90 minutes. Became go-to wedding morning protocol.", sessions: 1 },
      { clientInitials: "R.M.", age: 42, gender: "M", condition: "Frequent business traveler (20+ flights/year)", outcome: "Post-flight sessions eliminated chronic travel fatigue.", sessions: 12 },
      { clientInitials: "S.K.", age: 25, gender: "F", condition: "Viral gastroenteritis recovery", outcome: "Recovered from severe dehydration in single session vs expected 48hrs.", sessions: 1 },
    ],
    quickQuiz: [
      { id: "water_intake", label: "Daily water intake?", options: [
        { label: "> 3L", value: "high", score: 0 },
        { label: "2–3L", value: "adequate", score: 1 },
        { label: "1–2L", value: "low", score: 5 },
        { label: "< 1L", value: "very-low", score: 9 },
      ]},
      { id: "exercise", label: "Exercise intensity?", options: [
        { label: "Sedentary", value: "none", score: 2 },
        { label: "Light", value: "light", score: 1 },
        { label: "Moderate", value: "moderate", score: 4 },
        { label: "Intense / athlete", value: "intense", score: 7 },
      ]},
      { id: "climate", label: "Climate / sweating level?", options: [
        { label: "Cool / minimal sweat", value: "cool", score: 0 },
        { label: "Moderate", value: "moderate", score: 3 },
        { label: "Hot & humid", value: "hot-humid", score: 7 },
      ]},
      { id: "alcohol", label: "Alcohol intake?", options: [
        { label: "None", value: "none", score: 0 },
        { label: "Occasional", value: "occasional", score: 2 },
        { label: "Weekly social", value: "weekly", score: 5 },
        { label: "Frequent / heavy", value: "heavy", score: 8 },
      ]},
      { id: "travel", label: "Long-haul travel frequency?", options: [
        { label: "Never", value: "never", score: 0 },
        { label: "Few times a year", value: "few", score: 3 },
        { label: "Monthly", value: "monthly", score: 6 },
        { label: "Weekly", value: "weekly", score: 8 },
      ]},
    ],
  },

  apex: {
    heroTagline: "Amino acid + L-carnitine IV for muscle repair, endurance and performance recovery.",
    benefits: [
      { title: "Rapid Muscle Repair", description: "Complete amino acid profile floods muscle tissue with repair signals — 100% bioavailable.", icon: "💪" },
      { title: "Fat Oxidation", description: "L-Carnitine shuttles long-chain fats into mitochondria — improving endurance and body composition.", icon: "🔥" },
      { title: "Oxygen Transport", description: "B12 supports red blood cell production, raising oxygen-carrying capacity.", icon: "🫁" },
      { title: "Endurance Boost", description: "Taurine supports cardiac output and cellular hydration during prolonged exercise.", icon: "⚡" },
    ],
    frequency: {
      acute: "Weekly × 6 during training camps or competition blocks",
      maintenance: "Bi-weekly during regular training",
      contraindications: [
        "Phenylketonuria (amino acid restriction)",
        "Severe liver disease",
        "Trimethylaminuria (carnitine caution)",
        "Active kidney failure",
      ],
    },
    conditions: [
      { name: "Performance Plateau", protocol: "Weekly × 6 with L-Arginine add-on", evidence: "Amino acid + vasodilator combo improves power output metrics" },
      { name: "Post-Event Recovery", protocol: "Single session within 24 hours post-competition", evidence: "Halves reported DOMS duration in endurance athletes" },
      { name: "Body Composition / Fat Loss", protocol: "Bi-weekly × 8 with caloric deficit diet", evidence: "L-carnitine supports fat oxidation when adequate flux exists" },
      { name: "Sarcopenia (older adults)", protocol: "Weekly × 8, pair with resistance training", evidence: "Amino acid IV reverses sarcopenic muscle loss in older adults" },
      { name: "Prolonged Soreness (DOMS)", protocol: "Single session + Mg booster", evidence: "Reduces inflammatory markers and restores contractile function" },
    ],
    ingredientRationale: [
      { name: "Amino Acid Complex (BCAAs + EAAs)", dose: "10g", reasoning: "Muscle protein synthesis requires all 9 essential amino acids simultaneously. IV delivers peak plasma levels instantly, stimulating mTOR pathway within 30 min vs 2+ hours orally.", formsUsed: "IV (clinical), Oral (whey/EAA powders), Parenteral nutrition (hospital)" },
      { name: "L-Carnitine", dose: "3g", reasoning: "3g IV achieves plasma levels impossible orally (saturates at 2g oral dose with ~20% absorption). Critical for fatty acid transport into mitochondria.", formsUsed: "IV (therapeutic), Oral (L-carnitine tartrate), IM (athletic use)" },
      { name: "Vitamin B12", dose: "2mg", reasoning: "Double the standard dose — supports the elevated erythropoiesis demands of endurance training. Methylated form preferred.", formsUsed: "IV, IM (classic cyanocobalamin), Oral, Sublingual" },
      { name: "Taurine", dose: "2g", reasoning: "Osmolyte supporting cellular hydration under exercise stress. Cardiac protective. Depleted in endurance athletes.", formsUsed: "IV, Oral (pre-workout supplements), Dietary (shellfish, meat)" },
    ],
    protocolReasoning: {
      why: "Post-exercise, gut blood flow is reduced by 80% — severely impairing oral absorption of amino acids when they're most needed. IV bypasses this, delivering muscle-repair substrates at the precise moment of peak demand. This is why elite athletic programs use IV nutrition.",
      doseRationale: "10g amino acids matches the anabolic window requirement (0.25g/kg bodyweight protein equivalent). 3g L-carnitine is the ergogenic dose shown to improve fat oxidation in controlled studies. B12 at 2mg supports elevated red cell turnover.",
      infusionTime: "60–75 minutes. Slower rate prevents the nitrogen load stress on kidneys. Amino acids infused over at least 45 min for maximal utilisation vs rapid oxidation.",
    },
    studies: [
      { title: "Intravenous amino acids and muscle protein synthesis", authors: "Wolfe RR", journal: "Nutr Metab", year: 2002, finding: "IV amino acids produce 2× greater MPS response than oral at equivalent doses due to first-pass effect.", route: "IV, Oral" },
      { title: "L-Carnitine supplementation in elite athletes", authors: "Stephens FB, et al.", journal: "J Physiol", year: 2007, finding: "Carnitine supplementation with insulin infusion increased muscle carnitine by 15%, improved performance.", route: "IV, Oral" },
      { title: "B12 and athletic performance", authors: "Lukaski HC", journal: "Nutrition", year: 2004, finding: "B12 deficiency causes megaloblastic anaemia and impaired endurance; supplementation restores VO2 max.", route: "IV, IM, Oral" },
      { title: "Taurine as ergogenic aid", authors: "Waldron M, et al.", journal: "Sports Med", year: 2018, finding: "Meta-analysis: taurine improves endurance performance (effect size 0.21).", route: "Oral, IV" },
    ],
    labPanel: [
      { code: "CBC", name: "Complete Blood Count", purpose: "Detect sports anaemia" },
      { code: "CK", name: "Creatine Kinase + LDH", purpose: "Muscle damage markers" },
      { code: "CARN", name: "Plasma Carnitine (Free + Total)", purpose: "Baseline and response monitoring" },
      { code: "AA", name: "Plasma Amino Acid Profile", purpose: "Identify specific deficiencies" },
      { code: "VB12", name: "B12 + Folate + Homocysteine", purpose: "Methylation for recovery" },
      { code: "TEST", name: "Testosterone + Cortisol (AM)", purpose: "T:C ratio = overtraining marker" },
      { code: "VITD", name: "25-OH Vitamin D", purpose: "Performance and injury prevention" },
      { code: "FERR", name: "Ferritin + Iron Studies", purpose: "Sports anaemia screen" },
      { code: "KFT", name: "Kidney Function", purpose: "Safety for amino acid load" },
    ],
    successStories: [
      { clientInitials: "H.B.", age: 31, gender: "M", condition: "Ultramarathon runner, plateau at 100K distance", outcome: "Broke personal best by 45 min after 8-week protocol. Faster recovery noted.", sessions: 8 },
      { clientInitials: "P.D.", age: 38, gender: "F", condition: "CrossFit athlete, chronic shoulder DOMS", outcome: "Training volume increased 30% with better recovery. Shoulder pain resolved.", sessions: 6 },
      { clientInitials: "V.S.", age: 52, gender: "M", condition: "Age-related muscle loss, gym plateau", outcome: "Regained 4kg muscle mass over 3 months with training.", sessions: 10 },
      { clientInitials: "M.A.", age: 26, gender: "M", condition: "Cricketer — season recovery protocol", outcome: "Zero injury-related missed matches that season.", sessions: 16 },
    ],
    quickQuiz: [
      { id: "training_volume", label: "Weekly training volume?", options: [
        { label: "0–3 hours", value: "low", score: 1 },
        { label: "4–7 hours", value: "moderate", score: 3 },
        { label: "8–12 hours", value: "high", score: 6 },
        { label: "12+ hours", value: "elite", score: 9 },
      ]},
      { id: "recovery_speed", label: "Post-workout recovery?", options: [
        { label: "Ready next day", value: "fast", score: 0 },
        { label: "1–2 days recovery", value: "normal", score: 3 },
        { label: "3+ days", value: "slow", score: 7 },
        { label: "Chronic soreness", value: "chronic", score: 9 },
      ]},
      { id: "plateau", label: "Are you experiencing a performance plateau?", options: [
        { label: "No, improving", value: "no", score: 0 },
        { label: "Some stagnation", value: "some", score: 4 },
        { label: "Stuck for months", value: "stuck", score: 8 },
      ]},
      { id: "diet_protein", label: "Daily protein intake?", options: [
        { label: "> 1.6 g/kg", value: "optimal", score: 0 },
        { label: "1.0–1.5 g/kg", value: "adequate", score: 3 },
        { label: "< 1.0 g/kg", value: "low", score: 7 },
      ]},
      { id: "injuries", label: "Recent injury history?", options: [
        { label: "None in past year", value: "none", score: 0 },
        { label: "1 minor", value: "one", score: 3 },
        { label: "Multiple minor", value: "multiple", score: 6 },
        { label: "Major injury", value: "major", score: 9 },
      ]},
    ],
  },

  cognitas: {
    heroTagline: "Premium nootropic IV with NAD+, ALA, Taurine and Mg-Threonate for mental clarity.",
    benefits: [
      { title: "Sharp Focus", description: "NAD+ restores mitochondrial energy in neurons — the most metabolically demanding cells in the body.", icon: "🎯" },
      { title: "Memory Support", description: "Magnesium threonate is the only form shown to cross blood-brain barrier and raise brain Mg levels.", icon: "🧠" },
      { title: "Mood Stabilisation", description: "B12 + NAD+ support neurotransmitter pathways — dopamine, serotonin, noradrenaline.", icon: "🌤️" },
      { title: "Neuroprotection", description: "Alpha Lipoic Acid crosses blood-brain barrier as a potent antioxidant, protecting against oxidative damage.", icon: "🛡️" },
    ],
    frequency: {
      acute: "Weekly × 6 for significant cognitive concerns",
      maintenance: "Monthly for brain health maintenance (especially age 40+)",
      contraindications: [
        "History of mania / bipolar disorder",
        "Uncontrolled seizure disorder",
        "Active alcohol use disorder",
        "Severe kidney disease",
      ],
    },
    conditions: [
      { name: "Brain Fog (post-COVID or chronic)", protocol: "Weekly × 8 with added Vitamin C", evidence: "NAD+ restoration improves cognitive metrics in post-viral syndromes" },
      { name: "Executive Decision-Making Demand", protocol: "Bi-weekly during high-stakes periods", evidence: "Magnesium + B12 support prefrontal cortex glucose metabolism" },
      { name: "Age-Related Cognitive Decline", protocol: "Monthly for ongoing neuroprotection", evidence: "NAD+ decline correlates with age-related cognitive symptoms" },
      { name: "Anxiety / Mood Dysregulation", protocol: "Weekly × 4, then bi-weekly", evidence: "Magnesium threonate reduces anxiety scores in RCT" },
      { name: "Chronic Stress / Burnout Cognitive Symptoms", protocol: "Bi-weekly × 6", evidence: "Reverses stress-induced dendritic atrophy in prefrontal cortex (animal models)" },
    ],
    ingredientRationale: [
      { name: "NAD+ (Nicotinamide)", dose: "750mg", reasoning: "Higher dose than Velocity — neurons are the most metabolically active cells, requiring peak NAD+ for mitochondrial ATP. Crosses BBB minimally, but raises peripheral NAD+ which supports CNS energy demand.", formsUsed: "IV (therapeutic), Oral (NR/NMN precursors), Intranasal (research)" },
      { name: "Alpha Lipoic Acid", dose: "600mg", reasoning: "One of the few antioxidants that crosses BBB. Regenerates vitamin C, E, and glutathione in brain tissue. Higher dose (600mg vs 300mg) for CNS penetration.", formsUsed: "IV (therapeutic for diabetic neuropathy in Germany), Oral (R-form), Topical (limited)" },
      { name: "Taurine", dose: "2g", reasoning: "Osmolyte and inhibitory neurotransmitter. Modulates GABA receptor activity. Protects against glutamate excitotoxicity.", formsUsed: "IV, Oral (supplements), Dietary (meat, seafood)" },
      { name: "Magnesium Threonate", dose: "3g", reasoning: "The ONLY magnesium form clinically shown to raise brain magnesium levels. MIT-developed (Slutsky et al., 2010). Critical for NMDA receptor modulation and synaptic plasticity.", formsUsed: "IV (clinical), Oral (Magtein — dietary supplement)" },
    ],
    protocolReasoning: {
      why: "Magnesium threonate was specifically developed because standard magnesium salts don't cross the blood-brain barrier — only this chelate does. Combined IV with NAD+ and ALA provides neurological substrates at peak plasma levels impossible to achieve via oral supplementation alone.",
      doseRationale: "750mg NAD+ is the upper clinical dose for cognitive applications (Grant et al. research). 600mg ALA matches German diabetic neuropathy protocols. 3g Mg threonate matches the oral 2g dose (Magtein) × IV bioavailability factor.",
      infusionTime: "60–90 minutes. Slow infusion critical for NAD+ at this higher dose to prevent vasomotor effects. Clients often report immediate mental clarity at session end.",
    },
    studies: [
      { title: "Enhancement of learning and memory by elevating brain magnesium", authors: "Slutsky I, et al.", journal: "Neuron", year: 2010, finding: "Magnesium threonate (unique BBB-crossing form) improved hippocampal synaptic density and cognitive performance.", route: "Oral, IV" },
      { title: "NAD+ and cognitive aging", authors: "Grant R, et al.", journal: "Front Aging Neurosci", year: 2019, finding: "IV NAD+ protocol showed cognitive improvements in pilot studies of age-related decline.", route: "IV" },
      { title: "Alpha-lipoic acid in diabetic peripheral neuropathy", authors: "Ziegler D, et al.", journal: "Diabetes Care", year: 2006, finding: "600mg ALA IV daily × 3 weeks significantly improved neuropathic symptoms — approved therapy in Germany.", route: "IV, Oral" },
      { title: "Taurine and neurological function", authors: "Wu JY, Prentice H", journal: "J Biomed Sci", year: 2010, finding: "Taurine neuroprotective via GABA modulation, mitochondrial stabilisation, antioxidant pathways.", route: "Oral, IV" },
    ],
    labPanel: [
      { code: "CBC", name: "Complete Blood Count", purpose: "Rule out anaemia as cognitive symptom cause" },
      { code: "VB12", name: "B12 + Folate + Homocysteine + MMA", purpose: "Methylation status (MMA most sensitive for B12)" },
      { code: "TSH", name: "Thyroid Panel", purpose: "Thyroid dysfunction mimics cognitive decline" },
      { code: "VITD", name: "25-OH Vitamin D", purpose: "Low D linked to cognitive decline and mood" },
      { code: "MG_RBC", name: "RBC Magnesium", purpose: "More sensitive than serum — reflects intracellular status" },
      { code: "HBA1C", name: "HbA1c", purpose: "Diabetes is a major cognitive decline risk factor" },
      { code: "LIPID", name: "Lipid Profile + Apolipoprotein E (if available)", purpose: "Vascular health + APOE4 risk stratification" },
      { code: "CRP", name: "hs-CRP", purpose: "Neuroinflammation marker" },
      { code: "CORT", name: "Morning Cortisol + DHEA-S", purpose: "Chronic stress impact on cognition" },
    ],
    successStories: [
      { clientInitials: "R.V.", age: 56, gender: "M", condition: "CEO, memory slips, mental fatigue", outcome: "Sharp cognitive improvement by session 4. Now on monthly maintenance.", sessions: 6 },
      { clientInitials: "E.P.", age: 41, gender: "F", condition: "Post-COVID brain fog × 14 months, couldn't work", outcome: "Returned to full-time knowledge work after 8 sessions.", sessions: 10 },
      { clientInitials: "B.K.", age: 63, gender: "M", condition: "Early cognitive concerns, APOE4 carrier, family history", outcome: "Cognitive scores stable at 1-year follow-up. Neurologist impressed.", sessions: 14 },
      { clientInitials: "D.S.", age: 33, gender: "F", condition: "Chronic anxiety + rumination, poor focus", outcome: "Anxiety scores dropped significantly. Focus improved at work.", sessions: 6 },
    ],
    quickQuiz: [
      { id: "focus", label: "How is your focus and concentration?", options: [
        { label: "Excellent", value: "excellent", score: 0 },
        { label: "Good", value: "good", score: 2 },
        { label: "Fair — struggling", value: "fair", score: 6 },
        { label: "Poor", value: "poor", score: 9 },
      ]},
      { id: "memory", label: "Memory complaints?", options: [
        { label: "None", value: "none", score: 0 },
        { label: "Occasional name/word slips", value: "occasional", score: 3 },
        { label: "Frequent — losing conversations", value: "frequent", score: 7 },
        { label: "Increasingly worse", value: "worsening", score: 9 },
      ]},
      { id: "stress", label: "Chronic stress level (1=low, 10=high)?", options: [
        { label: "1–3", value: "low", score: 1 },
        { label: "4–6", value: "moderate", score: 4 },
        { label: "7–10", value: "high", score: 8 },
      ]},
      { id: "sleep_cognitive", label: "Do sleep issues affect your thinking?", options: [
        { label: "No", value: "no", score: 0 },
        { label: "Sometimes", value: "sometimes", score: 4 },
        { label: "Frequently", value: "frequently", score: 8 },
      ]},
      { id: "brain_fog_cog", label: "Brain fog frequency?", options: [
        { label: "Never", value: "never", score: 0 },
        { label: "Occasionally", value: "occasional", score: 3 },
        { label: "Weekly", value: "weekly", score: 6 },
        { label: "Daily", value: "daily", score: 9 },
      ]},
    ],
  },
};
