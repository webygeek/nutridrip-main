import Reveal from "@/components/ui/Reveal";
import type { Testimonial } from "@/lib/data/testimonials";

type Props = {
  testimonials: Testimonial[];
};

export default function TestimonialsSection({ testimonials }: Props) {
  const doubled = [...testimonials, ...testimonials];

  return (
    <section className="py-20 overflow-hidden bg-white">
      <div className="text-center px-5 md:px-14 pb-14">
        <Reveal>
          <p className="text-xs font-medium text-teal-brand tracking-[2px] uppercase mb-3">Client Stories</p>
        </Reveal>
        <Reveal delay={100}>
          <h2 className="font-semibold leading-[1.1]" style={{ fontSize: "clamp(32px,4vw,52px)", letterSpacing: "-1.5px" }}>
            Trusted by <em className="italic font-normal text-teal-brand" style={{ fontFamily: "'Lora', serif" }}>Thousands</em>
          </h2>
        </Reveal>
      </div>
      <div className="overflow-hidden">
        <div className="flex gap-5 animate-ticker">
          {doubled.map((t, i) => (
            <div
              key={i}
              className="bg-off-white border-[1.5px] rounded-[20px] p-7 min-w-[340px] shrink-0"
              style={{ borderColor: "rgba(91,184,245,0.2)" }}
            >
              <div className="text-sky-brand text-sm mb-3.5">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
              <p
                className="text-[15px] text-text-primary leading-relaxed mb-4 italic"
                style={{ fontFamily: "'Lora', serif" }}
              >
                &ldquo;{t.text}&rdquo;
              </p>
              <div className="text-xs tracking-[1px] text-text-muted uppercase font-medium">{t.name}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
