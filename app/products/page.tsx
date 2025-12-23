import ProductCard from "@/components/product-card";
import { products } from "@/lib/data";
import { PRODUCTS } from "@/lib/constants";

export default function ProductsPage() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-8">{PRODUCTS.pageTitle}</h1>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
