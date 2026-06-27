"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Link from "next/link";
import { DRIPS, type Drip } from "@/lib/data/drips";

// ─── Types ────────────────────────────────────────────────────────────────────

type AnswerValue = string | string[] | number | null;

type QuestionType = "single" | "multi" | "slider" | "compound";

type QuestionOption = {
  label: string;
  value: string;
  icon?: string;
};

type QuestionDef = {
  id: string;
  section: number;
  label: string;
  sub: string;
  type: QuestionType;
  options?: QuestionOption[];
  min?: number;
  max?: number;
  compoundParts?: {
    id: string;
    label: string;
    type: "single" | "slider";
    options?: QuestionOption[];
    min?: number;
    max?: number;
  }[];
};

type NutrientRisks = {
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

type LabTest = {
  name: string;
  reason: string;
};

type LabPanel = {
  essential: LabTest[];
  recommended: LabTest[];
  optional: LabTest[];
};

type QuizState = {
  currentSection: number;
  currentQ: number;
  answers: Record<string, AnswerValue>;
  completed: boolean;
};

// ─── Section definitions ──────────────────────────────────────────────────────

const SECTION_NAMES = [
  "Lifestyle Profile",
  "Energy & Vitality",
  "Immunity & Recovery",
  "Skin, Hair & Clinical Signs",
  "Physical Performance",
  "Cognitive & Mood",
  "Nutrition & Hydration",
  "Oral & Metabolic Markers",
  "Sexual & Reproductive Health",
];

// ─── Question pool ────────────────────────────────────────────────────────────

const ALL_QUESTIONS: QuestionDef[] = [
  // Section 0: Lifestyle Profile (always shown)
  {
    id: "age", section: 0,
    label: "What is your age range?",
    sub: "Helps us calibrate dosage and recovery priorities.",
    type: "single",
    options: [
      { label: "18–25", value: "18-25", icon: "🌱" },
      { label: "26–35", value: "26-35", icon: "⚡" },
      { label: "36–45", value: "36-45", icon: "🎯" },
      { label: "46–55", value: "46-55", icon: "💎" },
      { label: "56–65", value: "56-65", icon: "🌿" },
      { label: "65+", value: "65+", icon: "🌟" },
    ],
  },
  {
    id: "gender", section: 0,
    label: "What is your gender?",
    sub: "Certain nutrient needs differ significantly by gender.",
    type: "single",
    options: [
      { label: "Male", value: "male", icon: "♂" },
      { label: "Female", value: "female", icon: "♀" },
      { label: "Other / Prefer not to say", value: "other", icon: "⬡" },
    ],
  },
  {
    id: "occupation", section: 0,
    label: "What best describes your occupation?",
    sub: "Your work pattern affects energy expenditure and nutrient depletion.",
    type: "single",
    options: [
      { label: "Desk job / Sedentary", value: "sedentary", icon: "💻" },
      { label: "Active / On your feet", value: "active", icon: "🚶" },
      { label: "Mixed", value: "mixed", icon: "🔄" },
      { label: "Student", value: "student", icon: "📚" },
      { label: "Retired", value: "retired", icon: "🏡" },
    ],
  },
  {
    id: "climate", section: 0,
    label: "What is the climate where you live?",
    sub: "Heat and humidity dramatically increase electrolyte and hydration needs.",
    type: "single",
    options: [
      { label: "Hot & humid", value: "hot-humid", icon: "🌴" },
      { label: "Hot & dry", value: "hot-dry", icon: "☀️" },
      { label: "Moderate", value: "moderate", icon: "🌤️" },
      { label: "Cool", value: "cool", icon: "❄️" },
    ],
  },

  {
    id: "sexually_active", section: 0,
    label: "Are you currently sexually active?",
    sub: "This helps us assess reproductive hormone balance and related nutrient needs. Your answers are completely confidential.",
    type: "single",
    options: [
      { label: "Yes", value: "yes", icon: "✓" },
      { label: "No", value: "no", icon: "—" },
      { label: "Prefer not to say", value: "skip", icon: "⬡" },
    ],
  },

  // Section 1: Energy & Vitality
  {
    id: "fatigue", section: 1,
    label: "How fatigued do you feel on most days?",
    sub: "Slide to match your typical energy level — 1 means fully energised, 10 means completely drained.",
    type: "slider", min: 1, max: 10,
  },
  {
    id: "sleep", section: 1,
    label: "How is your sleep?",
    sub: "Select your average nightly hours and whether you wake refreshed.",
    type: "compound",
    compoundParts: [
      {
        id: "sleep_hours", label: "Average hours of sleep",
        type: "single",
        options: [
          { label: "Less than 5 hours", value: "<5" },
          { label: "5–6 hours", value: "5-6" },
          { label: "6–7 hours", value: "6-7" },
          { label: "7–8 hours", value: "7-8" },
          { label: "More than 8 hours", value: "8+" },
        ],
      },
      {
        id: "sleep_refreshed", label: "Do you wake up feeling refreshed?",
        type: "single",
        options: [
          { label: "Yes, usually refreshed", value: "yes" },
          { label: "No, still tired", value: "no" },
        ],
      },
    ],
  },
  {
    id: "energy_crash", section: 1,
    label: "When does your energy typically crash?",
    sub: "This helps us identify your metabolic rhythm and optimal nutrient timing.",
    type: "single",
    options: [
      { label: "Morning — struggle to start", value: "morning", icon: "🌅" },
      { label: "After lunch — post-meal slump", value: "after-lunch", icon: "🍽️" },
      { label: "Late afternoon — 3–5pm wall", value: "late-afternoon", icon: "⏰" },
      { label: "Evening — wiped out by 7pm", value: "evening", icon: "🌙" },
      { label: "Constant throughout the day", value: "constant", icon: "📉" },
    ],
  },
  {
    id: "caffeine", section: 1,
    label: "How many caffeinated drinks per day?",
    sub: "High caffeine depletes magnesium and disrupts cortisol — both impact energy.",
    type: "single",
    options: [
      { label: "None", value: "0", icon: "🚫" },
      { label: "1–2 cups", value: "1-2", icon: "☕" },
      { label: "3–4 cups", value: "3-4", icon: "☕☕" },
      { label: "5+ cups", value: "5+", icon: "⚠️" },
    ],
  },
  {
    id: "sleep_trouble", section: 1,
    label: "What kind of sleep trouble do you experience?",
    sub: "The type of insomnia points to different nutrient pathways.",
    type: "single",
    options: [
      { label: "Trouble falling asleep", value: "falling", icon: "🕐" },
      { label: "Trouble staying asleep", value: "staying", icon: "🔄" },
      { label: "Both — restless all night", value: "both", icon: "😩" },
    ],
  },

  // Section 2: Immunity & Recovery
  {
    id: "sick_frequency", section: 2,
    label: "How many times do you fall sick per year?",
    sub: "Frequent illness often signals depleted zinc, vitamin C or vitamin D reserves.",
    type: "single",
    options: [
      { label: "Rarely (0–1 times)", value: "rarely", icon: "💪" },
      { label: "Sometimes (2–3 times)", value: "sometimes", icon: "🤧" },
      { label: "Often (4–6 times)", value: "often", icon: "🤒" },
      { label: "Frequently (7+ times)", value: "frequently", icon: "🏥" },
    ],
  },
  {
    id: "recovery_speed", section: 2,
    label: "How fast do you recover from illness?",
    sub: "Recovery speed reflects immune reserve capacity.",
    type: "single",
    options: [
      { label: "Quick — 2–3 days", value: "quick", icon: "⚡" },
      { label: "Normal — 4–7 days", value: "normal", icon: "📅" },
      { label: "Slow — 1–2 weeks", value: "slow", icon: "🐢" },
      { label: "Very slow — 2+ weeks", value: "very-slow", icon: "⚠️" },
    ],
  },
  {
    id: "gut_health", section: 2,
    label: "Do you experience any gut health issues?",
    sub: "Gut health directly impacts nutrient absorption and immune function.",
    type: "multi",
    options: [
      { label: "Bloating", value: "bloating", icon: "🎈" },
      { label: "Acid reflux", value: "reflux", icon: "🔥" },
      { label: "IBS / Irregular bowel", value: "ibs", icon: "⚠️" },
      { label: "Frequent gas", value: "gas", icon: "💨" },
      { label: "None", value: "none", icon: "✓" },
    ],
  },
  {
    id: "muscle_soreness", section: 2,
    label: "How long does post-exercise muscle soreness last?",
    sub: "Prolonged soreness may indicate amino acid or magnesium deficit.",
    type: "single",
    options: [
      { label: "1 day", value: "1-day", icon: "✓" },
      { label: "2–3 days", value: "2-3-days", icon: "📅" },
      { label: "4+ days", value: "4+-days", icon: "⚠️" },
      { label: "I don't exercise", value: "no-exercise", icon: "🛋️" },
    ],
  },
  {
    id: "antibiotics", section: 2,
    label: "Have you had prolonged antibiotic courses?",
    sub: "Antibiotics deplete gut flora and can impair B12 and iron absorption for months.",
    type: "single",
    options: [
      { label: "Yes, multiple courses", value: "multiple", icon: "💊💊" },
      { label: "Yes, once", value: "once", icon: "💊" },
      { label: "No", value: "no", icon: "✓" },
    ],
  },

  // Section 3: Skin, Hair & Beauty
  {
    id: "skin_concerns", section: 3,
    label: "What are your current skin concerns?",
    sub: "Select all that apply — each points to different antioxidant needs.",
    type: "multi",
    options: [
      { label: "Dullness", value: "dullness", icon: "🌫️" },
      { label: "Pigmentation / Dark spots", value: "pigmentation", icon: "🔘" },
      { label: "Acne / Breakouts", value: "acne", icon: "😕" },
      { label: "Fine lines / Wrinkles", value: "wrinkles", icon: "〰️" },
      { label: "Uneven skin tone", value: "uneven", icon: "🎨" },
      { label: "None", value: "none", icon: "✨" },
    ],
  },
  {
    id: "hair_quality", section: 3,
    label: "How would you describe your hair quality?",
    sub: "Hair health is one of the earliest indicators of micronutrient depletion.",
    type: "single",
    options: [
      { label: "Healthy and strong", value: "healthy", icon: "💇" },
      { label: "Mild thinning", value: "mild-thinning", icon: "📉" },
      { label: "Significant thinning / Loss", value: "significant-thinning", icon: "⚠️" },
      { label: "Brittle / Dry / Breakage", value: "brittle", icon: "🔗" },
      { label: "Premature greying", value: "greying", icon: "🔘" },
    ],
  },
  {
    id: "sun_exposure", section: 3,
    label: "Daily sun exposure without protection?",
    sub: "UV exposure without protection accelerates oxidative damage and pigmentation.",
    type: "single",
    options: [
      { label: "Less than 30 minutes", value: "<30min", icon: "🌤️" },
      { label: "30–60 minutes", value: "30-60min", icon: "☀️" },
      { label: "1–2 hours", value: "1-2hrs", icon: "🔆" },
      { label: "More than 2 hours", value: "2+hrs", icon: "⚠️" },
    ],
  },
  {
    id: "thyroid_symptoms", section: 3,
    label: "Do you experience any of these thyroid-related symptoms?",
    sub: "Unexplained weight change, cold sensitivity, or excessive tiredness can signal thyroid issues affecting hair.",
    type: "single",
    options: [
      { label: "Yes, 2 or more of these", value: "2+", icon: "🚨" },
      { label: "Yes, 1 of these", value: "1", icon: "⚠️" },
      { label: "No", value: "no", icon: "✓" },
    ],
  },
  {
    id: "smoking_pollution", section: 3,
    label: "Smoking or high pollution exposure?",
    sub: "Both dramatically increase free radical load and deplete glutathione reserves.",
    type: "single",
    options: [
      { label: "Current smoker", value: "smoker", icon: "🚬" },
      { label: "Ex-smoker", value: "ex-smoker", icon: "🔄" },
      { label: "High pollution area", value: "pollution", icon: "🏭" },
      { label: "Neither", value: "neither", icon: "✓" },
    ],
  },

  // Section 3 continued: Deep clinical sign questions (conditionally shown)
  {
    id: "hair_loss_pattern", section: 3,
    label: "Describe your hair loss pattern.",
    sub: "The pattern of loss points to different root causes — hormonal, nutritional, or autoimmune.",
    type: "single",
    options: [
      { label: "Diffuse thinning all over", value: "diffuse", icon: "📉" },
      { label: "Receding hairline / temple area", value: "receding", icon: "↗️" },
      { label: "Patchy bald spots", value: "patchy", icon: "⭕" },
      { label: "Crown thinning", value: "crown", icon: "🎯" },
      { label: "Frontal thinning (female pattern)", value: "frontal", icon: "〰️" },
    ],
  },
  {
    id: "scalp_condition", section: 3,
    label: "How is your scalp condition?",
    sub: "Scalp health reflects sebum balance, fungal load and micronutrient status.",
    type: "single",
    options: [
      { label: "Healthy — no issues", value: "healthy", icon: "✓" },
      { label: "Dry, flaky, dandruff", value: "dry-flaky", icon: "❄️" },
      { label: "Oily, greasy", value: "oily", icon: "💧" },
      { label: "Itchy / irritated", value: "itchy", icon: "🔥" },
      { label: "Scales or crusting", value: "scales", icon: "⚠️" },
    ],
  },
  {
    id: "skin_dryness_pattern", section: 3,
    label: "Where do you notice dry, rough or scaly skin?",
    sub: "Location-specific dryness maps to distinct deficiency pathways. Select all that apply.",
    type: "multi",
    options: [
      { label: "Elbows / Knees (keratosis pilaris / roughness)", value: "elbows-knees", icon: "💪" },
      { label: "Shins / Lower legs", value: "shins", icon: "🦵" },
      { label: "Hands — cracking, peeling", value: "hands", icon: "✋" },
      { label: "Feet — cracked heels", value: "feet", icon: "🦶" },
      { label: "None of these", value: "none", icon: "✓" },
    ],
  },
  {
    id: "skin_darkening_areas", section: 3,
    label: "Do you notice darkening or velvety texture in any of these areas?",
    sub: "Darkened skin folds (acanthosis nigricans) is one of the earliest visible signs of insulin resistance and metabolic stress.",
    type: "multi",
    options: [
      { label: "Back of neck — dark patches or lines", value: "neck", icon: "🔘" },
      { label: "Underarms — darker than surrounding skin", value: "underarms", icon: "🔘" },
      { label: "Inner thighs / groin creases", value: "groin", icon: "🔘" },
      { label: "Under breasts", value: "under-breast", icon: "🔘" },
      { label: "Knuckles / finger joints", value: "knuckles", icon: "🔘" },
      { label: "None of these", value: "none", icon: "✓" },
    ],
  },
  {
    id: "intimate_dryness", section: 3,
    label: "Do you experience dryness or discomfort in intimate areas?",
    sub: "Genital/intimate dryness can indicate hormonal shifts, vitamin E deficiency or essential fatty acid depletion — clinically significant but often overlooked.",
    type: "single",
    options: [
      { label: "Yes, frequently", value: "frequent", icon: "⚠️" },
      { label: "Occasionally", value: "occasional", icon: "〰️" },
      { label: "No", value: "no", icon: "✓" },
      { label: "Prefer not to answer", value: "skip", icon: "—" },
    ],
  },
  {
    id: "breast_skin", section: 3,
    label: "Do you notice dryness, flaking, or texture changes on chest/breast skin?",
    sub: "Chest skin dryness can signal essential fatty acid deficiency, low vitamin E or hormonal changes.",
    type: "single",
    options: [
      { label: "Yes — dry, flaky or rough", value: "dry", icon: "❄️" },
      { label: "Stretch marks or thinning skin", value: "stretch", icon: "〰️" },
      { label: "No changes", value: "no", icon: "✓" },
      { label: "Prefer not to answer", value: "skip", icon: "—" },
    ],
  },
  {
    id: "nail_signs", section: 3,
    label: "What do your nails look like?",
    sub: "Nails grow slowly and record 3–6 months of nutritional history — ridges, spots, and shape changes are diagnostic.",
    type: "multi",
    options: [
      { label: "Vertical ridges", value: "ridges", icon: "📏" },
      { label: "White spots (leukonychia)", value: "white-spots", icon: "⚪" },
      { label: "Brittle / breaking easily", value: "brittle", icon: "💔" },
      { label: "Spoon-shaped (koilonychia)", value: "spoon", icon: "🥄" },
      { label: "Pale nail beds", value: "pale", icon: "🫥" },
      { label: "Healthy — no changes", value: "none", icon: "✓" },
    ],
  },

  // Section 4: Physical Performance
  {
    id: "exercise_frequency", section: 4,
    label: "How often do you exercise?",
    sub: "This shapes your amino acid, electrolyte and recovery requirements.",
    type: "single",
    options: [
      { label: "Never", value: "never", icon: "🛋️" },
      { label: "1–2x / week (light)", value: "1-2x-light", icon: "🚶" },
      { label: "3–4x / week (moderate)", value: "3-4x-moderate", icon: "🏃" },
      { label: "5+ / week (intense)", value: "5+-intense", icon: "🏋️" },
    ],
  },
  {
    id: "recovery_quality", section: 4,
    label: "How is your recovery after workouts?",
    sub: "Poor recovery often signals amino acid, magnesium or iron deficiency.",
    type: "single",
    options: [
      { label: "Great — ready next day", value: "great", icon: "💪" },
      { label: "Takes 1–2 days", value: "1-2-days", icon: "📅" },
      { label: "Lingering soreness 3+ days", value: "3+-days", icon: "😣" },
      { label: "Often injured", value: "injured", icon: "🩹" },
    ],
  },
  {
    id: "performance_plateau", section: 4,
    label: "Do you experience endurance plateaus or strength stalls?",
    sub: "Plateaus can indicate NAD+, B12 or iron depletion limiting oxygen transport.",
    type: "single",
    options: [
      { label: "Yes, often", value: "often", icon: "📉" },
      { label: "Sometimes", value: "sometimes", icon: "〰️" },
      { label: "Rarely", value: "rarely", icon: "📈" },
    ],
  },
  {
    id: "low_stamina", section: 4,
    label: "Is low stamina affecting your daily tasks?",
    sub: "Even without regular exercise, low stamina can signal nutrient gaps.",
    type: "single",
    options: [
      { label: "Yes, significantly", value: "significant", icon: "⚠️" },
      { label: "Somewhat", value: "somewhat", icon: "〰️" },
      { label: "Not really", value: "no", icon: "✓" },
    ],
  },

  // Section 5: Cognitive & Mood
  {
    id: "concentration", section: 5,
    label: "How would you rate your concentration and focus?",
    sub: "Cognitive function is one of the first things to decline with nutrient depletion.",
    type: "single",
    options: [
      { label: "Excellent", value: "excellent", icon: "🎯" },
      { label: "Good", value: "good", icon: "👍" },
      { label: "Fair", value: "fair", icon: "〰️" },
      { label: "Poor", value: "poor", icon: "😶‍🌫️" },
    ],
  },
  {
    id: "stress", section: 5,
    label: "What is your daily stress level?",
    sub: "Chronic stress depletes magnesium, B vitamins and cortisol regulation pathways.",
    type: "slider", min: 1, max: 10,
  },
  {
    id: "brain_fog", section: 5,
    label: "How often do you experience brain fog?",
    sub: "That cloudy, unfocused feeling is often linked to B12, iron or NAD+ levels.",
    type: "single",
    options: [
      { label: "Never", value: "never", icon: "✓" },
      { label: "Occasionally", value: "occasionally", icon: "🌤️" },
      { label: "Weekly", value: "weekly", icon: "🌫️" },
      { label: "Daily", value: "daily", icon: "☁️" },
    ],
  },
  {
    id: "anxiety_symptoms", section: 5,
    label: "Do you experience anxiety symptoms?",
    sub: "Racing thoughts, tension or difficulty relaxing may indicate magnesium or GABA pathway issues.",
    type: "single",
    options: [
      { label: "Frequently", value: "frequently", icon: "🔴" },
      { label: "Sometimes", value: "sometimes", icon: "🟡" },
      { label: "Rarely", value: "rarely", icon: "🟢" },
    ],
  },
  {
    id: "memory_complaints", section: 5,
    label: "Do you have memory complaints?",
    sub: "Forgetting names, losing track of conversations — these can signal NAD+ or B12 decline.",
    type: "single",
    options: [
      { label: "Yes, increasing over time", value: "increasing", icon: "📉" },
      { label: "Occasional lapses", value: "occasional", icon: "〰️" },
      { label: "No", value: "no", icon: "✓" },
    ],
  },
  {
    id: "emotional_eating", section: 5,
    label: "Do you experience emotional eating or appetite changes under stress?",
    sub: "Stress-driven eating patterns can compound nutrient imbalances.",
    type: "single",
    options: [
      { label: "Yes, often", value: "often", icon: "🍫" },
      { label: "Sometimes", value: "sometimes", icon: "〰️" },
      { label: "No", value: "no", icon: "✓" },
    ],
  },

  // Section 5 continued: Mindfulness & Behavioral Health
  {
    id: "procrastination", section: 5,
    label: "How often do you procrastinate on important tasks?",
    sub: "Chronic procrastination often correlates with dopamine pathway disruption — linked to magnesium, B6, iron and zinc status.",
    type: "single",
    options: [
      { label: "Rarely — I stay on top of things", value: "rarely", icon: "✓" },
      { label: "Sometimes — I delay but catch up", value: "sometimes", icon: "〰️" },
      { label: "Often — I know I should but can't start", value: "often", icon: "⏳" },
      { label: "Constantly — it's affecting my life", value: "constantly", icon: "🔴" },
    ],
  },
  {
    id: "decision_fatigue", section: 5,
    label: "Do you experience decision fatigue — feeling mentally drained by simple choices?",
    sub: "Decision fatigue signals depleted prefrontal cortex resources, often tied to glucose regulation and B-vitamin status.",
    type: "single",
    options: [
      { label: "No — decisions come easy", value: "no", icon: "🎯" },
      { label: "By evening I struggle with decisions", value: "evening", icon: "🌙" },
      { label: "Most of the day", value: "most-day", icon: "😶‍🌫️" },
    ],
  },
  {
    id: "mindfulness_practice", section: 5,
    label: "Do you practise any form of mindfulness, meditation, or breathwork?",
    sub: "Regular mindfulness practice modulates cortisol and improves nutrient utilisation. This helps us understand your stress resilience baseline.",
    type: "single",
    options: [
      { label: "Daily practice (10+ minutes)", value: "daily", icon: "🧘" },
      { label: "Few times a week", value: "few-weekly", icon: "🌿" },
      { label: "Rarely or tried but couldn't sustain", value: "rarely", icon: "〰️" },
      { label: "Never", value: "never", icon: "—" },
    ],
  },
  {
    id: "screen_before_sleep", section: 5,
    label: "How much screen time do you have in the last hour before bed?",
    sub: "Blue light exposure before sleep suppresses melatonin production and disrupts magnesium-dependent sleep pathways.",
    type: "single",
    options: [
      { label: "None — I have a screen-free routine", value: "none", icon: "🌙" },
      { label: "Less than 30 minutes", value: "<30min", icon: "📱" },
      { label: "30–60 minutes", value: "30-60min", icon: "💻" },
      { label: "More than 1 hour", value: "1hr+", icon: "⚠️" },
    ],
  },
  {
    id: "motivation_level", section: 5,
    label: "How is your overall motivation and drive?",
    sub: "Motivation is neurochemical — dopamine, noradrenaline, and iron are key drivers. Low drive without depression is a nutrient red flag.",
    type: "slider", min: 1, max: 10,
  },

  // Section 6: Nutrition & Hydration (always shown)
  {
    id: "diet_type", section: 6,
    label: "What is your diet type?",
    sub: "Diet type is one of the strongest predictors of B12, iron and amino acid status.",
    type: "single",
    options: [
      { label: "Vegetarian", value: "vegetarian", icon: "🥬" },
      { label: "Vegan", value: "vegan", icon: "🌱" },
      { label: "Non-vegetarian", value: "non-veg", icon: "🍗" },
      { label: "Eggetarian", value: "eggetarian", icon: "🥚" },
    ],
  },
  {
    id: "water_intake", section: 6,
    label: "How much water do you drink daily?",
    sub: "Even mild dehydration impairs cognitive function, energy and nutrient transport.",
    type: "single",
    options: [
      { label: "Less than 1 litre", value: "<1L", icon: "💧" },
      { label: "1–2 litres", value: "1-2L", icon: "💧💧" },
      { label: "2–3 litres", value: "2-3L", icon: "💧💧💧" },
      { label: "More than 3 litres", value: "3L+", icon: "🌊" },
    ],
  },
  {
    id: "fruit_veg", section: 6,
    label: "How many fruit and vegetable servings per day?",
    sub: "Most Indians consume well below the WHO-recommended 5 servings — each missing serving compounds deficiency.",
    type: "single",
    options: [
      { label: "0–1 servings", value: "0-1", icon: "⚠️" },
      { label: "2–3 servings", value: "2-3", icon: "🥗" },
      { label: "4–5 servings", value: "4-5", icon: "🥗🥗" },
      { label: "5+ servings", value: "5+", icon: "🌿" },
    ],
  },
  // Section 7: Oral & Metabolic Markers (dynamically branched)
  {
    id: "oral_health", section: 7,
    label: "Do you experience any of these oral signs?",
    sub: "Your mouth is a window into nutritional status — bleeding gums, ulcers and cracked corners each point to specific deficiencies.",
    type: "multi",
    options: [
      { label: "Bleeding gums (even with gentle brushing)", value: "bleeding-gums", icon: "🩸" },
      { label: "Recurrent mouth ulcers / canker sores", value: "ulcers", icon: "⭕" },
      { label: "Cracked corners of mouth (angular cheilitis)", value: "angular-cheilitis", icon: "↔️" },
      { label: "Swollen, red or sore tongue", value: "glossitis", icon: "👅" },
      { label: "Dry mouth despite drinking water", value: "dry-mouth", icon: "💧" },
      { label: "None of these", value: "none", icon: "✓" },
    ],
  },
  {
    id: "tongue_appearance", section: 7,
    label: "Look at your tongue — what do you see?",
    sub: "Tongue changes are among the most specific clinical signs of B-vitamin and iron deficiency.",
    type: "single",
    options: [
      { label: "Normal — pink, light coating", value: "normal", icon: "✓" },
      { label: "Smooth, shiny, beefy red (glossy tongue)", value: "smooth-red", icon: "🔴" },
      { label: "Geographic — patchy, map-like surface", value: "geographic", icon: "🗺️" },
      { label: "Thick white coating", value: "white-coating", icon: "⬜" },
      { label: "Pale / very light pink", value: "pale", icon: "🫥" },
      { label: "Scalloped edges (tooth marks)", value: "scalloped", icon: "〰️" },
    ],
  },
  {
    id: "urine_colour", section: 7,
    label: "What colour is your urine most of the time?",
    sub: "Urine colour is a real-time hydration and metabolic biomarker — darker tones signal dehydration, while specific colours can indicate liver or kidney stress.",
    type: "single",
    options: [
      { label: "Clear / almost colourless", value: "clear", icon: "💧" },
      { label: "Light straw / pale yellow", value: "pale-yellow", icon: "🟡" },
      { label: "Dark yellow / amber", value: "dark-yellow", icon: "🟠" },
      { label: "Brown / cola-coloured", value: "brown", icon: "🟤" },
      { label: "Bright neon yellow (after supplements)", value: "neon", icon: "💛" },
      { label: "Cloudy or foamy", value: "cloudy", icon: "☁️" },
    ],
  },
  {
    id: "urine_frequency", section: 7,
    label: "How often do you urinate per day?",
    sub: "Frequency combined with colour tells us about kidney function, hydration and blood sugar status.",
    type: "single",
    options: [
      { label: "2–4 times (low)", value: "low", icon: "📉" },
      { label: "5–7 times (normal)", value: "normal", icon: "✓" },
      { label: "8–10 times (frequent)", value: "frequent", icon: "📈" },
      { label: "More than 10 times", value: "very-frequent", icon: "⚠️" },
      { label: "Waking up at night to urinate (nocturia)", value: "nocturia", icon: "🌙" },
    ],
  },
  {
    id: "metabolic_signs", section: 7,
    label: "Do you notice any of these metabolic warning signs?",
    sub: "These are early clinical indicators that your metabolism may need support — often detectable years before lab values go out of range.",
    type: "multi",
    options: [
      { label: "Sugar cravings after meals", value: "sugar-cravings", icon: "🍬" },
      { label: "Excessive thirst despite drinking water", value: "polydipsia", icon: "🥤" },
      { label: "Slow wound healing (cuts take weeks)", value: "slow-healing", icon: "🩹" },
      { label: "Tingling or numbness in hands/feet", value: "neuropathy", icon: "⚡" },
      { label: "Skin tags (small fleshy growths)", value: "skin-tags", icon: "🏷️" },
      { label: "None of these", value: "none", icon: "✓" },
    ],
  },
  {
    id: "eye_signs", section: 7,
    label: "Have you noticed any changes in your eyes?",
    sub: "The eyes reveal vitamin A, B2 and essential fatty acid status — often before other symptoms appear.",
    type: "multi",
    options: [
      { label: "Dry, gritty eyes", value: "dry-eyes", icon: "👁️" },
      { label: "Night vision difficulty", value: "night-vision", icon: "🌙" },
      { label: "Frequent eye twitching", value: "twitching", icon: "⚡" },
      { label: "Red, bloodshot eyes often", value: "bloodshot", icon: "🔴" },
      { label: "Yellowish tinge (scleral icterus)", value: "yellow", icon: "🟡" },
      { label: "None of these", value: "none", icon: "✓" },
    ],
  },
  {
    id: "gut_deep", section: 7,
    label: "Describe your typical stool pattern.",
    sub: "Stool consistency is a direct biomarker of gut motility, bile flow, and microbiome health — all of which impact nutrient absorption.",
    type: "single",
    options: [
      { label: "Well-formed, easy to pass (Bristol 3–4)", value: "normal", icon: "✓" },
      { label: "Hard, dry, constipated (Bristol 1–2)", value: "constipated", icon: "🧱" },
      { label: "Loose, watery, frequent (Bristol 5–7)", value: "loose", icon: "💧" },
      { label: "Alternating between constipation and loose", value: "alternating", icon: "🔄" },
      { label: "Greasy, floating, foul-smelling", value: "steatorrhea", icon: "⚠️" },
    ],
  },
  {
    id: "food_reactions", section: 7,
    label: "Do certain foods cause noticeable reactions?",
    sub: "Food sensitivities damage gut lining and impair absorption of iron, B12, folate and fat-soluble vitamins.",
    type: "multi",
    options: [
      { label: "Dairy — bloating, gas, cramps", value: "dairy", icon: "🥛" },
      { label: "Wheat / gluten — bloating, fatigue", value: "gluten", icon: "🍞" },
      { label: "Spicy food — heartburn, discomfort", value: "spicy", icon: "🌶️" },
      { label: "Oily food — nausea, heaviness", value: "oily", icon: "🫒" },
      { label: "None — I tolerate most foods well", value: "none", icon: "✓" },
    ],
  },
  {
    id: "bloating_timing", section: 7,
    label: "When does bloating typically occur?",
    sub: "Timing of bloating reveals whether the issue is stomach acid, enzyme deficiency, or bacterial overgrowth (SIBO).",
    type: "single",
    options: [
      { label: "Immediately after eating (within 30 min)", value: "immediate", icon: "⚡" },
      { label: "1–2 hours after meals", value: "delayed", icon: "⏰" },
      { label: "Constant — regardless of meals", value: "constant", icon: "🎈" },
      { label: "Only after specific foods", value: "specific", icon: "🎯" },
      { label: "I don't bloat", value: "none", icon: "✓" },
    ],
  },
  {
    id: "acid_reflux", section: 7,
    label: "How often do you experience heartburn or acid reflux?",
    sub: "Paradoxically, reflux is often caused by LOW stomach acid — which impairs B12, iron and calcium absorption downstream.",
    type: "single",
    options: [
      { label: "Daily", value: "daily", icon: "🔥" },
      { label: "2–3 times per week", value: "weekly", icon: "🟠" },
      { label: "Occasionally", value: "occasionally", icon: "〰️" },
      { label: "Never", value: "never", icon: "✓" },
    ],
  },
  {
    id: "postmeal_fatigue", section: 7,
    label: "Do you feel heavy, sleepy, or foggy after meals?",
    sub: "Post-meal fatigue (postprandial somnolence) signals blood sugar dysregulation, poor digestive enzyme output, or food sensitivity.",
    type: "single",
    options: [
      { label: "After every meal", value: "every", icon: "😴" },
      { label: "Only after heavy/carb-rich meals", value: "carb-heavy", icon: "🍚" },
      { label: "Occasionally", value: "occasionally", icon: "〰️" },
      { label: "No — I feel energised after eating", value: "no", icon: "✓" },
    ],
  },
  {
    id: "appetite_pattern", section: 7,
    label: "How would you describe your appetite?",
    sub: "Appetite is regulated by zinc, B1 and ghrelin signalling — disruptions indicate specific nutrient gaps.",
    type: "single",
    options: [
      { label: "Consistently good — 3 meals feels natural", value: "good", icon: "✓" },
      { label: "Poor — I forget to eat or have no desire", value: "poor", icon: "📉" },
      { label: "Excessive — always hungry, never satisfied", value: "excessive", icon: "📈" },
      { label: "Erratic — some days nothing, some days too much", value: "erratic", icon: "🔄" },
    ],
  },

  // Section 8: Sexual & Reproductive Health (heavily gender-branched)
  {
    id: "libido", section: 8,
    label: "How would you rate your overall libido (sexual desire)?",
    sub: "Libido is a sensitive barometer of hormonal health, zinc, vitamin D and stress levels. Changes here are often the earliest signal — and highly correctable with the right support.",
    type: "slider", min: 1, max: 10,
  },
  // ── Male-specific questions ──
  {
    id: "erectile_function", section: 8,
    label: "How would you describe your erectile function?",
    sub: "Erectile quality is directly tied to cardiovascular health, nitric oxide production (L-arginine, B3) and testosterone. These are among the most responsive issues to nutritional correction.",
    type: "single",
    options: [
      { label: "Consistently strong — no concerns", value: "strong", icon: "✓" },
      { label: "Occasional difficulty — not always reliable", value: "occasional", icon: "〰️" },
      { label: "Frequent difficulty — affects confidence", value: "frequent", icon: "⚠️" },
      { label: "Significant difficulty — rarely achievable", value: "significant", icon: "🔴" },
    ],
  },
  {
    id: "morning_erections", section: 8,
    label: "Do you experience morning erections?",
    sub: "Morning erections are a key hormonal health marker — their absence often indicates low testosterone or vascular issues, both of which respond well to targeted nutrients.",
    type: "single",
    options: [
      { label: "Yes, most mornings", value: "most", icon: "✓" },
      { label: "Sometimes — a few times a week", value: "sometimes", icon: "〰️" },
      { label: "Rarely", value: "rarely", icon: "⚠️" },
      { label: "Almost never", value: "never", icon: "🔴" },
    ],
  },
  {
    id: "male_fertility_concern", section: 8,
    label: "Do you have any fertility concerns?",
    sub: "Male fertility is deeply nutrient-dependent — zinc, selenium, folate, CoQ10 and L-carnitine all directly impact sperm quality and can show improvement in as little as 3 months.",
    type: "single",
    options: [
      { label: "No — not currently trying or no concerns", value: "no", icon: "—" },
      { label: "Trying to conceive — no success yet", value: "trying", icon: "⏳" },
      { label: "Diagnosed low sperm count or motility", value: "diagnosed", icon: "🔬" },
      { label: "Prefer not to answer", value: "skip", icon: "⬡" },
    ],
  },
  {
    id: "male_stamina", section: 8,
    label: "Are you satisfied with your sexual stamina and performance?",
    sub: "Premature ejaculation and reduced stamina often trace to serotonin imbalance (magnesium, B6, zinc) and stress — not a permanent condition.",
    type: "single",
    options: [
      { label: "Yes — no issues", value: "satisfied", icon: "✓" },
      { label: "Sometimes feel it could be better", value: "sometimes", icon: "〰️" },
      { label: "Often dissatisfied — it affects my confidence", value: "often", icon: "⚠️" },
      { label: "Prefer not to answer", value: "skip", icon: "⬡" },
    ],
  },
  // ── Female-specific questions ──
  {
    id: "menstrual_regularity", section: 8,
    label: "How regular is your menstrual cycle?",
    sub: "Cycle regularity is one of the most important vital signs for women — irregularity points to hormonal imbalances that are often correctable with targeted nutrition.",
    type: "single",
    options: [
      { label: "Regular — 24–35 day cycle, predictable", value: "regular", icon: "✓" },
      { label: "Slightly irregular — varies by a week", value: "slightly-irregular", icon: "〰️" },
      { label: "Very irregular — skips months or unpredictable", value: "very-irregular", icon: "⚠️" },
      { label: "Absent for 3+ months (amenorrhoea)", value: "absent", icon: "🔴" },
      { label: "Post-menopausal or N/A", value: "na", icon: "—" },
    ],
  },
  {
    id: "period_pain", section: 8,
    label: "How severe is your menstrual pain?",
    sub: "Period pain (dysmenorrhoea) is driven by prostaglandin imbalance — omega-3, magnesium and vitamin E can reduce severity by 40–60% in clinical studies.",
    type: "single",
    options: [
      { label: "Mild or none — doesn't disrupt my day", value: "mild", icon: "✓" },
      { label: "Moderate — need painkillers occasionally", value: "moderate", icon: "💊" },
      { label: "Severe — bedbound, miss work/school", value: "severe", icon: "🔴" },
      { label: "N/A", value: "na", icon: "—" },
    ],
  },
  {
    id: "period_flow", section: 8,
    label: "How would you describe your menstrual flow?",
    sub: "Heavy flow is the #1 cause of iron deficiency in women of reproductive age. Even 'normal' heavy flow depletes iron stores over years.",
    type: "single",
    options: [
      { label: "Light — 1–3 days, light pads", value: "light", icon: "💧" },
      { label: "Normal — 4–5 days, regular pads/tampons", value: "normal", icon: "✓" },
      { label: "Heavy — 6+ days, soaking through, clots", value: "heavy", icon: "🩸" },
      { label: "Very heavy — flooding, anaemia symptoms", value: "very-heavy", icon: "🔴" },
      { label: "N/A", value: "na", icon: "—" },
    ],
  },
  {
    id: "pcod_symptoms", section: 8,
    label: "Do you experience any of these PCOD/PCOS-related symptoms?",
    sub: "PCOD affects 1 in 5 Indian women. The good news: it responds remarkably well to vitamin D, inositol, omega-3 and insulin-sensitising nutrients.",
    type: "multi",
    options: [
      { label: "Irregular or absent periods", value: "irregular-periods", icon: "📅" },
      { label: "Excess facial/body hair (hirsutism)", value: "hirsutism", icon: "⚠️" },
      { label: "Stubborn weight gain (especially belly)", value: "weight-gain", icon: "⚖️" },
      { label: "Hormonal acne (jawline/chin)", value: "hormonal-acne", icon: "😕" },
      { label: "Thinning hair on scalp", value: "hair-thinning", icon: "📉" },
      { label: "None of these", value: "none", icon: "✓" },
    ],
  },
  {
    id: "vaginal_discharge", section: 8,
    label: "Have you noticed any changes in vaginal discharge?",
    sub: "Discharge changes can indicate hormonal shifts, infections, or pH imbalance — all of which affect nutrient absorption and reproductive health.",
    type: "single",
    options: [
      { label: "Normal — clear/white, no odour", value: "normal", icon: "✓" },
      { label: "Unusual colour (yellow/green/grey)", value: "unusual-colour", icon: "⚠️" },
      { label: "Strong or unusual odour", value: "odour", icon: "⚠️" },
      { label: "Excessive quantity", value: "excessive", icon: "📈" },
      { label: "Very dry — little to no discharge", value: "dry", icon: "❄️" },
      { label: "Prefer not to answer", value: "skip", icon: "⬡" },
    ],
  },
  {
    id: "pms_severity", section: 8,
    label: "How severe are your premenstrual symptoms (PMS)?",
    sub: "PMS is not 'normal suffering' — it signals magnesium, B6 and calcium deficiency. 80% of PMS symptoms respond to nutritional correction within 2–3 cycles.",
    type: "single",
    options: [
      { label: "Minimal — barely notice", value: "minimal", icon: "✓" },
      { label: "Moderate — mood swings, bloating, cravings", value: "moderate", icon: "🌊" },
      { label: "Severe — significantly affects my life for days", value: "severe", icon: "🔴" },
      { label: "N/A", value: "na", icon: "—" },
    ],
  },
  {
    id: "female_fertility_concern", section: 8,
    label: "Do you have any fertility concerns?",
    sub: "Fertility in women is profoundly influenced by folate, vitamin D, iron, CoQ10 and thyroid function — early optimisation can make a significant difference.",
    type: "single",
    options: [
      { label: "No — not currently trying or no concerns", value: "no", icon: "—" },
      { label: "Planning to conceive in next 6–12 months", value: "planning", icon: "📅" },
      { label: "Actively trying — no success yet", value: "trying", icon: "⏳" },
      { label: "Diagnosed fertility issue (PCOD, endometriosis, etc.)", value: "diagnosed", icon: "🔬" },
      { label: "Prefer not to answer", value: "skip", icon: "⬡" },
    ],
  },
  // ── Gender-neutral sexual health ──
  {
    id: "sexual_confidence", section: 8,
    label: "Has your sexual health affected your confidence or relationships?",
    sub: "You're not alone — sexual health concerns are among the most common yet least discussed issues. Nearly every nutritional deficiency we screen for has a direct or indirect impact here, and most are correctable.",
    type: "single",
    options: [
      { label: "No impact", value: "no", icon: "✓" },
      { label: "Some impact — I think about it", value: "some", icon: "💭" },
      { label: "Significant impact — affecting my relationship", value: "significant", icon: "⚠️" },
      { label: "Prefer not to answer", value: "skip", icon: "⬡" },
    ],
  },
];

// ─── Adaptive branching engine ────────────────────────────────────────────────

function getSectionQuestions(section: number, answers: Record<string, AnswerValue>): QuestionDef[] {
  const pool = ALL_QUESTIONS.filter((q) => q.section === section);

  switch (section) {
    case 0: // Lifestyle — always all 5 (including sexual activity gateway)
      return pool;

    case 1: { // Energy & Vitality
      const base = pool.filter((q) => q.id === "fatigue" || q.id === "sleep");
      const fatigue = typeof answers.fatigue === "number" ? answers.fatigue : 0;
      const sleepHrs = answers.sleep_hours as string | undefined;
      const sleepRefreshed = answers.sleep_refreshed as string | undefined;

      if (fatigue > 6) {
        const crash = pool.find((q) => q.id === "energy_crash");
        const caff = pool.find((q) => q.id === "caffeine");
        if (crash) base.push(crash);
        if (caff) base.push(caff);
      }

      const poorSleep = sleepHrs === "<5" || sleepHrs === "5-6" || sleepRefreshed === "no";
      if (poorSleep) {
        const trouble = pool.find((q) => q.id === "sleep_trouble");
        if (trouble) base.push(trouble);
      }

      return base;
    }

    case 2: { // Immunity & Recovery
      const base = pool.filter((q) => q.id === "sick_frequency" || q.id === "recovery_speed");
      const sickOften = answers.sick_frequency === "often" || answers.sick_frequency === "frequently";
      const slowRecovery = answers.recovery_speed === "slow" || answers.recovery_speed === "very-slow";

      if (sickOften) {
        const gut = pool.find((q) => q.id === "gut_health");
        if (gut) base.push(gut);
      }
      if (slowRecovery) {
        const muscle = pool.find((q) => q.id === "muscle_soreness");
        if (muscle) base.push(muscle);
      }
      if (sickOften && slowRecovery) {
        const abx = pool.find((q) => q.id === "antibiotics");
        if (abx) base.push(abx);
      }
      return base;
    }

    case 3: { // Skin, Hair & Clinical Signs
      const base = pool.filter((q) => q.id === "skin_concerns" || q.id === "hair_quality");
      const skinArr = Array.isArray(answers.skin_concerns) ? answers.skin_concerns : [];
      const hasPigmentation = skinArr.includes("pigmentation") || skinArr.includes("dullness");
      const hairIssue = answers.hair_quality === "mild-thinning" || answers.hair_quality === "significant-thinning" || answers.hair_quality === "greying";
      const brittleHair = answers.hair_quality === "brittle";
      const manySkinConcerns = skinArr.filter((s) => s !== "none").length >= 2;
      const anySkinConcern = skinArr.length > 0 && !skinArr.includes("none");

      if (hasPigmentation) {
        const sun = pool.find((q) => q.id === "sun_exposure");
        if (sun) base.push(sun);
      }
      if (hairIssue) {
        // Deep-dive: hair loss pattern and scalp condition
        const pattern = pool.find((q) => q.id === "hair_loss_pattern");
        const scalp = pool.find((q) => q.id === "scalp_condition");
        const thyroid = pool.find((q) => q.id === "thyroid_symptoms");
        if (pattern) base.push(pattern);
        if (scalp) base.push(scalp);
        if (thyroid) base.push(thyroid);
      }
      if (brittleHair) {
        // Brittle hair → scalp + nail signs (keratin pathway)
        const scalp = pool.find((q) => q.id === "scalp_condition");
        const nails = pool.find((q) => q.id === "nail_signs");
        if (scalp && !base.includes(scalp)) base.push(scalp);
        if (nails) base.push(nails);
      }
      if (manySkinConcerns) {
        const smoking = pool.find((q) => q.id === "smoking_pollution");
        if (smoking) base.push(smoking);
      }
      // Clinical skin sign deep-dives — shown if ANY skin or hair issue reported
      if (anySkinConcern || hairIssue || brittleHair) {
        const dryness = pool.find((q) => q.id === "skin_dryness_pattern");
        const darkening = pool.find((q) => q.id === "skin_darkening_areas");
        if (dryness) base.push(dryness);
        if (darkening) base.push(darkening);
      }
      // Intimate/breast questions — only if dryness or hormonal signals present
      const dryArr = Array.isArray(answers.skin_dryness_pattern) ? answers.skin_dryness_pattern : [];
      const hasDryness = dryArr.length > 0 && !dryArr.includes("none");
      const darkArr = Array.isArray(answers.skin_darkening_areas) ? answers.skin_darkening_areas : [];
      const hasDarkening = darkArr.length > 0 && !darkArr.includes("none");
      const isFemale = answers.gender === "female";

      if (hasDryness || skinArr.includes("wrinkles")) {
        const intimate = pool.find((q) => q.id === "intimate_dryness");
        if (intimate) base.push(intimate);
      }
      if (isFemale && (hasDryness || hasDarkening)) {
        const breast = pool.find((q) => q.id === "breast_skin");
        if (breast) base.push(breast);
      }
      // Nail signs — shown if not already added and user has skin/hair concerns
      if (anySkinConcern && !brittleHair) {
        const nails = pool.find((q) => q.id === "nail_signs");
        if (nails && !base.includes(nails)) base.push(nails);
      }
      return base;
    }

    case 4: { // Physical Performance
      const base = pool.filter((q) => q.id === "exercise_frequency");
      const freq = answers.exercise_frequency as string | undefined;
      const active = freq === "3-4x-moderate" || freq === "5+-intense";
      const sedentary = freq === "never";

      if (active) {
        const recovery = pool.find((q) => q.id === "recovery_quality");
        const plateau = pool.find((q) => q.id === "performance_plateau");
        if (recovery) base.push(recovery);
        if (plateau) base.push(plateau);
      }
      if (sedentary) {
        const stamina = pool.find((q) => q.id === "low_stamina");
        if (stamina) base.push(stamina);
      }
      return base;
    }

    case 5: { // Cognitive & Mood + Mindfulness
      const base = pool.filter((q) => q.id === "concentration" || q.id === "stress" || q.id === "brain_fog");
      const stressVal = typeof answers.stress === "number" ? answers.stress : 0;
      const fogFreq = answers.brain_fog as string | undefined;
      const concentration = answers.concentration as string | undefined;

      if (stressVal > 7) {
        const anxiety = pool.find((q) => q.id === "anxiety_symptoms");
        if (anxiety) base.push(anxiety);
      }
      if (fogFreq === "weekly" || fogFreq === "daily") {
        const memory = pool.find((q) => q.id === "memory_complaints");
        if (memory) base.push(memory);
      }
      if (stressVal > 7 && (concentration === "fair" || concentration === "poor")) {
        const eating = pool.find((q) => q.id === "emotional_eating");
        if (eating) base.push(eating);
      }

      // Mindfulness & behavioral — always ask procrastination + motivation
      const procrastination = pool.find((q) => q.id === "procrastination");
      const motivation = pool.find((q) => q.id === "motivation_level");
      if (procrastination) base.push(procrastination);
      if (motivation) base.push(motivation);

      // Decision fatigue — if poor concentration or high stress
      if (concentration === "fair" || concentration === "poor" || stressVal > 6) {
        const decision = pool.find((q) => q.id === "decision_fatigue");
        if (decision) base.push(decision);
      }

      // Mindfulness practice — if high stress or anxiety
      if (stressVal > 5 || answers.anxiety_symptoms === "frequently" || answers.anxiety_symptoms === "sometimes") {
        const mindfulness = pool.find((q) => q.id === "mindfulness_practice");
        if (mindfulness) base.push(mindfulness);
      }

      // Screen before sleep — if poor sleep reported earlier
      const poorSleep = answers.sleep_hours === "<5" || answers.sleep_hours === "5-6" || answers.sleep_refreshed === "no";
      if (poorSleep || stressVal > 7) {
        const screen = pool.find((q) => q.id === "screen_before_sleep");
        if (screen) base.push(screen);
      }

      return base;
    }

    case 6: // Nutrition — always all 3
      return pool;

    case 7: { // Oral & Metabolic Markers — dynamically branched
      // Always start with oral health as gateway question
      const base = pool.filter((q) => q.id === "oral_health");

      const oralArr = Array.isArray(answers.oral_health) ? answers.oral_health : [];
      const hasOralIssues = oralArr.length > 0 && !oralArr.includes("none");

      // Tongue appearance — if oral issues or B12/iron risk signals from prior answers
      if (hasOralIssues || answers.hair_quality === "significant-thinning" || answers.hair_quality === "greying") {
        const tongue = pool.find((q) => q.id === "tongue_appearance");
        if (tongue) base.push(tongue);
      }

      // Urine colour — always shown (universal metabolic screen)
      const urine = pool.find((q) => q.id === "urine_colour");
      if (urine) base.push(urine);

      // Urine frequency — if dark urine, frequent urination signals, or metabolic risk
      const darkUrine = answers.urine_colour === "dark-yellow" || answers.urine_colour === "brown" || answers.urine_colour === "cloudy";
      if (darkUrine) {
        const freq = pool.find((q) => q.id === "urine_frequency");
        if (freq) base.push(freq);
      }

      // Metabolic signs — if acanthosis nigricans detected, or age/weight risk
      const darkArr = Array.isArray(answers.skin_darkening_areas) ? answers.skin_darkening_areas : [];
      const hasAcanthosis = darkArr.includes("neck") || darkArr.includes("underarms") || darkArr.includes("groin");
      const ageOver35 = answers.age === "36-45" || answers.age === "46-55" || answers.age === "56-65" || answers.age === "65+";

      if (hasAcanthosis || ageOver35 || darkUrine) {
        const metab = pool.find((q) => q.id === "metabolic_signs");
        if (metab) base.push(metab);
      }

      // Eye signs — if dry skin pattern detected, or vitamin A/B2 risk signals
      const dryArr = Array.isArray(answers.skin_dryness_pattern) ? answers.skin_dryness_pattern : [];
      const hasDrySkin = dryArr.includes("elbows-knees") || dryArr.includes("shins");
      const hasOralB2Signs = oralArr.includes("angular-cheilitis");

      if (hasDrySkin || hasOralB2Signs || answers.scalp_condition === "dry-flaky") {
        const eyes = pool.find((q) => q.id === "eye_signs");
        if (eyes) base.push(eyes);
      }

      // Gut deep-dive — if prior gut issues or steatorrhea signals
      const gutArr = Array.isArray(answers.gut_health) ? answers.gut_health : [];
      const hasGutIssues = gutArr.length > 0 && !gutArr.includes("none");
      const fatigue = typeof answers.fatigue === "number" ? answers.fatigue : 0;

      if (hasGutIssues || fatigue > 7) {
        const gutDeep = pool.find((q) => q.id === "gut_deep");
        if (gutDeep) base.push(gutDeep);
      }

      // Food reactions — if gut issues or stool abnormality
      const stoolIssue = answers.gut_deep === "constipated" || answers.gut_deep === "loose" || answers.gut_deep === "alternating" || answers.gut_deep === "steatorrhea";
      if (hasGutIssues || stoolIssue) {
        const food = pool.find((q) => q.id === "food_reactions");
        if (food) base.push(food);
      }

      // Bloating timing — if bloating reported in gut_health or general fatigue
      const hasBloating = gutArr.includes("bloating");
      if (hasBloating) {
        const bloatTime = pool.find((q) => q.id === "bloating_timing");
        if (bloatTime) base.push(bloatTime);
      }

      // Acid reflux — if reflux in gut_health or post-meal issues
      if (gutArr.includes("reflux") || answers.postmeal_fatigue === "every" || answers.postmeal_fatigue === "carb-heavy") {
        const reflux = pool.find((q) => q.id === "acid_reflux");
        if (reflux) base.push(reflux);
      }

      // Post-meal fatigue — always show as a screening question
      const pmf = pool.find((q) => q.id === "postmeal_fatigue");
      if (pmf) base.push(pmf);

      // Appetite pattern — if fatigue high or metabolic signs present
      const metabArr = Array.isArray(answers.metabolic_signs) ? answers.metabolic_signs : [];
      const hasMetabolicSigns = metabArr.length > 0 && !metabArr.includes("none");
      if (fatigue > 6 || hasMetabolicSigns || answers.appetite_pattern === undefined) {
        const appetite = pool.find((q) => q.id === "appetite_pattern");
        if (appetite) base.push(appetite);
      }

      return base;
    }

    case 8: { // Sexual & Reproductive Health — heavily gender-branched
      const isMale = answers.gender === "male";
      const isFemale = answers.gender === "female";
      const sexActive = answers.sexually_active === "yes";
      const skipped = answers.sexually_active === "skip";

      // If user chose "prefer not to say" for sexually active, show minimal
      if (skipped) {
        return [];
      }

      const base: QuestionDef[] = [];

      // Libido — universal entry point
      const libido = pool.find((q) => q.id === "libido");
      if (libido) base.push(libido);

      const libidoVal = typeof answers.libido === "number" ? answers.libido : 5;

      if (isMale) {
        // Erectile function — if sexually active or low libido
        if (sexActive || libidoVal < 5) {
          const erectile = pool.find((q) => q.id === "erectile_function");
          if (erectile) base.push(erectile);
        }
        // Morning erections — hormonal marker, always relevant for males
        const morning = pool.find((q) => q.id === "morning_erections");
        if (morning) base.push(morning);

        // Stamina — if sexually active and erectile issues
        if (sexActive && (answers.erectile_function === "occasional" || answers.erectile_function === "frequent" || answers.erectile_function === "significant")) {
          const stamina = pool.find((q) => q.id === "male_stamina");
          if (stamina) base.push(stamina);
        }
        // Fertility — if age 25+ or low libido
        const ageReproductive = answers.age !== "56-65" && answers.age !== "65+";
        if (ageReproductive) {
          const fertility = pool.find((q) => q.id === "male_fertility_concern");
          if (fertility) base.push(fertility);
        }
      }

      if (isFemale) {
        // Menstrual health — always shown for females
        const regularity = pool.find((q) => q.id === "menstrual_regularity");
        if (regularity) base.push(regularity);

        const isPremenopausal = answers.menstrual_regularity !== "na";
        if (isPremenopausal) {
          // Period pain — if periods present
          const pain = pool.find((q) => q.id === "period_pain");
          if (pain) base.push(pain);

          // Flow — always important for iron assessment
          const flow = pool.find((q) => q.id === "period_flow");
          if (flow) base.push(flow);

          // PCOD screen — if irregular or absent periods, or acne/weight/hair signals
          const irregular = answers.menstrual_regularity === "very-irregular" || answers.menstrual_regularity === "absent";
          const skinArr = Array.isArray(answers.skin_concerns) ? answers.skin_concerns : [];
          const hasHormonalAcne = skinArr.includes("acne");
          const hairThin = answers.hair_quality === "mild-thinning" || answers.hair_quality === "significant-thinning";
          if (irregular || hasHormonalAcne || hairThin) {
            const pcod = pool.find((q) => q.id === "pcod_symptoms");
            if (pcod) base.push(pcod);
          }

          // PMS — if periods present
          const pms = pool.find((q) => q.id === "pms_severity");
          if (pms) base.push(pms);
        }

        // Discharge — if sexually active or gynaecological signals
        if (sexActive || answers.intimate_dryness === "frequent") {
          const discharge = pool.find((q) => q.id === "vaginal_discharge");
          if (discharge) base.push(discharge);
        }

        // Fertility — for reproductive age women
        const reproAge = answers.age !== "56-65" && answers.age !== "65+" && isPremenopausal;
        if (reproAge) {
          const fertility = pool.find((q) => q.id === "female_fertility_concern");
          if (fertility) base.push(fertility);
        }
      }

      // Confidence — if low libido or sexual issues reported
      const hasIssues = libidoVal < 5 || answers.erectile_function === "frequent" || answers.erectile_function === "significant" || answers.menstrual_regularity === "very-irregular" || answers.menstrual_regularity === "absent";
      if (hasIssues) {
        const confidence = pool.find((q) => q.id === "sexual_confidence");
        if (confidence) base.push(confidence);
      }

      return base;
    }

    default:
      return [];
  }
}

// ─── Scoring engine ───────────────────────────────────────────────────────────

function calcNutrientRisks(answers: Record<string, AnswerValue>): NutrientRisks {
  const a = answers;
  const fatigue = typeof a.fatigue === "number" ? a.fatigue : 5;
  const stress = typeof a.stress === "number" ? a.stress : 5;
  const isVeg = a.diet_type === "vegetarian" || a.diet_type === "vegan" || a.diet_type === "eggetarian";
  const isStrictVeg = a.diet_type === "vegetarian" || a.diet_type === "vegan";
  const isFemale = a.gender === "female";
  const isSedentary = a.occupation === "sedentary" || a.exercise_frequency === "never";
  const isIntenseExercise = a.exercise_frequency === "5+-intense";
  const isModerateExercise = a.exercise_frequency === "3-4x-moderate" || isIntenseExercise;
  const sickOften = a.sick_frequency === "often" || a.sick_frequency === "frequently";
  const slowRecovery = a.recovery_speed === "slow" || a.recovery_speed === "very-slow";
  const skinArr = Array.isArray(a.skin_concerns) ? a.skin_concerns : [];
  const hasSkinConcerns = skinArr.length > 0 && !skinArr.includes("none");
  const hasPigmentation = skinArr.includes("pigmentation");
  const hasAcne = skinArr.includes("acne");
  const hairThinning = a.hair_quality === "mild-thinning" || a.hair_quality === "significant-thinning";
  const brainFogOften = a.brain_fog === "weekly" || a.brain_fog === "daily";
  const poorConcentration = a.concentration === "fair" || a.concentration === "poor";
  const poorSleep = a.sleep_hours === "<5" || a.sleep_hours === "5-6" || a.sleep_refreshed === "no";
  const hotClimate = a.climate === "hot-humid" || a.climate === "hot-dry";
  const isSmokerPollution = a.smoking_pollution === "smoker" || a.smoking_pollution === "pollution";
  const lowFruitVeg = a.fruit_veg === "0-1";
  const lowWater = a.water_intake === "<1L";
  const ageOver35 = a.age === "36-45" || a.age === "46-55" || a.age === "56-65" || a.age === "65+";
  const ageOver45 = a.age === "46-55" || a.age === "56-65" || a.age === "65+";
  const highCaffeine = a.caffeine === "3-4" || a.caffeine === "5+";

  const clamp = (v: number) => Math.min(100, Math.max(0, Math.round(v)));

  // New clinical sign signals
  const oralArr = Array.isArray(a.oral_health) ? a.oral_health : [];
  const hasBleedingGums = oralArr.includes("bleeding-gums");
  const hasAngularCheilitis = oralArr.includes("angular-cheilitis");
  const hasGlossitis = oralArr.includes("glossitis");
  const hasMouthUlcers = oralArr.includes("ulcers");
  const tongueSmooth = a.tongue_appearance === "smooth-red";
  const tonguePale = a.tongue_appearance === "pale";
  const dryArr = Array.isArray(a.skin_dryness_pattern) ? a.skin_dryness_pattern : [];
  const hasElbowDryness = dryArr.includes("elbows-knees");
  const hasShinDryness = dryArr.includes("shins");
  const darkArr = Array.isArray(a.skin_darkening_areas) ? a.skin_darkening_areas : [];
  const hasAcanthosis = darkArr.includes("neck") || darkArr.includes("underarms") || darkArr.includes("groin");
  const nailArr = Array.isArray(a.nail_signs) ? a.nail_signs : [];
  const hasSpoonNails = nailArr.includes("spoon");
  const hasBrittleNails = nailArr.includes("brittle");
  const hasPaleNails = nailArr.includes("pale");
  const hasWhiteSpots = nailArr.includes("white-spots");
  const eyeArr = Array.isArray(a.eye_signs) ? a.eye_signs : [];
  const hasDryEyes = eyeArr.includes("dry-eyes");
  const hasNightVision = eyeArr.includes("night-vision");
  const metabolicArr = Array.isArray(a.metabolic_signs) ? a.metabolic_signs : [];
  const hasSugarCravings = metabolicArr.includes("sugar-cravings");
  const hasNeuropathy = metabolicArr.includes("neuropathy");
  const hasSkinTags = metabolicArr.includes("skin-tags");
  const hasSlowHealing = metabolicArr.includes("slow-healing");
  const intimateDry = a.intimate_dryness === "frequent" || a.intimate_dryness === "occasional";
  const darkUrine = a.urine_colour === "dark-yellow" || a.urine_colour === "brown";
  const hairDiffuse = a.hair_loss_pattern === "diffuse";
  const scalpDryFlaky = a.scalp_condition === "dry-flaky" || a.scalp_condition === "scales";

  return {
    vitaminD: clamp(50 + (isSedentary ? 15 : 0) + (a.occupation === "sedentary" ? 10 : 0) + (a.sun_exposure === "<30min" ? 10 : 0) + (isVeg ? 10 : 0)),
    vitaminB12: clamp(30 + (isStrictVeg ? 25 : 0) + (fatigue > 6 ? 10 : 0) + (brainFogOften ? 10 : 0) + (ageOver45 ? 10 : 0) + (tongueSmooth ? 15 : 0) + (hasGlossitis ? 10 : 0) + (hasNeuropathy ? 12 : 0) + (hasMouthUlcers ? 8 : 0)),
    iron: clamp(20 + (isFemale ? 20 : 0) + (isModerateExercise ? 15 : 0) + (fatigue > 6 ? 10 : 0) + (isVeg ? 10 : 0) + (hasSpoonNails ? 15 : 0) + (hasPaleNails ? 10 : 0) + (tonguePale ? 10 : 0) + (hairDiffuse ? 8 : 0)),
    vitaminC: clamp(15 + (sickOften ? 15 : 0) + (isSmokerPollution ? 10 : 0) + (hasSkinConcerns ? 10 : 0) + (lowFruitVeg ? 10 : 0) + (hasBleedingGums ? 15 : 0) + (hasSlowHealing ? 10 : 0)),
    zinc: clamp(15 + (sickOften ? 15 : 0) + (hasAcne ? 10 : 0) + (hairThinning ? 10 : 0) + (isVeg ? 10 : 0) + (hasWhiteSpots ? 10 : 0) + (hasSlowHealing ? 8 : 0)),
    magnesium: clamp(20 + (stress > 7 ? 15 : 0) + (poorSleep ? 10 : 0) + (slowRecovery ? 10 : 0) + (highCaffeine ? 10 : 0) + (eyeArr.includes("twitching") ? 12 : 0)),
    glutathione: clamp(10 + (hasPigmentation ? 20 : 0) + (isSmokerPollution ? 15 : 0) + (ageOver35 ? 10 : 0) + (a.antibiotics === "multiple" ? 10 : 0)),
    nad: clamp(10 + (ageOver35 ? 20 : 0) + (fatigue > 7 ? 15 : 0) + (brainFogOften ? 10 : 0) + (poorConcentration ? 10 : 0)),
    aminoAcids: clamp(10 + (isIntenseExercise ? 25 : 0) + (isStrictVeg ? 15 : 0) + (slowRecovery ? 10 : 0)),
    electrolytes: clamp(15 + (lowWater ? 15 : 0) + (isModerateExercise ? 15 : 0) + (hotClimate ? 10 : 0) + (darkUrine ? 10 : 0)),
    vitaminA: clamp(10 + (hasElbowDryness ? 20 : 0) + (hasShinDryness ? 12 : 0) + (hasNightVision ? 20 : 0) + (hasDryEyes ? 10 : 0) + (scalpDryFlaky ? 8 : 0) + (lowFruitVeg ? 10 : 0)),
    vitaminB2: clamp(8 + (hasAngularCheilitis ? 25 : 0) + (hasDryEyes ? 12 : 0) + (scalpDryFlaky ? 10 : 0) + (hasGlossitis ? 10 : 0) + (a.tongue_appearance === "geographic" ? 8 : 0)),
    omega3: clamp(10 + (hasElbowDryness ? 15 : 0) + (hasShinDryness ? 10 : 0) + (intimateDry ? 12 : 0) + (a.breast_skin === "dry" ? 10 : 0) + (hasDryEyes ? 10 : 0) + (hasBrittleNails ? 8 : 0) + (scalpDryFlaky ? 8 : 0)),
    insulinResistance: clamp(5 + (hasAcanthosis ? 30 : 0) + (hasSkinTags ? 15 : 0) + (hasSugarCravings ? 10 : 0) + (a.urine_frequency === "very-frequent" || a.urine_frequency === "nocturia" ? 12 : 0) + (metabolicArr.includes("polydipsia") ? 12 : 0) + (ageOver45 ? 8 : 0)),
    hormoneBalance: clamp(10
      + (typeof a.libido === "number" && a.libido < 4 ? 20 : typeof a.libido === "number" && a.libido < 6 ? 10 : 0)
      + (a.erectile_function === "frequent" || a.erectile_function === "significant" ? 20 : a.erectile_function === "occasional" ? 10 : 0)
      + (a.morning_erections === "rarely" || a.morning_erections === "never" ? 15 : 0)
      + (a.menstrual_regularity === "very-irregular" || a.menstrual_regularity === "absent" ? 20 : a.menstrual_regularity === "slightly-irregular" ? 8 : 0)
      + (a.period_flow === "heavy" || a.period_flow === "very-heavy" ? 10 : 0)
      + (a.pms_severity === "severe" ? 12 : a.pms_severity === "moderate" ? 6 : 0)
      + ((() => { const pcArr = Array.isArray(a.pcod_symptoms) ? a.pcod_symptoms : []; return pcArr.filter((p: string) => p !== "none").length >= 2 ? 20 : pcArr.filter((p: string) => p !== "none").length === 1 ? 8 : 0; })())
      + (stress > 7 ? 8 : 0)
    ),
    folate: clamp(10
      + (isStrictVeg ? 12 : 0)
      + (a.female_fertility_concern === "trying" || a.female_fertility_concern === "planning" || a.female_fertility_concern === "diagnosed" ? 20 : 0)
      + (a.male_fertility_concern === "trying" || a.male_fertility_concern === "diagnosed" ? 15 : 0)
      + (hasMouthUlcers ? 12 : 0)
      + (tongueSmooth ? 10 : 0)
      + (a.menstrual_regularity === "very-irregular" || a.menstrual_regularity === "absent" ? 8 : 0)
      + (lowFruitVeg ? 10 : 0)
      + (a.antibiotics === "multiple" ? 8 : 0)
    ),
  };
}

function calcVitalityScore(risks: NutrientRisks): number {
  const vals = Object.values(risks);
  const sorted = [...vals].sort((a, b) => b - a);
  const top5 = sorted.slice(0, 5);
  const avg = top5.reduce((s, v) => s + v, 0) / 5;
  return Math.min(96, Math.max(28, Math.round(100 - avg * 0.7)));
}

function calcCategoryScores(risks: NutrientRisks): Record<string, number> {
  return {
    Energy: Math.round((risks.nad + risks.vitaminB12 + risks.magnesium + risks.iron) / 4),
    Immunity: Math.round((risks.vitaminC + risks.zinc + risks.vitaminD) / 3),
    Skin: Math.round((risks.glutathione + risks.vitaminA + risks.omega3 + risks.vitaminB2) / 4),
    Performance: Math.round((risks.aminoAcids + risks.iron + risks.vitaminB12) / 3),
    Cognitive: Math.round((risks.nad + risks.magnesium + risks.vitaminB12) / 3),
    Metabolic: Math.round((risks.insulinResistance + risks.electrolytes + risks.magnesium) / 3),
    Hormonal: Math.round((risks.hormoneBalance + risks.folate + risks.zinc + risks.vitaminD) / 4),
  };
}

// ─── Drip matching ────────────────────────────────────────────────────────────

type DripMatch = { drip: Drip; matchPct: number; reasons: string[] };

function matchDrips(risks: NutrientRisks): DripMatch[] {
  const dripNutrientMap: Record<string, { nutrients: (keyof NutrientRisks)[]; labels: Record<string, string> }> = {
    velocity: {
      nutrients: ["nad", "magnesium", "vitaminB12"],
      labels: { nad: "NAD+ for mitochondrial energy", magnesium: "Magnesium for muscle & nerve function", vitaminB12: "B12 for red blood cell production" },
    },
    luminescence: {
      nutrients: ["glutathione", "vitaminC", "zinc"],
      labels: { glutathione: "Glutathione for skin brightening & detox", vitaminC: "Vitamin C for collagen synthesis", zinc: "Zinc for skin repair & acne control" },
    },
    fortress: {
      nutrients: ["vitaminC", "zinc", "vitaminD"],
      labels: { vitaminC: "High-dose Vitamin C for immune defence", zinc: "Zinc for pathogen resistance", vitaminD: "Vitamin D for immune modulation" },
    },
    hydraflux: {
      nutrients: ["electrolytes", "magnesium"],
      labels: { electrolytes: "Electrolytes for cellular hydration", magnesium: "Magnesium for muscle recovery" },
    },
    apex: {
      nutrients: ["aminoAcids", "iron", "vitaminB12"],
      labels: { aminoAcids: "Amino acids for muscle repair", iron: "Iron for oxygen transport", vitaminB12: "B12 for endurance capacity" },
    },
    cognitas: {
      nutrients: ["nad", "magnesium", "vitaminB12"],
      labels: { nad: "NAD+ for neuroprotection", magnesium: "Magnesium threonate for brain penetration", vitaminB12: "B12 for myelin sheath integrity" },
    },
  };

  return DRIPS.map((drip) => {
    const mapping = dripNutrientMap[drip.id];
    if (!mapping) return { drip, matchPct: 40, reasons: [] };
    const avg = mapping.nutrients.reduce((s, n) => s + risks[n], 0) / mapping.nutrients.length;
    const matchPct = Math.min(98, Math.max(35, Math.round(avg * 1.05)));
    const reasons = mapping.nutrients
      .filter((n) => risks[n] > 40)
      .map((n) => mapping.labels[n]);
    return { drip, matchPct, reasons };
  }).sort((a, b) => b.matchPct - a.matchPct);
}

// ─── Lab test recommendations ─────────────────────────────────────────────────

function getLabPanel(risks: NutrientRisks, answers: Record<string, AnswerValue>, catScores: Record<string, number>): LabPanel {
  const essential: LabTest[] = [
    { name: "Complete Blood Count (CBC)", reason: "Baseline health marker — detects anaemia, infection, and platelet status" },
    { name: "25-OH Vitamin D", reason: "70–90% of Indian urban adults are deficient; critical for immunity and bone health" },
    { name: "Vitamin B12 & Folate", reason: "Essential for nerve function and red blood cell formation; especially critical for vegetarians" },
    { name: "Serum Ferritin + Iron Studies", reason: "Detects iron deficiency before anaemia develops; especially important for women 18–45" },
  ];

  const recommended: LabTest[] = [];
  const optional: LabTest[] = [];

  if (catScores.Energy > 60 || (typeof answers.fatigue === "number" && answers.fatigue > 6)) {
    recommended.push({ name: "Thyroid Panel (TSH, T3, T4)", reason: "Fatigue and energy issues often trace to subclinical thyroid dysfunction" });
  }
  if (catScores.Immunity > 60) {
    recommended.push({ name: "CRP (C-Reactive Protein)", reason: "Elevated CRP indicates chronic inflammation impairing immune response" });
  }
  if (catScores.Cognitive > 60) {
    recommended.push({ name: "Homocysteine Levels", reason: "Elevated homocysteine is linked to cognitive decline and B-vitamin metabolism issues" });
  }
  if (catScores.Skin > 60) {
    recommended.push({ name: "Liver Function Tests (LFT)", reason: "Liver health directly impacts detoxification and skin clarity" });
  }
  if (catScores.Performance > 60) {
    recommended.push({ name: "Serum Magnesium", reason: "Magnesium deficiency impairs muscle function, recovery and athletic performance" });
    recommended.push({ name: "Electrolyte Panel", reason: "Imbalanced electrolytes cause cramps, fatigue and performance decline" });
  }

  const ageOver35 = answers.age === "36-45" || answers.age === "46-55" || answers.age === "56-65" || answers.age === "65+";
  if (ageOver35 && (typeof answers.fatigue === "number" && answers.fatigue > 6)) {
    optional.push({ name: "HbA1c", reason: "Screens for prediabetes — fatigue combined with age is a risk factor" });
  }
  const isVeg = answers.diet_type === "vegetarian" || answers.diet_type === "vegan";
  if (isVeg && risks.vitaminB12 > 70) {
    optional.push({ name: "Methylmalonic Acid (MMA)", reason: "More sensitive than serum B12 for detecting true tissue-level B12 deficiency" });
  }
  const hairIssue = answers.hair_quality === "mild-thinning" || answers.hair_quality === "significant-thinning" || answers.hair_quality === "greying";
  if (hairIssue) {
    optional.push({ name: "Zinc & Selenium", reason: "Both are essential for hair follicle health and preventing premature hair loss" });
    optional.push({ name: "Thyroid Antibodies (Anti-TPO)", reason: "Autoimmune thyroid disease is a common hidden cause of hair loss" });
  }

  // Clinical sign-driven additions
  const darkArr = Array.isArray(answers.skin_darkening_areas) ? answers.skin_darkening_areas : [];
  const hasAcanthosis = darkArr.includes("neck") || darkArr.includes("underarms") || darkArr.includes("groin");
  if (hasAcanthosis || risks.insulinResistance > 40) {
    recommended.push({ name: "Fasting Insulin + HOMA-IR", reason: "Acanthosis nigricans (darkened skin folds) is a clinical marker of insulin resistance — fasting insulin is more sensitive than blood sugar alone" });
    if (!ageOver35) {
      optional.push({ name: "HbA1c", reason: "Combined with insulin resistance markers, screens for prediabetes even in younger adults with metabolic signs" });
    }
  }

  const oralArr = Array.isArray(answers.oral_health) ? answers.oral_health : [];
  if (oralArr.includes("angular-cheilitis") || oralArr.includes("glossitis")) {
    recommended.push({ name: "Vitamin B2 (Riboflavin)", reason: "Angular cheilitis and glossitis are hallmark signs of riboflavin deficiency" });
  }
  if (oralArr.includes("bleeding-gums")) {
    optional.push({ name: "Vitamin C (Ascorbic Acid Level)", reason: "Bleeding gums with no dental cause suggests subclinical scurvy — vitamin C depletion" });
  }

  const dryArr = Array.isArray(answers.skin_dryness_pattern) ? answers.skin_dryness_pattern : [];
  if (dryArr.includes("elbows-knees") || answers.eye_signs && (Array.isArray(answers.eye_signs) && answers.eye_signs.includes("night-vision"))) {
    optional.push({ name: "Serum Retinol (Vitamin A)", reason: "Keratosis pilaris on elbows/knees and night vision difficulty point to vitamin A insufficiency" });
  }

  if (answers.intimate_dryness === "frequent" || answers.breast_skin === "dry") {
    optional.push({ name: "Omega-3 Index (RBC)", reason: "Essential fatty acid deficiency causes widespread mucosal and skin dryness — the omega-3 index measures long-term status" });
  }

  // Reproductive health-driven labs
  const isMale = answers.gender === "male";
  const isFemaleLocal = answers.gender === "female";
  const lowLibido = typeof answers.libido === "number" && answers.libido < 5;

  if (isMale && (lowLibido || answers.erectile_function === "frequent" || answers.erectile_function === "significant" || answers.morning_erections === "rarely" || answers.morning_erections === "never")) {
    recommended.push({ name: "Total & Free Testosterone", reason: "Low libido, erectile difficulty and absent morning erections point to testosterone insufficiency — the most actionable male hormone marker" });
    optional.push({ name: "DHEA-S + SHBG", reason: "Provides a complete picture of androgen availability and metabolic clearance" });
  }
  if (isMale && (answers.male_fertility_concern === "trying" || answers.male_fertility_concern === "diagnosed")) {
    recommended.push({ name: "Semen Analysis", reason: "Gold standard for male fertility assessment — count, motility and morphology" });
    optional.push({ name: "Serum Zinc + Selenium + CoQ10", reason: "These three nutrients directly improve sperm quality in clinical trials" });
  }
  if (isFemaleLocal && (answers.menstrual_regularity === "very-irregular" || answers.menstrual_regularity === "absent")) {
    recommended.push({ name: "AMH + FSH + LH + Estradiol", reason: "Irregular/absent periods require a full hormonal panel to distinguish PCOD, premature ovarian insufficiency and hypothalamic causes" });
  }
  const pcodArr = Array.isArray(answers.pcod_symptoms) ? answers.pcod_symptoms : [];
  if (pcodArr.filter((p: string) => p !== "none").length >= 2) {
    recommended.push({ name: "Fasting Insulin + HOMA-IR", reason: "PCOD is fundamentally an insulin-driven condition — insulin testing is more diagnostic than blood sugar" });
    optional.push({ name: "Free Testosterone + DHEA-S", reason: "Androgen excess drives hirsutism, acne and hair thinning in PCOD" });
  }
  if (isFemaleLocal && (answers.female_fertility_concern === "trying" || answers.female_fertility_concern === "planning" || answers.female_fertility_concern === "diagnosed")) {
    recommended.push({ name: "Serum Folate + RBC Folate", reason: "Folate must be optimised at least 3 months before conception — RBC folate reflects true tissue stores" });
  }
  if (isFemaleLocal && (answers.period_flow === "heavy" || answers.period_flow === "very-heavy")) {
    // Iron should already be essential, but flag specifically
    optional.push({ name: "Serum Ferritin (repeat every 3 months)", reason: "Heavy menstrual flow causes chronic iron depletion — ferritin should be tracked quarterly" });
  }

  return { essential, recommended, optional };
}

// ─── Trust items ──────────────────────────────────────────────────────────────

const TRUST_ITEMS = [
  { icon: "🏥", title: "Physician Approved", desc: "Every protocol reviewed by a licensed MD within 2 hours." },
  { icon: "👩‍⚕️", title: "Certified RN Nurses", desc: "All infusions administered by credentialed registered nurses." },
  { icon: "🔬", title: "Lab-Tested Formulas", desc: "ISO-certified pharmacy. Third-party purity verified." },
  { icon: "📞", title: "24-hr Follow-up", desc: "Our clinical team checks in after every session." },
];

// ─── Page CSS ─────────────────────────────────────────────────────────────────

const PAGE_CSS = `
  .quiz-page { background:var(--sky-bg); min-height:100vh; }

  /* Header */
  .quiz-header-block {
    background:linear-gradient(160deg,#C8E9F8 0%,#A4D5F5 40%,#7DC4F0 100%);
    padding:140px 56px 60px;text-align:center;position:relative;overflow:hidden;
  }
  .quiz-header-block .hb-blob {
    position:absolute;border-radius:50%;filter:blur(80px);pointer-events:none;
  }
  .hb1 { width:350px;height:350px;background:rgba(255,255,255,0.20);top:-80px;right:-80px; }
  .hb2 { width:220px;height:220px;background:rgba(255,255,255,0.12);bottom:0;left:8%; }
  .qhb-inner { position:relative;z-index:2;max-width:560px;margin:0 auto; }
  .qhb-eyebrow {
    font-size:11px;letter-spacing:2px;text-transform:uppercase;
    font-weight:500;color:rgba(255,255,255,0.80);margin-bottom:12px;
  }
  .qhb-title {
    font-size:clamp(36px,5vw,58px);font-weight:600;
    color:#fff;letter-spacing:-2px;line-height:1.05;margin-bottom:12px;
  }
  .qhb-title em { font-style:italic;font-family:var(--font-serif);font-weight:400; }
  .qhb-sub { font-size:16px;color:rgba(255,255,255,0.85);line-height:1.7; }

  /* Card wrapper */
  .quiz-card-outer { padding:60px 56px;display:flex;flex-direction:column;align-items:center; }

  /* Quiz card */
  .quiz-card {
    width:100%;max-width:800px;
    background:var(--white);border-radius:20px;overflow:hidden;
    border:1.5px solid var(--border);box-shadow:var(--shadow-lg);
  }

  /* Card header with gradient */
  .quiz-card-header {
    background:linear-gradient(135deg,var(--teal) 0%,var(--sky) 100%);
    padding:28px 32px 24px;
  }
  .qch-section-name {
    font-size:10px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;
    color:rgba(255,255,255,0.70);margin-bottom:6px;
  }
  .qch-row { display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:14px; }
  .progress-track { flex:1;height:6px;border-radius:100px;background:rgba(255,255,255,0.25);overflow:hidden; }
  .progress-fill { height:100%;border-radius:100px;background:rgba(255,255,255,0.90);transition:width .5s ease; }
  .qch-count { font-size:12px;font-weight:500;color:rgba(255,255,255,0.80);white-space:nowrap; }

  /* Section dots */
  .section-dots { display:flex;gap:6px;margin-bottom:16px; }
  .section-dot {
    height:4px;border-radius:100px;transition:all .3s;
  }
  .section-dot.done { background:rgba(255,255,255,0.80); }
  .section-dot.current { background:#fff; }
  .section-dot.future { background:rgba(255,255,255,0.25); }

  .qch-title {
    font-size:clamp(18px,3vw,22px);font-weight:600;color:#fff;
    letter-spacing:-0.5px;line-height:1.3;
  }
  .q-hint { font-size:13px;color:rgba(255,255,255,0.80);margin-top:6px;line-height:1.55; }

  /* Card body */
  .quiz-body { padding:32px; }

  /* Options grid */
  .opts { display:grid;grid-template-columns:1fr 1fr;gap:12px; }
  .opts.single-col { grid-template-columns:1fr; }
  .opt {
    display:flex;align-items:center;gap:12px;
    padding:14px 16px;border-radius:12px;
    border:1.5px solid var(--border);background:var(--off-white);
    cursor:pointer;text-align:left;font-family:var(--font-display);
    transition:border-color .2s,background .2s,transform .2s,box-shadow .2s;
    width:100%;position:relative;
  }
  .opt:hover { transform:translateY(-2px);border-color:var(--sky); }
  .opt.sel {
    border-color:var(--teal);background:var(--sky-pale);
    box-shadow:0 4px 16px rgba(26,126,168,0.12);
  }
  .opt-icon { font-size:20px;flex-shrink:0; }
  .opt-label { font-size:13px;font-weight:500;color:var(--text);line-height:1.35; }
  .opt.sel .opt-label { color:var(--teal); }
  .opt-check {
    margin-left:auto;flex-shrink:0;
    width:20px;height:20px;border-radius:50%;
    background:var(--teal);
    display:flex;align-items:center;justify-content:center;
  }

  /* Multi-select checkbox */
  .opt-checkbox {
    margin-left:auto;flex-shrink:0;
    width:18px;height:18px;border-radius:4px;
    border:1.5px solid var(--border);
    display:flex;align-items:center;justify-content:center;
    transition:all .2s;
  }
  .opt.sel .opt-checkbox {
    background:var(--teal);border-color:var(--teal);
  }

  /* Slider */
  .slider-section { padding:16px 0; }
  .slider-labels {
    display:flex;justify-content:space-between;
    font-size:11px;color:var(--text-3);margin-bottom:12px;
  }
  .quiz-range {
    width:100%;accent-color:var(--teal);cursor:pointer;
    height:8px;border-radius:100px;
  }
  .slider-dots { display:flex;justify-content:space-between;margin-top:12px; }
  .slider-dot {
    width:32px;height:32px;border-radius:50%;border:none;cursor:pointer;
    font-size:12px;font-weight:500;font-family:var(--font-display);
    background:rgba(91,184,245,0.12);color:var(--text-3);
    display:flex;align-items:center;justify-content:center;
    transition:background .15s,color .15s;
  }
  .slider-dot.active { background:var(--teal);color:#fff; }
  .slider-val {
    text-align:center;margin-top:20px;
    font-size:48px;font-weight:600;color:var(--teal);
    letter-spacing:-2px;line-height:1;
  }
  .slider-val span { font-size:16px;color:var(--text-3);font-weight:300;margin-left:6px; }

  /* Compound question */
  .compound-part { margin-bottom:24px; }
  .compound-part:last-child { margin-bottom:0; }
  .compound-label {
    font-size:13px;font-weight:600;color:var(--text);
    margin-bottom:10px;
  }

  /* Nav buttons */
  .q-nav { display:flex;gap:12px;margin-top:28px; }
  .btn-back {
    flex:1;padding:13px;border-radius:50px;
    border:1.5px solid var(--border);background:transparent;
    color:var(--text-2);font-size:13px;font-weight:500;
    font-family:var(--font-display);cursor:pointer;transition:background .2s;
  }
  .btn-back:hover { background:var(--sky-bg); }
  .btn-next {
    flex:2;padding:13px;border-radius:50px;border:none;
    background:linear-gradient(145deg,var(--teal),var(--sky));
    color:#fff;font-size:13px;font-weight:600;
    font-family:var(--font-display);cursor:pointer;
    box-shadow:0 4px 16px rgba(26,126,168,0.25);
    transition:opacity .2s,transform .2s;
  }
  .btn-next:disabled {
    background:rgba(91,184,245,0.2);color:var(--text-3);
    box-shadow:none;cursor:not-allowed;
  }
  .btn-next:not(:disabled):hover {
    transform:translateY(-1px);box-shadow:0 6px 20px rgba(26,126,168,0.35);
  }

  /* Trust strip */
  .trust-strip {
    display:grid;grid-template-columns:repeat(4,1fr);gap:12px;
    margin-top:40px;width:100%;max-width:800px;
  }
  .trust-item {
    background:var(--white);border-radius:12px;padding:18px;
    text-align:center;border:1.5px solid var(--border);
    box-shadow:0 2px 12px rgba(91,184,245,0.08);
  }
  .t-icon { font-size:20px;margin-bottom:5px; }
  .t-title { font-size:11px;font-weight:600;color:var(--text);margin-bottom:3px; }
  .t-desc { font-size:10px;color:var(--text-3);line-height:1.4; }

  /* ── RESULTS ── */
  .results-body { max-width:960px;margin:0 auto;padding:60px 56px 80px; }

  /* Score + radar hero */
  .results-hero {
    background:var(--white);border-radius:20px;box-shadow:var(--shadow-lg);
    padding:48px;display:flex;gap:48px;align-items:flex-start;margin-bottom:32px;
    border:1.5px solid var(--border);
  }
  .score-ring-wrap {
    position:relative;width:180px;height:180px;
    display:flex;align-items:center;justify-content:center;flex-shrink:0;
  }
  .score-big {
    position:absolute;inset:0;
    display:flex;flex-direction:column;align-items:center;justify-content:center;
  }
  .rs-label {
    display:inline-block;font-size:11px;font-weight:600;
    padding:5px 14px;border-radius:50px;margin-top:10px;
  }
  .result-title { font-size:22px;font-weight:600;letter-spacing:-0.5px;margin-bottom:6px; }
  .result-sub { font-size:14px;color:var(--text-3);margin-bottom:24px;line-height:1.65; }

  /* Radar chart */
  .radar-section {
    background:var(--white);border-radius:20px;box-shadow:var(--shadow-lg);
    padding:40px;margin-bottom:32px;border:1.5px solid var(--border);
  }
  .radar-wrap {
    display:flex;align-items:center;justify-content:center;gap:48px;
  }
  .radar-legend { display:flex;flex-direction:column;gap:10px; }
  .radar-leg-item {
    display:flex;align-items:center;gap:10px;font-size:13px;
    color:var(--text-2);font-weight:500;
  }
  .radar-leg-dot {
    width:10px;height:10px;border-radius:50%;flex-shrink:0;
  }
  .radar-leg-val {
    margin-left:auto;font-weight:600;color:var(--text);
    min-width:32px;text-align:right;
  }

  /* Nutrient risk bars */
  .nutrient-section {
    background:var(--white);border-radius:20px;box-shadow:var(--shadow-lg);
    padding:40px;margin-bottom:32px;border:1.5px solid var(--border);
  }
  .section-heading {
    font-size:22px;font-weight:600;letter-spacing:-0.5px;margin-bottom:20px;
  }
  .section-heading em {
    font-style:italic;font-family:var(--font-serif);color:var(--teal);font-weight:400;
  }
  .section-subheading {
    font-size:14px;color:var(--text-3);margin-top:-14px;margin-bottom:24px;line-height:1.6;
  }

  .def-row { margin-bottom:18px; }
  .def-label {
    display:flex;justify-content:space-between;align-items:center;
    font-size:12px;font-weight:500;color:var(--text-2);margin-bottom:6px;
  }
  .def-risk-badge {
    font-size:10px;font-weight:600;padding:2px 8px;border-radius:50px;
    letter-spacing:0.5px;text-transform:uppercase;
  }
  .def-track {
    height:8px;border-radius:100px;
    background:rgba(91,184,245,0.12);overflow:hidden;
  }
  .def-fill {
    height:100%;border-radius:100px;
    transition:width 1.2s cubic-bezier(0.22,1,0.36,1);
  }
  .def-context {
    font-size:11px;color:var(--text-3);margin-top:4px;line-height:1.45;
  }

  /* Drip recommendations */
  .rec-grid { display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:32px; }
  .rec-card {
    background:var(--white);border-radius:20px;padding:32px;
    border:1.5px solid var(--border);transition:transform .3s,box-shadow .3s;
  }
  .rec-card:hover { transform:translateY(-4px); }
  .rec-card.primary {
    border-color:var(--teal);
    box-shadow:0 8px 32px rgba(26,126,168,0.15);
  }
  .rec-top-badge {
    display:inline-block;font-size:10px;font-weight:600;
    letter-spacing:1.5px;text-transform:uppercase;
    padding:4px 12px;border-radius:50px;
    background:rgba(26,126,168,0.10);color:var(--teal);margin-bottom:14px;
  }
  .rec-icon-row { display:flex;align-items:center;gap:14px;margin-bottom:14px; }
  .rec-icon-box {
    width:52px;height:52px;border-radius:14px;background:var(--sky-pale);
    display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0;
  }
  .rec-name { font-size:20px;font-weight:600;letter-spacing:-0.4px; }
  .rec-sub { font-size:12px;color:var(--text-3); }
  .rec-match-pct {
    font-size:11px;font-weight:600;color:var(--teal);
    letter-spacing:1px;margin-bottom:8px;
  }
  .rec-desc { font-size:13px;color:var(--text-2);line-height:1.7;margin-bottom:12px; }
  .rec-reasons { margin-bottom:16px; }
  .rec-reason {
    font-size:12px;color:var(--text-2);line-height:1.55;
    padding:3px 0;display:flex;align-items:baseline;gap:6px;
  }
  .rec-reason::before { content:"→";color:var(--teal);font-weight:600;flex-shrink:0; }
  .rec-tags { display:flex;gap:6px;flex-wrap:wrap;margin-bottom:18px; }
  .rec-tag {
    font-size:10px;letter-spacing:1px;text-transform:uppercase;
    color:var(--teal);background:var(--sky-pale);
    padding:4px 10px;border-radius:50px;font-weight:500;
  }
  .rec-price-row { display:flex;align-items:center;justify-content:space-between; }
  .rec-price { font-size:24px;font-weight:600;color:var(--teal);letter-spacing:-0.5px; }
  .rec-price span { font-size:13px;color:var(--text-3);font-weight:300;margin-left:4px; }

  .big-book-btn {
    display:inline-block;
    background:linear-gradient(145deg,var(--teal),var(--sky));
    color:#fff;border:none;border-radius:50px;
    padding:12px 22px;font-size:13px;font-weight:500;
    font-family:var(--font-display);text-decoration:none;cursor:pointer;
    transition:transform .2s,box-shadow .2s;
  }
  .big-book-btn:hover {
    transform:translateY(-2px);box-shadow:0 8px 24px rgba(26,126,168,0.30);
  }
  .big-book-btn.secondary { background:var(--sky-pale);color:var(--teal);box-shadow:none; }

  /* Lab tests */
  .lab-section {
    background:var(--white);border-radius:20px;box-shadow:var(--shadow-lg);
    padding:40px;margin-bottom:32px;border:1.5px solid var(--border);
  }
  .lab-tier { margin-bottom:28px; }
  .lab-tier:last-child { margin-bottom:0; }
  .lab-tier-header {
    display:flex;align-items:center;gap:10px;margin-bottom:14px;
  }
  .lab-tier-badge {
    font-size:10px;font-weight:600;letter-spacing:1.2px;
    text-transform:uppercase;padding:4px 12px;border-radius:50px;
  }
  .lab-tier-badge.essential { background:#E5F5F3;color:#0A7B6E; }
  .lab-tier-badge.recommended { background:#E6F1FB;color:#1A5FA8; }
  .lab-tier-badge.optional { background:rgba(91,184,245,0.08);color:var(--text-2); }
  .lab-tier-label {
    font-size:13px;font-weight:500;color:var(--text-2);
  }
  .lab-tests { display:flex;flex-direction:column;gap:10px; }
  .lab-test-card {
    padding:14px 18px;border-radius:12px;
    border:1.5px solid var(--border);background:var(--off-white);
  }
  .lab-test-name {
    font-size:13px;font-weight:600;color:var(--text);margin-bottom:4px;
  }
  .lab-test-reason {
    font-size:12px;color:var(--text-3);line-height:1.5;
  }

  /* Share button */
  .share-row { text-align:center;margin-bottom:32px; }
  .share-btn {
    display:inline-flex;align-items:center;gap:8px;
    padding:14px 28px;border-radius:50px;
    border:1.5px solid var(--border);background:var(--white);
    color:var(--text-2);font-size:13px;font-weight:500;
    font-family:var(--font-display);cursor:pointer;
    transition:all .2s;
  }
  .share-btn:hover {
    border-color:var(--teal);color:var(--teal);
    box-shadow:0 4px 16px rgba(26,126,168,0.10);
  }

  .retake-row { text-align:center;margin-bottom:48px; }

  /* Trust strip results */
  .trust-strip-wide {
    display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-top:32px;
  }
  .trust-item-wide {
    background:var(--white);border-radius:12px;
    padding:24px;text-align:center;border:1.5px solid var(--border);
    box-shadow:0 2px 12px rgba(91,184,245,0.08);
    transition:transform .3s;
  }
  .trust-item-wide:hover { transform:translateY(-4px); }

  /* ── Responsive ── */
  @media(max-width:768px){
    .quiz-header-block { padding:100px 20px 40px; }
    .quiz-card-outer { padding:32px 16px; }
    .quiz-card-header { padding:20px; }
    .quiz-body { padding:20px; }
    .opts { grid-template-columns:1fr; }
    .trust-strip { grid-template-columns:1fr 1fr; }
    .results-body { padding:32px 16px 60px; }
    .results-hero { flex-direction:column;padding:24px;gap:24px; }
    .radar-wrap { flex-direction:column; }
    .rec-grid { grid-template-columns:1fr; }
    .trust-strip-wide { grid-template-columns:1fr 1fr; }
    .nutrient-section { padding:24px; }
    .radar-section { padding:24px; }
    .lab-section { padding:24px; }
  }
`;

// ─── Animated score ring ──────────────────────────────────────────────────────

function ScoreRing({ score }: { score: number }) {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const [animated, setAnimated] = useState(false);
  const offset = animated ? circumference - (score / 100) * circumference : circumference;

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 120);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="score-ring-wrap">
      <svg width="180" height="180" viewBox="0 0 180 180" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="90" cy="90" r={radius} fill="none" stroke="rgba(91,184,245,0.15)" strokeWidth="12" />
        <circle
          cx="90" cy="90" r={radius} fill="none"
          stroke="url(#scoreGrad)" strokeWidth="12" strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1.4s cubic-bezier(0.22,1,0.36,1)" }}
        />
        <defs>
          <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1A7EA8" />
            <stop offset="100%" stopColor="#5BB8F5" />
          </linearGradient>
        </defs>
      </svg>
      <div className="score-big">
        <span style={{ fontSize: 42, fontWeight: 600, letterSpacing: "-2px", color: "#0E2233", lineHeight: 1 }}>
          {score}
        </span>
        <span style={{ fontSize: 12, color: "#7A9BB0", marginTop: 4 }}>Vitality Score</span>
      </div>
    </div>
  );
}

