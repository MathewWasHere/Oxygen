import { Hero } from "@/components/home/Hero";
import { LiveOrderBanner } from "@/components/home/LiveOrderBanner";
import {
  CategoryStrip,
  PopularProducts,
  PromoBanner,
  TrackingPreview,
  VisitUs,
} from "@/components/home/Sections";

export default function HomePage() {
  return (
    <>
      {/* Live tracking sits ABOVE the hero once an order is placed. */}
      <LiveOrderBanner />
      <Hero />
      <CategoryStrip />
      <PopularProducts />
      <PromoBanner />
      <TrackingPreview />
      <VisitUs />
    </>
  );
}
