import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import Cursor from "@/components/layout/CustomCursor";
import MobileTabBar from "@/components/layout/MobileTabBar";

export const metadata: Metadata = {
  title: "NutriDrip — Premium IV Therapy",
  description: "Premium IV therapy delivered to your world. Physician-formulated, nurse-administered, results guaranteed.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "NutriDrip",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "theme-color": "#1A7EA8",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,300;12..96,400;12..96,500;12..96,600&family=Lora:ital,wght@0,400;0,500;1,400;1,500&display=swap"
          rel="stylesheet"
        />
        <link rel="apple-touch-icon" href="/icons/icon-192.svg" />
      </head>
      <body>
        <Cursor />
        <Nav />
        {children}
        <Footer />
        <MobileTabBar />
      </body>
    </html>
  );
}
