import Hero from "@/components/hero";
import CategoryBar from "@/components/category-bar";
import TrendingProductsSlider from "@/components/trending-products-slider";
import CustomerReviewSection from "@/components/customer-review-section";

export default function HomePage() {
  return (
    <>
      <Hero />
      <CategoryBar />
      <TrendingProductsSlider />
      <CustomerReviewSection />
    </>
  );
}
