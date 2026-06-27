"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { DRIPS, ADDONS } from "@/lib/data/drips";

/* ─── Comparison table data ─────────────────────────────────────────────── */
const COMPARISON_DRIPS = ["Velocity", "Luminescence", "Fortress", "Hydraflux", "Apex", "Cognitas"];
type BenefitKey = "Energy" | "Skin" | "Immune" | "Recovery" | "Brain";
const BENEFITS: BenefitKey[] = ["Energy", "Skin", "Immune", "Recovery", "Brain"];
const BENEFIT_MATRIX: Record<string, Record<BenefitKey, boolean>> = {
  Velocity:     { Energy: true,  Skin: false, Immune: false, Recovery: true,  Brain: true  },
  Luminescence: { Energy: false, Skin: true,  Immune: true,  Recovery: false, Brain: false },
  Fortress:     { Energy: false, Skin: false, Immune: true,  Recovery: true,  Brain: false },
  Hydraflux:    { Energy: true,  Skin: false, Immune: false, Recovery: true,  Brain: false },
  Apex:         { Energy: true,  Skin: false, Immune: false, Recovery: true,  Brain: false },
  Cognitas:     { Energy: true,  Skin: false, Immune: false, Recovery: false, Brain: true  },
};

/* ─── FAQ data ───────────────────────────────────────────────────────────── */
const FAQS = [
  { q: "How long does a session take?",         a: "Most drips run for 30–90 minutes depending on the formula and volume. Your nurse will give you an exact estimate at setup." },
  { q: "Is IV therapy safe?",                   a: "Yes. Every protocol is approved by a board-certified physician, administered by a registered nurse, and compounded in our ISO-certified pharmacy." },
  { q: "How soon will I feel results?",          a: "Many clients notice a difference during or within hours of the session — especially for energy, hydration and skin brightness drips." },
  { q: "Can I add multiple add-ons to one drip?", a: "Absolutely. Your physician will confirm compatibility. Most drips support up to 3 add-ons per session." },
  { q: "Do I need a prescription?",             a: "No. Our physician review process handles all approvals. You just fill in your health quiz and we take care of the rest." },
];

/* ─── Category filter options ────────────────────────────────────────────── */
const CATS = [
  { key: "all",         label: "All Drips" },
  { key: "energy",      label: "Energy" },
  { key: "beauty",      label: "Beauty" },
  { key: "immunity",    label: "Immunity" },
  { key: "recovery",    label: "Recovery" },
  { key: "performance", label: "Performance" },
  { key: "cognition",   label: "Cognition" },
];

