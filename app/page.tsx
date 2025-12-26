import HeroWorking from "@/components/hero-working";
import CategoryBar from "@/components/category-bar";
import TrendingProductsSlider from "@/components/trending-products-slider";
import CustomerReviewSection from "@/components/customer-review-section";

export default function HomePage() {
  return (
    <>
      <HeroWorking />
      <CategoryBar />
      <TrendingProductsSlider />
      <CustomerReviewSection />
    </>
  );
}
