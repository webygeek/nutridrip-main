"use client";

import { useEffect, useState } from "react";

// ─── Content store ─────────────────────────────────────────────────────────
// A content management layer. Every editable string / image / list on the
// frontend can be registered here. The Studio UI reads the registry to
// render an editor, and pages use `useContent(key)` to fetch the current
// value (override from localStorage, or default).
//
// To make a new screen editable:
//   1. Register the screen + blocks in CONTENT_REGISTRY below
//   2. In the component, replace hardcoded text with `useContent("key")`
// ───────────────────────────────────────────────────────────────────────────

const STORAGE_KEY = "nutridrip_content_overrides";
const EVENT_NAME = "nutridrip_content_change";

export type ContentBlock =
  | { type: "text"; key: string; label: string; hint?: string; defaultValue: string; multiline?: boolean }
  | { type: "image"; key: string; label: string; hint?: string; defaultValue: string }
  | { type: "list"; key: string; label: string; hint?: string; defaultValue: string[] }
  | { type: "color"; key: string; label: string; hint?: string; defaultValue: string };

export type ContentSection = {
  id: string;
  label: string;
  icon: string;
  blocks: ContentBlock[];
};

export type ScreenConfig = {
  route: string;
  label: string;
  icon: string;
  sections: ContentSection[];
};

