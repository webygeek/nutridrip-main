"use client";

import Link from "next/link";
import { useContent } from "@/lib/content-store";

export default function Footer() {
  const logoUrl = useContent("brand.logo", "");
  const brandName = useContent("brand.name", "nutridrip");
  const tagline = useContent("brand.tagline", "Premium IV Therapy");
  const copyright = useContent("legal.copyright", "© 2026 NutriDrip. All rights reserved.");
  const disclaimer = useContent("legal.disclaimer", "Consult your physician before any IV therapy.");

  return (
    <footer className="nd-footer">
      <div className="footer-grid">
        <div>
          <div className="footer-logo">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt={brandName} style={{ height: 32, width: "auto", marginBottom: 8 }} />
            ) : (
              brandName
            )}
          </div>
          <div className="footer-tagline">{tagline} — delivered to your world. Physician-formulated, nurse-administered, results guaranteed.</div>
        </div>
        <div className="footer-col">
          <h4>Treatments</h4>
          <Link href="/treatments/velocity">Velocity</Link>
          <Link href="/treatments/luminescence">Luminescence</Link>
          <Link href="/treatments/fortress">Fortress</Link>
          <Link href="/treatments/hydraflux">Hydraflux</Link>
          <Link href="/treatments/apex">Apex</Link>
          <Link href="/treatments/cognitas">Cognitas</Link>
        </div>
        <div className="footer-col">
          <h4>Services</h4>
          <Link href="/book-now">Book a Session</Link>
          <Link href="/how-it-works">How It Works</Link>
          <Link href="/for-clinics">Partner Clinics</Link>
          <Link href="/consult">Consult a Doctor</Link>
          <Link href="/health-quiz">Health Quiz</Link>
        </div>
        <div className="footer-col">
          <h4>Company</h4>
          <Link href="/about">About Us</Link>
          <Link href="/faqs">FAQs</Link>
          <Link href="/login">Login / Dashboard</Link>
        </div>
      </div>
      <div className="footer-bottom">
        <span>{copyright} | Medical Disclaimer: {disclaimer}</span>
        <span style={{ color: "var(--sky-light)" }}>Hyderabad &middot; Bengaluru &middot; Mumbai &middot; Chennai</span>
      </div>
    </footer>
  );
}
