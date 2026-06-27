"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { DRIPS } from "@/lib/data/drips";
import { TESTIMONIALS } from "@/lib/data/testimonials";

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.1 }
    );
    ref.current.querySelectorAll(".reveal").forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);
  return ref;
}

function CountUp({ target, suffix = "" }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const done = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !done.current) {
        done.current = true;
        let c = 0;
        const step = target / 60;
        const id = setInterval(() => {
          c += step;
          if (c >= target) { el.textContent = target.toLocaleString() + suffix; clearInterval(id); }
          else el.textContent = Math.floor(c).toLocaleString() + suffix;
        }, 16);
      }
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, [target, suffix]);
  return <span ref={ref} className="stat-num">0</span>;
}

export default function HomePage() {
  const pageRef = useReveal();
  const testi = [...TESTIMONIALS, ...TESTIMONIALS];

  return (
    <div ref={pageRef}>
      {/* HERO */}
      <section className="hero-home">
        <div className="hero-blobs">
          <div className="blob b1" />
          <div className="blob b2" />
          <div className="blob b3" />
        </div>

        {/* LEFT — hero copy */}
        <div className="hero-content">
          <div className="hero-badge"><div className="badge-dot" /> Premium IV Therapy &middot; Delivered to You</div>
          <h1 className="hero-title">Unlock your <em>peak vitality</em> with expert IV drips</h1>
          <p className="hero-sub-text">Experience optimal health, boost your energy, and discover true vitality with our physician-designed, nurse-delivered formulas.</p>
          <div className="hero-btns">
            <Link href="/health-quiz" className="btn-white">Find My Drip &rarr;</Link>
            <Link href="/treatments" className="btn-ghost">Explore Treatments</Link>
          </div>
          <div className="hero-trust">
            <div className="trust-pill">
              <svg viewBox="0 0 16 16" fill="none"><path d="M8 1L10 6h5l-4 3 1.5 5L8 12l-4.5 3L5 10 1 7h5z" fill="#1A7EA8"/></svg>
              Expert care &middot; Certified nurses
            </div>
            <div className="trust-pill">
              <svg viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="#1A7EA8" strokeWidth="1.5"/><path d="M5 8l2 2 4-4" stroke="#1A7EA8" strokeWidth="1.5" strokeLinecap="round"/></svg>
              Quick results &middot; Feel it fast
            </div>
          </div>
        </div>

        {/* RIGHT — animated IV drip visual */}
        <div className="hero-visual">
          {/* Layer 1: pulse rings */}
          <div className="hero-pulse-ring" />
          <div className="hero-pulse-ring" />
          <div className="hero-pulse-ring" />

          {/* Layer 5: sparkle particles */}
          <div className="hero-sparkle" />
          <div className="hero-sparkle" />
          <div className="hero-sparkle" />
          <div className="hero-sparkle" />
          <div className="hero-sparkle" />
          <div className="hero-sparkle" />
          <div className="hero-sparkle" />

          {/* Layer 2: IV bag */}
          <div className="iv-bag">
            <div className="iv-bag-hook" />
            <div className="iv-bag-label">NutriDrip</div>
            <div className="iv-bag-inner">
              <div className="iv-fluid">
                <div className="iv-bubble" />
                <div className="iv-bubble" />
                <div className="iv-bubble" />
                <div className="iv-bubble" />
                <div className="iv-bubble" />
              </div>
            </div>

            {/* Layer 3: drip tube + animated droplet (inside bag, at bottom) */}
            <div className="iv-tube-wrap">
              <div className="iv-tube-line" />
              <div className="iv-droplet" />
            </div>
          </div>

          {/* Layer 4: floating info cards */}
          {/* Top-right: bioavailability with SVG progress ring */}
          <div className="hero-info-card card-bioavail">
            <div className="hero-info-card-title">Bioavailability</div>
            <div className="ic-ring-wrap">
              <svg className="ic-ring" width="38" height="38" viewBox="0 0 38 38">
                <circle cx="19" cy="19" r="15" fill="none" stroke="rgba(91,184,245,0.18)" strokeWidth="3.5"/>
                <circle cx="19" cy="19" r="15" fill="none" stroke="var(--teal)" strokeWidth="3.5"
                  strokeDasharray="94" strokeDashoffset="6"
                  strokeLinecap="round" transform="rotate(-90 19 19)"/>
              </svg>
              <div>
                <div className="hero-info-card-value">97%</div>
                <div className="hero-info-card-sub">vs 20% oral</div>
              </div>
            </div>
          </div>

          {/* Left: physician approved */}
          <div className="hero-info-card card-physician">
            <div className="hero-info-card-title">Physician Approved</div>
            <div className="hero-info-card-value" style={{display:"flex",alignItems:"center",gap:"6px"}}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" fill="rgba(26,126,168,0.12)" stroke="var(--teal)" strokeWidth="1.5"/>
                <path d="M5 8l2 2 4-4" stroke="var(--teal)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Dr. Sharma
            </div>
            <div className="hero-info-card-sub">MD, Internal Medicine</div>
          </div>

          {/* Bottom-right: next appointment */}
          <div className="hero-info-card card-schedule">
            <div className="hero-info-card-title">Next Session</div>
            <div className="hero-info-card-value" style={{display:"flex",alignItems:"center",gap:"6px"}}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="6.5" stroke="var(--teal)" strokeWidth="1.4"/>
                <path d="M8 4.5v4l2.5 1.5" stroke="var(--teal)" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
              Today, 3 pm
            </div>
            <div className="hero-info-card-sub">Velocity Boost &#x26A1;</div>
          </div>
        </div>

        <div className="scroll-indicator">
          <span>Scroll</span>
          <div className="scroll-line" />
        </div>
      </section>

      {/* STATS */}
      <div className="stats-row">
        <div className="stat-item reveal"><CountUp target={12400} /><div className="stat-label">Happy Clients</div></div>
        <div className="stat-item reveal d1"><span className="stat-num">99<small style={{fontSize:20}}>%</small></span><div className="stat-label">Satisfaction</div></div>
        <div className="stat-item reveal d2"><span className="stat-num">24/7</span><div className="stat-label">Concierge</div></div>
        <div className="stat-item reveal d3"><span className="stat-num">18</span><div className="stat-label">Formulas</div></div>
        <div className="stat-item reveal d4"><span className="stat-num">ISO</span><div className="stat-label">Certified</div></div>
      </div>

      {/* GOALS */}
      <section className="section section-alt" style={{ padding: "100px 56px" }}>
        <div className="goals-header">
          <div>
            <div className="eyebrow reveal">Choose Your Goal</div>
            <h2 className="sec-title reveal">Unlock Your <em>Potential</em></h2>
          </div>
          <Link href="/health-quiz" className="btn-white reveal" style={{ background: "var(--teal)", color: "#fff" }}>Pick Your Goal &rarr;</Link>
        </div>
        <div className="goals-grid">
          {[
            { n: 1, t: "Recover & Rehydrate", d: "Restore energy and deep cellular hydration with IV therapy designed for fast recovery from travel, sport or illness." },
            { n: 2, t: "Boost Immunity", d: "Strengthen your body\u2019s natural defences with nutrient-rich Vitamin C, Zinc and Selenium IV therapy." },
            { n: 3, t: "Energy & Focus", d: "Boost your energy, sharpen your focus, and restore mental clarity with NAD+ and B-complex tailored IV." },
            { n: 4, t: "Skin & Glow", d: "High-dose Glutathione and Vitamin C for radiant, brightened skin and deep cellular detoxification." },
            { n: 5, t: "Athletic Performance", d: "Amino acids, L-Carnitine and electrolytes to accelerate muscle recovery and maximise endurance gains." },
            { n: 6, t: "Anti-Ageing & Longevity", d: "NAD+, Alpha Lipoic Acid and antioxidants to slow cellular ageing and promote long-term vitality." },
          ].map((g, i) => (
            <div key={g.n} className={`goal-card reveal ${i > 0 ? `d${Math.min(i, 4)}` : ""}`}>
              <div className="goal-num">{g.n}</div>
              <div className="goal-title">{g.t}</div>
              <div className="goal-desc">{g.d}</div>
              <div className="goal-link">Explore &rarr;</div>
            </div>
          ))}
        </div>
      </section>

      {/* DRIPS */}
      <section className="section" style={{ padding: "100px 56px" }}>
        <div className="eyebrow reveal">Our Formulas</div>
        <h2 className="sec-title reveal">Signature <em>Drips</em></h2>
        <p className="sec-sub reveal">Each formula crafted by leading physicians, compounded in our ISO-certified pharmacy.</p>
        <div className="drips-grid">
          {DRIPS.map((drip, i) => (
            <Link
              key={drip.id}
              href={`/treatments/${drip.slug}`}
              className={`drip-card reveal ${i > 0 ? `d${Math.min(i, 4)}` : ""}`}
              style={{ textDecoration: "none", color: "inherit", display: "block", cursor: "pointer" }}
            >
              <div className="drip-icon">{drip.icon}</div>
              <div className="drip-name">{drip.name}</div>
              <div className="drip-tagline">{drip.subtitle}: {drip.description.slice(0, 80)}...</div>
              <div className="drip-tags">
                {drip.tags.slice(0, 3).map((t) => <span key={t} className="drip-tag">{t}</span>)}
              </div>
              <div className="drip-price">&#x20B9;{drip.price.toLocaleString("en-IN")} <span>/ session</span></div>
              <span className="drip-order-btn" style={{ display: "block" }}>View Details &rarr;</span>
            </Link>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section" style={{ padding: "100px 56px", background: "linear-gradient(160deg, var(--sky-bg) 0%, #DCF0FA 50%, var(--sky-pale) 100%)" }}>
        <div className="how-layout">
          <div>
            <div className="eyebrow reveal">The Process</div>
            <h2 className="sec-title reveal">Simple, <em>Safe</em> &amp; Science-Led</h2>
            <div className="steps">
              {[
                { n: 1, t: "Take the Health Quiz", d: "Our intelligent questionnaire maps your symptoms and goals to identify your ideal formula." },
                { n: 2, t: "Physician Review", d: "A licensed MD reviews your profile and approves your personalised formula within 2 hours." },
                { n: 3, t: "Choose Your Setting", d: "Home, office, hotel or clinic \u2014 our certified nurses come to you anywhere in the city." },
                { n: 4, t: "Infuse & Feel the Shift", d: "Your drip is administered in 30\u201360 minutes. Most clients feel results within hours." },
              ].map((s, i) => (
                <div key={s.n} className={`step reveal d${i + 1}`}>
                  <div className="step-num">{s.n}</div>
                  <div>
                    <div className="step-title">{s.t}</div>
                    <div className="step-desc">{s.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="how-visual reveal">
            <div className="ring r3" />
            <div className="ring r2" />
            <div className="ring r1" />
            <div className="iv-visual">
              <svg width="120" height="200" viewBox="0 0 120 200" fill="none">
                <rect x="25" y="10" width="70" height="110" rx="16" fill="rgba(91,184,245,0.12)" stroke="rgba(91,184,245,0.5)" strokeWidth="1.5"/>
                <rect x="25" y="65" width="70" height="55" rx="0" fill="rgba(91,184,245,0.15)"/>
                <line x1="25" y1="64" x2="95" y2="64" stroke="rgba(91,184,245,0.6)" strokeWidth="1"/>
                <text x="60" y="42" textAnchor="middle" fill="rgba(26,126,168,0.7)" fontSize="9" fontFamily="serif" fontStyle="italic">NutriDrip</text>
                <circle cx="44" cy="90" r="4" fill="rgba(91,184,245,0.25)" stroke="rgba(91,184,245,0.5)" strokeWidth="1"/>
                <circle cx="65" cy="80" r="3" fill="rgba(91,184,245,0.2)" stroke="rgba(91,184,245,0.4)" strokeWidth="1"/>
                <circle cx="80" cy="95" r="5" fill="rgba(91,184,245,0.15)" stroke="rgba(91,184,245,0.3)" strokeWidth="1"/>
                <line x1="60" y1="120" x2="60" y2="155" stroke="rgba(91,184,245,0.4)" strokeWidth="2"/>
                <circle cx="60" cy="160" r="7" fill="none" stroke="rgba(91,184,245,0.4)" strokeWidth="1.5"/>
                <line x1="60" y1="167" x2="60" y2="195" stroke="rgba(91,184,245,0.4)" strokeWidth="2"/>
                <path d="M57 195 L60 200 L63 195" fill="rgba(91,184,245,0.4)"/>
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST */}
      <section className="section section-sky" style={{ padding: "100px 56px", textAlign: "center" }}>
        <div className="eyebrow reveal" style={{ textAlign: "center" }}>Why NutriDrip</div>
        <h2 className="sec-title reveal" style={{ textAlign: "center" }}>Built on <em>Science</em>,<br/>Delivered with Care</h2>
        <div className="cert-grid">
          {[
            { i: "\uD83C\uDFE5", n: "ISO Certified", d: "Our compounding pharmacy holds ISO 9001 for pharmaceutical quality management." },
            { i: "\uD83D\uDC69\u200D\u2695\uFE0F", n: "Board-Certified MDs", d: "Every formula and client protocol is approved by licensed physicians." },
            { i: "\uD83E\uDDEC", n: "Lab-Tested Purity", d: "Every batch is third-party tested for potency, sterility and contaminant absence." },
            { i: "\uD83D\uDD12", n: "HIPAA Compliant", d: "Your health data protected with end-to-end encryption and strict access controls." },
          ].map((c, idx) => (
            <div key={c.n} className={`cert-card reveal d${idx + 1}`}>
              <div className="cert-icon">{c.i}</div>
              <div className="cert-name">{c.n}</div>
              <div className="cert-desc">{c.d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={{ padding: "80px 0", overflow: "hidden", background: "var(--white)" }}>
        <div style={{ textAlign: "center", padding: "0 56px 56px" }}>
          <div className="eyebrow reveal">Client Stories</div>
          <h2 className="sec-title reveal" style={{ textAlign: "center" }}>Trusted by <em>Thousands</em></h2>
        </div>
        <div style={{ overflow: "hidden" }}>
          <div className="testi-track">
            {testi.map((t, i) => (
              <div key={i} className="testi-card">
                <div className="testi-stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
                <div className="testi-text">&ldquo;{t.text}&rdquo;</div>
                <div className="testi-name">{t.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-strip">
        <h2 className="reveal" style={{ fontSize: "clamp(28px,4vw,48px)", fontWeight: 600, color: "#fff", letterSpacing: "-1px", marginBottom: 16 }}>
          Not sure which drip is right for you?
        </h2>
        <p className="reveal" style={{ fontSize: 16, color: "rgba(255,255,255,0.8)", marginBottom: 32 }}>
          Take our 2-minute health quiz and get a personalised recommendation instantly.
        </p>
        <div className="reveal" style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/health-quiz" className="btn-white">Take the Health Quiz &rarr;</Link>
          <Link href="/book-now" className="btn-ghost">Book Now</Link>
        </div>
      </section>
    </div>
  );
}
