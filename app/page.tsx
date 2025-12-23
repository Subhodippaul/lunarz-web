import Hero from "@/components/hero";
import CategoryBar from "@/components/category-bar";
import ProductCard from "@/components/product-card";
import { products } from "@/lib/data";

export default function HomePage() {
  return (
    <>
      <Hero />
      <CategoryBar />
      <section className="max-w-7xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-semibold mb-6">Trending Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {products.slice(0, 4).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </>
  );
}