export const CONTENT_REGISTRY: ScreenConfig[] = [
  {
    route: "/",
    label: "Home Page",
    icon: "🏠",
    sections: [
      {
        id: "hero",
        label: "Hero Section",
        icon: "✨",
        blocks: [
          { type: "text", key: "home.hero.badge", label: "Top Badge Text", defaultValue: "Premium IV Wellness" },
          { type: "text", key: "home.hero.title", label: "Hero Title", defaultValue: "Premium IV Therapy", hint: "Main H1 on homepage" },
          { type: "text", key: "home.hero.title_em", label: "Hero Title Accent (italic)", defaultValue: "Delivered", hint: "The italic-serif emphasis word" },
          { type: "text", key: "home.hero.subtitle", label: "Hero Subtitle", defaultValue: "Physician-formulated, nurse-administered, results guaranteed. IV therapy delivered to your home, office, or our clinic.", multiline: true },
          { type: "text", key: "home.hero.cta_primary", label: "Primary CTA Button", defaultValue: "Book a Session" },
          { type: "text", key: "home.hero.cta_secondary", label: "Secondary CTA Button", defaultValue: "Take Health Quiz" },
        ],
      },
      {
        id: "drips",
        label: "Signature Drips Section",
        icon: "💧",
        blocks: [
          { type: "text", key: "home.drips.eyebrow", label: "Section Eyebrow", defaultValue: "Our Formulas" },
          { type: "text", key: "home.drips.title", label: "Section Title", defaultValue: "Signature" },
          { type: "text", key: "home.drips.title_em", label: "Section Title Accent", defaultValue: "Drips" },
          { type: "text", key: "home.drips.subtitle", label: "Section Subtitle", defaultValue: "Each formula crafted by leading physicians, compounded in our ISO-certified pharmacy.", multiline: true },
        ],
      },
    ],
  },
  {
    route: "/consult",
    label: "Doctor Consultation Page",
    icon: "👨‍⚕️",
    sections: [
      {
        id: "hero",
        label: "Hero Section",
        icon: "✨",
        blocks: [
          { type: "text", key: "consult.hero.title", label: "Hero Title", defaultValue: "Doctor" },
          { type: "text", key: "consult.hero.title_em", label: "Hero Title Accent", defaultValue: "Consultation" },
          { type: "text", key: "consult.hero.subtitle", label: "Hero Subtitle", multiline: true, defaultValue: "Tell us your health concerns, review recommended lab investigations, and book a physician consultation — all in one seamless flow." },
        ],
      },
    ],
  },
  {
    route: "/book-now",
    label: "Book Now Page",
    icon: "📅",
    sections: [
      {
        id: "hero",
        label: "Hero Section",
        icon: "✨",
        blocks: [
          { type: "text", key: "booknow.hero.title", label: "Hero Title", defaultValue: "Book Your" },
          { type: "text", key: "booknow.hero.title_em", label: "Hero Title Accent", defaultValue: "IV Session" },
          { type: "text", key: "booknow.hero.subtitle", label: "Hero Subtitle", multiline: true, defaultValue: "Physician-approved, nurse-administered IV therapy delivered to your world." },
        ],
      },
    ],
  },
  {
    route: "/health-quiz",
    label: "Health Quiz Page",
    icon: "📋",
    sections: [
      {
        id: "hero",
        label: "Hero Section",
        icon: "✨",
        blocks: [
          { type: "text", key: "quiz.hero.eyebrow", label: "Top Eyebrow Text", defaultValue: "Personalised Assessment" },
          { type: "text", key: "quiz.hero.title", label: "Hero Title", defaultValue: "Find Your" },
          { type: "text", key: "quiz.hero.title_em", label: "Hero Title Accent", defaultValue: "Perfect Formula" },
        ],
      },
    ],
  },
  {
    route: "/treatments",
    label: "Treatments Page",
    icon: "💉",
    sections: [
      {
        id: "hero",
        label: "Hero Section",
        icon: "✨",
        blocks: [
          { type: "text", key: "treatments.hero.title", label: "Hero Title", defaultValue: "Our Signature" },
          { type: "text", key: "treatments.hero.title_em", label: "Hero Title Accent", defaultValue: "Drips" },
          { type: "text", key: "treatments.hero.subtitle", label: "Hero Subtitle", multiline: true, defaultValue: "Physician-formulated IV therapies. Choose by goal, browse ingredients, read evidence — all before you book." },
        ],
      },
    ],
  },
  {
    route: "/about",
    label: "About Us Page",
    icon: "🏢",
    sections: [
      {
        id: "hero",
        label: "Hero Section",
        icon: "✨",
        blocks: [
          { type: "text", key: "about.hero.title", label: "Hero Title", defaultValue: "We Believe in" },
          { type: "text", key: "about.hero.title_em", label: "Hero Title Accent", defaultValue: "Science" },
          { type: "text", key: "about.hero.title_end", label: "Hero Title End", defaultValue: "Delivered with Care" },
          { type: "text", key: "about.hero.subtitle", label: "Hero Subtitle", multiline: true, defaultValue: "NutriDrip was founded by physicians who believed optimal cellular nutrition should be accessible to everyone — not just elite athletes or hospital patients." },
        ],
      },
      {
        id: "stats",
        label: "Stats Row",
        icon: "📊",
        blocks: [
          { type: "text", key: "about.stat1.value", label: "Stat 1 — Value", defaultValue: "12400" },
          { type: "text", key: "about.stat1.label", label: "Stat 1 — Label", defaultValue: "Clients Served" },
          { type: "text", key: "about.stat2.value", label: "Stat 2 — Value", defaultValue: "99.2" },
          { type: "text", key: "about.stat2.label", label: "Stat 2 — Label", defaultValue: "Satisfaction Rate" },
          { type: "text", key: "about.stat3.value", label: "Stat 3 — Value", defaultValue: "42" },
          { type: "text", key: "about.stat3.label", label: "Stat 3 — Label", defaultValue: "Clinic Partners" },
          { type: "text", key: "about.stat4.value", label: "Stat 4 — Value", defaultValue: "6" },
          { type: "text", key: "about.stat4.label", label: "Stat 4 — Label", defaultValue: "IV Formulas" },
          { type: "text", key: "about.stat5.value", label: "Stat 5 — Value", defaultValue: "5" },
          { type: "text", key: "about.stat5.label", label: "Stat 5 — Label", defaultValue: "Cities Active" },
        ],
      },
      {
        id: "mission",
        label: "Mission Section",
        icon: "🎯",
        blocks: [
          { type: "text", key: "about.mission.eyebrow", label: "Section Eyebrow", defaultValue: "Our Mission" },
          { type: "text", key: "about.mission.title", label: "Mission Title", defaultValue: "Making Optimal Health" },
          { type: "text", key: "about.mission.title_em", label: "Mission Title Accent", defaultValue: "Accessible" },
          { type: "text", key: "about.mission.quote", label: "Founder Quote", multiline: true, defaultValue: "We started NutriDrip because the gap between what science knows and what people receive was too wide. IV micronutrient therapy works — but it was locked behind hospital walls and celebrity clinics. We changed that." },
          { type: "text", key: "about.mission.body", label: "Mission Body Text", multiline: true, defaultValue: "Our protocols are built on published clinical evidence. Every formula is reviewed by a board-certified physician, compounded in our ISO-certified pharmacy, administered by trained nurses, and monitored for outcomes. We don't guess. We measure." },
        ],
      },
      {
        id: "values",
        label: "Core Values (4 cards)",
        icon: "💎",
        blocks: [
          { type: "text", key: "about.value1.title", label: "Value 1 — Title", defaultValue: "Science First" },
          { type: "text", key: "about.value1.desc", label: "Value 1 — Description", defaultValue: "Every protocol backed by peer-reviewed research. No trends, no hype — just evidence." },
          { type: "text", key: "about.value2.title", label: "Value 2 — Title", defaultValue: "Client Trust" },
          { type: "text", key: "about.value2.desc", label: "Value 2 — Description", defaultValue: "Transparent pricing, honest consultations, and results you can feel. We earn trust, not demand it." },
          { type: "text", key: "about.value3.title", label: "Value 3 — Title", defaultValue: "Real Results" },
          { type: "text", key: "about.value3.desc", label: "Value 3 — Description", defaultValue: "100% bioavailability. Clinical-grade nutrients. Physician oversight. Results from session one." },
          { type: "text", key: "about.value4.title", label: "Value 4 — Title", defaultValue: "Genuine Care" },
          { type: "text", key: "about.value4.desc", label: "Value 4 — Description", defaultValue: "24-hour follow-up calls. Personalised protocols. We treat people, not numbers." },
        ],
      },
      {
        id: "story",
        label: "Our Story Timeline",
        icon: "📖",
        blocks: [
          { type: "text", key: "about.story.eyebrow", label: "Section Eyebrow", defaultValue: "Our Story" },
          { type: "text", key: "about.story.title", label: "Section Title", defaultValue: "The Journey" },
          { type: "text", key: "about.story.title_em", label: "Section Title Accent", defaultValue: "So Far" },
          { type: "text", key: "about.story.y1.year", label: "Timeline 1 — Year", defaultValue: "2021" },
          { type: "text", key: "about.story.y1.title", label: "Timeline 1 — Title", defaultValue: "The Idea" },
          { type: "text", key: "about.story.y1.desc", label: "Timeline 1 — Description", multiline: true, defaultValue: "Three physicians in Hyderabad identified a gap: IV micronutrient therapy was proven but inaccessible outside hospitals." },
          { type: "text", key: "about.story.y2.year", label: "Timeline 2 — Year", defaultValue: "2022" },
          { type: "text", key: "about.story.y2.title", label: "Timeline 2 — Title", defaultValue: "First Clinic" },
          { type: "text", key: "about.story.y2.desc", label: "Timeline 2 — Description", multiline: true, defaultValue: "Opened our first clinic in Banjara Hills with 3 formulas and a team of 4." },
          { type: "text", key: "about.story.y3.year", label: "Timeline 3 — Year", defaultValue: "2023" },
          { type: "text", key: "about.story.y3.title", label: "Timeline 3 — Title", defaultValue: "Home Delivery" },
          { type: "text", key: "about.story.y3.desc", label: "Timeline 3 — Description", multiline: true, defaultValue: "Launched home-visit IV therapy across Hyderabad. 2,000 sessions in the first 6 months." },
          { type: "text", key: "about.story.y4.year", label: "Timeline 4 — Year", defaultValue: "2024" },
          { type: "text", key: "about.story.y4.title", label: "Timeline 4 — Title", defaultValue: "Multi-City" },
          { type: "text", key: "about.story.y4.desc", label: "Timeline 4 — Description", multiline: true, defaultValue: "Expanded to Mumbai, Bangalore, and Chennai. Launched the Health Quiz and partner clinic programme." },
          { type: "text", key: "about.story.y5.year", label: "Timeline 5 — Year", defaultValue: "2025" },
          { type: "text", key: "about.story.y5.title", label: "Timeline 5 — Title", defaultValue: "Today" },
          { type: "text", key: "about.story.y5.desc", label: "Timeline 5 — Description", multiline: true, defaultValue: "42 partner clinics, 12,000+ clients, 6 signature drips, and a physician-approved platform trusted across India." },
        ],
      },
      {
        id: "team",
        label: "Team Members",
        icon: "👥",
        blocks: [
          { type: "text", key: "about.team.eyebrow", label: "Section Eyebrow", defaultValue: "Leadership" },
          { type: "text", key: "about.team.title", label: "Section Title", defaultValue: "The Team Behind" },
          { type: "text", key: "about.team.title_em", label: "Section Title Accent", defaultValue: "NutriDrip" },
          { type: "text", key: "about.team1.name", label: "Member 1 — Name", defaultValue: "Dr. Arjun Menon" },
          { type: "text", key: "about.team1.role", label: "Member 1 — Role", defaultValue: "Co-Founder & Chief Medical Officer" },
          { type: "text", key: "about.team1.bio", label: "Member 1 — Bio", multiline: true, defaultValue: "Internal Medicine, 14 years. Designed every NutriDrip protocol. Former Apollo Hospitals consultant." },
          { type: "image", key: "about.team1.photo", label: "Member 1 — Photo", defaultValue: "", hint: "Upload headshot (PNG/JPG, max 500KB)" },
          { type: "text", key: "about.team2.name", label: "Member 2 — Name", defaultValue: "Priya Sharma" },
          { type: "text", key: "about.team2.role", label: "Member 2 — Role", defaultValue: "Co-Founder & CEO" },
          { type: "text", key: "about.team2.bio", label: "Member 2 — Bio", multiline: true, defaultValue: "MBA, IIM-A. Previously led health-tech ops at Practo. Scaled NutriDrip from 1 to 5 cities." },
          { type: "image", key: "about.team2.photo", label: "Member 2 — Photo", defaultValue: "", hint: "Upload headshot" },
          { type: "text", key: "about.team3.name", label: "Member 3 — Name", defaultValue: "Dr. Kavya Mehra" },
          { type: "text", key: "about.team3.role", label: "Member 3 — Role", defaultValue: "Head of Clinical Operations" },
          { type: "text", key: "about.team3.bio", label: "Member 3 — Bio", multiline: true, defaultValue: "MD Internal Medicine, Fellowship IV Therapy. Oversees protocol approval and nurse training." },
          { type: "image", key: "about.team3.photo", label: "Member 3 — Photo", defaultValue: "", hint: "Upload headshot" },
          { type: "text", key: "about.team4.name", label: "Member 4 — Name", defaultValue: "Rohan Das" },
          { type: "text", key: "about.team4.role", label: "Member 4 — Role", defaultValue: "Head of Pharmacy & Quality" },
          { type: "text", key: "about.team4.bio", label: "Member 4 — Bio", multiline: true, defaultValue: "M.Pharm, 10 years compounding. Manages our ISO-certified pharmacy and supply chain." },
          { type: "image", key: "about.team4.photo", label: "Member 4 — Photo", defaultValue: "", hint: "Upload headshot" },
        ],
      },
      {
        id: "certs",
        label: "Certifications",
        icon: "🏆",
        blocks: [
          { type: "text", key: "about.certs.eyebrow", label: "Section Eyebrow", defaultValue: "Certifications" },
          { type: "text", key: "about.certs.title", label: "Section Title", defaultValue: "Certified" },
          { type: "text", key: "about.certs.title_em", label: "Section Title Accent", defaultValue: "Excellence" },
          { type: "text", key: "about.cert1.title", label: "Cert 1 — Title", defaultValue: "ISO 9001:2015" },
          { type: "text", key: "about.cert1.desc", label: "Cert 1 — Description", defaultValue: "Quality management system certified for pharmaceutical compounding." },
          { type: "text", key: "about.cert2.title", label: "Cert 2 — Title", defaultValue: "GMP Certified" },
          { type: "text", key: "about.cert2.desc", label: "Cert 2 — Description", defaultValue: "Good Manufacturing Practice compliance across all production." },
          { type: "text", key: "about.cert3.title", label: "Cert 3 — Title", defaultValue: "HIPAA Compliant" },
          { type: "text", key: "about.cert3.desc", label: "Cert 3 — Description", defaultValue: "Patient data protected to international healthcare privacy standards." },
          { type: "text", key: "about.cert4.title", label: "Cert 4 — Title", defaultValue: "CDSCO Registered" },
          { type: "text", key: "about.cert4.desc", label: "Cert 4 — Description", defaultValue: "Registered with India's Central Drugs Standard Control Organisation." },
        ],
      },
      {
        id: "cta",
        label: "CTA Section",
        icon: "🚀",
        blocks: [
          { type: "text", key: "about.cta.title", label: "CTA Heading", defaultValue: "Ready to experience the difference?" },
          { type: "text", key: "about.cta.body", label: "CTA Body", multiline: true, defaultValue: "Join thousands of clients who trust NutriDrip for science-backed IV therapy delivered with genuine care." },
          { type: "text", key: "about.cta.btn_primary", label: "Primary Button", defaultValue: "Book a Session" },
          { type: "text", key: "about.cta.btn_secondary", label: "Secondary Button", defaultValue: "Take Health Quiz" },
        ],
      },
    ],
  },
  {
    route: "/how-it-works",
    label: "How It Works Page",
    icon: "⚙️",
    sections: [
      {
        id: "hero",
        label: "Hero Section",
        icon: "✨",
        blocks: [
          { type: "text", key: "hiw.hero.title", label: "Hero Title", defaultValue: "Simple, Safe &" },
          { type: "text", key: "hiw.hero.title_em", label: "Hero Title Accent", defaultValue: "Science-Led" },
          { type: "text", key: "hiw.hero.subtitle", label: "Hero Subtitle", multiline: true, defaultValue: "From your first health quiz to your 24-hour follow-up call — every step is physician-approved, nurse-administered, and built on evidence." },
        ],
      },
      {
        id: "cta",
        label: "CTA Section",
        icon: "🚀",
        blocks: [
          { type: "text", key: "hiw.cta.title", label: "CTA Heading", defaultValue: "Ready to feel the difference?" },
          { type: "text", key: "hiw.cta.body", label: "CTA Body", multiline: true, defaultValue: "Book your first session in under 3 minutes. Physician-approved, nurse-delivered, results guaranteed." },
        ],
      },
    ],
  },
  {
    route: "/for-clinics",
    label: "For Clinics Page",
    icon: "🏥",
    sections: [
      {
        id: "hero",
        label: "Hero Section",
        icon: "✨",
        blocks: [
          { type: "text", key: "clinics.hero.title", label: "Hero Title", defaultValue: "Offer" },
          { type: "text", key: "clinics.hero.title_em", label: "Hero Title Accent", defaultValue: "IV Therapy" },
          { type: "text", key: "clinics.hero.title_end", label: "Hero Title End", defaultValue: "in Your Clinic" },
          { type: "text", key: "clinics.hero.subtitle", label: "Hero Subtitle", multiline: true, defaultValue: "Partner with NutriDrip to add premium IV therapy to your clinic's services. Wholesale pricing, physician protocols, nurse training — we handle everything." },
        ],
      },
    ],
  },
  {
    route: "/faqs",
    label: "FAQs Page",
    icon: "❓",
    sections: [
      {
        id: "hero",
        label: "Hero Section",
        icon: "✨",
        blocks: [
          { type: "text", key: "faqs.hero.title", label: "Hero Title", defaultValue: "Got Questions?" },
          { type: "text", key: "faqs.hero.title_em", label: "Hero Title Accent", defaultValue: "We've Got Answers" },
          { type: "text", key: "faqs.hero.subtitle", label: "Hero Subtitle", multiline: true, defaultValue: "Everything you need to know about IV therapy, our process, safety, and pricing." },
        ],
      },
    ],
  },
  {
    route: "/drip-images",
    label: "Drip Images & Backgrounds",
    icon: "🖼️",
    sections: [
      {
        id: "velocity",
        label: "Velocity Drip",
        icon: "⚡",
        blocks: [
          { type: "image", key: "drip.velocity.hero_bg", label: "Hero Background Image", defaultValue: "", hint: "Background for the Velocity detail page hero" },
          { type: "image", key: "drip.velocity.main_image", label: "Main Product Image", defaultValue: "", hint: "Product photo / IV bag illustration" },
        ],
      },
      {
        id: "luminescence",
        label: "Luminescence Drip",
        icon: "✦",
        blocks: [
          { type: "image", key: "drip.luminescence.hero_bg", label: "Hero Background Image", defaultValue: "" },
          { type: "image", key: "drip.luminescence.main_image", label: "Main Product Image", defaultValue: "" },
        ],
      },
      {
        id: "fortress",
        label: "Fortress Drip",
        icon: "🛡️",
        blocks: [
          { type: "image", key: "drip.fortress.hero_bg", label: "Hero Background Image", defaultValue: "" },
          { type: "image", key: "drip.fortress.main_image", label: "Main Product Image", defaultValue: "" },
        ],
      },
      {
        id: "hydraflux",
        label: "Hydraflux Drip",
        icon: "🌊",
        blocks: [
          { type: "image", key: "drip.hydraflux.hero_bg", label: "Hero Background Image", defaultValue: "" },
          { type: "image", key: "drip.hydraflux.main_image", label: "Main Product Image", defaultValue: "" },
        ],
      },
      {
        id: "apex",
        label: "Apex Drip",
        icon: "🏋️",
        blocks: [
          { type: "image", key: "drip.apex.hero_bg", label: "Hero Background Image", defaultValue: "" },
          { type: "image", key: "drip.apex.main_image", label: "Main Product Image", defaultValue: "" },
        ],
      },
      {
        id: "cognitas",
        label: "Cognitas Drip",
        icon: "🧠",
        blocks: [
          { type: "image", key: "drip.cognitas.hero_bg", label: "Hero Background Image", defaultValue: "" },
          { type: "image", key: "drip.cognitas.main_image", label: "Main Product Image", defaultValue: "" },
        ],
      },
    ],
  },
  {
    route: "/globals",
    label: "Global Brand",
    icon: "🎨",
    sections: [
      {
        id: "brand",
        label: "Brand Identity",
        icon: "🖼️",
        blocks: [
          { type: "text", key: "brand.name", label: "Brand Name", defaultValue: "nutridrip" },
          { type: "text", key: "brand.tagline", label: "Brand Tagline", defaultValue: "Premium IV Therapy" },
          { type: "image", key: "brand.logo", label: "Logo Upload (optional)", defaultValue: "", hint: "Leave empty to use wordmark. PNG/SVG preferred." },
          { type: "image", key: "brand.hero_image", label: "Hero Background Image (optional)", defaultValue: "", hint: "Used on landing page if provided" },
        ],
      },
      {
        id: "contact",
        label: "Contact Info",
        icon: "📞",
        blocks: [
          { type: "text", key: "contact.phone", label: "Phone Number", defaultValue: "+91 80000 00000" },
          { type: "text", key: "contact.email", label: "Email", defaultValue: "hello@nutridrip.in" },
          { type: "text", key: "contact.address", label: "Clinic Address", multiline: true, defaultValue: "NutriDrip Clinic, Bandra Kurla Complex, Mumbai 400051" },
        ],
      },
      {
        id: "legal",
        label: "Legal Copy",
        icon: "⚖️",
        blocks: [
          { type: "text", key: "legal.disclaimer", label: "Medical Disclaimer", multiline: true, defaultValue: "IV therapy at NutriDrip is an elective wellness service and is not intended to diagnose, treat, cure, or prevent any disease." },
          { type: "text", key: "legal.copyright", label: "Copyright Line", defaultValue: "© 2026 NutriDrip. All rights reserved." },
        ],
      },
    ],
  },
];

