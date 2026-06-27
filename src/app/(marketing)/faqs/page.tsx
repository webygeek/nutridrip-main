"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";

/* ─── Page-specific CSS ──────────────────────────────────────────────────────── */
const PAGE_CSS = `
/* ── FAQ layout ── */
.faq-layout {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 40px;
  align-items: start;
}
/* ── Sidebar ── */
.faq-sidebar {
  position: sticky;
  top: 108px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.sidebar-panel {
  background: var(--white);
  border-radius: var(--radius);
  border: 1.5px solid var(--border);
  padding: 20px;
}
.sidebar-heading {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-3);
  letter-spacing: 2px;
  text-transform: uppercase;
  margin-bottom: 16px;
}
.cat-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.cat-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  text-align: left;
  font-family: var(--font-display);
  transition: background 0.2s, color 0.2s;
  background: transparent;
  color: var(--text-2);
}
.cat-btn.active {
  background: var(--sky-pale);
  color: var(--teal);
}
.cat-btn:hover:not(.active) {
  background: var(--off-white);
}
.cat-count {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 50px;
  font-weight: 500;
  background: rgba(91,184,245,0.18);
  color: var(--teal);
  transition: background 0.2s, color 0.2s;
}
.cat-btn.active .cat-count {
  background: var(--teal);
  color: var(--white);
}
/* ── Sidebar CTA ── */
.sidebar-cta-title {
  font-size: 15px;
  font-weight: 600;
  letter-spacing: -0.3px;
  margin-bottom: 6px;
}
.sidebar-cta-sub {
  font-size: 13px;
  color: var(--text-2);
  line-height: 1.7;
  margin-bottom: 16px;
}
.sidebar-cta-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 12px;
  border-radius: 50px;
  font-size: 13px;
  font-weight: 500;
  font-family: var(--font-display);
  background: linear-gradient(135deg, var(--teal), var(--teal-dark));
  color: var(--white);
  text-decoration: none;
  border: none;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}
.sidebar-cta-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow);
}
/* ── FAQ sections ── */
.faq-sections { flex: 1; min-width: 0; }
.faq-block {
  background: var(--white);
  border-radius: var(--radius);
  border: 1.5px solid var(--border);
  margin-bottom: 20px;
  overflow: hidden;
}
.faq-block-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 28px;
  border-bottom: 1px solid rgba(91,184,245,0.15);
}
.faq-block-icon { font-size: 22px; }
.faq-block-title { font-size: 17px; font-weight: 600; letter-spacing: -0.3px; }
.faq-block-count { font-size: 11px; color: var(--text-3); }
.faq-list { padding: 0 28px; }
/* ── Accordion ── */
.faq-item {
  border-bottom: 1px solid rgba(91,184,245,0.15);
  transition: background 0.2s;
}
.faq-item:last-child { border-bottom: none; }
.faq-item.open { background: rgba(214,238,250,0.25); }
.faq-q {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 0;
  background: none;
  border: none;
  cursor: pointer;
  font-family: var(--font-display);
  text-align: left;
}
.faq-q-text {
  font-size: 15px;
  font-weight: 500;
  color: var(--text);
  letter-spacing: -0.2px;
  line-height: 1.45;
}
.faq-icon {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--sky-pale);
  color: var(--teal);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 300;
  transition: transform 0.3s, background 0.2s;
  user-select: none;
}
.faq-icon.open {
  transform: rotate(45deg);
  background: var(--teal);
  color: var(--white);
}
.faq-a {
  overflow: hidden;
  max-height: 0;
  transition: max-height 0.4s cubic-bezier(0.4,0,0.2,1);
}
.faq-a.open { max-height: 600px; }
.faq-a-inner {
  font-size: 14px;
  color: var(--text-2);
  line-height: 1.75;
  padding-bottom: 20px;
  padding-right: 40px;
}
/* ── Search result info ── */
.search-info {
  font-size: 14px;
  color: var(--text-2);
  margin-bottom: 20px;
}
.search-info strong { color: var(--teal); }
/* ── No results ── */
.no-results {
  background: var(--white);
  border-radius: var(--radius);
  border: 1.5px solid var(--border);
  padding: 80px 24px;
  text-align: center;
}
.no-results-icon { font-size: 48px; margin-bottom: 16px; }
.no-results-title { font-size: 17px; font-weight: 600; letter-spacing: -0.3px; margin-bottom: 8px; }
.no-results-sub { font-size: 14px; color: var(--text-2); margin-bottom: 24px; }
.no-results-btn {
  padding: 10px 24px;
  border-radius: 50px;
  background: var(--sky-pale);
  color: var(--teal);
  font-size: 14px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  font-family: var(--font-display);
  transition: background 0.2s, color 0.2s;
}
.no-results-btn:hover { background: var(--teal); color: var(--white); }
/* ── Contact strip ── */
.contact-strip {
  padding: 80px 56px;
  background: linear-gradient(135deg, var(--teal) 0%, var(--teal-dark) 100%);
  text-align: center;
}
/* ── Responsive ── */
@media (max-width: 1024px) {
  .faq-layout { grid-template-columns: 1fr; }
  .faq-sidebar { position: static; }
  .contact-strip { padding: 60px 24px; }
}
@media (max-width: 768px) {
  .faq-layout { padding: 24px 16px calc(80px + env(safe-area-inset-bottom,0px)); }
  .faq-sidebar { margin-bottom: 24px; }
  .contact-strip { padding: 48px 16px; }
  .faq-cat-btn { font-size: 12px; padding: 8px 14px; }
}
@media (max-width: 480px) {
  .faq-layout { padding: 20px 12px calc(80px + env(safe-area-inset-bottom,0px)); }
  .faq-q-btn { font-size: 14px; padding: 16px 0; }
}
`;

