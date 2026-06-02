"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

/* ─── Page-specific CSS ──────────────────────────────────────────────────────── */
const PAGE_CSS = `
/* ── Hero dark 2-col ── */
.hero-dark-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 64px;
  align-items: center;
  position: relative;
  z-index: 2;
}
.hero-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.hero-stat {
  background: rgba(255,255,255,0.12);
  backdrop-filter: blur(10px);
  border: 1.5px solid rgba(255,255,255,0.2);
  border-radius: var(--radius-sm);
  padding: 20px;
}
.hero-stat-num {
  font-size: 32px;
  font-weight: 600;
  color: #fff;
  letter-spacing: -1.5px;
  line-height: 1;
  margin-bottom: 6px;
}
.hero-stat-label {
  font-size: 12px;
  color: rgba(255,255,255,0.65);
  letter-spacing: 1px;
}

/* ── Benefits ── */
.benefits-layout {
  display: grid;
  grid-template-columns: 380px 1fr;
  gap: 80px;
  align-items: start;
  margin-bottom: 64px;
}
.benefits-intro p { font-size: 15px; color: var(--text-2); line-height: 1.75; }
.benefits-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}
.benefit {
  background: var(--white);
  border-radius: var(--radius);
  border: 1.5px solid var(--border);
  padding: 28px 24px;
  transition: transform 0.3s, box-shadow 0.3s, border-color 0.3s;
  cursor: default;
  position: relative;
  overflow: hidden;
}
.benefit::after {
  content: '';
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: 3px;
  background: linear-gradient(180deg, var(--sky), var(--teal));
  transform: scaleY(0);
  transform-origin: top;
  transition: transform 0.35s;
}
.benefit:hover {
  transform: translateX(4px);
  box-shadow: var(--shadow-lg);
  border-color: var(--sky);
}
.benefit:hover::after { transform: scaleY(1); }
.benefit-icon { font-size: 28px; margin-bottom: 14px; }
.benefit-title { font-size: 15px; font-weight: 600; letter-spacing: -0.3px; margin-bottom: 6px; }
.benefit-desc { font-size: 13px; color: var(--text-2); line-height: 1.7; }

/* ── Tiers ── */
.tiers-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 20px;
  margin-top: 60px;
}
.tier-card {
  background: var(--white);
  border-radius: var(--radius);
  border: 1.5px solid var(--border);
  padding: 36px 28px;
  transition: transform 0.3s, box-shadow 0.3s;
  position: relative;
  overflow: hidden;
}
.tier-card.featured {
  border-color: var(--teal);
  box-shadow: 0 0 0 3px rgba(26,126,168,0.15);
}
.tier-featured-badge {
  position: absolute;
  top: 16px; right: 16px;
  background: var(--teal);
  color: #fff;
  font-size: 10px;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 50px;
}
.tier-card:hover:not(.featured) { transform: translateY(-4px); box-shadow: var(--shadow-lg); }
.tier-card.featured:hover { transform: translateY(-4px); }
.tier-name {
  font-size: 22px;
  font-weight: 600;
  letter-spacing: -0.5px;
  margin-bottom: 4px;
}
.tier-discount {
  font-size: 13px;
  color: var(--teal);
  font-weight: 500;
  margin-bottom: 20px;
}
.tier-moq {
  font-size: 12px;
  color: var(--text-3);
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border);
}
.tier-features { list-style: none; display: flex; flex-direction: column; gap: 10px; margin-bottom: 28px; }
.tier-feature {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 13px;
  color: var(--text-2);
  line-height: 1.5;
}
.tier-check {
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--sky-pale);
  color: var(--teal);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  margin-top: 1px;
}
.tier-cta {
  display: block;
  width: 100%;
  padding: 13px;
  border-radius: 50px;
  font-size: 13px;
  font-weight: 500;
  font-family: var(--font-display);
  border: none;
  cursor: pointer;
  text-align: center;
  text-decoration: none;
  transition: background 0.2s, transform 0.2s;
}
.tier-cta-primary {
  background: linear-gradient(145deg, var(--teal), var(--teal-dark));
  color: #fff;
}
.tier-cta-primary:hover { transform: translateY(-2px); box-shadow: var(--shadow); }
.tier-cta-secondary {
  background: var(--sky-pale);
  color: var(--teal);
}
.tier-cta-secondary:hover { background: var(--sky-light); }

/* ── Process ── */
.process-steps {
  display: flex;
  align-items: flex-start;
  gap: 0;
  margin-top: 60px;
  position: relative;
}
.process-steps::before {
  content: '';
  position: absolute;
  top: 28px;
  left: calc(10% + 14px);
  right: calc(10% + 14px);
  height: 2px;
  background: linear-gradient(90deg, var(--sky-pale), var(--teal), var(--sky-pale));
  z-index: 0;
}
.proc-step {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 0 12px;
  position: relative;
  z-index: 1;
}
.proc-circle {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--white);
  border: 2.5px solid var(--teal);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  margin-bottom: 16px;
  box-shadow: 0 4px 16px rgba(26,126,168,0.2);
  transition: background 0.3s, transform 0.3s;
}
.proc-step:hover .proc-circle {
  background: var(--teal);
  transform: scale(1.1);
}
.proc-step:hover .proc-circle .proc-num { color: #fff; }
.proc-num {
  font-size: 18px;
  font-weight: 600;
  color: var(--teal);
  transition: color 0.3s;
}
.proc-title { font-size: 14px; font-weight: 600; letter-spacing: -0.3px; margin-bottom: 6px; }
.proc-desc { font-size: 12px; color: var(--text-2); line-height: 1.6; }

/* ── Testimonials ── */
.clinic-testimonials {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-top: 60px;
}
.clinic-testi {
  background: var(--white);
  border-radius: var(--radius);
  border: 1.5px solid var(--border);
  padding: 28px;
  transition: box-shadow 0.3s, transform 0.3s;
}
.clinic-testi:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-4px);
}
.clinic-testi-stars { font-size: 13px; color: var(--sky); margin-bottom: 12px; }
.clinic-testi-text {
  font-family: var(--font-serif);
  font-style: italic;
  font-size: 14px;
  color: var(--text);
  line-height: 1.7;
  margin-bottom: 16px;
}
.clinic-testi-author { font-size: 12px; color: var(--text-3); letter-spacing: 1px; text-transform: uppercase; font-weight: 500; }

/* ── Partner section ── */
.partner-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 64px;
  align-items: start;
}
.partner-benefits { display: flex; flex-direction: column; gap: 16px; }
.partner-benefit-item {
  display: flex;
  gap: 14px;
  align-items: flex-start;
}
.partner-benefit-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: var(--sky-pale);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}
.partner-benefit-title { font-size: 14px; font-weight: 600; margin-bottom: 3px; }
.partner-benefit-desc { font-size: 13px; color: var(--text-2); line-height: 1.6; }
.partner-form {
  background: var(--white);
  border-radius: var(--radius);
  border: 1.5px solid var(--border);
  padding: 36px;
  box-shadow: var(--shadow);
}
.partner-form-title { font-size: 20px; font-weight: 600; letter-spacing: -0.5px; margin-bottom: 6px; }
.partner-form-sub { font-size: 13px; color: var(--text-2); line-height: 1.6; margin-bottom: 24px; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.form-submit-btn {
  width: 100%;
  padding: 14px;
  border-radius: 50px;
  background: linear-gradient(145deg, var(--teal), var(--teal-dark));
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  font-family: var(--font-display);
  border: none;
  cursor: pointer;
  margin-top: 8px;
  transition: transform 0.2s, box-shadow 0.2s;
}
.form-submit-btn:hover { transform: translateY(-2px); box-shadow: var(--shadow); }
.form-disclaimer { font-size: 11px; color: var(--text-3); text-align: center; margin-top: 10px; line-height: 1.5; }

/* ── Success modal ── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(14,34,51,0.6);
  backdrop-filter: blur(6px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  animation: fadeIn 0.25s ease;
}
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.modal-card {
  background: var(--white);
  border-radius: var(--radius);
  padding: 48px 40px;
  max-width: 440px;
  width: 100%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(14,34,51,0.2);
  animation: slideUp 0.35s cubic-bezier(0.16,1,0.3,1);
}
@keyframes slideUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
.modal-icon { font-size: 52px; margin-bottom: 16px; }
.modal-title { font-size: 24px; font-weight: 600; letter-spacing: -0.5px; margin-bottom: 8px; color: var(--text); }
.modal-sub { font-size: 14px; color: var(--text-2); line-height: 1.7; margin-bottom: 28px; }
.modal-close {
  padding: 12px 32px;
  border-radius: 50px;
  background: linear-gradient(145deg, var(--teal), var(--teal-dark));
  color: #fff;
  border: none;
  font-family: var(--font-display);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: transform 0.2s;
}
.modal-close:hover { transform: translateY(-2px); }

/* ── Responsive ── */
@media (max-width: 1024px) {
  .hero-dark-layout { grid-template-columns: 1fr; }
  .hero-stats { grid-template-columns: 1fr 1fr; }
  .benefits-layout { grid-template-columns: 1fr; gap: 40px; }
  .benefits-grid { grid-template-columns: 1fr 1fr; }
  .tiers-grid { grid-template-columns: 1fr; }
  .clinic-testimonials { grid-template-columns: 1fr; }
  .partner-layout { grid-template-columns: 1fr; }
  .process-steps { flex-direction: column; gap: 28px; }
  .process-steps::before { display: none; }
}
@media (max-width: 640px) {
  .benefits-grid { grid-template-columns: 1fr; }
  .hero-stats { grid-template-columns: 1fr; }
  .form-row { grid-template-columns: 1fr; }
}
@media (max-width: 480px) {
  .tiers-grid { gap: 12px; }
  .benefits-grid { gap: 10px; }
  .partner-form { padding: 24px 16px; }
}
`;

