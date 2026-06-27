"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

/* ─── Step data ─────────────────────────────────────────────────────────── */
const STEPS = [
  {
    num: 1,
    title: "Take the Health Quiz",
    description: "Our intelligent questionnaire maps your symptoms, goals and lifestyle to identify the IV formula that fits you precisely. Takes under 2 minutes.",
    detail: "Covers energy levels, hydration, skin concerns, athletic load, travel frequency, and existing health conditions. Completely confidential.",
  },
  {
    num: 2,
    title: "Physician Review & Approval",
    description: "A board-certified MD reviews your profile, checks for contraindications and approves your personalised formula — typically within 2 hours.",
    detail: "No approval, no infusion. Every protocol is signed off by a licensed physician before your nurse is dispatched.",
  },
  {
    num: 3,
    title: "Choose Your Setting",
    description: "Home, office, hotel or clinic — our certified nurses travel to you anywhere across the city. You pick the time and place.",
    detail: "We arrive with a fully sterile kit. Setup takes 5 minutes. You stay comfortable throughout.",
  },
  {
    num: 4,
    title: "Infuse & Feel the Shift",
    description: "Your drip is administered in 30–60 minutes. Most clients report feeling results within hours — sharper energy, clearer skin, faster recovery.",
    detail: "Your nurse monitors vitals throughout. Post-session notes are sent to your profile for your physician to review.",
  },
];

/* ─── Absorption data ───────────────────────────────────────────────────── */
const ABSORPTION = [
  { label: "IV Therapy (NutriDrip)", pct: 97, color: "#1A7EA8" },
  { label: "Oral Capsules / Pills",  pct: 45, color: "#5BB8F5" },
  { label: "Standard Supplements",   pct: 20, color: "#A8D8F8" },
  { label: "Diet / Food Sources",    pct: 10, color: "#D6EEFA" },
];

/* ─── Safety cards ──────────────────────────────────────────────────────── */
const SAFETY = [
  { icon: "🏥", title: "ISO-Certified Pharmacy",  desc: "Every formula compounded under ISO 9001 pharmaceutical quality controls." },
  { icon: "👨‍⚕️", title: "Board-Certified MDs",   desc: "All protocols reviewed and approved by licensed physicians before use." },
  { icon: "💉", title: "Registered Nurses Only",  desc: "Every infusion administered by a credentialed, experienced RN." },
  { icon: "🔬", title: "Third-Party Lab Tested",  desc: "Batches independently tested for potency, sterility and purity." },
  { icon: "📋", title: "Pre-Infusion Screening",  desc: "Health screening and contraindication check before every session." },
  { icon: "📞", title: "Post-Session Follow-Up",  desc: "Your nurse checks in after every visit. MD available for questions." },
];

/* ─── Locations ──────────────────────────────────────────────────────────── */
const LOCATIONS = [
  { icon: "🏠", label: "At Home",   desc: "Relax in your own space while we set up and administer your drip." },
  { icon: "🏢", label: "At Office", desc: "Mid-day reset — our nurses work quietly in a private room." },
  { icon: "🏨", label: "At Hotel",  desc: "Perfect for travel recovery. We service all major hotels." },
  { icon: "🏥", label: "At Clinic", desc: "Visit our flagship clinic for the full NutriDrip experience." },
];

/* ─── Day-of experience ─────────────────────────────────────────────────── */
const DAY_OF = [
  { title: "Nurse arrives on time", desc: "Your assigned RN arrives within the scheduled window with a fully sterile kit." },
  { title: "5-minute setup",        desc: "Sterile drape, equipment check and IV site prep — done in under 5 minutes." },
  { title: "Comfortable infusion",  desc: "Sit back, work, watch or rest. The drip runs quietly for 30–60 minutes." },
  { title: "Vitals monitored",      desc: "Your nurse checks blood pressure and comfort throughout the session." },
  { title: "Clean close",           desc: "All materials safely packed away. No trace left. Zero mess." },
  { title: "Session notes sent",    desc: "Post-infusion summary emailed to you and filed with your physician." },
];

/* ─── Reveal wrapper ─────────────────────────────────────────────────────── */
function R({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { el.classList.add("visible"); obs.unobserve(el); }
      },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} className="reveal" style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

/* ─── Animated absorption bar ───────────────────────────────────────────── */
function AbsorptionBar({
  label, pct, color, delay,
}: { label: string; pct: number; color: string; delay: number }) {
  const barRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = barRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => { if (barRef.current) barRef.current.style.width = `${pct}%`; }, delay);
          obs.unobserve(el);
        }
      },
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [pct, delay]);

  return (
    <div className="bar-item">
      <div className="bar-meta">
        <span className="bar-label">{label}</span>
        <span className="bar-pct" style={{ color }}>{pct}%</span>
      </div>
      <div className="bar-track">
        <div
          ref={barRef}
          className="bar-fill"
          style={{
            width: "0%",
            background: color,
            transition: "width 1s cubic-bezier(.4,0,.2,1)",
          }}
        />
      </div>
    </div>
  );
}