// Build defaults index
const DEFAULTS: Record<string, string | string[]> = {};
for (const screen of CONTENT_REGISTRY) {
  for (const section of screen.sections) {
    for (const block of section.blocks) {
      DEFAULTS[block.key] = block.defaultValue;
    }
  }
}

function readOverrides(): Record<string, string | string[]> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeOverrides(overrides: Record<string, string | string[]>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
  window.dispatchEvent(new Event(EVENT_NAME));
}

export function getContent(key: string): string | string[] {
  const overrides = readOverrides();
  if (key in overrides) return overrides[key];
  if (key in DEFAULTS) return DEFAULTS[key];
  return "";
}

export function getContentText(key: string, fallback: string = ""): string {
  const v = getContent(key);
  if (Array.isArray(v)) return v.join(", ");
  return v || fallback;
}

export function setContent(key: string, value: string | string[]) {
  const overrides = readOverrides();
  overrides[key] = value;
  writeOverrides(overrides);
  const strValue = Array.isArray(value) ? value.join(", ") : value;
  fetch("/api/content", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key, value: strValue }),
  }).catch(() => {});
}

export function resetContent(key?: string) {
  if (!key) {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event(EVENT_NAME));
    fetch("/api/content", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    }).catch(() => {});
    return;
  }
  const overrides = readOverrides();
  delete overrides[key];
  writeOverrides(overrides);
  fetch("/api/content", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key }),
  }).catch(() => {});
}

export function getAllOverrides(): Record<string, string | string[]> {
  return readOverrides();
}

export function syncFromBackend() {
  if (typeof window === "undefined") return;
  fetch("/api/content")
    .then((r) => r.json())
    .then((res) => {
      if (res.success && res.data && typeof res.data === "object") {
        const local = readOverrides();
        const merged = { ...res.data, ...local };
        writeOverrides(merged);
      }
    })
    .catch(() => {});
}

// React hook — components re-render when overrides change
export function useContent(key: string, fallback: string = ""): string {
  const [value, setValue] = useState<string>(() => {
    if (typeof window === "undefined") {
      const v = DEFAULTS[key];
      return (typeof v === "string" ? v : fallback) || fallback;
    }
    return getContentText(key, fallback);
  });

  useEffect(() => {
    const handler = () => setValue(getContentText(key, fallback));
    handler();
    syncFromBackend();
    window.addEventListener(EVENT_NAME, handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener(EVENT_NAME, handler);
      window.removeEventListener("storage", handler);
    };
  }, [key, fallback]);

  return value;
}
