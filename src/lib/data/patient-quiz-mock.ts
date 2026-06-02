// Mock patient quiz results for doctor dashboard.
// All data is synthetic demo data aligned to dashboard-mock.ts patient profiles.

export type CategoryScores = {
  Energy: number;
  Immunity: number;
  Skin: number;
  Performance: number;
  Cognitive: number;
  Metabolic: number;
  Hormonal: number;
};

export type NutrientRisks = {
  vitaminD: number;
  vitaminB12: number;
  iron: number;
  vitaminC: number;
  zinc: number;
  magnesium: number;
  glutathione: number;
  nad: number;
  aminoAcids: number;
  electrolytes: number;
  vitaminA: number;
  vitaminB2: number;
  omega3: number;
  insulinResistance: number;
  hormoneBalance: number;
  folate: number;
};

export type QAItem = {
  q: string;
  a: string;
};

export type QASection = {
  section: string;
  qa: QAItem[];
};

export type PatientQuizResult = {
  patientId: string;
  completedAt: string;
  vitalityScore: number;
  categoryScores: CategoryScores;
  nutrientRisks: NutrientRisks;
  sections: QASection[];
};

export const NUTRIENT_LABELS: Record<keyof NutrientRisks, string> = {
  vitaminD: "Vitamin D",
  vitaminB12: "Vitamin B12",
  iron: "Iron",
  vitaminC: "Vitamin C",
  zinc: "Zinc",
  magnesium: "Magnesium",
  glutathione: "Glutathione",
  nad: "NAD+",
  aminoAcids: "Amino Acids",
  electrolytes: "Electrolytes",
  vitaminA: "Vitamin A",
  vitaminB2: "Vitamin B2",
  omega3: "Omega-3",
  insulinResistance: "Insulin Sensitivity",
  hormoneBalance: "Hormone Balance",
  folate: "Folate",
};

export const CATEGORY_COLORS: Record<keyof CategoryScores, string> = {
  Energy: "#1A7EA8",
  Immunity: "#16A34A",
  Skin: "#D97706",
  Performance: "#7C3AED",
  Cognitive: "#0891B2",
  Metabolic: "#DC2626",
  Hormonal: "#BE185D",
};

// p-001: Arjun Sharma, 34M, vitality 52, chronic fatigue
// p-002: Priya Reddy, 42F, vitality 68, post-COVID brain fog
// p-004: Neha Desai, 29F, vitality 44, burnout + anxiety
// p-006: Sneha Venkat, 31F, vitality 61, melasma
// p-007: Rohit Joshi, 47M, vitality 49, recurrent sinusitis