/* ─── Donut SVG ──────────────────────────────────────────────────────────── */
function BioavailabilityDonut() {
  const pct = 97;
  const r = 70;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <div className="donut-wrap">
      <svg width="200" height="200" viewBox="0 0 200 200">
        <circle cx="100" cy="100" r={r} fill="none" stroke="rgba(91,184,245,0.15)" strokeWidth="18" />
        <circle
          cx="100" cy="100" r={r}
          fill="none"
          stroke="#1A7EA8"
          strokeWidth="18"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          strokeDashoffset={circ * 0.25}
        />
        <text x="100" y="92" textAnchor="middle" fontSize="34" fontWeight="600" fill="#0E2233"
          fontFamily="var(--font-display)" letterSpacing="-1">97%</text>
        <text x="100" y="114" textAnchor="middle" fontSize="11" fill="#7A9BB0"
          fontFamily="var(--font-display)">Bioavailability</text>
      </svg>
      <p className="donut-caption">vs. up to 45% via oral supplements</p>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────── */
export default function HowItWorksPage() {
  return (
    <>
      <style>{`
        /* ── How It Works page-specific CSS ──────────────────────────── */

        /* Timeline */
        .timeline {
          position: relative;
          max-width: 780px;
          margin: 0 auto;
        }
        .tl-line {
          position: absolute;
          left: 39px;
          top: 40px;
          bottom: 40px;
          width: 2px;
          background: linear-gradient(to bottom, var(--sky-pale), rgba(91,184,245,0.1));
        }
        .tl-steps { display: flex; flex-direction: column; gap: 40px; }
        .tl-step { display: flex; gap: 28px; align-items: flex-start; position: relative; }
        .tl-num {
          flex-shrink: 0;
          width: 80px;
          height: 80px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          font-weight: 600;
          z-index: 2;
          box-shadow: 0 4px 24px rgba(91,184,245,0.15);
          border: 2px solid rgba(91,184,245,0.35);
          background: var(--white);
          color: var(--teal);
          transition: all .3s;
        }
        .tl-num.active {
          background: linear-gradient(145deg, var(--teal), var(--teal-dark));
          color: #fff;
          border-color: transparent;
        }
        .tl-content { flex: 1; padding-top: 12px; }
        .tl-title {
          font-size: 20px;
          font-weight: 600;
          letter-spacing: -0.5px;
          color: var(--text);
          margin-bottom: 8px;
        }
        .tl-desc { font-size: 14px; color: var(--text-2); line-height: 1.75; margin-bottom: 16px; }
        .tl-detail {
          padding: 16px;
          border-radius: 10px;
          font-size: 13px;
          line-height: 1.7;
          color: var(--text-2);
          background: var(--sky-pale);
          border-left: 3px solid var(--teal);
        }

        /* Science section */
        .science-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          align-items: center;
          max-width: 960px;
          margin: 0 auto;
        }

        /* Absorption bars card */
        .absorption-bars {
          background: var(--white);
          border-radius: var(--radius);
          padding: 32px;
          border: 1.5px solid var(--border);
        }
        .abs-eyebrow {
          font-size: 11px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: var(--teal);
          font-weight: 500;
          margin-bottom: 24px;
        }
        .bar-item { margin-bottom: 20px; }
        .bar-meta { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
        .bar-label { font-size: 14px; font-weight: 500; color: var(--text); }
        .bar-pct { font-size: 14px; font-weight: 600; }
        .bar-track { height: 10px; border-radius: 50px; background: rgba(91,184,245,0.12); overflow: hidden; }
        .bar-fill { height: 100%; border-radius: 50px; }
        .abs-footnote { font-size: 11px; color: var(--text-3); margin-top: 16px; }

        /* Donut card */
        .donut-card {
          background: var(--white);
          border-radius: var(--radius);
          padding: 32px;
          border: 1.5px solid var(--border);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 20px;
          text-align: center;
        }
        .donut-wrap { display: flex; flex-direction: column; align-items: center; }
        .donut-caption { font-size: 12px; color: var(--text-3); margin-top: 8px; max-width: 160px; text-align: center; }
        .donut-title { font-size: 15px; font-weight: 600; color: var(--text); margin-bottom: 4px; }
        .donut-sub { font-size: 14px; color: var(--text-2); line-height: 1.6; }

        /* Safety grid */
        .safety-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        .safety-card {
          background: var(--white);
          border-radius: var(--radius-sm);
          border: 1.5px solid var(--border);
          padding: 28px;
          display: flex;
          gap: 20px;
          align-items: flex-start;
          transition: all .3s;
        }
        .safety-card:hover { border-color: var(--sky); box-shadow: var(--shadow); transform: translateY(-3px); }
        .safety-icon {
          width: 48px; height: 48px;
          border-radius: 12px;
          background: var(--sky-pale);
          display: flex; align-items: center; justify-content: center;
          font-size: 22px;
          flex-shrink: 0;
        }
        .safety-title { font-size: 15px; font-weight: 600; color: var(--text); margin-bottom: 6px; }
        .safety-desc { font-size: 14px; color: var(--text-2); line-height: 1.65; }

        /* Locations grid */
        .locations-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }
        .loc-card {
          background: var(--white);
          border-radius: var(--radius);
          border: 1.5px solid var(--border);
          padding: 32px 24px;
          text-align: center;
          transition: all .3s;
        }
        .loc-card:hover { border-color: var(--sky); box-shadow: var(--shadow-lg); transform: translateY(-5px); }
        .loc-icon {
          width: 64px; height: 64px;
          border-radius: 50%;
          background: var(--sky-pale);
          display: flex; align-items: center; justify-content: center;
          font-size: 30px;
          margin: 0 auto 20px;
        }
        .loc-label { font-size: 17px; font-weight: 600; letter-spacing: -0.3px; color: var(--text); margin-bottom: 8px; }
        .loc-desc { font-size: 14px; color: var(--text-2); line-height: 1.65; }

        /* Day-of experience */
        .expect-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 28px 48px;
          max-width: 800px;
          margin: 0 auto;
        }
        .expect-item { display: flex; gap: 16px; align-items: flex-start; }
        .expect-dot {
          width: 10px; height: 10px;
          border-radius: 50%;
          background: var(--teal);
          flex-shrink: 0;
          margin-top: 6px;
        }
        .expect-title { font-size: 15px; font-weight: 600; color: var(--text); margin-bottom: 4px; }
        .expect-desc { font-size: 14px; color: var(--text-2); line-height: 1.65; }

        /* CTA helpers */
        .cta-h2 {
          font-size: clamp(28px,4vw,48px);
          font-weight: 600;
          letter-spacing: -1px;
          color: #fff;
          text-align: center;
          margin-bottom: 16px;
        }
        .cta-p { font-size: 16px; color: rgba(255,255,255,0.8); text-align: center; margin-bottom: 32px; }
        .cta-btns { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }

        /* Responsive */
        @media(max-width: 1024px) {
          .science-grid { grid-template-columns: 1fr; gap: 24px; }
          .safety-grid { grid-template-columns: 1fr 1fr; }
          .locations-grid { grid-template-columns: 1fr 1fr; }
          .tl-line { display: none; }
        }
        @media(max-width: 640px) {
          .safety-grid { grid-template-columns: 1fr; }
          .locations-grid { grid-template-columns: 1fr; }
          .expect-grid { grid-template-columns: 1fr; gap: 20px; }
        }
        @media(max-width: 480px) {
          .safety-grid { gap: 10px; }
          .locations-grid { gap: 10px; }
          .tl-item { gap: 16px; }
        }
      `}</style>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="hero-sub">
        <div className="hero-blobs">
          <div className="blob b1" />
          <div className="blob b2" />
        </div>
        <div className="hero-content">
          <nav className="breadcrumb">
            <Link href="/">Home</Link> &rsaquo; How It Works
          </nav>
          <h1>
            Simple, <em>Safe</em> &amp; Science-Led
          </h1>
          <p>
            From your first health quiz to the moment you feel the shift — here is
            exactly what to expect at every step of your NutriDrip experience.
          </p>
        </div>
      </div>

      {/* ── 4-Step Timeline ──────────────────────────────────────────────── */}
      <section className="section">
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <R><p className="eyebrow">The Process</p></R>
          <R delay={100}>
            <h2 className="sec-title" style={{ margin: "0 auto" }}>
              Four Steps to <em>Feeling Better</em>
            </h2>
          </R>
        </div>

        <div className="timeline">
          <div className="tl-line" aria-hidden="true" />
          <div className="tl-steps">
            {STEPS.map((step, i) => (
              <R key={step.num} delay={i * 120}>
                <div className="tl-step">
                  <div className={`tl-num${i === 0 ? " active" : ""}`}>{step.num}</div>
                  <div className="tl-content">
                    <div className="tl-title">{step.title}</div>
                    <p className="tl-desc">{step.description}</p>
                    <div className="tl-detail">{step.detail}</div>
                  </div>
                </div>
              </R>
            ))}
          </div>
        </div>
      </section>

      {/* ── Science of Absorption ────────────────────────────────────────── */}
      <section
        className="section"
        style={{ background: "linear-gradient(160deg, #EEF7FD 0%, #DCF0FA 50%, #D6EEFA 100%)" }}
      >
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <R><p className="eyebrow">The Science</p></R>
          <R delay={100}>
            <h2 className="sec-title" style={{ margin: "0 auto" }}>
              Why IV Delivers <em>More</em>
            </h2>
          </R>
          <R delay={200}>
            <p className="sec-sub" style={{ margin: "12px auto 0", textAlign: "center" }}>
              The digestive system absorbs only a fraction of what you swallow. IV therapy
              bypasses the gut entirely — nutrients reach every cell at full concentration.
            </p>
          </R>
        </div>

        <div className="science-grid">
          <R delay={100}>
            <div className="absorption-bars">
              <p className="abs-eyebrow">Nutrient Bioavailability Comparison</p>
              {ABSORPTION.map((a, i) => (
                <AbsorptionBar key={a.label} label={a.label} pct={a.pct} color={a.color} delay={i * 150} />
              ))}
              <p className="abs-footnote">
                * Based on published clinical absorption studies. Individual results may vary.
              </p>
            </div>
          </R>

          <R delay={200}>
            <div className="donut-card">
              <BioavailabilityDonut />
              <div>
                <p className="donut-title">Up to 97% Bioavailability</p>
                <p className="donut-sub">
                  IV-delivered nutrients are absorbed directly into the bloodstream —
                  nothing is lost to the digestive process.
                </p>
              </div>
            </div>
          </R>
        </div>
      </section>

      {/* ── Safety Grid ──────────────────────────────────────────────────── */}
      <section className="section">
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <R><p className="eyebrow">Your Safety First</p></R>
          <R delay={100}>
            <h2 className="sec-title" style={{ margin: "0 auto" }}>
              Built on <em>Trust</em>
            </h2>
          </R>
        </div>

        <div className="safety-grid">
          {SAFETY.map((card, i) => (
            <R key={card.title} delay={i * 80}>
              <div className="safety-card">
                <div className="safety-icon">{card.icon}</div>
                <div>
                  <div className="safety-title">{card.title}</div>
                  <div className="safety-desc">{card.desc}</div>
                </div>
              </div>
            </R>
          ))}
        </div>
      </section>

      {/* ── Locations ────────────────────────────────────────────────────── */}
      <section className="section section-alt">
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <R><p className="eyebrow">We Come to You</p></R>
          <R delay={100}>
            <h2 className="sec-title" style={{ margin: "0 auto" }}>
              Any <em>Location,</em> Your Schedule
            </h2>
          </R>
        </div>

        <div className="locations-grid">
          {LOCATIONS.map((loc, i) => (
            <R key={loc.label} delay={i * 80}>
              <div className="loc-card">
                <div className="loc-icon">{loc.icon}</div>
                <div className="loc-label">{loc.label}</div>
                <div className="loc-desc">{loc.desc}</div>
              </div>
            </R>
          ))}
        </div>
      </section>

      {/* ── Day-of Experience ────────────────────────────────────────────── */}
      <section className="section">
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <R><p className="eyebrow">On the Day</p></R>
          <R delay={100}>
            <h2 className="sec-title" style={{ margin: "0 auto" }}>
              What to <em>Expect</em>
            </h2>
          </R>
        </div>

        <div className="expect-grid">
          {DAY_OF.map((item, i) => (
            <R key={item.title} delay={i * 80}>
              <div className="expect-item">
                <div className="expect-dot" />
                <div>
                  <div className="expect-title">{item.title}</div>
                  <div className="expect-desc">{item.desc}</div>
                </div>
              </div>
            </R>
          ))}
        </div>
      </section>

      {/* ── CTA strip ────────────────────────────────────────────────────── */}
      <div className="cta-strip">
        <R>
          <h2 className="cta-h2">
            Ready to feel the{" "}
            <em style={{ fontStyle: "italic", fontFamily: "var(--font-serif)", color: "rgba(255,255,255,0.85)", fontWeight: 400 }}>
              difference?
            </em>
          </h2>
        </R>
        <R delay={100}>
          <p className="cta-p">
            Book your first session in under 3 minutes. A physician reviews your profile within 2 hours.
          </p>
        </R>
        <R delay={200}>
          <div className="cta-btns">
            <Link href="/health-quiz" className="btn-white">Take the Health Quiz &rarr;</Link>
            <Link href="/book-now" className="btn-ghost">Book Now</Link>
          </div>
        </R>
      </div>
    </>
  );
}
