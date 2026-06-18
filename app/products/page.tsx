"use client";
import { useState, useEffect, useMemo, useRef, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "@/components/product-card";
import ProductFilters from "@/components/product-filters";
import ProductsBanner from "@/components/products-banner";
import { Product } from "@/lib/data";
import { ProductService } from "@/lib/supabase-services";
import { CenteredLoader } from "@/components/ui/loader";
import { Loader2 } from "lucide-react";

const PAGE_SIZE = 8;

interface FilterState {
  colors: string[];
  priceRange: { min: number; max: number };
  categories: string[];
  sizes: string[];
}

function ProductsPageContent() {
  const searchParams = useSearchParams();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [displayedCount, setDisplayedCount] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [sortBy, setSortBy] = useState("featured");
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterState>({
    colors: [],
    priceRange: { min: 0, max: 999999 },
    categories: [],
    sizes: [],
  });

  // Sentinel element at the bottom of the list
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    const categoryParam = searchParams.get("category");
    const searchParam = searchParams.get("search");

    if (categoryParam) {
      setFilters((prev) => ({ ...prev, categories: [categoryParam] }));
    }
    if (searchParam) {
      setSearchQuery(searchParam);
    }
  }, [searchParams]);

  // Reset displayed count whenever filters/sort/search change
  useEffect(() => {
    setDisplayedCount(PAGE_SIZE);
  }, [filters, sortBy, searchQuery]);

  const loadProducts = async () => {
    try {
      const fetchedProducts = await ProductService.getAllProducts();
      setAllProducts(fetchedProducts);
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setLoading(false);
    }
  };

  // All filtered+sorted products (full list, no slice yet)
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = allProducts.filter((product) => {
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          product.name.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query) ||
          product.category.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      if (filters.colors.length > 0) {
        const productColors = product.variants || [];
        if (!filters.colors.some((color) => productColors.includes(color)))
          return false;
      }

      if (
        product.price < filters.priceRange.min ||
        product.price > filters.priceRange.max
      )
        return false;

      if (filters.categories.length > 0) {
        const productCategorySlug = product.category
          .toLowerCase()
          .replace(/\s+/g, "-");
        const matchesCategory = filters.categories.some((filterCategory) => {
          const filterCategorySlug = filterCategory
            .toLowerCase()
            .replace(/\s+/g, "-");
          return (
            productCategorySlug === filterCategorySlug ||
            product.category.toLowerCase() === filterCategory.toLowerCase()
          );
        });
        if (!matchesCategory) return false;
      }

      if (filters.sizes.length > 0) {
        const productSizes = product.sizes || [];
        if (!filters.sizes.some((size) => productSizes.includes(size)))
          return false;
      }

      return true;
    });

    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "name-asc":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "newest":
        filtered.sort((a, b) => b.id.localeCompare(a.id));
        break;
    }

    return filtered;
  }, [allProducts, filters, sortBy, searchQuery]);

  // The slice that's actually rendered
  const visibleProducts = useMemo(
    () => filteredAndSortedProducts.slice(0, displayedCount),
    [filteredAndSortedProducts, displayedCount]
  );

  const hasMore = displayedCount < filteredAndSortedProducts.length;

  // IntersectionObserver — fires when sentinel enters the viewport
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      if (target.isIntersecting && hasMore && !loadingMore) {
        setLoadingMore(true);
        // Small delay to show the spinner briefly (feels more natural)
        setTimeout(() => {
          setDisplayedCount((prev) => prev + PAGE_SIZE);
          setLoadingMore(false);
        }, 400);
      }
    },
    [hasMore, loadingMore]
  );

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: "200px", // trigger 200px before sentinel is visible
      threshold: 0,
    });
    if (sentinelRef.current) observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [handleObserver]);

  const handleClearFilters = () => {
    setFilters({
      colors: [],
      priceRange: { min: 0, max: 999999 },
      categories: [],
      sizes: [],
    });
  };

  if (loading) {
    return <CenteredLoader text="Loading products..." size="lg" />;
  }

  return (
    <section className="max-w-7xl mx-auto px-6 py-12">
      <ProductsBanner />

      {searchQuery && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h2 className="text-lg font-semibold text-blue-900">
            Search Results for "{searchQuery}"
          </h2>
          <p className="text-blue-700 text-sm">
            Found {filteredAndSortedProducts.length} products
          </p>
        </div>
      )}

      <ProductFilters
        filters={filters}
        onFiltersChange={setFilters}
        sortBy={sortBy}
        onSortChange={setSortBy}
        onClearFilters={handleClearFilters}
      />

      {filteredAndSortedProducts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">
            {allProducts.length === 0
              ? "No products available at the moment."
              : "No products match your current filters."}
          </p>
          {allProducts.length > 0 && (
            <button
              onClick={handleClearFilters}
              className="mt-4 text-blue-600 hover:text-blue-700 underline"
            >
              Clear all filters
            </button>
          )}
        </div>
      ) : (
        <div className="mt-8">
          <div className="flex justify-between items-center mb-6">
            <p className="text-gray-600">
              Showing {visibleProducts.length} of{" "}
              {filteredAndSortedProducts.length} products
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 lg:gap-6">
            {visibleProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        {/* Sentinel + loading indicator */}
<div ref={sentinelRef} className="mt-10 flex justify-center">
  {loadingMore && (
    <div className="flex items-center gap-2 text-gray-500">
      <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
      <span className="text-sm">Loading more products...</span>
    </div>
  )}
  {!hasMore && allProducts.length > 0 && (
    <p className="text-sm text-gray-400">
      You've seen all {filteredAndSortedProducts.length} products
    </p>
  )}
</div>
        </div>
      )}
    </section>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<CenteredLoader text="Loading products..." size="lg" />}>
      <ProductsPageContent />
    </Suspense>
  );
}