/* ─── Reveal wrapper ─────────────────────────────────────────────────────────── */
function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
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

/* ─── Static data ────────────────────────────────────────────────────────────── */
const HERO_STATS = [
  { num: "200+", label: "Partner Clinics" },
  { num: "30–45%", label: "Wholesale Discount" },
  { num: "24h",   label: "Dispatch SLA" },
  { num: "18",    label: "Formulas Available" },
];

const BENEFITS = [
  { icon: "💊", title: "Wholesale Formula Supply",       desc: "All 18 NutriDrip formulas available at 30–45% below market rate, depending on your monthly volume tier." },
  { icon: "🚚", title: "Same-Day / Next-Day Dispatch",   desc: "Orders placed before 2 PM dispatch the same working day. All formulas arrive cold-chain compliant and batch-certified." },
  { icon: "🖥️", title: "Partner Web Dashboard",          desc: "Manage orders, track deliveries, view client session logs, and download batch certificates from one unified portal." },
  { icon: "👩‍⚕️", title: "Staff Training Support",       desc: "Training modules, video guides, and direct nurse support line included at Gold and Platinum tiers." },
  { icon: "📄", title: "Co-Branded Materials",           desc: "Get clinic-branded consent forms, IV protocol guides, and patient education leaflets pre-designed by our medical team." },
  { icon: "📞", title: "Dedicated Account Manager",      desc: "Gold and Platinum partners get a named account manager available 9 AM–7 PM for support, ordering, and clinical queries." },
];