export const PATIENT_QUIZ: PatientQuizResult[] = [
  {
    patientId: "p-001",
    completedAt: "2026-04-01T10:22:00Z",
    vitalityScore: 52,
    categoryScores: {
      Energy: 72,
      Immunity: 48,
      Skin: 35,
      Performance: 65,
      Cognitive: 60,
      Metabolic: 42,
      Hormonal: 38,
    },
    nutrientRisks: {
      vitaminD: 75,
      vitaminB12: 55,
      iron: 60,
      vitaminC: 45,
      zinc: 40,
      magnesium: 70,
      glutathione: 30,
      nad: 78,
      aminoAcids: 35,
      electrolytes: 50,
      vitaminA: 25,
      vitaminB2: 20,
      omega3: 30,
      insulinResistance: 38,
      hormoneBalance: 42,
      folate: 28,
    },
    sections: [
      {
        section: "Lifestyle Profile",
        qa: [
          { q: "What is your age range?", a: "26–35" },
          { q: "What is your biological sex?", a: "Male" },
          { q: "What best describes your occupation?", a: "Desk-based / sedentary" },
          { q: "How would you describe your current diet?", a: "Vegetarian" },
          { q: "How much time do you spend outdoors in direct sunlight each day?", a: "Less than 30 minutes" },
          { q: "How many cups of coffee or tea do you consume daily?", a: "3–4 cups" },
        ],
      },
      {
        section: "Energy & Vitality",
        qa: [
          { q: "On a scale of 1–10, how would you rate your energy levels throughout the day?", a: "3 / 10" },
          { q: "How many hours of sleep do you get on average?", a: "5–6 hours" },
          { q: "Do you wake up feeling refreshed?", a: "No — always tired" },
          { q: "How often do you feel a mid-afternoon energy crash?", a: "Daily" },
        ],
      },
      {
        section: "Immunity & Recovery",
        qa: [
          { q: "How often do you fall sick (cold, flu, infections)?", a: "4–6 times per year" },
          { q: "How long does it typically take you to recover?", a: "1–2 weeks" },
          { q: "Have you taken antibiotics in the last 12 months?", a: "Yes, once" },
        ],
      },
      {
        section: "Cognitive & Mood",
        qa: [
          { q: "How would you rate your concentration and focus?", a: "Fair" },
          { q: "What is your daily stress level?", a: "7 / 10" },
          { q: "How often do you experience brain fog?", a: "Occasionally" },
          { q: "Do you experience anxiety symptoms?", a: "Sometimes" },
          { q: "Do you procrastinate on important tasks?", a: "Often — I know I should but can't start" },
        ],
      },
      {
        section: "Nutrition & Hydration",
        qa: [
          { q: "How many servings of fruit and vegetables do you eat daily?", a: "2–3 servings" },
          { q: "How much water do you drink per day?", a: "1–1.5 L" },
          { q: "Do certain foods cause noticeable reactions?", a: "Dairy — bloating, gas" },
        ],
      },
    ],
  },

  {
    patientId: "p-002",
    completedAt: "2026-04-08T14:05:00Z",
    vitalityScore: 68,
    categoryScores: {
      Energy: 62,
      Immunity: 55,
      Skin: 42,
      Performance: 40,
      Cognitive: 78,
      Metabolic: 48,
      Hormonal: 50,
    },
    nutrientRisks: {
      vitaminD: 65,
      vitaminB12: 50,
      iron: 45,
      vitaminC: 40,
      zinc: 35,
      magnesium: 68,
      glutathione: 38,
      nad: 82,
      aminoAcids: 20,
      electrolytes: 30,
      vitaminA: 22,
      vitaminB2: 18,
      omega3: 35,
      insulinResistance: 28,
      hormoneBalance: 55,
      folate: 30,
    },
    sections: [
      {
        section: "Lifestyle Profile",
        qa: [
          { q: "What is your age range?", a: "36–45" },
          { q: "What is your biological sex?", a: "Female" },
          { q: "What best describes your occupation?", a: "Work from home" },
          { q: "How would you describe your current diet?", a: "Non-vegetarian" },
          { q: "How much time do you spend outdoors in direct sunlight each day?", a: "30–60 minutes" },
          { q: "How many cups of coffee or tea do you consume daily?", a: "1–2 cups" },
        ],
      },
      {
        section: "Energy & Vitality",
        qa: [
          { q: "On a scale of 1–10, how would you rate your energy levels throughout the day?", a: "5 / 10" },
          { q: "How many hours of sleep do you get on average?", a: "7–8 hours" },
          { q: "Do you wake up feeling refreshed?", a: "Sometimes" },
          { q: "How often do you feel a mid-afternoon energy crash?", a: "A few times a week" },
        ],
      },
      {
        section: "Cognitive & Mood",
        qa: [
          { q: "How would you rate your concentration and focus?", a: "Poor" },
          { q: "What is your daily stress level?", a: "8 / 10" },
          { q: "How often do you experience brain fog?", a: "Daily" },
          { q: "Do you experience anxiety symptoms?", a: "Frequently" },
          { q: "Do you have memory complaints?", a: "Yes, increasing over time" },
          { q: "Do you experience emotional eating?", a: "Sometimes" },
          { q: "Do you practise mindfulness or breathwork?", a: "Rarely" },
          { q: "How much screen time before bed?", a: "More than 1 hour" },
        ],
      },
      {
        section: "Immunity & Recovery",
        qa: [
          { q: "How often do you fall sick?", a: "2–3 times per year" },
          { q: "How long does it take you to recover?", a: "About a week" },
        ],
      },
      {
        section: "Nutrition & Hydration",
        qa: [
          { q: "How many servings of fruit and vegetables do you eat daily?", a: "3–4 servings" },
          { q: "How much water do you drink per day?", a: "2+ L" },
        ],
      },
    ],
  },

  {
    patientId: "p-004",
    completedAt: "2026-04-12T09:40:00Z",
    vitalityScore: 44,
    categoryScores: {
      Energy: 80,
      Immunity: 60,
      Skin: 55,
      Performance: 50,
      Cognitive: 82,
      Metabolic: 58,
      Hormonal: 72,
    },
    nutrientRisks: {
      vitaminD: 80,
      vitaminB12: 45,
      iron: 70,
      vitaminC: 55,
      zinc: 50,
      magnesium: 85,
      glutathione: 42,
      nad: 78,
      aminoAcids: 25,
      electrolytes: 48,
      vitaminA: 30,
      vitaminB2: 22,
      omega3: 45,
      insulinResistance: 35,
      hormoneBalance: 75,
      folate: 40,
    },
    sections: [
      {
        section: "Lifestyle Profile",
        qa: [
          { q: "What is your age range?", a: "26–35" },
          { q: "What is your biological sex?", a: "Female" },
          { q: "What best describes your occupation?", a: "Desk-based / sedentary" },
          { q: "How would you describe your current diet?", a: "Eggetarian" },
          { q: "How much time do you spend outdoors in direct sunlight each day?", a: "Less than 30 minutes" },
          { q: "How many cups of coffee or tea do you consume daily?", a: "5+ cups" },
        ],
      },
      {
        section: "Energy & Vitality",
        qa: [
          { q: "On a scale of 1–10, how would you rate your energy levels throughout the day?", a: "2 / 10" },
          { q: "How many hours of sleep do you get on average?", a: "Less than 5 hours" },
          { q: "Do you wake up feeling refreshed?", a: "No — always exhausted" },
          { q: "How often do you feel a mid-afternoon energy crash?", a: "Daily — severe" },
        ],
      },
      {
        section: "Cognitive & Mood",
        qa: [
          { q: "How would you rate your concentration and focus?", a: "Poor" },
          { q: "What is your daily stress level?", a: "9 / 10" },
          { q: "How often do you experience brain fog?", a: "Daily" },
          { q: "Do you experience anxiety symptoms?", a: "Frequently" },
          { q: "Do you have memory complaints?", a: "Occasional lapses" },
          { q: "Do you procrastinate?", a: "Constantly — it's affecting my life" },
          { q: "Do you experience decision fatigue?", a: "Most of the day" },
          { q: "Do you practise mindfulness or breathwork?", a: "Never" },
        ],
      },
      {
        section: "Sexual & Reproductive Health",
        qa: [
          { q: "How would you rate your overall libido?", a: "3 / 10" },
          { q: "How regular is your menstrual cycle?", a: "Very irregular — skips months or unpredictable" },
          { q: "How severe is your menstrual pain?", a: "Severe — bedbound, miss work" },
          { q: "How would you describe your menstrual flow?", a: "Heavy — soaking multiple pads" },
          { q: "Do you have PCOD/PCOS symptoms?", a: "Acne, irregular cycles, weight gain" },
          { q: "How severe is your PMS?", a: "Severe — significantly affects mood and function" },
        ],
      },
      {
        section: "Immunity & Recovery",
        qa: [
          { q: "How often do you fall sick?", a: "4–6 times per year" },
          { q: "How long does it take you to recover?", a: "More than 2 weeks" },
        ],
      },
    ],
  },

  {
    patientId: "p-006",
    completedAt: "2026-04-15T11:15:00Z",
    vitalityScore: 61,
    categoryScores: {
      Energy: 50,
      Immunity: 45,
      Skin: 78,
      Performance: 38,
      Cognitive: 52,
      Metabolic: 44,
      Hormonal: 60,
    },
    nutrientRisks: {
      vitaminD: 60,
      vitaminB12: 40,
      iron: 55,
      vitaminC: 50,
      zinc: 45,
      magnesium: 55,
      glutathione: 82,
      nad: 48,
      aminoAcids: 20,
      electrolytes: 35,
      vitaminA: 55,
      vitaminB2: 38,
      omega3: 60,
      insulinResistance: 42,
      hormoneBalance: 65,
      folate: 35,
    },
    sections: [
      {
        section: "Lifestyle Profile",
        qa: [
          { q: "What is your age range?", a: "26–35" },
          { q: "What is your biological sex?", a: "Female" },
          { q: "What best describes your occupation?", a: "Field / outdoor work" },
          { q: "How would you describe your current diet?", a: "Non-vegetarian" },
          { q: "How much time do you spend outdoors in direct sunlight each day?", a: "More than 2 hours" },
          { q: "Do you smoke or live in high-pollution area?", a: "High pollution area" },
          { q: "How many cups of coffee or tea do you consume daily?", a: "1–2 cups" },
        ],
      },
      {
        section: "Skin, Hair & Clinical Signs",
        qa: [
          { q: "What are your primary skin concerns?", a: "Pigmentation / melasma, dullness, uneven tone" },
          { q: "How would you rate your hair quality?", a: "Mild thinning" },
          { q: "How long have you been exposed to sun daily?", a: "More than 2 hours" },
          { q: "What does your skin dryness pattern look like?", a: "Elbows and knees, shins" },
          { q: "Do you notice darkening in specific areas?", a: "Neck, underarms" },
          { q: "Do you experience dryness in intimate areas?", a: "Occasionally" },
          { q: "What do your nails look like?", a: "Brittle, breaking easily; white spots" },
        ],
      },
      {
        section: "Energy & Vitality",
        qa: [
          { q: "On a scale of 1–10, how would you rate your energy levels?", a: "5 / 10" },
          { q: "How many hours of sleep do you get?", a: "6–7 hours" },
          { q: "Do you wake up feeling refreshed?", a: "Sometimes" },
        ],
      },
      {
        section: "Sexual & Reproductive Health",
        qa: [
          { q: "How would you rate your overall libido?", a: "5 / 10" },
          { q: "How regular is your menstrual cycle?", a: "Slightly irregular — varies by a week" },
          { q: "How severe is your menstrual pain?", a: "Moderate — need painkillers occasionally" },
          { q: "How would you describe your menstrual flow?", a: "Moderate — changes 3–4 pads per day" },
        ],
      },
    ],
  },

  {
    patientId: "p-007",
    completedAt: "2026-04-18T16:30:00Z",
    vitalityScore: 49,
    categoryScores: {
      Energy: 65,
      Immunity: 82,
      Skin: 40,
      Performance: 55,
      Cognitive: 58,
      Metabolic: 52,
      Hormonal: 48,
    },
    nutrientRisks: {
      vitaminD: 78,
      vitaminB12: 48,
      iron: 42,
      vitaminC: 75,
      zinc: 72,
      magnesium: 60,
      glutathione: 35,
      nad: 55,
      aminoAcids: 30,
      electrolytes: 45,
      vitaminA: 38,
      vitaminB2: 30,
      omega3: 40,
      insulinResistance: 40,
      hormoneBalance: 52,
      folate: 25,
    },
    sections: [
      {
        section: "Lifestyle Profile",
        qa: [
          { q: "What is your age range?", a: "46–55" },
          { q: "What is your biological sex?", a: "Male" },
          { q: "What best describes your occupation?", a: "Desk-based / sedentary" },
          { q: "How would you describe your current diet?", a: "Non-vegetarian" },
          { q: "How much time do you spend outdoors in direct sunlight each day?", a: "Less than 30 minutes" },
          { q: "How many cups of coffee or tea do you consume daily?", a: "3–4 cups" },
        ],
      },
      {
        section: "Immunity & Recovery",
        qa: [
          { q: "How often do you fall sick?", a: "More than 6 times per year" },
          { q: "How long does it typically take you to recover?", a: "More than 2 weeks" },
          { q: "How is your gut health?", a: "Bloating, irregular stools" },
          { q: "How long does muscle soreness last after activity?", a: "4–5 days" },
          { q: "Have you taken antibiotics in the last 12 months?", a: "Yes, multiple courses" },
        ],
      },
      {
        section: "Energy & Vitality",
        qa: [
          { q: "On a scale of 1–10, how would you rate your energy levels?", a: "4 / 10" },
          { q: "How many hours of sleep do you get on average?", a: "5–6 hours" },
          { q: "Do you wake up feeling refreshed?", a: "No — always tired" },
          { q: "How often do you feel an energy crash?", a: "Daily" },
        ],
      },
      {
        section: "Cognitive & Mood",
        qa: [
          { q: "How would you rate your concentration and focus?", a: "Fair" },
          { q: "What is your daily stress level?", a: "7 / 10" },
          { q: "How often do you experience brain fog?", a: "Weekly" },
          { q: "Do you have memory complaints?", a: "Occasional lapses" },
        ],
      },
      {
        section: "Sexual & Reproductive Health",
        qa: [
          { q: "How would you rate your overall libido?", a: "4 / 10" },
          { q: "How would you describe your erectile function?", a: "Occasional difficulty" },
          { q: "Do you experience morning erections?", a: "Rarely" },
          { q: "Do you have any fertility concerns?", a: "No — not currently trying" },
        ],
      },
    ],
  },
];
