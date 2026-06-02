"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useContent } from "@/lib/content-store";

/* ─── Page-specific CSS ──────────────────────────────────────────────────────── */
const PAGE_CSS = `
/* ── Numbers row ── */
.numbers-row {
  background: var(--white);
  display: flex;
  align-items: stretch;
  border-bottom: 1px solid var(--border);
  overflow: hidden;
}
.num-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
  border-right: 1px solid var(--border);
}
.num-item:last-child { border-right: none; }
.num-big {
  font-size: clamp(32px, 4vw, 52px);
  font-weight: 600;
  color: var(--teal);
  letter-spacing: -1.5px;
  line-height: 1;
  display: block;
  margin-bottom: 8px;
}
.num-label {
  font-size: 11px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--text-3);
  font-weight: 500;
}

/* ── Mission ── */
.mission-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 80px;
  align-items: start;
}
.mission-quote {
  font-family: var(--font-serif);
  font-size: 17px;
  font-style: italic;
  color: var(--text-2);
  line-height: 1.75;
  border-left: 3px solid var(--sky);
  padding-left: 20px;
  margin: 20px 0 24px;
}
.values-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.value-card {
  background: var(--white);
  border-radius: var(--radius);
  border: 1.5px solid var(--border);
  padding: 24px;
  transition: transform 0.3s, box-shadow 0.3s;
  cursor: default;
}
.value-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}
.value-icon { font-size: 24px; margin-bottom: 12px; }
.value-title { font-size: 15px; font-weight: 600; letter-spacing: -0.3px; margin-bottom: 6px; }
.value-desc { font-size: 13px; color: var(--text-2); line-height: 1.7; }

/* ── Story timeline ── */
.story-timeline { position: relative; display: flex; flex-direction: column; gap: 28px; }
.story-timeline::before {
  content: '';
  position: absolute;
  left: 21px;
  top: 22px;
  bottom: 22px;
  width: 2px;
  background: rgba(91,184,245,0.3);
}
.story-item {
  display: flex;
  gap: 40px;
  align-items: flex-start;
  position: relative;
}
.story-year {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  position: relative;
  z-index: 2;
}
.story-year-circle {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--teal);
  color: var(--white);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 600;
  box-shadow: 0 4px 16px rgba(26,126,168,0.3);
}
.story-year-label {
  font-size: 10px;
  font-weight: 600;
  color: var(--teal);
  letter-spacing: 0.5px;
}
.story-card {
  background: var(--white);
  border-radius: var(--radius);
  border: 1.5px solid var(--border);
  padding: 24px 28px;
  flex: 1;
  transition: box-shadow 0.3s;
}
.story-card:hover { box-shadow: 0 8px 32px rgba(91,184,245,0.15); }
.story-card-title { font-size: 17px; font-weight: 600; letter-spacing: -0.3px; margin-bottom: 8px; }
.story-card-desc { font-size: 13px; color: var(--text-2); line-height: 1.7; }

/* ── Team ── */
.team-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}
.team-card {
  background: var(--white);
  border-radius: var(--radius);
  border: 1.5px solid var(--border);
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
  cursor: default;
}
.team-card:hover {
  transform: translateY(-6px);
  box-shadow: var(--shadow-lg);
}
.team-avatar {
  height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 56px;
}
.team-body { padding: 20px; }
.team-name { font-size: 15px; font-weight: 600; letter-spacing: -0.3px; margin-bottom: 2px; }
.team-role {
  font-size: 11px;
  font-weight: 500;
  color: var(--teal);
  letter-spacing: 1px;
  text-transform: uppercase;
  margin-bottom: 10px;
}
.team-bio { font-size: 13px; color: var(--text-2); line-height: 1.7; }

/* ── Certifications ── */
.cert-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-top: 60px;
}
.cert-card {
  background: var(--white);
  border-radius: var(--radius);
  border: 1.5px solid var(--border);
  padding: 32px 24px;
  text-align: center;
  transition: transform 0.3s, box-shadow 0.3s, border-color 0.3s;
  cursor: default;
}
.cert-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: var(--sky);
}
.cert-card .cert-icon { font-size: 32px; margin-bottom: 14px; }
.cert-card .cert-name { font-size: 17px; font-weight: 600; letter-spacing: -0.3px; margin-bottom: 8px; }
.cert-card .cert-desc { font-size: 13px; color: var(--text-2); line-height: 1.6; }

/* ── Responsive ── */
@media (max-width: 1024px) {
  .numbers-row { flex-wrap: wrap; }
  .num-item { flex: 0 0 33%; border-bottom: 1px solid var(--border); }
  .mission-layout { grid-template-columns: 1fr; gap: 48px; }
  .team-grid { grid-template-columns: 1fr 1fr; }
  .cert-row { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 640px) {
  .num-item { flex: 0 0 50%; }
  .values-grid { grid-template-columns: 1fr; }
  .team-grid { grid-template-columns: 1fr 1fr; }
  .cert-row { grid-template-columns: 1fr 1fr; }
  .story-timeline::before { display: none; }
}
@media (max-width: 480px) {
  .num-item { flex: 0 0 50%; padding: 28px 12px; }
  .team-grid { grid-template-columns: 1fr; }
  .cert-row { grid-template-columns: 1fr; }
  .story-item { gap: 16px; }
  .story-card { padding: 16px 18px; }
  .value-card { padding: 18px; }
  .values-grid { grid-template-columns: 1fr; }
}
`;