const TIERS = [
  {
    name: "Silver",
    discount: "30% wholesale discount",
    moq: "Minimum 10 sessions / formula / month",
    features: [
      "Access to all 18 formulas",
      "Standard 48h dispatch",
      "Written protocols & video guides",
      "Monthly ordering cycle",
      "Batch test certificates",
    ],
    featured: false,
    cta: "Apply for Silver",
    ctaClass: "tier-cta-secondary",
  },
  {
    name: "Gold",
    discount: "40% wholesale discount",
    moq: "Minimum 30 sessions / formula / month",
    features: [
      "Everything in Silver",
      "Same-day dispatch (orders before 2 PM)",
      "Online training modules + nurse support line",
      "Co-branded patient materials",
      "Quarterly clinical review call",
      "Partner dashboard access",
    ],
    featured: true,
    cta: "Apply for Gold",
    ctaClass: "tier-cta-primary",
  },
  {
    name: "Platinum",
    discount: "45% wholesale discount",
    moq: "Minimum 60 sessions / formula / month",
    features: [
      "Everything in Gold",
      "In-clinic staff training session",
      "Dedicated account manager",
      "Priority dispatch & emergency top-ups",
      "Custom formula development (on request)",
      "Revenue-sharing referral programme",
    ],
    featured: false,
    cta: "Apply for Platinum",
    ctaClass: "tier-cta-secondary",
  },
];

