import HeroWorking from "@/components/hero-working";
import CategoryCarousel from "@/components/category-carousel";
import TrendingProductsSlider from "@/components/trending-products-slider";
import LatestCollectionSlider from "@/components/latest-collection-slider";
import AdvertisementSection from "@/components/advertisement-section";
import CustomerReviewSection from "@/components/customer-review-section";
import UniqueIdGenerator from "@/components/unique-id-generator";

export default function HomePage() {
  return (
    <>
      <UniqueIdGenerator />
      <HeroWorking />
      <CategoryCarousel />
      <TrendingProductsSlider />
      <LatestCollectionSlider />
      <AdvertisementSection />
      <CustomerReviewSection />
    </>
  );
}
