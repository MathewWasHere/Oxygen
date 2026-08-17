import { Navbar } from "@/components/shell/Navbar";
import { BottomNav } from "@/components/shell/BottomNav";
import { Footer } from "@/components/shell/Footer";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      {/* The Footer carries `pb-nav`, so the last thing on every page clears
          the floating island using the shared token (item 18). Pages with a
          sticky action bar additionally use `.above-nav`, which derives from
          the same variable. */}
      <main className="flex-1">{children}</main>
      <Footer />
      <BottomNav />
    </div>
  );
}