const PROCESS_STEPS = [
  { num: "1", emoji: "📝", title: "Apply Online",          desc: "Submit your clinic details and monthly volume estimate via the form below." },
  { num: "2", emoji: "📞", title: "Discovery Call",        desc: "Our B2B team contacts you within 24h to understand your needs and confirm fit." },
  { num: "3", emoji: "📋", title: "Agreement & Tier",      desc: "We sign a simple partnership agreement and confirm your wholesale tier." },
  { num: "4", emoji: "🚀", title: "Onboarding",            desc: "Dashboard access, training materials, and your first order are processed within 48h." },
  { num: "5", emoji: "💰", title: "Grow Together",         desc: "Order as needed, scale tiers as your volume grows, and earn referral bonuses." },
];

const TESTIMONIALS = [
  {
    stars: "★★★★★",
    text: "\"NutriDrip's B2B programme transformed our wellness centre. We went from zero IV offerings to 40 sessions a month within six weeks. The training support was exceptional.\"",
    author: "Dr. Sneha Kapoor — Dermatology Clinic, Mumbai",
  },
  {
    stars: "★★★★★",
    text: "\"The wholesale pricing makes IV therapy genuinely viable as a service. The same-day dispatch and batch certificates mean we never worry about supply or compliance.\"",
    author: "Dr. Vikram Patel — Sports Medicine Centre, Delhi",
  },
  {
    stars: "★★★★★",
    text: "\"Our patients love having NutriDrip formulas available in-house. The partner dashboard is simple, the account manager is responsive, and the quality is consistent.\"",
    author: "Dr. Ananya Joshi — Integrative Wellness Clinic, Bengaluru",
  },
];

/* ─── Partner form ───────────────────────────────────────────────────────────── */
type FormState = { clinicName: string; doctorName: string; email: string; phone: string; city: string; monthlyVolume: string; message: string };
const EMPTY: FormState = { clinicName: "", doctorName: "", email: "", phone: "", city: "", monthlyVolume: "", message: "" };