// ─── Radar chart (SVG hexagon) ────────────────────────────────────────────────

const RADAR_COLORS = ["#FF6B35", "#5BB8F5", "#FF9CEE", "#43CBFF", "#C471F5", "#43E5F7", "#E85D75"];

function RadarChart({ scores }: { scores: Record<string, number> }) {
  const labels = Object.keys(scores);
  const values = Object.values(scores);
  const cx = 140, cy = 140, maxR = 110;
  const n = labels.length;

  const [animated, setAnimated] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 200);
    return () => clearTimeout(t);
  }, []);

  function polarToCart(angle: number, r: number): [number, number] {
    const rad = (angle - 90) * (Math.PI / 180);
    return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
  }

  const gridLevels = [0.25, 0.5, 0.75, 1];

  return (
    <svg width="280" height="280" viewBox="0 0 280 280">
      {/* Grid lines */}
      {gridLevels.map((lvl) => {
        const pts = Array.from({ length: n }, (_, i) => {
          const angle = (360 / n) * i;
          const [x, y] = polarToCart(angle, maxR * lvl);
          return `${x},${y}`;
        }).join(" ");
        return (
          <polygon
            key={lvl}
            points={pts}
            fill="none"
            stroke="rgba(91,184,245,0.15)"
            strokeWidth="1"
          />
        );
      })}

      {/* Axis lines */}
      {labels.map((_, i) => {
        const angle = (360 / n) * i;
        const [x, y] = polarToCart(angle, maxR);
        return (
          <line
            key={i}
            x1={cx} y1={cy} x2={x} y2={y}
            stroke="rgba(91,184,245,0.12)" strokeWidth="1"
          />
        );
      })}

      {/* Data polygon */}
      {(() => {
        const pts = values.map((v, i) => {
          const angle = (360 / n) * i;
          const r = animated ? (v / 100) * maxR : 0;
          const [x, y] = polarToCart(angle, r);
          return `${x},${y}`;
        }).join(" ");
        return (
          <>
            <polygon
              points={pts}
              fill="rgba(26,126,168,0.12)"
              stroke="var(--teal)"
              strokeWidth="2"
              style={{ transition: "all 1s cubic-bezier(0.22,1,0.36,1)" }}
            />
            {values.map((v, i) => {
              const angle = (360 / n) * i;
              const r = animated ? (v / 100) * maxR : 0;
              const [x, y] = polarToCart(angle, r);
              return (
                <circle
                  key={i} cx={x} cy={y} r="5"
                  fill={RADAR_COLORS[i]} stroke="#fff" strokeWidth="2"
                  style={{ transition: "all 1s cubic-bezier(0.22,1,0.36,1)" }}
                />
              );
            })}
          </>
        );
      })()}

      {/* Labels */}
      {labels.map((label, i) => {
        const angle = (360 / n) * i;
        const [x, y] = polarToCart(angle, maxR + 22);
        return (
          <text
            key={label}
            x={x} y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="var(--text-2)"
            fontSize="11"
            fontWeight="500"
            fontFamily="var(--font-display)"
          >
            {label}
          </text>
        );
      })}
    </svg>
  );
}

