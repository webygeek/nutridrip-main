"use client";

import Link from "next/link";

export default function HeroSection() {
  return (
    <section
      className="min-h-screen flex flex-col justify-center relative overflow-hidden px-5 md:px-14"
      style={{
        paddingTop: "120px",
        paddingBottom: "80px",
        background: "linear-gradient(160deg, #C8E9F8 0%, #A4D5F5 30%, #7DC4F0 60%, #5BAEE8 100%)",
      }}
    >
      {/* Blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute w-[500px] h-[500px] bg-white/25 rounded-full -top-[100px] -right-[100px] blur-[80px] animate-blob" />
        <div className="absolute w-[300px] h-[300px] bg-white/15 rounded-full bottom-0 left-[10%] blur-[80px] animate-blob animation-delay-3000" />
        <div className="absolute w-[200px] h-[200px] rounded-full top-[40%] right-[25%] blur-[80px] animate-blob animation-delay-5000" style={{ background: "rgba(26,126,168,0.12)" }} />
      </div>

      <div className="relative z-[2] max-w-[600px]">
        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-lg border border-white/80 px-[18px] py-2 rounded-full text-sm font-medium mb-7 animate-fade-up"
          style={{ animationDelay: "0.1s", color: "#0F5C7D" }}
        >
          <div className="w-[7px] h-[7px] bg-teal-brand rounded-full animate-pulse-dot" />
          Premium IV Therapy &middot; Delivered to You
        </div>

        {/* Title */}
        <h1
          className="font-semibold text-white mb-[22px] animate-fade-up"
          style={{
            fontSize: "clamp(46px, 6vw, 76px)",
            lineHeight: 1.05,
            letterSpacing: "-2px",
            textShadow: "0 2px 20px rgba(10,50,80,0.15)",
            animationDelay: "0.25s",
          }}
        >
          Unlock your{" "}
          <em className="italic font-normal" style={{ fontFamily: "'Lora', serif" }}>
            peak vitality
          </em>{" "}
          with expert IV drips
        </h1>

        <p
          className="text-[17px] text-white/90 leading-relaxed max-w-[480px] mb-10 font-light animate-fade-up"
          style={{ animationDelay: "0.4s" }}
        >
          Experience optimal health, boost your energy, and discover true vitality
          with our physician-designed, nurse-delivered formulas.
        </p>

        {/* Buttons */}
        <div className="flex gap-3.5 animate-fade-up flex-wrap" style={{ animationDelay: "0.55s" }}>
          <Link
            href="/health-quiz"
            className="bg-white text-teal-brand px-8 py-4 rounded-full text-sm font-medium no-underline shadow-[0_4px_20px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(0,0,0,0.15)] transition-all"
          >
            Find My Drip &rarr;
          </Link>
          <Link
            href="/treatments"
            className="bg-white/20 text-white border-[1.5px] border-white/50 px-8 py-4 rounded-full text-sm no-underline backdrop-blur-lg hover:bg-white/30 hover:-translate-y-0.5 transition-all"
          >
            Explore Treatments
          </Link>
        </div>

        {/* Trust pills */}
        <div className="flex gap-5 mt-10 flex-wrap animate-fade-up" style={{ animationDelay: "0.7s" }}>
          <div className="flex items-center gap-2.5 bg-white/50 backdrop-blur-lg border border-white/70 px-[18px] py-2.5 rounded-full text-sm" style={{ color: "#0F5C7D" }}>
            <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4 shrink-0">
              <path d="M8 1L10 6h5l-4 3 1.5 5L8 12l-4.5 3L5 10 1 7h5z" fill="#1A7EA8" />
            </svg>
            Expert care &middot; Certified nurses
          </div>
          <div className="flex items-center gap-2.5 bg-white/50 backdrop-blur-lg border border-white/70 px-[18px] py-2.5 rounded-full text-sm" style={{ color: "#0F5C7D" }}>
            <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4 shrink-0">
              <circle cx="8" cy="8" r="6" stroke="#1A7EA8" strokeWidth="1.5" />
              <path d="M5 8l2 2 4-4" stroke="#1A7EA8" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Quick results &middot; Feel it fast
          </div>
        </div>
      </div>

      {/* Floating card (desktop) */}
      <div
        className="hidden lg:block absolute right-20 bottom-20 z-[3] bg-white/90 backdrop-blur-2xl border border-white/90 rounded-[20px] px-7 py-6 shadow-[0_12px_48px_rgba(91,184,245,0.18)] min-w-[220px] animate-fade-up"
        style={{ animationDelay: "0.9s" }}
      >
        <div className="text-[11px] tracking-[1.5px] text-text-muted uppercase mb-1.5">nutridrip</div>
        <div className="text-lg font-semibold text-text-primary mb-3.5">Priya&apos;s Energy Boost &#x2728;</div>
        <Link href="/book-now?drip=Velocity" className="bg-sky-pale text-teal-brand px-[18px] py-2 rounded-full text-xs font-medium no-underline">
          View drip &rarr;
        </Link>
        <div className="text-xs text-text-muted mt-3 pt-3" style={{ borderTop: "1px solid rgba(91,184,245,0.2)" }}>
          Approved by Dr. Sharma &middot; Today
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-9 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-white/70 text-[11px] tracking-[2px] uppercase animate-fade-up" style={{ animationDelay: "1.1s" }}>
        <span>Scroll</span>
        <div className="w-px h-10 bg-gradient-to-b from-white/60 to-transparent animate-scroll-line" />
      </div>
    </section>
  );
}