/* ─── Reveal wrapper ─────────────────────────────────────────────────────── */
function R({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
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
    <div ref={ref} className="reveal" style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

/* ─── FAQ accordion item ─────────────────────────────────────────────────── */
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="faq-item">
      <button className="faq-q" onClick={() => setOpen(!open)} aria-expanded={open}>
        <span>{q}</span>
        <span className="faq-arrow">{open ? "−" : "+"}</span>
      </button>
      {open && <div className="faq-a">{a}</div>}
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────── */
export default function TreatmentsPage() {
  const [activeCat, setActiveCat] = useState("all");
  const filtered = activeCat === "all" ? DRIPS : DRIPS.filter((d) => d.cat === activeCat);

  return (
    <>
      <style>{`
        /* ── Treatments page-specific CSS ─────────────────────────────── */

        /* Filter bar */
        .filter-bar {
          position: sticky;
          top: 65px;
          z-index: 50;
          background: rgba(255,255,255,0.95);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--border);
          padding: 14px 56px;
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          align-items: center;
        }
        .filter-pill {
          padding: 7px 18px;
          border-radius: 50px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          border: 1.5px solid var(--border);
          background: transparent;
          color: var(--text-2);
          font-family: var(--font-display);
          transition: all .2s;
        }
        .filter-pill:hover { border-color: var(--sky); color: var(--teal); }
        .filter-pill.active {
          background: var(--teal);
          border-color: var(--teal);
          color: #fff;
        }

        /* Hero filter pills inside the hero */
        .hero-filter-pills {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-top: 32px;
        }
        .hero-filter-pill {
          padding: 8px 20px;
          border-radius: 50px;
          font-size: 13px;
          font-weight: 500;
          background: rgba(255,255,255,0.25);
          color: #fff;
          border: 1.5px solid rgba(255,255,255,0.5);
          backdrop-filter: blur(8px);
          cursor: pointer;
          font-family: var(--font-display);
          transition: background .2s;
        }
        .hero-filter-pill:hover { background: rgba(255,255,255,0.4); }

        /* Section layout helpers */
        .treatments-section-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          flex-wrap: wrap;
          gap: 20px;
          margin-bottom: 48px;
        }
        .quiz-btn {
          flex-shrink: 0;
          font-size: 14px;
          font-weight: 500;
          padding: 12px 28px;
          border-radius: 50px;
          background: linear-gradient(145deg, var(--teal), var(--teal-dark));
          color: #fff;
          text-decoration: none;
          transition: box-shadow .2s, transform .2s;
        }
        .quiz-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 24px rgba(26,126,168,0.28); }

        /* Drip cards grid */
        .treatments-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        .treatments-card {
          background: var(--white);
          border-radius: var(--radius);
          border: 1.5px solid var(--border);
          padding: 36px 32px;
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
          transition: all .3s;
        }
        .treatments-card:hover {
          border-color: var(--sky);
          box-shadow: var(--shadow-lg);
          transform: translateY(-5px);
        }

        /* Accent gradient bar at top of each card */
        .drip-card-top {
          height: 4px;
          width: calc(100% + 64px);
          margin: -36px -32px 28px;
          border-radius: 2px 2px 0 0;
        }

        /* Header row inside card */
        .drip-card-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 18px;
        }
        .popular-badge {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          background: var(--sky-pale);
          color: var(--teal);
          padding: 4px 12px;
          border-radius: 50px;
        }

        /* Ingredient bars */
        .ingredient-bars {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 20px;
        }
        .ing-row { display: flex; flex-direction: column; gap: 5px; }
        .ing-meta { display: flex; justify-content: space-between; align-items: center; }
        .ing-name { font-size: 11px; font-weight: 500; color: var(--text); }
        .ing-dose { font-size: 11px; color: var(--text-3); }
        .ing-track { height: 5px; border-radius: 50px; background: rgba(91,184,245,0.15); overflow: hidden; }
        .ing-fill {
          height: 100%;
          border-radius: 50px;
          background: linear-gradient(90deg, var(--sky), var(--teal));
        }

        /* Duration / volume row */
        .drip-meta-row {
          display: flex;
          gap: 20px;
          font-size: 11px;
          padding-bottom: 18px;
          margin-bottom: 18px;
          border-bottom: 1px solid rgba(91,184,245,0.15);
        }
        .drip-meta-val { font-weight: 600; color: var(--text); }
        .drip-meta-label { color: var(--text-3); }

        /* Footer: price + button */
        .drip-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: auto;
        }
        .drip-price-large {
          font-size: 28px;
          font-weight: 600;
          color: var(--teal);
          letter-spacing: -0.5px;
        }
        .drip-price-unit { font-size: 12px; color: var(--text-3); margin-left: 4px; font-weight: 300; }
        .book-btn {
          font-size: 13px;
          font-weight: 500;
          padding: 10px 22px;
          border-radius: 50px;
          background: linear-gradient(145deg, var(--teal), var(--teal-dark));
          color: #fff;
          text-decoration: none;
          border: none;
          cursor: pointer;
          font-family: var(--font-display);
          transition: box-shadow .2s, transform .2s;
        }
        .book-btn:hover { box-shadow: 0 4px 16px rgba(26,126,168,0.3); transform: translateY(-1px); }

        /* Add-ons grid */
        .addons-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }
        .addon-card {
          background: var(--white);
          border-radius: var(--radius-sm);
          border: 1.5px solid var(--border);
          padding: 24px 20px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          transition: all .3s;
        }
        .addon-card:hover { border-color: var(--sky); box-shadow: var(--shadow); transform: translateY(-3px); }
        .addon-icon {
          width: 44px; height: 44px;
          border-radius: 10px;
          background: var(--sky-pale);
          display: flex; align-items: center; justify-content: center;
          font-size: 20px;
          flex-shrink: 0;
        }
        .addon-name { font-size: 15px; font-weight: 600; color: var(--text); margin-bottom: 2px; }
        .addon-desc { font-size: 13px; color: var(--text-2); line-height: 1.6; }
        .addon-price {
          font-size: 20px; font-weight: 600;
          color: var(--teal); letter-spacing: -0.3px;
          margin-top: auto; padding-top: 8px;
        }

        /* Comparison table */
        .compare-wrap {
          overflow-x: auto;
          border-radius: 16px;
          border: 1.5px solid var(--border);
        }
        .compare-table { width: 100%; border-collapse: collapse; font-size: 14px; }
        .compare-table th {
          padding: 16px 24px;
          background: var(--sky-bg);
          font-weight: 600;
          text-align: left;
          color: var(--text);
        }
        .compare-table th.center { text-align: center; font-weight: 500; color: var(--text-2); }
        .compare-table td { padding: 16px 24px; }
        .compare-table td.center { text-align: center; }
        .compare-table tr { border-top: 1px solid rgba(91,184,245,0.12); }
        .compare-table tr:nth-child(even) td { background: var(--off-white); }
        .compare-drip-cell { display: flex; align-items: center; gap: 12px; }
        .compare-drip-icon { font-size: 18px; }
        .compare-drip-name { font-weight: 600; color: var(--text); }
        .dot-yes { display: inline-block; width: 20px; height: 20px; border-radius: 50%; background: var(--teal); }
        .dot-no  { display: inline-block; width: 20px; height: 20px; border-radius: 50%; background: rgba(91,184,245,0.15); }
        .compare-book-btn {
          font-size: 12px; font-weight: 500;
          background: var(--sky-pale); color: var(--teal);
          padding: 6px 16px; border-radius: 50px;
          text-decoration: none; white-space: nowrap;
        }
        .compare-book-btn:hover { background: var(--sky-light); }

        /* FAQ */
        .faq-list { display: flex; flex-direction: column; }
        .faq-item { border-bottom: 1px solid var(--border); }
        .faq-item:first-child { border-top: 1px solid var(--border); }
        .faq-q {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          padding: 22px 0;
          background: none;
          border: none;
          cursor: pointer;
          font-family: var(--font-display);
          font-size: 16px;
          font-weight: 500;
          color: var(--text);
          text-align: left;
          gap: 16px;
        }
        .faq-arrow { font-size: 20px; color: var(--teal); flex-shrink: 0; line-height: 1; }
        .faq-a { font-size: 14px; color: var(--text-2); line-height: 1.75; padding-bottom: 20px; }

        /* CTA text */
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
          .filter-bar { padding: 14px 24px; }
          .treatments-grid { grid-template-columns: 1fr 1fr; }
          .addons-grid { grid-template-columns: 1fr 1fr; }
        }
        @media(max-width: 768px) {
          .filter-bar { padding: 12px 16px; gap: 8px; flex-wrap: wrap; }
          .filter-pill { font-size: 11px; padding: 7px 14px; }
          .treatments-grid { grid-template-columns: 1fr 1fr; gap: 12px; }
          .cta-btns { flex-direction: column; align-items: center; }
          .cta-btns a { width: 100%; max-width: 320px; text-align: center; }
        }
        @media(max-width: 640px) {
          .treatments-grid { grid-template-columns: 1fr; }
          .addons-grid { grid-template-columns: 1fr; }
          .filter-bar { padding: 10px 16px; }
        }
        @media(max-width: 480px) {
          .treatments-grid { grid-template-columns: 1fr; gap: 10px; }
          .addons-grid { grid-template-columns: 1fr; }
          .drip-card-top { height: 80px; }
        }
      `}</style>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="hero-sub">
        <div className="hero-blobs">
          <div className="blob b1" />
          <div className="blob b2" />
        </div>
        <div className="hero-content" style={{ maxWidth: 660 }}>
          <nav className="breadcrumb">
            <Link href="/">Home</Link> &rsaquo; Treatments
          </nav>
          <h1>
            Our Signature <em>IV Formulas</em>
          </h1>
          <p>
            18 physician-crafted IV formulas — each designed to address a specific
            biological goal, compounded fresh in our ISO-certified pharmacy.
          </p>
          <div className="hero-filter-pills">
            {CATS.map((c) => (
              <button
                key={c.key}
                className="hero-filter-pill"
                onClick={() => setActiveCat(c.key)}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Sticky filter bar ────────────────────────────────────────────── */}
      <div className="filter-bar">
        {CATS.map((c) => (
          <button
            key={c.key}
            className={`filter-pill${activeCat === c.key ? " active" : ""}`}
            onClick={() => setActiveCat(c.key)}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* ── Drips grid ───────────────────────────────────────────────────── */}
      <section className="section">
        <div className="treatments-section-header">
          <div>
            <R><p className="eyebrow">Signature Formulas</p></R>
            <R delay={100}>
              <h2 className="sec-title">
                Every Drip, <em>Precisely</em> Crafted
              </h2>
            </R>
            <R delay={200}>
              <p className="sec-sub" style={{ marginBottom: 0 }}>
                Select a formula below. Every drip is approved by a board-certified
                physician and administered by a registered nurse.
              </p>
            </R>
          </div>
          <R delay={300}>
            <Link href="/health-quiz" className="quiz-btn">
              Not sure? Take the Quiz &rarr;
            </Link>
          </R>
        </div>

        <div className="treatments-grid">
          {filtered.map((drip, i) => (
            <R key={drip.id} delay={i * 80}>
              <article className="treatments-card">
                {/* Accent gradient top bar */}
                <div className="drip-card-top" style={{ background: drip.accentGradient }} />

                {/* Icon + popular badge */}
                <div className="drip-card-header">
                  <div className="drip-icon">{drip.icon}</div>
                  {drip.popular && <span className="popular-badge">Most Popular</span>}
                </div>

                {/* Name + subtitle */}
                <div className="drip-name">{drip.name}</div>
                <p className="drip-tagline">{drip.subtitle}</p>

                {/* Description */}
                <p style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.75, marginBottom: 20 }}>
                  {drip.description}
                </p>

                {/* Ingredient bars */}
                <div className="ingredient-bars">
                  {drip.ingredients.map((ing) => (
                    <div key={ing.name} className="ing-row">
                      <div className="ing-meta">
                        <span className="ing-name">{ing.name}</span>
                        <span className="ing-dose">{ing.dose}</span>
                      </div>
                      <div className="ing-track">
                        <div className="ing-fill" style={{ width: `${ing.barPct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tags */}
                <div className="drip-tags">
                  {drip.tags.map((tag) => (
                    <span key={tag} className="drip-tag">{tag}</span>
                  ))}
                </div>

                {/* Duration / volume */}
                <div className="drip-meta-row">
                  <span>
                    <span className="drip-meta-val">{drip.duration}</span>{" "}
                    <span className="drip-meta-label">duration</span>
                  </span>
                  <span>
                    <span className="drip-meta-val">{drip.volume}</span>{" "}
                    <span className="drip-meta-label">volume</span>
                  </span>
                </div>

                {/* Price + CTA */}
                <div className="drip-footer">
                  <div>
                    <span className="drip-price-large">&#x20B9;{drip.price.toLocaleString("en-IN")}</span>
                    <span className="drip-price-unit">/ session</span>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <Link href={`/treatments/${drip.slug}`} className="book-btn" style={{ background: "var(--sky-pale)", color: "var(--teal)" }}>
                      Details
                    </Link>
                    <Link href={`/book-now?drip=${drip.name}`} className="book-btn">
                      Book Now
                    </Link>
                  </div>
                </div>
              </article>
            </R>
          ))}
        </div>
      </section>

      {/* ── Add-Ons ──────────────────────────────────────────────────────── */}
      <section className="section section-alt">
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <R><p className="eyebrow">Customise Your Infusion</p></R>
          <R delay={100}>
            <h2 className="sec-title" style={{ margin: "0 auto" }}>
              Power-Up <em>Add-Ons</em>
            </h2>
          </R>
          <R delay={200}>
            <p className="sec-sub" style={{ margin: "12px auto 0", textAlign: "center" }}>
              Enhance any drip with physician-approved boosters. Add directly when booking.
            </p>
          </R>
        </div>

        <div className="addons-grid">
          {ADDONS.map((addon, i) => (
            <R key={addon.name} delay={i * 70}>
              <div className="addon-card">
                <div className="addon-icon">{addon.icon}</div>
                <div>
                  <div className="addon-name">{addon.name}</div>
                  <div className="addon-desc">{addon.description}</div>
                </div>
                <div className="addon-price">&#x20B9;{addon.price.toLocaleString("en-IN")}</div>
              </div>
            </R>
          ))}
        </div>
      </section>

      {/* ── Comparison table ─────────────────────────────────────────────── */}
      <section className="section">
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <R><p className="eyebrow">Side-by-Side</p></R>
          <R delay={100}>
            <h2 className="sec-title" style={{ margin: "0 auto" }}>
              Compare <em>Benefits</em>
            </h2>
          </R>
        </div>

        <R delay={200}>
          <div className="compare-wrap">
            <table className="compare-table">
              <thead>
                <tr>
                  <th style={{ minWidth: 160 }}>Drip</th>
                  {BENEFITS.map((b) => <th key={b} className="center">{b}</th>)}
                  <th />
                </tr>
              </thead>
              <tbody>
                {COMPARISON_DRIPS.map((name) => {
                  const drip = DRIPS.find((d) => d.name === name);
                  return (
                    <tr key={name}>
                      <td>
                        <div className="compare-drip-cell">
                          <span className="compare-drip-icon">{drip?.icon}</span>
                          <span className="compare-drip-name">{name}</span>
                        </div>
                      </td>
                      {BENEFITS.map((b) => (
                        <td key={b} className="center">
                          {BENEFIT_MATRIX[name]?.[b]
                            ? <span className="dot-yes" title={`${name} supports ${b}`} />
                            : <span className="dot-no" />}
                        </td>
                      ))}
                      <td style={{ textAlign: "right" }}>
                        <Link href={`/book-now?drip=${name}`} className="compare-book-btn">Book</Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </R>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section className="section section-sky">
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <R><p className="eyebrow">Common Questions</p></R>
          <R delay={100}>
            <h2 className="sec-title" style={{ margin: "0 auto" }}>
              Frequently <em>Asked</em>
            </h2>
          </R>
        </div>
        <R delay={200}>
          <div style={{ maxWidth: 720, margin: "0 auto" }}>
            <div className="faq-list">
              {FAQS.map((faq) => (
                <FaqItem key={faq.q} q={faq.q} a={faq.a} />
              ))}
            </div>
          </div>
        </R>
      </section>

      {/* ── CTA strip ────────────────────────────────────────────────────── */}
      <div className="cta-strip">
        <R>
          <h2 className="cta-h2">
            Not sure which drip is{" "}
            <em style={{ fontStyle: "italic", fontFamily: "var(--font-serif)", color: "rgba(255,255,255,0.85)", fontWeight: 400 }}>
              right for you?
            </em>
          </h2>
        </R>
        <R delay={100}>
          <p className="cta-p">
            Take our 2-minute health quiz and receive a personalised drip recommendation instantly.
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