/* ─── Types ──────────────────────────────────────────────────────────────────── */
type FaqItem     = { q: string; a: string };
type FaqCategory = { id: string; icon: string; label: string; items: FaqItem[] };

/* ─── Data ───────────────────────────────────────────────────────────────────── */
const FAQ_DATA: FaqCategory[] = [
  {
    id: "safety", icon: "🛡️", label: "Safety",
    items: [
      { q: "Is IV therapy safe?",
        a: "Yes — when administered by trained medical professionals using pharmaceutical-grade compounds. Every NutriDrip session is approved by a licensed MD, compounded in our ISO 9001-certified pharmacy, and administered by a certified registered nurse. We follow strict sterile preparation and infusion protocols." },
      { q: "Who should not receive IV therapy?",
        a: "IV therapy is not recommended for individuals with congestive heart failure, severe kidney disease, certain cardiac arrhythmias, or known allergies to any formula ingredients. Pregnant or breastfeeding women should consult their OB-GYN first. Our physician review process screens for all contraindications before approval." },
      { q: "What are the possible side effects?",
        a: "Most clients experience no side effects. Some may notice mild bruising or warmth at the IV site, a slight flushing sensation with high-dose Vitamin C or magnesium, or a temporary metallic taste. Serious adverse events are extremely rare with properly formulated, physician-approved IV therapy." },
      { q: "Are NutriDrip formulas third-party tested?",
        a: "Yes. Every batch produced in our compounding pharmacy is third-party tested for potency, sterility, endotoxin levels, and the absence of heavy metals or contaminants before release. Test certificates are available on request." },
      { q: "Do I need a doctor's prescription?",
        a: "NutriDrip's physician team reviews your health profile and issues an approval before each session — this functions as a medical order. You do not need to bring an external prescription. Our process ensures every infusion is medically supervised and appropriate for your individual profile." },
      { q: "How are your nurses qualified?",
        a: "All NutriDrip nurses are Registered Nurses (RNs) with a minimum of two years of clinical IV experience. They undergo additional NutriDrip certification covering IV placement, infusion monitoring, emergency response, and our specific formula protocols before their first client session." },
      { q: "What happens if I feel unwell during the infusion?",
        a: "Your nurse monitors you throughout the entire session. If any discomfort arises — flushing, nausea, dizziness, or pain at the IV site — the infusion is immediately slowed or stopped. Our nurses carry an emergency kit and are trained in anaphylaxis response. Our medical team is reachable by phone during all active sessions." },
      { q: "Is my health data kept private?",
        a: "Absolutely. NutriDrip is HIPAA-compliant. Your health profile, physician notes, and session records are encrypted end-to-end and stored on access-controlled servers. We never sell or share your health data with third parties. You can request deletion of your data at any time." },
    ],
  },
  {
    id: "treatments", icon: "💉", label: "Treatments",
    items: [
      { q: "What IV drips does NutriDrip offer?",
        a: "We offer 18 signature formulas targeting: hydration & recovery, immune defence, energy & NAD+, skin brightening & glutathione, athletic performance, anti-ageing & longevity, detox & liver support, migraine relief, hangover recovery, and weight management support. Each formula is explained in detail on our Treatments page." },
      { q: "How do I know which drip is right for me?",
        a: "Take our 2-minute Health Quiz — it maps your symptoms, lifestyle, and goals to the most clinically appropriate formula. You can also book a free phone consultation with our nursing team. Our physician team reviews every profile and may adjust the recommendation based on your health history." },
      { q: "How long does a session take?",
        a: "Most formulas infuse in 30–60 minutes. NAD+ protocols run 90–120 minutes due to the slower infusion rate required for comfort. High-dose Vitamin C sessions are typically 60–75 minutes. Your nurse will give you an accurate estimate for your chosen formula before starting." },
      { q: "How quickly will I feel results?",
        a: "Many clients report feeling effects within 2–4 hours of their session — particularly with hydration, hangover, and energy formulas. For skin-brightening and anti-ageing outcomes, consistent sessions over 4–8 weeks yield the most visible results. NAD+ effects on clarity and mood are often noticed the same evening." },
      { q: "How often should I get IV therapy?",
        a: "Frequency depends on your goal. Acute recovery (hangover, jet lag, post-sport) is typically a one-off session. Immune and energy maintenance works well with bi-weekly or monthly sessions. Skin brightening and NAD+ longevity protocols are most effective as 4–8 week courses. Our physicians personalise recommendations." },
      { q: "Can I combine multiple formulas?",
        a: "Yes, with physician approval. Our medical team can review your goals and health profile and recommend combination protocols. Some add-ons (e.g., extra Vitamin C, glutathione push, or B12 boost) can be added to base formulas at your session. Never self-combine formulas without medical guidance." },
      { q: "Do you offer oral supplement alternatives?",
        a: "We focus exclusively on IV and IM (intramuscular) delivery because they achieve near-100% bioavailability — bypassing the gut absorption limitations that reduce the efficacy of oral supplements. We do not currently sell oral supplements but may recommend evidence-based products from our clinical partners." },
    ],
  },
  {
    id: "booking", icon: "📅", label: "Booking",
    items: [
      { q: "How do I book a session?",
        a: "Click Book Now on any page, select your preferred formula, choose home, office, hotel, or clinic delivery, pick a date and time slot, and complete the intake form. Our physician team reviews your profile — typically within 2 hours — and confirms your booking by SMS and email." },
      { q: "Can I book for someone else?",
        a: "Yes. During booking, select 'Booking for someone else' and enter their details. They will receive a separate health intake form to complete. Our physician review applies to the recipient's profile, not the booker's. The recipient must be present for the session." },
      { q: "How far in advance must I book?",
        a: "We recommend booking at least 4 hours in advance to allow time for physician review and nurse scheduling. Same-day bookings are available in our active service cities (Mumbai, Delhi, Bengaluru, Hyderabad) subject to nurse availability. For specific time slots, 24 hours notice is ideal." },
      { q: "Can I reschedule or cancel?",
        a: "Yes. You may reschedule at no charge up to 4 hours before your session. Cancellations made more than 4 hours before the session receive a full refund. Cancellations within 4 hours are subject to a 50% cancellation fee to cover nurse travel and preparation costs." },
      { q: "What areas do you serve?",
        a: "NutriDrip currently operates in Mumbai (all zones), Delhi NCR, Bengaluru, and Hyderabad. Within these cities, our nurses cover most pin codes — enter your address during booking to confirm availability. We are expanding to Pune and Chennai in Q3 2025." },
      { q: "Can I book at a clinic instead of at home?",
        a: "Yes. We have partner clinic locations in each city where you can walk in or pre-book a slot. Clinic sessions offer the same physician-approved formula as home delivery. Some clients prefer the clinical setting for comfort or discretion. Clinic locations are shown on the booking page." },
      { q: "What should I do to prepare for my session?",
        a: "Eat a light meal 1–2 hours before your session — do not arrive fasted. Stay well hydrated beforehand to make vein access easier. Wear comfortable clothing with easy upper-arm access. Have your intake form completed. Avoid alcohol for 12 hours before your session." },
    ],
  },
  {
    id: "pricing", icon: "💳", label: "Pricing",
    items: [
      { q: "How much does a session cost?",
        a: "Our formulas range from ₹2,999 for hydration and basic immunity drips to ₹12,999 for NAD+ longevity protocols. Skin-brightening and athletic performance formulas typically fall in the ₹4,999–₹7,999 range. Full pricing is shown on the Treatments and Book Now pages. No hidden fees." },
      { q: "Do you offer packages or subscriptions?",
        a: "Yes. We offer 4-session and 8-session packages at 15–25% savings compared to single-session pricing. Monthly wellness memberships provide priority booking, discounted rates, and a dedicated nurse assignment. Packages are formula-specific or can be mixed across formulas with physician guidance." },
      { q: "Is GST included in the price shown?",
        a: "All prices shown on our website are inclusive of 18% GST. Your invoice will itemise the base formula cost and GST amount separately. GST invoices are automatically emailed after payment and available in your account dashboard." },
      { q: "What payment methods do you accept?",
        a: "We accept all major credit and debit cards, UPI (GPay, PhonePe, Paytm), net banking, and EMI options through our payment gateway. Corporate clients may arrange invoice-based billing on a monthly cycle. We do not accept cash payments." },
      { q: "Do you offer corporate or group pricing?",
        a: "Yes. We offer dedicated corporate wellness packages for companies wanting to offer IV therapy as an employee benefit, or for event-based group sessions (team offsites, athlete recovery days, wellness events). Contact our B2B team at corporate@nutridrip.in for a custom quote." },
    ],
  },
  {
    id: "results", icon: "📈", label: "Results",
    items: [
      { q: "Is IV therapy scientifically proven?",
        a: "The bioavailability advantage of IV over oral delivery is well-established in medical literature. Clinical evidence supports specific IV applications including high-dose Vitamin C for immune support, magnesium for migraine prevention, and NAD+ for cellular energy and neuroprotection. We only offer formulas with published clinical rationale." },
      { q: "How many sessions do I need to see results?",
        a: "For acute needs (hydration, hangover, jet lag), one session delivers noticeable results. For chronic goals (skin brightening, anti-ageing, energy optimisation), most clients see meaningful change after 4–6 sessions over 4–8 weeks. Maintenance sessions every 2–4 weeks sustain results." },
      { q: "What do most clients report after their first session?",
        a: "The most commonly reported effects after a first session are: significantly improved energy and mental clarity (energy & NAD+ formulas), reduced fatigue and body aches (recovery formulas), improved skin radiance (glutathione & Vitamin C formulas), and a general sense of wellbeing and improved mood." },
      { q: "Can IV therapy replace a healthy diet?",
        a: "No, and we would never suggest it should. IV therapy is a targeted micronutrient intervention — it corrects deficiencies, supports acute recovery, and enhances specific biological pathways. It works best as a complement to good nutrition, sleep, and exercise — not a replacement for any of them." },
      { q: "Do you track client outcomes?",
        a: "Yes. We collect pre- and post-session symptom ratings and track outcomes across our client base. Aggregate anonymised data informs formula refinements. Individual clients can view their personal outcome history in their dashboard. We encourage honest feedback — both positive and negative." },
    ],
  },
  {
    id: "clinics", icon: "🏥", label: "Clinics",
    items: [
      { q: "How can my clinic partner with NutriDrip?",
        a: "Apply through our For Clinics page. We offer wholesale formula supply at 30–45% discount depending on monthly volume, same-day or next-day dispatch, a web dashboard for order and client management, and optional training for your staff. There is no partnership fee — we grow when you grow." },
      { q: "What is the minimum order quantity for clinic partners?",
        a: "The minimum order is 10 sessions per formula per month for our Silver tier. Gold and Platinum tiers have higher minimums (30 and 60 sessions/month respectively) but unlock deeper discounts and additional services. Most of our clinic partners operate comfortably in the Gold tier." },
      { q: "Do you provide training for clinic staff?",
        a: "Yes. All Platinum partners receive in-clinic training for their nursing staff covering formula handling, administration protocols, client monitoring, and emergency response. Gold partners receive online training modules and access to our nurse support line. Silver partners receive comprehensive written protocols and video guides." },
    ],
  },
];