// ─── Animated deficit bar ─────────────────────────────────────────────────────

type NutrientBarItem = {
  label: string;
  risk: number;
  color: string;
  context: string;
};

function NutrientBar({ item, delay }: { item: NutrientBarItem; delay: number }) {
  const [animated, setAnimated] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  const riskLevel =
    item.risk >= 70 ? { text: "High Risk", bg: "#FFF0E8", color: "#D97706" }
    : item.risk >= 45 ? { text: "Moderate", bg: "#E6F1FB", color: "#1A5FA8" }
    : { text: "Low", bg: "#E5F5F3", color: "#0A7B6E" };

  return (
    <div className="def-row">
      <div className="def-label">
        <span>{item.label}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            className="def-risk-badge"
            style={{ background: riskLevel.bg, color: riskLevel.color }}
          >
            {riskLevel.text}
          </span>
          <span style={{ color: item.color, fontWeight: 600, minWidth: 32, textAlign: "right" }}>
            {item.risk}%
          </span>
        </div>
      </div>
      <div className="def-track">
        <div className="def-fill" style={{ width: animated ? `${item.risk}%` : "0%", background: item.color }} />
      </div>
      <div className="def-context">{item.context}</div>
    </div>
  );
}

// ─── Nutrient display data ────────────────────────────────────────────────────

