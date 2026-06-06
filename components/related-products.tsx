"use client";
import { useState, useEffect } from "react";
import { Product } from "@/lib/data";
import { supabase } from "@/lib/supabase";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

interface RelatedProductsProps {
  currentProduct: Product;
}

// Extract meaningful keywords from a product name/description (skip short/common words)
function extractKeywords(text: string): string[] {
  const stopWords = new Set([
    "a", "an", "the", "and", "or", "for", "of", "in", "on", "at",
    "to", "with", "is", "it", "its", "by", "be", "as", "are",
  ]);
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopWords.has(w));
}

// Score how relevant another product is relative to the current one
function scoreRelevance(current: Product, candidate: Product): number {
  let score = 0;

  // Same category — highest signal
  if (candidate.category === current.category) score += 10;

  // Keyword overlap in name
  const currentKeywords = new Set(extractKeywords(current.name));
  const candidateKeywords = extractKeywords(candidate.name);
  for (const kw of candidateKeywords) {
    if (currentKeywords.has(kw)) score += 5;
  }

  // Keyword overlap in description
  if (current.description && candidate.description) {
    const currentDescKw = new Set(extractKeywords(current.description));
    const candidateDescKw = extractKeywords(candidate.description);
    for (const kw of candidateDescKw) {
      if (currentDescKw.has(kw)) score += 1;
    }
  }

  // Same material
  if (current.material && candidate.material &&
      current.material.toLowerCase() === candidate.material.toLowerCase()) {
    score += 2;
  }

  return score;
}

export default function RelatedProducts({ currentProduct }: RelatedProductsProps) {
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    fetchRelatedProducts();
    setCurrentSlide(0);
  }, [currentProduct.id]);

  const fetchRelatedProducts = async () => {
    try {
      setLoading(true);

      // Fetch all products in one query — avoids N+1 calls
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .neq("id", currentProduct.id)
        .limit(100); // plenty to rank from

      if (error) throw error;

      const candidates = (data ?? []) as Product[];

      // Score and sort by relevance
      const scored = candidates
        .map((p) => ({ product: p, score: scoreRelevance(currentProduct, p) }))
        .sort((a, b) => b.score - a.score || 0);

      // Take top 8 — always show at least some products
      setRelatedProducts(scored.slice(0, 8).map((s) => s.product));
    } catch (error) {
      console.error("Error fetching related products:", error);
    } finally {
      setLoading(false);
    }
  };

  const ITEMS_PER_PAGE = 4;
  const totalPages = Math.ceil(relatedProducts.length / ITEMS_PER_PAGE);

  const nextSlide = () =>
    setCurrentSlide((prev) => (prev + 1 >= totalPages ? 0 : prev + 1));
  const prevSlide = () =>
    setCurrentSlide((prev) => (prev - 1 < 0 ? totalPages - 1 : prev - 1));

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold mb-8">You might also like</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-square bg-gray-200 rounded-lg mb-4" />
              <div className="h-4 bg-gray-200 rounded mb-2" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (relatedProducts.length === 0) return null;

  const visibleProducts = relatedProducts.slice(
    currentSlide * ITEMS_PER_PAGE,
    currentSlide * ITEMS_PER_PAGE + ITEMS_PER_PAGE
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 border-t border-gray-200">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold">You might also like</h2>
        {totalPages > 1 && (
          <div className="flex gap-2">
            <button
              onClick={prevSlide}
              className="p-2 rounded-full border border-gray-300 hover:bg-gray-50 disabled:opacity-40"
              disabled={currentSlide === 0}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={nextSlide}
              className="p-2 rounded-full border border-gray-300 hover:bg-gray-50 disabled:opacity-40"
              disabled={currentSlide >= totalPages - 1}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {visibleProducts.map((product) => (
          <Link key={product.id} href={`/products/${product.id}`}>
            <div className="group cursor-pointer">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400 text-sm">No Image</span>
                  </div>
                )}
              </div>
              <h3 className="font-medium text-gray-900 mb-1 truncate group-hover:text-blue-600 transition-colors">
                {product.name}
              </h3>
              <p className="text-gray-500 text-xs mb-1">{product.category}</p>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-gray-900">₹{product.price.toLocaleString()}</span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <>
                    <span className="text-sm text-gray-400 line-through">
                      ₹{product.originalPrice.toLocaleString()}
                    </span>
                    <span className="text-xs font-semibold text-green-700 bg-green-100 px-1.5 py-0.5 rounded-full">
                      {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% off
                    </span>
                  </>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`w-2 h-2 rounded-full transition-colors ${
                currentSlide === i ? "bg-blue-600" : "bg-gray-300"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}