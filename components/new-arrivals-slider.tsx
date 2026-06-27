"use client";
import { useState, useEffect, useCallback } from "react";
import { Product } from "@/lib/data";
import { getAllProducts } from "@/lib/supabase-services";
import { ColorInventoryService } from "@/lib/inventory-services"; "@/lib/inventory-services";
import { ChevronLeft, ChevronRight, Sparkles, ImageOff } from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { toDriveImageUrl } from "@/lib/drive-image";
import { createSlug } from "@/lib/slug";

const ITEMS_PER_SLIDE = 4;
// Returns true if EVERY variant/color for this product has 0 stock
async function isProductOutOfStock(product: Product): Promise<boolean> {
  const colors = product.variants && product.variants.length > 0
    ? product.variants
    : [null]; // no variants -> nothing to check per-color, treat as in-stock unless you want different fallback

  if (colors[0] === null) return false;

  const stocks = await Promise.all(
    colors.map((color) => ColorInventoryService.getStockByColor(color as string, product.category))
  );

  return stocks.every((s) => s === 0);
}

function variantColor(variant: string): string {
  const v = variant.toLowerCase();
  if (v === "black") return "#000";
  if (v === "white") return "#fff";
  if (v === "red") return "#ef4444";
  if (v === "blue") return "#3b82f6";
  if (v === "green") return "#10b981";
  if (v === "grey" || v === "gray") return "#6b7280";
  if (v === "navy") return "#1e3a5f";
  if (v === "maroon") return "#7f1d1d";
  return "#9ca3af";
}

// Self-contained image with CSS fallback — no external file needed
function ProductImage({ src, alt, className }: { src?: string; alt: string; className?: string }) {
  const [errored, setErrored] = useState(false);
  const resolvedSrc = src ? toDriveImageUrl(src) : undefined;

  if (!resolvedSrc || errored) {
    return (
      <div className="w-full h-full bg-gray-200 flex flex-col items-center justify-center gap-1">
        <ImageOff className="w-8 h-8 text-gray-400" />
        <span className="text-xs text-gray-400">No Image</span>
      </div>
    );
  }

  return (
    <img
      src={resolvedSrc}
      alt={alt}
      className={className}
      onError={() => setErrored(true)}
    />
  );
}

