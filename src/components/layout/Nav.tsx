"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useContent } from "@/lib/content-store";

const MOBILE_NAV_CSS = `
  .hamburger {
    display:none;
    background:none;border:none;cursor:pointer;
    width:32px;height:32px;position:relative;z-index:201;
    flex-direction:column;justify-content:center;align-items:center;gap:5px;
  }
  .hamburger span {
    display:block;width:22px;height:2px;background:#ffffff;
    border-radius:2px;transition:all .3s;
  }
  .hamburger.open span:nth-child(1) { transform:rotate(45deg) translate(2.5px,2.5px); }
  .hamburger.open span:nth-child(2) { opacity:0; }
  .hamburger.open span:nth-child(3) { transform:rotate(-45deg) translate(2.5px,-2.5px); }

  .mobile-menu {
    display:none;
    position:fixed;inset:0;z-index:200;
    background:rgba(8,15,30,0.98);backdrop-filter:blur(16px);
    flex-direction:column;align-items:center;justify-content:center;gap:0;
    padding:80px 40px 40px;
  }
  .mobile-menu.open { display:flex; }
  .mobile-menu a {
    display:block;width:100%;text-align:center;
    padding:16px 0;font-size:18px;font-weight:500;
    color:rgba(255,255,255,0.65);text-decoration:none;
    border-bottom:1px solid rgba(255,255,255,0.08);
    transition:color .15s;
  }
  .mobile-menu a:last-child { border-bottom:none; }
  .mobile-menu a:hover, .mobile-menu a.active { color:#ffffff; }
  .mobile-menu .nav-cta {
    margin-top:20px;
    background:var(--teal)!important;color:#fff!important;
    padding:14px 32px!important;border-radius:50px;
    font-weight:600!important;font-size:15px!important;
    border-bottom:none;width:auto;
  }

  @media(max-width:768px) {
    .hamburger { display:flex; }
    .nav-links { display:none!important; }
  }
`;

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const { isLoggedIn } = useAuth();
  const logoUrl = useContent("brand.logo", "");
  const brandName = useContent("brand.name", "nutridrip");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const links = [
    { href: "/treatments", label: "Treatments" },
    { href: "/how-it-works", label: "How It Works" },
    { href: "/about", label: "About" },
    ...(isLoggedIn
      ? [{ href: "/dashboard", label: "Dashboard" }]
      : [{ href: "/login", label: "Login" }]),
  ];
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: MOBILE_NAV_CSS }} />
      <nav className={`nd-nav${scrolled ? " scrolled" : ""}`}>
        <Link href="/" className="logo">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={brandName} style={{ height: 28, width: "auto" }} />
          ) : (
            <>{brandName.slice(0, 5)}<em>{brandName.slice(5)}</em></>
          )}
        </Link>

        <div className="nav-links">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className={pathname === l.href || (l.href === "/dashboard" && pathname?.startsWith("/dashboard")) ? "active" : ""}>
              {l.label}
            </Link>
          ))}
          <Link href="/book-now" className="nav-cta">Book Now &rarr;</Link>
        </div>

        <button
          className={`hamburger${menuOpen ? " open" : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span /><span /><span />
        </button>
      </nav>

      <div className={`mobile-menu${menuOpen ? " open" : ""}`}>
        {links.map((l) => (
          <Link key={l.href} href={l.href} className={pathname === l.href ? "active" : ""} onClick={() => setMenuOpen(false)}>
            {l.label}
          </Link>
        ))}
        <Link href="/book-now" className="nav-cta" onClick={() => setMenuOpen(false)}>
          Book Now &rarr;
        </Link>
      </div>
    </>
  );
}
