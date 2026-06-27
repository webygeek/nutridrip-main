"use client";

import { useEffect, useRef } from "react";
import Reveal from "@/components/ui/Reveal";

function CountUp({ target, suffix = "" }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const counted = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !counted.current) {
          counted.current = true;
          let current = 0;
          const step = target / 60;
          const interval = setInterval(() => {
            current += step;
            if (current >= target) {
              el.textContent = target.toLocaleString() + suffix;
              clearInterval(interval);
            } else {
              el.textContent = Math.floor(current).toLocaleString() + suffix;
            }
          }, 16);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, suffix]);

  return <span ref={ref}>0</span>;
}

export default function StatsRow() {
  const stats = [
    { value: 12400, suffix: "", label: "Happy Clients" },
    { value: 99, suffix: "%", label: "Satisfaction" },
    { value: 0, suffix: "", label: "Concierge", display: "24/7" },
    { value: 18, suffix: "", label: "Formulas" },
    { value: 0, suffix: "", label: "Certified", display: "ISO" },
  ];

  return (
    <div className="bg-white px-5 md:px-14 py-12 flex flex-wrap justify-around items-center gap-6 border-b" style={{ borderColor: "rgba(91,184,245,0.2)" }}>
      {stats.map((s, i) => (
        <Reveal key={s.label} delay={i * 100}>
          <div className="text-center">
            <span className="text-[38px] font-semibold text-teal-brand block" style={{ letterSpacing: "-1px" }}>
              {s.display ? s.display : <CountUp target={s.value} suffix={s.suffix} />}
            </span>
            <div className="text-xs text-text-muted tracking-[1px] uppercase mt-1">{s.label}</div>
          </div>
        </Reveal>
      ))}
    </div>
  );
}
