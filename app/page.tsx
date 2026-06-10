import type { Metadata } from "next";
import { headers } from "next/headers";

import HeroWorking from "@/components/hero-working";
import CategoryCarousel from "@/components/category-carousel";
import NewArrivalsSlider from "@/components/new-arrivals-slider";
import TrendingProductsSlider from "@/components/trending-products-slider";
import LatestCollectionSlider from "@/components/latest-collection-slider";
import AdvertisementSection from "@/components/advertisement-section";
import CustomerReviewSection from "@/components/customer-review-section";
import UniqueIdGenerator from "@/components/unique-id-generator";
import PromoMarquee from "@/components/promo-marquee";
import ComingSoonPage from "@/components/coming-soon";

export const metadata: Metadata = {
  alternates: {
    canonical: "https://lunarz.in",
  },
};

export default async function HomePage() {
  const headersList = await headers();
  const host = headersList.get("host");

  const isComingSoon =
    host === "lunarz.in" || host === "www.lunarz.in";

  if (isComingSoon) {
    return <ComingSoonPage />;
  }

  return (
    <>
      <UniqueIdGenerator />
      <PromoMarquee />
      <HeroWorking />
      <CategoryCarousel />
      <NewArrivalsSlider />
      <TrendingProductsSlider />
      <LatestCollectionSlider />
      <AdvertisementSection />
      <CustomerReviewSection />
    </>
  );
}