const NUTRIENT_META: Record<string, { label: string; color: string; context: string }> = {
  vitaminD: { label: "Vitamin D", color: "#FFD93D", context: "Critical for bone health, immunity and mood regulation. Widespread deficiency across India." },
  vitaminB12: { label: "Vitamin B12", color: "#FF6B35", context: "Essential for nerve function, red blood cells and DNA synthesis. Plant-based diets are most at risk." },
  iron: { label: "Iron", color: "#E85D75", context: "Required for oxygen transport and energy metabolism. Women and athletes have higher requirements." },
  vitaminC: { label: "Vitamin C", color: "#43E5F7", context: "Powerful antioxidant, supports collagen synthesis and immune defence. Cannot be stored by the body." },
  zinc: { label: "Zinc", color: "#5BB8F5", context: "Immune function, wound healing and skin repair. Depleted by stress and poor diet." },
  magnesium: { label: "Magnesium", color: "#C471F5", context: "Involved in 300+ enzyme reactions including sleep, stress response and muscle function." },
  glutathione: { label: "Glutathione", color: "#FF9CEE", context: "The body's master antioxidant. Detoxifies cells, brightens skin and protects against oxidative damage." },
  nad: { label: "NAD+", color: "#43CBFF", context: "Declines ~50% between age 25 and 50. Critical for cellular energy, DNA repair and longevity pathways." },
  aminoAcids: { label: "Amino Acids", color: "#9708CC", context: "Building blocks of muscle tissue and neurotransmitters. Intense exercise dramatically increases demand." },
  electrolytes: { label: "Electrolytes", color: "#1A7EA8", context: "Regulate hydration, nerve signals and muscle contractions. Lost through sweat and inadequate intake." },
  vitaminA: { label: "Vitamin A", color: "#E8A838", context: "Essential for skin cell turnover, night vision and mucosal integrity. Rough, dry elbows/knees (keratosis pilaris) and poor night vision are hallmark signs." },
  vitaminB2: { label: "Vitamin B2 (Riboflavin)", color: "#FF8A65", context: "Drives cellular energy production and maintains mucous membranes. Cracked lip corners (angular cheilitis) and scaly scalp are classic deficiency signs." },
  omega3: { label: "Omega-3 Fatty Acids", color: "#26C6DA", context: "Anti-inflammatory essential fats critical for skin barrier function, joint health and brain. Dry skin, brittle nails and intimate dryness are early clinical signs." },
  insulinResistance: { label: "Insulin Resistance Risk", color: "#EF5350", context: "Darkened skin folds (acanthosis nigricans), skin tags and sugar cravings are early metabolic warning signs — often detectable years before blood sugar rises." },
  hormoneBalance: { label: "Hormone Balance", color: "#E85D75", context: "Reproductive hormones (testosterone, estrogen, progesterone) are built from zinc, vitamin D, omega-3 and cholesterol. Imbalances are among the most correctable nutritional issues." },
  folate: { label: "Folate (Vitamin B9)", color: "#66BB6A", context: "Critical for DNA synthesis, fertility and neural tube development. Deficiency causes mouth ulcers, fatigue and is the most important pre-conception nutrient for both genders." },
};