/* ─── Counter hook ───────────────────────────────────────────────────────────── */
function useCounter(target: number, duration = 1800, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let raf: number;
    const startTime = performance.now();
    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [start, target, duration]);
  return count;
}

/* ─── Reveal wrapper ─────────────────────────────────────────────────────────── */
function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add("visible"); obs.unobserve(el); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} className={`reveal ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

/* ─── Static data ────────────────────────────────────────────────────────────── */
const STATS = [
  { value: 12400, label: "Clients Served", suffix: "+" },
  { value: 99,    label: "Satisfaction Rate", suffix: "%" },
  { value: 200,   label: "Clinic Partners", suffix: "+" },
  { value: 18,    label: "IV Formulas", suffix: "" },
  { value: 4,     label: "Cities Active", suffix: "" },
];

const VALUES = [
  { icon: "🔬", title: "Science First",   desc: "Every formula backed by peer-reviewed research and approved by board-certified physicians." },
  { icon: "🤝", title: "Client Trust",    desc: "Transparent ingredients, clear pricing, and no hidden add-ons — ever." },
  { icon: "📊", title: "Real Results",    desc: "We measure outcomes, not promises. 99% client satisfaction speaks for itself." },
  { icon: "💚", title: "Genuine Care",    desc: "Our nurses and physicians treat every client as an individual, not a transaction." },
];

const TIMELINE = [
  { year: "2021", title: "Founded in Mumbai",        desc: "NutriDrip was born in a single clinic in Bandra, Mumbai — with three formulas, two nurses, and one mission: make IV therapy safe and accessible." },
  { year: "2022", title: "ISO 9001 Certification",   desc: "Our compounding pharmacy received ISO 9001 certification, establishing pharmaceutical-grade quality management across all production." },
  { year: "2023", title: "Expanded to 4 Cities",     desc: "We launched in Delhi, Bengaluru, and Hyderabad — bringing physician-approved IV therapy to clients across India's major metros." },
  { year: "2024", title: "200+ Clinic Partnerships", desc: "Our B2B wholesale programme crossed 200 partner clinics, enabling dermatology, sports medicine, and wellness centres to offer IV therapy in-house." },
  { year: "2025", title: "12,400 Clients & Counting",desc: "Today NutriDrip serves over 12,400 clients with 18 signature formulas, an AI-assisted health quiz, and a growing team of 60+ certified nurses." },
];

const TEAM = [
  {
    emoji: "👨‍⚕️",
    bg: "linear-gradient(135deg, #5BB8F5 0%, #1A7EA8 100%)",
    name: "Dr. Arjun Mehta",
    role: "Chief Medical Officer",
    bio:  "MBBS, MD (Internal Medicine). 14 years of clinical practice. Designed NutriDrip's core protocols and oversees all physician approvals.",
  },
  {
    emoji: "👩‍🔬",
    bg: "linear-gradient(135deg, #A8D8F8 0%, #5BB8F5 100%)",
    name: "Dr. Priya Nair",
    role: "Head of Formulations",
    bio:  "PhD Biochemistry, IISc Bengaluru. Leads our R&D lab, third-party testing, and new formula development with a focus on bioavailability.",
  },
  {
    emoji: "👨‍💼",
    bg: "linear-gradient(135deg, #0F5C7D 0%, #1A7EA8 100%)",
    name: "Rohan Sharma",
    role: "Co-Founder & CEO",
    bio:  "Ex-healthcare investor turned entrepreneur. Rohan built the NutriDrip model after personally experiencing the impact of IV micronutrient therapy.",
  },
  {
    emoji: "👩‍⚕️",
    bg: "linear-gradient(135deg, #D6EEFA 0%, #5BB8F5 100%)",
    name: "Kavya Reddy",
    role: "Director of Nursing",
    bio:  "MSN, 10 years in ICU and oncology care. Kavya manages training, protocols, and quality for our 60-nurse field team across all four cities.",
  },
];

const CERTS = [
  { icon: "🏅", title: "ISO 9001:2015",    desc: "Pharmaceutical quality management for our compounding pharmacy." },
  { icon: "🧪", title: "GMP Certified",     desc: "Good Manufacturing Practice standards upheld across all batch production." },
  { icon: "🔒", title: "HIPAA Compliant",   desc: "End-to-end encryption and strict access controls for all client health data." },
  { icon: "📋", title: "CDSCO Registered",  desc: "Registered with India's Central Drugs Standard Control Organisation." },
];

/* ─── Stat counter component ─────────────────────────────────────────────────── */
function StatCounter({ value, label, suffix, started }: { value: number; label: string; suffix: string; started: boolean }) {
  const count = useCounter(value, 1800, started);
  return (
    <div className="num-item">
      <span className="num-big">{count.toLocaleString("en-IN")}{suffix}</span>
      <span className="num-label">{label}</span>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────────── */
export default function AboutPage() {
  const heroTitle = useContent("about.hero.title", "We Believe in");
  const heroTitleEm = useContent("about.hero.title_em", "Science");
  const heroTitleEnd = useContent("about.hero.title_end", "Delivered with Care");
  const heroSubtitle = useContent("about.hero.subtitle", "NutriDrip was founded by physicians who believed optimal cellular nutrition should be accessible to everyone — not just elite athletes or hospital patients.");
  const missionEyebrow = useContent("about.mission.eyebrow", "Our Mission");
  const missionTitle = useContent("about.mission.title", "Making Optimal Health");
  const missionTitleEm = useContent("about.mission.title_em", "Accessible");
  const missionQuote = useContent("about.mission.quote", "We started NutriDrip because the gap between what science knows and what people receive was too wide. IV micronutrient therapy works — but it was locked behind hospital walls and celebrity clinics. We changed that.");
  const missionBody = useContent("about.mission.body", "Our protocols are built on published clinical evidence. Every formula is reviewed by a board-certified physician, compounded in our ISO-certified pharmacy, administered by trained nurses, and monitored for outcomes. We don't guess. We measure.");

  // Content-store driven data — overrides the static arrays when admin edits in Studio
  const storyEyebrow = useContent("about.story.eyebrow", "Our Story");
  const storyTitle = useContent("about.story.title", "The Journey");
  const storyTitleEm = useContent("about.story.title_em", "So Far");
  const teamEyebrow = useContent("about.team.eyebrow", "Leadership");
  const teamTitle = useContent("about.team.title", "The Team Behind");
  const teamTitleEm = useContent("about.team.title_em", "NutriDrip");
  const certsEyebrow = useContent("about.certs.eyebrow", "Certifications");
  const certsTitle = useContent("about.certs.title", "Certified");
  const certsTitleEm = useContent("about.certs.title_em", "Excellence");
  const ctaTitle = useContent("about.cta.title", "Ready to experience the difference?");
  const ctaBody = useContent("about.cta.body", "Join thousands of clients who trust NutriDrip for science-backed IV therapy delivered with genuine care.");
  const ctaBtnPrimary = useContent("about.cta.btn_primary", "Book a Session");
  const ctaBtnSecondary = useContent("about.cta.btn_secondary", "Take Health Quiz");

  // Team members — content store overrides hardcoded TEAM array
  const team1Name = useContent("about.team1.name", TEAM[0].name);
  const team1Role = useContent("about.team1.role", TEAM[0].role);
  const team1Bio = useContent("about.team1.bio", TEAM[0].bio);
  const team1Photo = useContent("about.team1.photo", "");
  const team2Name = useContent("about.team2.name", TEAM[1].name);
  const team2Role = useContent("about.team2.role", TEAM[1].role);
  const team2Bio = useContent("about.team2.bio", TEAM[1].bio);
  const team2Photo = useContent("about.team2.photo", "");
  const team3Name = useContent("about.team3.name", TEAM[2].name);
  const team3Role = useContent("about.team3.role", TEAM[2].role);
  const team3Bio = useContent("about.team3.bio", TEAM[2].bio);
  const team3Photo = useContent("about.team3.photo", "");
  const team4Name = useContent("about.team4.name", TEAM[3].name);
  const team4Role = useContent("about.team4.role", TEAM[3].role);
  const team4Bio = useContent("about.team4.bio", TEAM[3].bio);
  const team4Photo = useContent("about.team4.photo", "");

  const teamData = [
    { name: team1Name, role: team1Role, bio: team1Bio, photo: team1Photo, emoji: TEAM[0].emoji, bg: TEAM[0].bg },
    { name: team2Name, role: team2Role, bio: team2Bio, photo: team2Photo, emoji: TEAM[1].emoji, bg: TEAM[1].bg },
    { name: team3Name, role: team3Role, bio: team3Bio, photo: team3Photo, emoji: TEAM[2].emoji, bg: TEAM[2].bg },
    { name: team4Name, role: team4Role, bio: team4Bio, photo: team4Photo, emoji: TEAM[3].emoji, bg: TEAM[3].bg },
  ];
  const statsRef = useRef<HTMLDivElement>(null);
  const [statsStarted, setStatsStarted] = useState(false);

  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setStatsStarted(true); obs.unobserve(el); } },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: PAGE_CSS }} />

      {/* ── Hero ── */}
      <section className="hero-sub">
        <div className="hero-blobs">
          <div className="blob b1" />
          <div className="blob b2" />
          <div className="blob b3" />
        </div>
        <div className="hero-content" style={{ maxWidth: 680 }}>
          <p className="breadcrumb">
            <Link href="/">Home</Link> &rsaquo; About
          </p>
          <h1>
            {heroTitle}{" "}
            <em>{heroTitleEm}</em>{" "}
            {heroTitleEnd}
          </h1>
          <p>
            {heroSubtitle}
          </p>
        </div>
      </section>

      {/* ── Numbers row ── */}
      <div className="numbers-row" ref={statsRef}>
        {STATS.map((s) => (
          <StatCounter key={s.label} value={s.value} label={s.label} suffix={s.suffix} started={statsStarted} />
        ))}
      </div>

      {/* ── Mission ── */}
      <section className="section">
        <div className="mission-layout">
          {/* Left */}
          <div>
            <Reveal>
              <p className="eyebrow">{missionEyebrow}</p>
            </Reveal>
            <Reveal delay={100}>
              <h2 className="sec-title">
                {missionTitle}{" "}
                <em>{missionTitleEm}</em>
              </h2>
            </Reveal>
            <Reveal delay={200}>
              <blockquote className="mission-quote">
                &ldquo;{missionQuote}&rdquo;
              </blockquote>
            </Reveal>
            <Reveal delay={300}>
              <p style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.75 }}>
                {missionBody}
              </p>
            </Reveal>
          </div>
          {/* Right — value cards */}
          <div className="values-grid">
            {VALUES.map((v, i) => (
              <Reveal key={v.title} delay={i * 80}>
                <div className="value-card">
                  <div className="value-icon">{v.icon}</div>
                  <div className="value-title">{v.title}</div>
                  <div className="value-desc">{v.desc}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Story timeline ── */}
      <section className="section section-sky">
        <Reveal>
          <p className="eyebrow">{storyEyebrow}</p>
        </Reveal>
        <Reveal delay={100}>
          <h2 className="sec-title" style={{ marginBottom: 56 }}>
            {storyTitle} <em>{storyTitleEm}</em>
          </h2>
        </Reveal>
        <div className="story-timeline">
          {TIMELINE.map((item, i) => (
            <Reveal key={item.year} delay={i * 100}>
              <div className="story-item">
                <div className="story-year">
                  <div className="story-year-circle">{item.year.slice(2)}</div>
                  <span className="story-year-label">{item.year}</span>
                </div>
                <div className="story-card">
                  <div className="story-card-title">{item.title}</div>
                  <p className="story-card-desc">{item.desc}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Team ── */}
      <section className="section">
        <Reveal>
          <p className="eyebrow">{teamEyebrow}</p>
        </Reveal>
        <Reveal delay={100}>
          <h2 className="sec-title" style={{ marginBottom: 56 }}>
            {teamTitle} <em>{teamTitleEm}</em>
          </h2>
        </Reveal>
        <div className="team-grid">
          {teamData.map((member, i) => (
            <Reveal key={i} delay={i * 100}>
              <div className="team-card">
                {member.photo ? (
                  <div className="team-avatar" style={{ background: "none", padding: 0, overflow: "hidden" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={member.photo} alt={member.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                ) : (
                  <div className="team-avatar" style={{ background: member.bg }}>
                    {member.emoji}
                  </div>
                )}
                <div className="team-body">
                  <div className="team-name">{member.name}</div>
                  <div className="team-role">{member.role}</div>
                  <p className="team-bio">{member.bio}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Certifications ── */}
      <section className="section section-alt">
        <Reveal>
          <p className="eyebrow">{certsEyebrow}</p>
        </Reveal>
        <Reveal delay={100}>
          <h2 className="sec-title">
            {certsTitle} <em>{certsTitleEm}</em>
          </h2>
        </Reveal>
        <div className="cert-row">
          {CERTS.map((c, i) => (
            <Reveal key={c.title} delay={i * 100}>
              <div className="cert-card">
                <div className="cert-icon">{c.icon}</div>
                <div className="cert-name">{c.title}</div>
                <p className="cert-desc">{c.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── CTA strip ── */}
      <section className="cta-strip">
        <Reveal>
          <h2 style={{ fontSize: "clamp(26px,3.5vw,44px)", fontWeight: 600, color: "#fff", letterSpacing: "-1px", marginBottom: 16 }}>
            {ctaTitle}
          </h2>
        </Reveal>
        <Reveal delay={100}>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.85)", maxWidth: 480, margin: "0 auto 32px", lineHeight: 1.7 }}>
            {ctaBody}
          </p>
        </Reveal>
        <Reveal delay={200}>
          <div className="hero-btns" style={{ justifyContent: "center" }}>
            <Link href="/health-quiz" className="btn-white">{ctaBtnSecondary} &rarr;</Link>
            <Link href="/book-now" className="btn-ghost">{ctaBtnPrimary}</Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