function PartnerForm() {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [showModal, setShowModal] = useState(false);

  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [k]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowModal(true);
    setForm(EMPTY);
  };

  return (
    <>
      <div className="partner-form">
        <div className="partner-form-title">Apply to Partner with NutriDrip</div>
        <p className="partner-form-sub">Complete this form and our B2B team will contact you within one business day.</p>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Clinic / Practice Name *</label>
              <input className="form-input" type="text" required value={form.clinicName} onChange={set("clinicName")} placeholder="Your clinic name" />
            </div>
            <div className="form-group">
              <label className="form-label">Doctor / Contact Name *</label>
              <input className="form-input" type="text" required value={form.doctorName} onChange={set("doctorName")} placeholder="Dr. Full Name" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input className="form-input" type="email" required value={form.email} onChange={set("email")} placeholder="doctor@clinic.com" />
            </div>
            <div className="form-group">
              <label className="form-label">Phone *</label>
              <input className="form-input" type="tel" required value={form.phone} onChange={set("phone")} placeholder="+91 98765 43210" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">City *</label>
              <select className="form-input" required value={form.city} onChange={set("city")}>
                <option value="">Select city</option>
                <option>Mumbai</option>
                <option>Delhi NCR</option>
                <option>Bengaluru</option>
                <option>Hyderabad</option>
                <option>Pune</option>
                <option>Chennai</option>
                <option>Other</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Est. Monthly Sessions</label>
              <select className="form-input" value={form.monthlyVolume} onChange={set("monthlyVolume")}>
                <option value="">Select range</option>
                <option>Under 10</option>
                <option>10–30 (Silver)</option>
                <option>30–60 (Gold)</option>
                <option>60+ (Platinum)</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Tell us about your practice</label>
            <textarea
              className="form-input"
              rows={3}
              value={form.message}
              onChange={set("message")}
              placeholder="Specialty, current IV experience, what you're looking to offer..."
              style={{ resize: "vertical", borderRadius: "var(--radius-sm)" }}
            />
          </div>
          <button type="submit" className="form-submit-btn">Submit Application &rarr;</button>
          <p className="form-disclaimer">No partnership fee. No minimum commitment to apply. We respond within 1 business day.</p>
        </form>
      </div>

      {/* Success modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon">🎉</div>
            <div className="modal-title">Application Received!</div>
            <p className="modal-sub">
              Thank you for applying to the NutriDrip Partner Programme. Our B2B team will review your application and contact you within one business day.
            </p>
            <button className="modal-close" onClick={() => setShowModal(false)}>Got it</button>
          </div>
        </div>
      )}
    </>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────────── */
export default function ForClinicsPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: PAGE_CSS }} />

      {/* ── Hero dark ── */}
      <section className="hero-dark">
        <div className="hero-blobs">
          <div className="blob b1" style={{ background: "rgba(255,255,255,0.1)" }} />
          <div className="blob b2" style={{ background: "rgba(255,255,255,0.07)" }} />
          <div className="blob b3" />
        </div>
        <div className="hero-dark-layout">
          {/* Left */}
          <div>
            <p className="breadcrumb">
              <Link href="/">Home</Link> &rsaquo; For Clinics
            </p>
            <h1>
              Offer IV Therapy in <em>Your Clinic</em>
            </h1>
            <p style={{ marginBottom: 32 }}>
              Join 200+ partner clinics offering physician-formulated NutriDrip IV formulas at wholesale pricing. No setup fee, no minimum commitment to apply.
            </p>
            <div className="hero-btns">
              <a href="#apply" className="btn-white">Apply to Partner &rarr;</a>
              <a href="#tiers" className="btn-ghost">View Pricing Tiers</a>
            </div>
          </div>
          {/* Right — stat tiles */}
          <div className="hero-stats">
            {HERO_STATS.map((s) => (
              <div key={s.label} className="hero-stat">
                <div className="hero-stat-num">{s.num}</div>
                <div className="hero-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Benefits ── */}
      <section className="section">
        <div className="benefits-layout">
          <div className="benefits-intro">
            <Reveal>
              <p className="eyebrow">Why Partner With Us</p>
            </Reveal>
            <Reveal delay={100}>
              <h2 className="sec-title">
                Everything Your Clinic <em>Needs</em>
              </h2>
            </Reveal>
            <Reveal delay={200}>
              <p>
                NutriDrip handles formulation, quality control, compliance, and training. You focus on your clients. We give you everything you need to offer IV therapy professionally from day one.
              </p>
            </Reveal>
          </div>
          <div className="benefits-grid">
            {BENEFITS.map((b, i) => (
              <Reveal key={b.title} delay={i * 80}>
                <div className="benefit">
                  <div className="benefit-icon">{b.icon}</div>
                  <div className="benefit-title">{b.title}</div>
                  <p className="benefit-desc">{b.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tiers ── */}
      <section className="section section-sky" id="tiers">
        <Reveal>
          <p className="eyebrow">Partnership Tiers</p>
        </Reveal>
        <Reveal delay={100}>
          <h2 className="sec-title">
            Choose Your <em>Partnership Level</em>
          </h2>
        </Reveal>
        <Reveal delay={150}>
          <p className="sec-sub">
            Scale from Silver to Platinum as your IV therapy practice grows. No lock-in — tier up any quarter.
          </p>
        </Reveal>
        <div className="tiers-grid">
          {TIERS.map((tier, i) => (
            <Reveal key={tier.name} delay={i * 100}>
              <div className={`tier-card${tier.featured ? " featured" : ""}`}>
                {tier.featured && <span className="tier-featured-badge">Most Popular</span>}
                <div className="tier-name">{tier.name}</div>
                <div className="tier-discount">{tier.discount}</div>
                <div className="tier-moq">{tier.moq}</div>
                <ul className="tier-features">
                  {tier.features.map((f) => (
                    <li key={f} className="tier-feature">
                      <span className="tier-check">✓</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <a href="#apply" className={`tier-cta ${tier.ctaClass}`}>{tier.cta}</a>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Process ── */}
      <section className="section">
        <Reveal>
          <p className="eyebrow">How It Works</p>
        </Reveal>
        <Reveal delay={100}>
          <h2 className="sec-title">
            From Application to <em>First Order</em> in 5 Steps
          </h2>
        </Reveal>
        <Reveal delay={150}>
          <div className="process-steps">
            {PROCESS_STEPS.map((step, i) => (
              <div className="proc-step" key={step.num} style={{ transitionDelay: `${i * 80}ms` }}>
                <div className="proc-circle">
                  <span className="proc-num">{step.emoji}</span>
                </div>
                <div className="proc-title">{step.title}</div>
                <p className="proc-desc">{step.desc}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ── Testimonials ── */}
      <section className="section section-alt">
        <Reveal>
          <p className="eyebrow">Partner Voices</p>
        </Reveal>
        <Reveal delay={100}>
          <h2 className="sec-title">
            What Our <em>Clinic Partners</em> Say
          </h2>
        </Reveal>
        <div className="clinic-testimonials">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={i} delay={i * 100}>
              <div className="clinic-testi">
                <div className="clinic-testi-stars">{t.stars}</div>
                <p className="clinic-testi-text">{t.text}</p>
                <div className="clinic-testi-author">{t.author}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Partner form ── */}
      <section className="section" id="apply">
        <div className="partner-layout">
          {/* Left — benefits list */}
          <div>
            <Reveal>
              <p className="eyebrow">Apply Now</p>
            </Reveal>
            <Reveal delay={100}>
              <h2 className="sec-title" style={{ marginBottom: 12 }}>
                Start Your <em>Partnership</em>
              </h2>
            </Reveal>
            <Reveal delay={150}>
              <p style={{ fontSize: 15, color: "var(--text-2)", lineHeight: 1.75, marginBottom: 36 }}>
                Applying takes under 3 minutes. There is no partnership fee and no minimum commitment to apply. Our B2B team will contact you within one business day.
              </p>
            </Reveal>
            <div className="partner-benefits">
              {[
                { icon: "💸", title: "No Partnership Fee",         desc: "Zero cost to join. You only pay for the formulas you order at your discounted wholesale rate." },
                { icon: "📦", title: "No Minimum to Apply",        desc: "Apply at any volume. Your tier is set based on your actual monthly ordering after onboarding." },
                { icon: "⚡", title: "Onboarded Within 48 Hours",  desc: "Dashboard access, training, and first order typically completed within two working days." },
                { icon: "🤝", title: "We Grow When You Grow",      desc: "As your monthly volume increases, your discount tier upgrades automatically at each quarter-end review." },
              ].map((b, i) => (
                <Reveal key={b.title} delay={i * 80}>
                  <div className="partner-benefit-item">
                    <div className="partner-benefit-icon">{b.icon}</div>
                    <div>
                      <div className="partner-benefit-title">{b.title}</div>
                      <p className="partner-benefit-desc">{b.desc}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          {/* Right — form */}
          <Reveal delay={200}>
            <PartnerForm />
          </Reveal>
        </div>
      </section>

      {/* ── CTA strip ── */}
      <section className="cta-strip">
        <Reveal>
          <h2 style={{ fontSize: "clamp(26px,3.5vw,44px)", fontWeight: 600, color: "#fff", letterSpacing: "-1px", marginBottom: 16 }}>
            Ready to bring IV therapy <em style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontWeight: 400 }}>to your clients</em>?
          </h2>
        </Reveal>
        <Reveal delay={100}>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.85)", maxWidth: 480, margin: "0 auto 32px", lineHeight: 1.7 }}>
            200+ clinics already trust NutriDrip for wholesale IV formulas. Join them today — no fee, no minimum commitment.
          </p>
        </Reveal>
        <Reveal delay={200}>
          <div className="hero-btns" style={{ justifyContent: "center" }}>
            <a href="#apply" className="btn-white">Apply to Partner &rarr;</a>
            <Link href="/treatments" className="btn-ghost">Browse Formulas</Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
