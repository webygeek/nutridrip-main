import Link from "next/link";

type PageHeroProps = {
  breadcrumb: string;
  title: React.ReactNode;
  subtitle: string;
  variant?: "light" | "dark";
  children?: React.ReactNode;
};

export default function PageHero({ breadcrumb, title, subtitle, variant = "light", children }: PageHeroProps) {
  const bg =
    variant === "dark"
      ? "linear-gradient(160deg, #0F5C7D 0%, #1A7EA8 40%, #3A9EC4 100%)"
      : "linear-gradient(160deg, #C8E9F8 0%, #A4D5F5 40%, #7DC4F0 100%)";

  return (
    <div className="relative overflow-hidden px-5 md:px-14" style={{ paddingTop: "140px", paddingBottom: "80px", background: bg }}>
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute w-[400px] h-[400px] bg-white/20 rounded-full -top-20 -right-20 blur-[80px] animate-blob" />
        <div className="absolute w-[250px] h-[250px] bg-white/12 rounded-full -bottom-10 left-[5%] blur-[80px] animate-blob animation-delay-3000" />
      </div>
      <div className="relative z-[2]">
        <div className="text-xs text-white/70 mb-4">
          <Link href="/" className="text-white/70 no-underline hover:text-white/90">Home</Link> &rsaquo; {breadcrumb}
        </div>
        <h1
          className="font-semibold text-white mb-4 leading-[1.05]"
          style={{ fontSize: "clamp(42px, 5vw, 68px)", letterSpacing: "-2px" }}
        >
          {title}
        </h1>
        <p className="text-[17px] text-white/85 max-w-[520px] leading-relaxed">
          {subtitle}
        </p>
        {children}
      </div>
    </div>
  );
}
