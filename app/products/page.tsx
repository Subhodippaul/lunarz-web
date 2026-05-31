"use client";
import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "@/components/product-card";
import ProductFilters from "@/components/product-filters";
import ProductsBanner from "@/components/products-banner";
// Alternative: import ProductsBannerSimple from "@/components/products-banner-simple";
import { Product } from "@/lib/data";
import { ProductService } from "@/lib/supabase-services";
import { PRODUCTS } from "@/lib/constants";
import { CenteredLoader } from "@/components/ui/loader";

interface FilterState {
  colors: string[];
  priceRange: { min: number; max: number };
  categories: string[];
  sizes: string[];
}

// Separate component that uses useSearchParams
function ProductsPageContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("featured");
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterState>({
    colors: [],
    priceRange: { min: 0, max: 999999 },
    categories: [],
    sizes: [],
  });

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    // Handle URL parameters for category filtering and search
    const categoryParam = searchParams.get('category');
    const searchParam = searchParams.get('search');
    
    if (categoryParam) {
      setFilters(prev => ({
        ...prev,
        categories: [categoryParam]
      }));
    }
    
    if (searchParam) {
      setSearchQuery(searchParam);
    }
  }, [searchParams]);

  const loadProducts = async () => {
    try {
      const fetchedProducts = await ProductService.getAllProducts();
      setProducts(fetchedProducts);
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products.filter((product) => {
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          product.name.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query) ||
          product.category.toLowerCase().includes(query);
        if (!matchesSearch) {
          return false;
        }
      }

      // Color filter
      if (filters.colors.length > 0) {
        const productColors = product.variants || [];
        if (!filters.colors.some(color => productColors.includes(color))) {
          return false;
        }
      }

      // Price filter
      if (product.price < filters.priceRange.min || product.price > filters.priceRange.max) {
        return false;
      }

      // Category filter
      if (filters.categories.length > 0) {
        const productCategorySlug = product.category.toLowerCase().replace(/\s+/g, '-');
        const matchesCategory = filters.categories.some(filterCategory => {
          // Handle both slug format and original category name
          const filterCategorySlug = filterCategory.toLowerCase().replace(/\s+/g, '-');
          return productCategorySlug === filterCategorySlug || product.category.toLowerCase() === filterCategory.toLowerCase();
        });
        if (!matchesCategory) {
          return false;
        }
      }

      // Size filter
      if (filters.sizes.length > 0) {
        const productSizes = product.sizes || [];
        if (!filters.sizes.some(size => productSizes.includes(size))) {
          return false;
        }
      }

      return true;
    });

    // Sort products
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
        // Since we don't have createdAt, sort by id (assuming newer documents have longer IDs)
        filtered.sort((a, b) => b.id.localeCompare(a.id));
        break;
      default:
        // Featured - keep original order or sort by some featured logic
        break;
    }

    return filtered;
  }, [products, filters, sortBy, searchQuery]);

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
      {/* Banner Section */}
      <ProductsBanner />
      
      {/* Search Results Header */}
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
      
      {/* <h1 className="text-3xl font-bold mb-8">{PRODUCTS.pageTitle}</h1> */}
      
      {/* Filters and Sort */}
      <ProductFilters
        filters={filters}
        onFiltersChange={setFilters}
        sortBy={sortBy}
        onSortChange={setSortBy}
        onClearFilters={handleClearFilters}
      />

      {/* Products Grid */}
      {filteredAndSortedProducts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">
            {products.length === 0 
              ? "No products available at the moment." 
              : "No products match your current filters."
            }
          </p>
          {products.length > 0 && (
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
              Showing {filteredAndSortedProducts.length} of {products.length} products
            </p>
          </div>
          
          {/* 5-column grid for desktop, responsive for smaller screens */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 lg:gap-6">
            {filteredAndSortedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

// Main ProductsPage component with Suspense boundary
export default function ProductsPage() {
  return (
    <Suspense fallback={<CenteredLoader text="Loading products..." size="lg" />}>
      <ProductsPageContent />
    </Suspense>
  );
}