const ALL_COUNT = FAQ_DATA.reduce((acc, c) => acc + c.items.length, 0);

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

/* ─── Accordion item ─────────────────────────────────────────────────────────── */
function FaqAccordionItem({ item, isOpen, onToggle }: { item: FaqItem; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className={`faq-item${isOpen ? " open" : ""}`}>
      <button className="faq-q" onClick={onToggle} aria-expanded={isOpen}>
        <span className="faq-q-text">{item.q}</span>
        <span className={`faq-icon${isOpen ? " open" : ""}`}>+</span>
      </button>
      <div className={`faq-a${isOpen ? " open" : ""}`}>
        <p className="faq-a-inner">{item.a}</p>
      </div>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────────── */
export default function FaqsPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [openItems, setOpenItems] = useState<Record<string, number | null>>({ safety: 0 });

  const toggleItem = (catId: string, idx: number) => {
    setOpenItems((prev) => ({ ...prev, [catId]: prev[catId] === idx ? null : idx }));
  };

  const lower = search.toLowerCase().trim();

  const filtered = useMemo<FaqCategory[]>(() => {
    if (!lower) {
      return activeCategory === "all" ? FAQ_DATA : FAQ_DATA.filter((c) => c.id === activeCategory);
    }
    return FAQ_DATA.map((cat) => ({
      ...cat,
      items: cat.items.filter((i) => i.q.toLowerCase().includes(lower) || i.a.toLowerCase().includes(lower)),
    })).filter((c) => c.items.length > 0);
  }, [lower, activeCategory]);

  const totalVisible = filtered.reduce((acc, c) => acc + c.items.length, 0);
  const noResults = lower && totalVisible === 0;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: PAGE_CSS }} />

      {/* ── Hero with search ── */}
      <section className="hero-sub">
        <div className="hero-blobs">
          <div className="blob b1" />
          <div className="blob b2" />
          <div className="blob b3" />
        </div>
        <div className="hero-content" style={{ maxWidth: 680 }}>
          <p className="breadcrumb">
            <Link href="/">Home</Link> &rsaquo; FAQs
          </p>
          <h1>
            Got Questions? <em>We&apos;ve Got Answers</em>
          </h1>
          <p>Everything you need to know about IV therapy, our formulas, booking, and safety standards.</p>

          {/* Search bar */}
          <div style={{ marginTop: 28, position: "relative", maxWidth: 520 }}>
            <span style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.6)", pointerEvents: "none" }}>🔍</span>
            <input
              type="text"
              placeholder="Search questions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                paddingLeft: 44,
                paddingRight: 40,
                paddingTop: 14,
                paddingBottom: 14,
                borderRadius: 50,
                background: "rgba(255,255,255,0.2)",
                backdropFilter: "blur(8px)",
                border: "1.5px solid rgba(255,255,255,0.3)",
                color: "#fff",
                fontFamily: "var(--font-display)",
                fontSize: 14,
                outline: "none",
              }}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.7)", fontSize: 20, lineHeight: 1 }}
              >×</button>
            )}
          </div>
        </div>
      </section>

      {/* ── Main layout ── */}
      <section className="section section-alt">
        <div className="faq-layout">

          {/* Sidebar */}
          <aside className="faq-sidebar">
            <div className="sidebar-panel">
              <p className="sidebar-heading">Browse by Category</p>
              <div className="cat-list">
                <button
                  className={`cat-btn${activeCategory === "all" && !lower ? " active" : ""}`}
                  onClick={() => { setActiveCategory("all"); setSearch(""); }}
                >
                  <span>All Questions</span>
                  <span className="cat-count">{ALL_COUNT}</span>
                </button>
                {FAQ_DATA.map((cat) => (
                  <button
                    key={cat.id}
                    className={`cat-btn${activeCategory === cat.id && !lower ? " active" : ""}`}
                    onClick={() => { setActiveCategory(cat.id); setSearch(""); }}
                  >
                    <span>{cat.icon} {cat.label}</span>
                    <span className="cat-count">{cat.items.length}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="sidebar-panel">
              <p className="sidebar-cta-title">Still have questions?</p>
              <p className="sidebar-cta-sub">Our clinical team is happy to answer anything not covered here.</p>
              <a href="https://wa.me/919999999999" target="_blank" rel="noopener noreferrer" className="sidebar-cta-btn">
                💬 Chat with Us
              </a>
            </div>
          </aside>

          {/* FAQ content */}
          <div className="faq-sections">
            {/* Search info */}
            {lower && !noResults && (
              <p className="search-info">
                Showing <strong>{totalVisible}</strong> result{totalVisible !== 1 ? "s" : ""} for &ldquo;<strong>{search}</strong>&rdquo;
              </p>
            )}

            {/* No results */}
            {noResults && (
              <div className="no-results">
                <div className="no-results-icon">🔍</div>
                <p className="no-results-title">No results found</p>
                <p className="no-results-sub">Try a different search term, or browse by category in the sidebar.</p>
                <button className="no-results-btn" onClick={() => setSearch("")}>Clear Search</button>
              </div>
            )}

            {/* Categories */}
            {filtered.map((cat, ci) => (
              <Reveal key={cat.id} delay={ci * 60}>
                <div className="faq-block">
                  <div className="faq-block-header">
                    <span className="faq-block-icon">{cat.icon}</span>
                    <div>
                      <div className="faq-block-title">{cat.label}</div>
                      <div className="faq-block-count">{cat.items.length} question{cat.items.length !== 1 ? "s" : ""}</div>
                    </div>
                  </div>
                  <div className="faq-list">
                    {cat.items.map((item, idx) => (
                      <FaqAccordionItem
                        key={idx}
                        item={item}
                        isOpen={openItems[cat.id] === idx}
                        onToggle={() => toggleItem(cat.id, idx)}
                      />
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contact strip ── */}
      <section className="contact-strip">
        <Reveal>
          <h2 style={{ fontSize: "clamp(24px,3vw,40px)", fontWeight: 600, color: "#fff", letterSpacing: "-1px", marginBottom: 12 }}>
            Didn&apos;t find what you&apos;re looking for?
          </h2>
        </Reveal>
        <Reveal delay={100}>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.85)", maxWidth: 460, margin: "0 auto 32px", lineHeight: 1.7 }}>
            Our clinical team can answer specific questions about your health, formulas, or your first session.
          </p>
        </Reveal>
        <Reveal delay={200}>
          <div className="hero-btns" style={{ justifyContent: "center" }}>
            <Link href="/book-now" className="btn-white">Book a Session &rarr;</Link>
            <Link href="/health-quiz" className="btn-ghost">Take the Health Quiz</Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
