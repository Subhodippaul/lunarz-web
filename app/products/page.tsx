"use client";
import { useState, useEffect, useMemo } from "react";
import ProductCard from "@/components/product-card";
import ProductFilters from "@/components/product-filters";
import { Product } from "@/lib/data";
import { ProductService } from "@/lib/firebase-services";
import { PRODUCTS } from "@/lib/constants";

interface FilterState {
  colors: string[];
  priceRange: { min: number; max: number };
  categories: string[];
  sizes: string[];
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("featured");
  const [filters, setFilters] = useState<FilterState>({
    colors: [],
    priceRange: { min: 0, max: 999999 },
    categories: [],
    sizes: [],
  });

  useEffect(() => {
    loadProducts();
  }, []);

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
        if (!filters.categories.includes(product.category)) {
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
  }, [products, filters, sortBy]);

  const handleClearFilters = () => {
    setFilters({
      colors: [],
      priceRange: { min: 0, max: 999999 },
      categories: [],
      sizes: [],
    });
  };

  if (loading) {
    return (
      <section className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-8">{PRODUCTS.pageTitle}</h1>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p>Loading products...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-8">{PRODUCTS.pageTitle}</h1>
      
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