// ─── Main page component ──────────────────────────────────────────────────────

export default function HealthQuizPage() {
  const [state, setState] = useState<QuizState>({
    currentSection: 0,
    currentQ: 0,
    answers: {},
    completed: false,
  });
  const cardRef = useRef<HTMLDivElement>(null);

  // Get active questions for the current section
  const activeQuestions = useMemo(
    () => getSectionQuestions(state.currentSection, state.answers),
    [state.currentSection, state.answers]
  );

  const currentQuestion = activeQuestions[state.currentQ] ?? null;

  // Count total answered + remaining for progress
  const totalQuestionsEstimate = useMemo(() => {
    let count = 0;
    for (let s = 0; s < 9; s++) {
      count += getSectionQuestions(s, state.answers).length;
    }
    return count;
  }, [state.answers]);

  const answeredCount = useMemo(() => {
    let count = 0;
    for (let s = 0; s < state.currentSection; s++) {
      count += getSectionQuestions(s, state.answers).length;
    }
    count += state.currentQ;
    return count;
  }, [state.currentSection, state.currentQ, state.answers]);

  const progressPct = Math.round((answeredCount / Math.max(totalQuestionsEstimate, 1)) * 100);

  // ── Answer handlers ────────────────────────────────────────────────────────

  const setAnswer = useCallback((questionId: string, value: AnswerValue) => {
    setState((prev) => ({
      ...prev,
      answers: { ...prev.answers, [questionId]: value },
    }));
  }, []);

  const toggleMulti = useCallback((questionId: string, value: string) => {
    setState((prev) => {
      const current = (prev.answers[questionId] as string[] | undefined) ?? [];
      let next: string[];
      if (value === "none") {
        next = current.includes("none") ? [] : ["none"];
      } else {
        const without = current.filter((v) => v !== "none");
        next = without.includes(value)
          ? without.filter((v) => v !== value)
          : [...without, value];
      }
      return { ...prev, answers: { ...prev.answers, [questionId]: next } };
    });
  }, []);

  // ── Navigation ─────────────────────────────────────────────────────────────

  function canContinue(): boolean {
    if (!currentQuestion) return false;
    const q = currentQuestion;

    if (q.type === "compound" && q.compoundParts) {
      return q.compoundParts.every((part) => {
        const val = state.answers[part.id];
        return val !== null && val !== undefined;
      });
    }
    if (q.type === "slider") {
      return typeof state.answers[q.id] === "number";
    }
    if (q.type === "multi") {
      const val = state.answers[q.id];
      return Array.isArray(val) && val.length > 0;
    }
    return state.answers[q.id] !== null && state.answers[q.id] !== undefined;
  }

  function goNext() {
    if (!canContinue()) return;

    // Re-evaluate questions for this section after new answer
    const updatedSectionQs = getSectionQuestions(state.currentSection, state.answers);
    const nextQIdx = state.currentQ + 1;

    if (nextQIdx < updatedSectionQs.length) {
      setState((prev) => ({ ...prev, currentQ: nextQIdx }));
    } else {
      // Move to next section
      const nextSection = state.currentSection + 1;
      if (nextSection >= 9) {
        setState((prev) => ({ ...prev, completed: true }));
      } else {
        setState((prev) => ({ ...prev, currentSection: nextSection, currentQ: 0 }));
      }
    }
    setTimeout(() => cardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
  }

  function goBack() {
    if (state.currentQ > 0) {
      setState((prev) => ({ ...prev, currentQ: prev.currentQ - 1 }));
    } else if (state.currentSection > 0) {
      const prevSection = state.currentSection - 1;
      const prevQs = getSectionQuestions(prevSection, state.answers);
      setState((prev) => ({
        ...prev,
        currentSection: prevSection,
        currentQ: Math.max(0, prevQs.length - 1),
      }));
    }
    setTimeout(() => cardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
  }

  function resetQuiz() {
    setState({ currentSection: 0, currentQ: 0, answers: {}, completed: false });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ── Results computation ────────────────────────────────────────────────────

  const risks = useMemo(() => calcNutrientRisks(state.answers), [state.answers]);
  const vitalityScore = useMemo(() => calcVitalityScore(risks), [risks]);
  const categoryScores = useMemo(() => calcCategoryScores(risks), [risks]);
  const dripMatches = useMemo(() => matchDrips(risks), [risks]);
  const labPanel = useMemo(() => getLabPanel(risks, state.answers, categoryScores), [risks, state.answers, categoryScores]);

  const nutrientBars: NutrientBarItem[] = useMemo(() => {
    return (Object.entries(risks) as [keyof NutrientRisks, number][])
      .sort((a, b) => b[1] - a[1])
      .map(([key, risk]) => ({
        label: NUTRIENT_META[key].label,
        risk,
        color: NUTRIENT_META[key].color,
        context: NUTRIENT_META[key].context,
      }));
  }, [risks]);

  // ── RESULTS SCREEN ─────────────────────────────────────────────────────────

  if (state.completed) {
    const scoreLabel =
      vitalityScore >= 75 ? { text: "Strong Foundation", color: "#1A9E6A" }
      : vitalityScore >= 55 ? { text: "Good — Room to Optimise", color: "#1A7EA8" }
      : { text: "Significant Deficits Detected", color: "#D97706" };

    const topDrips = dripMatches.slice(0, 2);

    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: PAGE_CSS }} />
        <div className="quiz-page">
          <div className="quiz-header-block">
            <div className="hb-blob hb1" />
            <div className="hb-blob hb2" />
            <div className="qhb-inner">
              <p className="qhb-eyebrow">Your Results</p>
              <h1 className="qhb-title">Your <em>Vitality Profile</em></h1>
              <p className="qhb-sub">
                A comprehensive, evidence-based assessment based on {Object.keys(state.answers).length} data points from your responses.
              </p>
            </div>
          </div>

          <div className="results-body">
            {/* Vitality Score hero */}
            <div className="results-hero">
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                <ScoreRing score={vitalityScore} />
                <span className="rs-label" style={{ background: `${scoreLabel.color}18`, color: scoreLabel.color }}>
                  {scoreLabel.text}
                </span>
              </div>
              <div style={{ flex: 1 }}>
                <p className="result-title">Overall Vitality Score</p>
                <p className="result-sub">
                  Your score reflects the weighted average of your top nutrient deficiency risks.
                  A score below 60 suggests meaningful nutritional gaps that IV therapy can address
                  more effectively than oral supplements alone — bypassing gut absorption barriers
                  for 100% bioavailability.
                </p>
              </div>
            </div>

            {/* Radar chart */}
            <div className="radar-section">
              <h2 className="section-heading">Deficiency <em>Profile</em></h2>
              <p className="section-subheading">
                Six axes of health — higher values indicate greater areas of concern.
              </p>
              <div className="radar-wrap">
                <RadarChart scores={categoryScores} />
                <div className="radar-legend">
                  {Object.entries(categoryScores).map(([label, val], i) => (
                    <div key={label} className="radar-leg-item">
                      <div className="radar-leg-dot" style={{ background: RADAR_COLORS[i] }} />
                      <span>{label}</span>
                      <span className="radar-leg-val">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Nutrient risk bars */}
            <div className="nutrient-section">
              <h2 className="section-heading">Top Nutrient <em>Deficiency Risks</em></h2>
              <p className="section-subheading">
                Ranked by estimated depletion risk. Clinical context explains why each nutrient matters for your profile.
              </p>
              {nutrientBars.map((bar, i) => (
                <NutrientBar key={bar.label} item={bar} delay={200 + i * 100} />
              ))}
            </div>

            {/* Recommended drips */}
            <h2 className="section-heading">
              Your Recommended <em>Formulas</em>
            </h2>
            <div className="rec-grid">
              {topDrips.map((match, i) => (
                <div key={match.drip.id} className={`rec-card${i === 0 ? " primary" : ""}`}>
                  {i === 0 && <div className="rec-top-badge">Best Match</div>}
                  {i === 1 && <div className="rec-top-badge" style={{ background: "rgba(91,184,245,0.08)", color: "var(--text-2)" }}>Secondary</div>}
                  <div className="rec-icon-row">
                    <div className="rec-icon-box">{match.drip.icon}</div>
                    <div>
                      <div className="rec-name">{match.drip.name}</div>
                      <div className="rec-sub">{match.drip.subtitle}</div>
                    </div>
                  </div>
                  <p className="rec-match-pct">{match.matchPct}% match for your profile</p>
                  <p className="rec-desc">{match.drip.description}</p>
                  {match.reasons.length > 0 && (
                    <div className="rec-reasons">
                      {match.reasons.map((r) => (
                        <div key={r} className="rec-reason">{r}</div>
                      ))}
                    </div>
                  )}
                  <div className="rec-tags">
                    {match.drip.tags.slice(0, 4).map((t) => (
                      <span key={t} className="rec-tag">{t}</span>
                    ))}
                  </div>
                  <div className="rec-price-row">
                    <div className="rec-price">
                      ₹{match.drip.price.toLocaleString("en-IN")}
                      <span>/ session</span>
                    </div>
                    <Link
                      href={`/book-now?drip=${match.drip.name}`}
                      className={`big-book-btn${i !== 0 ? " secondary" : ""}`}
                    >
                      Book Now →
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Lab test recommendations */}
            <div className="lab-section">
              <h2 className="section-heading">Recommended <em>Lab Tests</em></h2>
              <p className="section-subheading">
                We recommend completing these tests before your first drip session.
                Results help your physician and our clinical team personalise your protocol.
              </p>

              <div className="lab-tier">
                <div className="lab-tier-header">
                  <span className="lab-tier-badge essential">Essential</span>
                  <span className="lab-tier-label">Recommended for everyone</span>
                </div>
                <div className="lab-tests">
                  {labPanel.essential.map((test) => (
                    <div key={test.name} className="lab-test-card">
                      <div className="lab-test-name">{test.name}</div>
                      <div className="lab-test-reason">{test.reason}</div>
                    </div>
                  ))}
                </div>
              </div>

              {labPanel.recommended.length > 0 && (
                <div className="lab-tier">
                  <div className="lab-tier-header">
                    <span className="lab-tier-badge recommended">Recommended</span>
                    <span className="lab-tier-label">Based on your risk profile</span>
                  </div>
                  <div className="lab-tests">
                    {labPanel.recommended.map((test) => (
                      <div key={test.name} className="lab-test-card">
                        <div className="lab-test-name">{test.name}</div>
                        <div className="lab-test-reason">{test.reason}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {labPanel.optional.length > 0 && (
                <div className="lab-tier">
                  <div className="lab-tier-header">
                    <span className="lab-tier-badge optional">Optional</span>
                    <span className="lab-tier-label">For deeper investigation</span>
                  </div>
                  <div className="lab-tests">
                    {labPanel.optional.map((test) => (
                      <div key={test.name} className="lab-test-card">
                        <div className="lab-test-name">{test.name}</div>
                        <div className="lab-test-reason">{test.reason}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Consult a Doctor CTA */}
            <div style={{
              background: "linear-gradient(135deg, #0F5C7D 0%, #1A7EA8 50%, #3A9EC4 100%)",
              borderRadius: "var(--radius)", padding: "48px", textAlign: "center",
              marginBottom: 32, position: "relative", overflow: "hidden",
            }}>
              <div style={{
                position: "absolute", top: -60, right: -60, width: 200, height: 200,
                borderRadius: "50%", background: "rgba(255,255,255,0.08)", pointerEvents: "none",
              }} />
              <div style={{
                position: "absolute", bottom: -40, left: "10%", width: 140, height: 140,
                borderRadius: "50%", background: "rgba(255,255,255,0.05)", pointerEvents: "none",
              }} />
              <div style={{ position: "relative", zIndex: 2 }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>👨‍⚕️</div>
                <h2 style={{
                  fontSize: "clamp(22px, 3vw, 28px)", fontWeight: 600, color: "#fff",
                  letterSpacing: "-0.5px", marginBottom: 10,
                }}>
                  Discuss Your Results with a Doctor
                </h2>
                <p style={{
                  fontSize: 14, color: "rgba(255,255,255,0.80)", lineHeight: 1.7,
                  maxWidth: 480, margin: "0 auto 24px",
                }}>
                  Your quiz identified {nutrientBars.filter((b) => b.risk >= 45).length} areas of concern.
                  A physician can review your lab results, confirm deficiencies and create a personalised
                  IV therapy + supplement protocol.
                </p>
                <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                  <Link
                    href="/consult"
                    style={{
                      display: "inline-block", background: "#fff", color: "var(--teal)",
                      padding: "14px 32px", borderRadius: 50, fontSize: 14, fontWeight: 600,
                      textDecoration: "none", fontFamily: "var(--font-display)",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                      transition: "transform .2s, box-shadow .2s",
                    }}
                  >
                    Book Doctor Consultation →
                  </Link>
                  <Link
                    href={`/book-now?drip=${topDrips[0]?.drip.name}`}
                    style={{
                      display: "inline-block",
                      background: "rgba(255,255,255,0.15)", color: "#fff",
                      border: "1.5px solid rgba(255,255,255,0.4)",
                      padding: "14px 32px", borderRadius: 50, fontSize: 14, fontWeight: 500,
                      textDecoration: "none", fontFamily: "var(--font-display)",
                      backdropFilter: "blur(8px)",
                      transition: "background .2s, transform .2s",
                    }}
                  >
                    Book IV Therapy Directly
                  </Link>
                </div>
              </div>
            </div>

            {/* Share + retake */}
            <div className="share-row">
              <button className="share-btn" onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: "My NutriDrip Vitality Profile", text: `My Vitality Score: ${vitalityScore}/100. Top recommendation: ${topDrips[0]?.drip.name}`, url: window.location.href });
                }
              }}>
                📋 Share with your physician
              </button>
            </div>

            <div className="retake-row">
              <button
                onClick={resetQuiz}
                style={{
                  background: "transparent", border: "none", cursor: "pointer",
                  color: "#7A9BB0", fontSize: 14, fontFamily: "var(--font-display)",
                }}
              >
                ← Retake the quiz
              </button>
            </div>

            {/* Trust strip */}
            <div className="trust-strip-wide">
              {TRUST_ITEMS.map((c) => (
                <div key={c.title} className="trust-item-wide">
                  <div className="t-icon">{c.icon}</div>
                  <div className="t-title">{c.title}</div>
                  <div className="t-desc">{c.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  // ── QUIZ SCREEN ────────────────────────────────────────────────────────────

  if (!currentQuestion) return null;

  const q = currentQuestion;
  const isFirst = state.currentSection === 0 && state.currentQ === 0;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: PAGE_CSS }} />
      <div className="quiz-page">
        {/* Page header */}
        <div className="quiz-header-block">
          <div className="hb-blob hb1" />
          <div className="hb-blob hb2" />
          <div className="qhb-inner">
            <p className="qhb-eyebrow">Personalised Assessment</p>
            <h1 className="qhb-title">Find Your <em>Perfect Formula</em></h1>
            <p className="qhb-sub">
              {totalQuestionsEstimate} adaptive questions · Evidence-based scoring · Lab test recommendations
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="quiz-card-outer">
          <div ref={cardRef} style={{ width: "100%", maxWidth: 800 }}>
            <div className="quiz-card">
              {/* Header with section progress */}
              <div className="quiz-card-header">
                <div className="qch-section-name">
                  Section {state.currentSection + 1} of 9 — {SECTION_NAMES[state.currentSection]}
                </div>

                {/* Section dots */}
                <div className="section-dots">
                  {SECTION_NAMES.map((_, i) => {
                    const status = i < state.currentSection ? "done" : i === state.currentSection ? "current" : "future";
                    return (
                      <div
                        key={i}
                        className={`section-dot ${status}`}
                        style={{ flex: i === state.currentSection ? 3 : 1 }}
                      />
                    );
                  })}
                </div>

                {/* Overall progress */}
                <div className="qch-row">
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${progressPct}%` }} />
                  </div>
                  <span className="qch-count">{Math.round(progressPct)}%</span>
                </div>

                <div className="qch-title">{q.label}</div>
                <div className="q-hint">{q.sub}</div>
              </div>

              {/* Body */}
              <div className="quiz-body">
                {/* Single select */}
                {q.type === "single" && q.options && (
                  <div className={`opts${(q.options.length % 2 !== 0 || q.options.length <= 3) ? " single-col" : ""}`}>
                    {q.options.map((opt) => {
                      const selected = state.answers[q.id] === opt.value;
                      return (
                        <button
                          key={opt.value}
                          className={`opt${selected ? " sel" : ""}`}
                          onClick={() => setAnswer(q.id, opt.value)}
                        >
                          {opt.icon && <span className="opt-icon">{opt.icon}</span>}
                          <span className="opt-label">{opt.label}</span>
                          {selected && (
                            <span className="opt-check">
                              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                <path d="M2.5 6L5 8.5L9.5 4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Multi select */}
                {q.type === "multi" && q.options && (
                  <div className="opts">
                    {q.options.map((opt) => {
                      const arr = (state.answers[q.id] as string[] | undefined) ?? [];
                      const selected = arr.includes(opt.value);
                      return (
                        <button
                          key={opt.value}
                          className={`opt${selected ? " sel" : ""}`}
                          onClick={() => toggleMulti(q.id, opt.value)}
                        >
                          {opt.icon && <span className="opt-icon">{opt.icon}</span>}
                          <span className="opt-label">{opt.label}</span>
                          <span className="opt-checkbox">
                            {selected && (
                              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                <path d="M2.5 6L5 8.5L9.5 4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            )}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Slider */}
                {q.type === "slider" && (
                  <div className="slider-section">
                    <div className="slider-labels">
                      <span>{q.id === "fatigue" ? "Full energy" : "Calm & relaxed"}</span>
                      <span>{q.id === "fatigue" ? "Completely drained" : "Extremely stressed"}</span>
                    </div>
                    <input
                      type="range"
                      className="quiz-range"
                      min={q.min ?? 1}
                      max={q.max ?? 10}
                      value={typeof state.answers[q.id] === "number" ? (state.answers[q.id] as number) : 5}
                      onChange={(e) => setAnswer(q.id, parseInt(e.target.value))}
                    />
                    <div className="slider-dots">
                      {Array.from({ length: (q.max ?? 10) - (q.min ?? 1) + 1 }, (_, i) => {
                        const val = (q.min ?? 1) + i;
                        const isActive = typeof state.answers[q.id] === "number" && state.answers[q.id] === val;
                        return (
                          <button
                            key={val}
                            className={`slider-dot${isActive ? " active" : ""}`}
                            onClick={() => setAnswer(q.id, val)}
                          >
                            {val}
                          </button>
                        );
                      })}
                    </div>
                    <div className="slider-val">
                      {typeof state.answers[q.id] === "number" ? state.answers[q.id] as number : "–"}
                      <span>/ {q.max ?? 10}</span>
                    </div>
                  </div>
                )}

                {/* Compound question */}
                {q.type === "compound" && q.compoundParts && (
                  <div>
                    {q.compoundParts.map((part) => (
                      <div key={part.id} className="compound-part">
                        <div className="compound-label">{part.label}</div>
                        {part.type === "single" && part.options && (
                          <div className="opts single-col">
                            {part.options.map((opt) => {
                              const selected = state.answers[part.id] === opt.value;
                              return (
                                <button
                                  key={opt.value}
                                  className={`opt${selected ? " sel" : ""}`}
                                  onClick={() => setAnswer(part.id, opt.value)}
                                >
                                  <span className="opt-label">{opt.label}</span>
                                  {selected && (
                                    <span className="opt-check">
                                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                        <path d="M2.5 6L5 8.5L9.5 4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                      </svg>
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Navigation */}
                <div className="q-nav">
                  {!isFirst && (
                    <button className="btn-back" onClick={goBack}>← Back</button>
                  )}
                  <button
                    className="btn-next"
                    disabled={!canContinue()}
                    onClick={goNext}
                  >
                    {state.currentSection === 8 && state.currentQ === activeQuestions.length - 1
                      ? "See My Results →"
                      : "Continue →"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Trust strip */}
          <div className="trust-strip">
            {TRUST_ITEMS.map((c) => (
              <div key={c.title} className="trust-item">
                <div className="t-icon">{c.icon}</div>
                <div className="t-title">{c.title}</div>
                <div className="t-desc">{c.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
