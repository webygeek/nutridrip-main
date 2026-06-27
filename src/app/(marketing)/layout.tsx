import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import Cursor from "@/components/layout/CustomCursor";
import MobileTabBar from "@/components/layout/MobileTabBar";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Cursor />
      <Nav />
      {children}
      <Footer />
      <MobileTabBar />
    </>
  );
}