export default function NewArrivalsSlider() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [outOfStockMap, setOutOfStockMap] = useState<Record<string, boolean>>({});
  const [mobileIndex, setMobileIndex] = useState(0);
  const [desktopIndex, setDesktopIndex] = useState(0);

  useEffect(() => {
    fetchNewArrivals();
  }, []);

  const fetchNewArrivals = async () => {
    try {
      // getAllProducts uses mapRow to convert snake_case DB fields (e.g. original_price)
      // to camelCase (e.g. originalPrice) so the price display works correctly
      const data = await getAllProducts();
      const sliced = data.slice(0, 12);
      setProducts(sliced);
      setLoading(false); // show products immediately, stock badges fill in after

      // Fetch stock status for all products in parallel, independently of render
      const entries = await Promise.all(
        sliced.map(async (product) => {
          const outOfStock = await isProductOutOfStock(product);
          return [product.id, outOfStock] as const;
        })
      );
      setOutOfStockMap(Object.fromEntries(entries));
    } catch (err) {
      console.error("Error fetching new arrivals:", err);
      setLoading(false);
    }
  };

  const mobilePages = Math.ceil(products.length / ITEMS_PER_SLIDE);
  const desktopPages = Math.ceil(products.length / ITEMS_PER_SLIDE);

  const prevMobile = () => setMobileIndex((p) => (p <= 0 ? mobilePages - 1 : p - 1));
  const nextMobile = () => setMobileIndex((p) => (p >= mobilePages - 1 ? 0 : p + 1));
  const prevDesktop = () => setDesktopIndex((p) => (p <= 0 ? desktopPages - 1 : p - 1));
  const nextDesktop = () => setDesktopIndex((p) => (p >= desktopPages - 1 ? 0 : p + 1));

  if (loading) {
    return (
      <section className="mb-10 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4" />
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg overflow-hidden">
                <div className="aspect-square bg-gray-200" />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-6 w-6 text-purple-500" />
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">New Arrivals</h2>
            </div>
            <p className="text-lg text-gray-600">Fresh styles just dropped</p>
          </div>
          <Link href="/products" className="hidden md:inline-flex items-center text-blue-600 hover:text-blue-800 font-medium">
            View All
          </Link>
        </div>

        {/* ── MOBILE SLIDER ── */}
        <div className="md:hidden relative">
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${mobileIndex * 100}%)` }}
            >
              {Array.from({ length: mobilePages }).map((_, pageIdx) => (
                <div key={pageIdx} className="w-full shrink-0">
                  <div className="grid grid-cols-2 gap-3">
                    {products
                      .slice(pageIdx * ITEMS_PER_SLIDE, (pageIdx + 1) * ITEMS_PER_SLIDE)
                      .map((product) => (
                        <Link
                          key={product.id}
                          href={`/products/${createSlug(product.name)}`}
                          className="group bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden"
                        >
                          <div className="relative aspect-square overflow-hidden bg-gray-100">
                            <ProductImage
                              src={product.images?.[0]}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            {outOfStockMap[product.id] && (
                              <div className="absolute top-2 right-2 bg-red-500 text-white px-1.5 py-0.5 rounded-full text-xs font-medium">
                                Out of stock
                              </div>
                            )}
                          </div>
                          <div className="p-2">
                            <span className="inline-block px-1.5 py-0.5 text-xs font-medium bg-purple-100 text-purple-800 rounded-full mb-1">
                              {product.category}
                            </span>
                            <h3 className="truncate font-semibold text-gray-900 text-sm group-hover:text-purple-600 transition-colors">
                              {product.name}
                            </h3>
                            <div className="flex items-center gap-1.5 flex-wrap mt-1">
                              <span className="text-sm font-bold text-gray-900">
                                ₹{product.price.toLocaleString()}
                              </span>
                              {product.originalPrice && product.originalPrice > product.price && (
                                <>
                                  <span className="text-xs text-gray-400 line-through">
                                    ₹{product.originalPrice.toLocaleString()}
                                  </span>
                                  <span className="text-xs font-semibold text-green-700 bg-green-100 px-1 py-0.5 rounded-full">
                                    {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% off
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </Link>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {mobilePages > 1 && (
            <>
              <button onClick={prevMobile} className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white rounded-full p-2 shadow-lg border border-gray-200 hover:bg-gray-50 z-10">
                <ChevronLeft className="h-4 w-4 text-gray-600" />
              </button>
              <button onClick={nextMobile} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white rounded-full p-2 shadow-lg border border-gray-200 hover:bg-gray-50 z-10">
                <ChevronRight className="h-4 w-4 text-gray-600" />
              </button>
              <div className="flex justify-center gap-2 mt-6">
                {Array.from({ length: mobilePages }).map((_, i) => (
                  <button key={i} onClick={() => setMobileIndex(i)}
                    className={`w-2 h-2 rounded-full transition-colors ${i === mobileIndex ? "bg-purple-600" : "bg-gray-300"}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* ── DESKTOP SLIDER ── */}
        <div className="hidden md:block relative">
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${desktopIndex * 100}%)` }}
            >
              {Array.from({ length: desktopPages }).map((_, pageIdx) => (
                <div key={pageIdx} className="w-full shrink-0">
                  <div className="grid grid-cols-4 gap-6">
                    {products
                      .slice(pageIdx * ITEMS_PER_SLIDE, (pageIdx + 1) * ITEMS_PER_SLIDE)
                      .map((product) => (
                        <Link
                          key={product.id}
                          href={`/products/${createSlug(product.name)}`}
                          className="group bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden"
                        >
                          <div className="relative aspect-square overflow-hidden bg-gray-100">
                            <ProductImage
                              src={product.images?.[0]}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            {outOfStockMap[product.id] && (
                              <div className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                                Out of Stock
                              </div>
                            )}
                          </div>
                          <div className="p-4">
                            <span className="inline-block px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                              {product.category}
                            </span>
                            <div className="my-2 w-20">
                              <Separator />
                            </div>
                            <h3 className="truncate font-semibold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors text-base">
                              {product.name}
                            </h3>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-lg font-bold text-gray-900">
                                  ₹{product.price.toLocaleString()}
                                </span>
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
                              {product.variants && product.variants.length > 0 && (
                                <div className="flex items-center gap-1">
                                  {product.variants.slice(0, 3).map((v, i) => (
                                    <div key={i} className="w-4 h-4 rounded-full border border-gray-300"
                                      style={{ backgroundColor: variantColor(v) }} title={v} />
                                  ))}
                                  {product.variants.length > 3 && (
                                    <span className="text-xs text-gray-500">+{product.variants.length - 3}</span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </Link>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {desktopPages > 1 && (
            <>
              <button onClick={prevDesktop} className="cursor-pointer absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white rounded-full p-3 shadow-lg border border-gray-200 hover:bg-gray-50 z-10">
                <ChevronLeft className="h-5 w-5 text-gray-600" />
              </button>
              <button onClick={nextDesktop} className="cursor-pointer absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white rounded-full p-3 shadow-lg border border-gray-200 hover:bg-gray-50 z-10">
                <ChevronRight className="h-5 w-5 text-gray-600" />
              </button>
              <div className="flex justify-center gap-2 mt-8">
                {Array.from({ length: desktopPages }).map((_, i) => (
                  <button key={i} onClick={() => setDesktopIndex(i)}
                    className={`w-2 h-2 rounded-full transition-colors ${i === desktopIndex ? "bg-purple-600" : "bg-gray-300"}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Mobile View All */}
        <div className="text-center mt-8 md:hidden">
          <Link href="/products" className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium">
            View All Products
          </Link>
        </div>
      </div>
    </section>
  );
}