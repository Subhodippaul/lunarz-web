"use client";
import { useState, useEffect } from "react";
import { AdminProductService } from "@/lib/admin-services";
import { Product } from "@/lib/data";
import { ChevronLeft, ChevronRight, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

export default function TrendingProductsSlider() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMobileIndex, setCurrentMobileIndex] = useState(0);
  const [currentDesktopIndex, setCurrentDesktopIndex] = useState(0);

  useEffect(() => {
    fetchTrendingProducts();
  }, []);

  const fetchTrendingProducts = async () => {
    try {
      // Get trending products as controlled by admin
      const trendingProducts = await AdminProductService.getTrendingProducts();
      setProducts(trendingProducts);
    } catch (error) {
      console.error("Error fetching trending products:", error);
      // Fallback to mock data if needed
    } finally {
      setLoading(false);
    }
  };

  // Mobile: slide by 4 products (2x2 grid), Desktop: slide by 4 products (single row)
  const mobileItemsPerSlide = 4;
  const desktopItemsPerSlide = 4;
  const maxMobileSlides = Math.max(0, Math.ceil(products.length / mobileItemsPerSlide) - 1);
  const maxDesktopSlides = Math.max(0, Math.ceil(products.length / desktopItemsPerSlide) - 1);

  const nextMobileSlide = () => {
    setCurrentMobileIndex((prev) => (prev >= maxMobileSlides ? 0 : prev + 1));
  };

  const prevMobileSlide = () => {
    setCurrentMobileIndex((prev) => (prev <= 0 ? maxMobileSlides : prev - 1));
  };

  const nextDesktopSlide = () => {
    setCurrentDesktopIndex((prev) => (prev >= maxDesktopSlides ? 0 : prev + 1));
  };

  const prevDesktopSlide = () => {
    setCurrentDesktopIndex((prev) => (prev <= 0 ? maxDesktopSlides : prev - 1));
  };

  const goToMobileSlide = (index: number) => {
    setCurrentMobileIndex(index);
  };

  const goToDesktopSlide = (index: number) => {
    setCurrentDesktopIndex(index);
  };

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            {/* Mobile: 2x2 grid, Desktop: 1x4 grid */}
            <div className="grid grid-cols-2 grid-rows-2 md:grid-cols-4 md:grid-rows-1 gap-4 md:gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-100 rounded-lg md:block" style={{ display: i >= 4 ? 'none' : 'block' }}>
                  <div className="aspect-square bg-gray-200 rounded-t-lg mb-4"></div>
                  <div className="p-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
              {/* Desktop only skeleton items */}
              <div className="hidden md:block bg-gray-100 rounded-lg">
                <div className="aspect-square bg-gray-200 rounded-t-lg mb-4"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="h-6 w-6 text-orange-500" />
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                Trending Products
              </h2>
            </div>
            <p className="text-lg text-gray-600">
              Most popular items loved by our customers
            </p>
          </div>
          
          <Link
            href="/products"
            className="hidden md:inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
          >
            View All Products
          </Link>
        </div>

        {/* Mobile Slider (2x2 Grid) */}
        <div className="md:hidden relative">
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentMobileIndex * 100}%)` }}
            >
              {Array.from({ length: Math.ceil(products.length / mobileItemsPerSlide) }).map((_, slideIndex) => (
                <div key={slideIndex} className="w-full shrink-0">
                  {/* Mobile: 2x2 Grid (2 columns, 2 rows) */}
                  <div className="grid grid-cols-2 gap-3">
                    {products
                      .slice(slideIndex * mobileItemsPerSlide, (slideIndex + 1) * mobileItemsPerSlide)
                      .map((product) => (
                        <Link
                          key={product.id}
                          href={`/products/${product.id}`}
                          className="group bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden"
                        >
                          {/* Product Image */}
                          <div className="relative aspect-square overflow-hidden bg-gray-100">
                            <img
                              src={product?.images[0]}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.onerror = null;
                                target.src = "/placeholder.jpg";
                              }}
                            />
                            
                            {/* Trending Badge */}
                            <div className="absolute top-2 left-2">
                              <div className="bg-orange-500 text-white px-1.5 py-0.5 rounded-full text-xs font-medium flex items-center space-x-1">
                                <TrendingUp className="h-2.5 w-2.5" />
                              </div>
                            </div>

                            {/* Stock Status */}
                            {product.stock !== undefined && (
                              <div className="absolute top-2 right-2">
                                {product.stock === 0 ? (
                                  <div className="bg-red-500 text-white px-1.5 py-0.5 rounded-full text-xs font-medium">
                                    Out
                                  </div>
                                ) : product.stock <= (product.lowStockThreshold || 10) ? (
                                  <div className="bg-yellow-500 text-white px-1.5 py-0.5 rounded-full text-xs font-medium">
                                    Low
                                  </div>
                                ) : null}
                              </div>
                            )}
                          </div>

                          {/* Product Info */}
                          <div className="p-2">
                            <div className="mb-1">
                              <span className="inline-block px-1.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                {product.category}
                              </span>
                            </div>
                            <h3 className="truncate font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors text-sm">
                              {product.name}
                            </h3>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5 flex-wrap">
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
                              
                              {product.variants && product.variants.length > 0 && (
                                <div className="flex items-center space-x-1">
                                  {product.variants.slice(0, 2).map((variant, index) => (
                                    <div
                                      key={index}
                                      className="w-2.5 h-2.5 rounded-full border border-gray-300"
                                      style={{
                                        backgroundColor: variant.toLowerCase() === 'black' ? '#000' :
                                                       variant.toLowerCase() === 'white' ? '#fff' :
                                                       variant.toLowerCase() === 'red' ? '#ef4444' :
                                                       variant.toLowerCase() === 'blue' ? '#3b82f6' :
                                                       variant.toLowerCase() === 'green' ? '#10b981' :
                                                       variant.toLowerCase() === 'grey' || variant.toLowerCase() === 'gray' ? '#6b7280' :
                                                       '#9ca3af'
                                      }}
                                      title={variant}
                                    />
                                  ))}
                                  {product.variants.length > 2 && (
                                    <span className="text-xs text-gray-500">
                                      +{product.variants.length - 2}
                                    </span>
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

          {/* Mobile Navigation Buttons */}
          {maxMobileSlides > 0 && (
            <>
              <button
                onClick={prevMobileSlide}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white rounded-full p-2 shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors z-10"
              >
                <ChevronLeft className="h-4 w-4 text-gray-600" />
              </button>
              <button
                onClick={nextMobileSlide}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white rounded-full p-2 shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors z-10"
              >
                <ChevronRight className="h-4 w-4 text-gray-600" />
              </button>
            </>
          )}

          {/* Mobile Dots Indicator */}
          {maxMobileSlides > 0 && (
            <div className="flex justify-center space-x-2 mt-6">
              {Array.from({ length: maxMobileSlides + 1 }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToMobileSlide(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentMobileIndex ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Desktop Slider (1x5 Grid) */}
        <div className="hidden md:block relative">
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentDesktopIndex * 100}%)` }}
            >
              {Array.from({ length: Math.ceil(products.length / desktopItemsPerSlide) }).map((_, slideIndex) => (
                <div key={slideIndex} className="w-full shrink-0">
                  {/* Desktop: 1x4 Grid (4 columns, 1 row) - Tablet: 1x3 Grid */}
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
                    {products
                      .slice(slideIndex * desktopItemsPerSlide, (slideIndex + 1) * desktopItemsPerSlide)
                      .map((product) => (
                        <Link
                          key={product.id}
                          href={`/products/${product.id}`}
                          className="group bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden"
                        >
                          {/* Product Image */}
                          <div className="relative aspect-square overflow-hidden bg-gray-100">
                            <img
                              src={product?.images[0]}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.onerror = null;
                                target.src = "/placeholder.jpg";
                              }}
                            />
                            
                            {/* Trending Badge */}
                            <div className="absolute top-3 left-3">
                              <div className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                                <TrendingUp className="h-3 w-3" />
                                <span>Trending</span>
                              </div>
                            </div>

                            {/* Stock Status */}
                            {product.stock !== undefined && (
                              <div className="absolute top-3 right-3">
                                {product.stock === 0 ? (
                                  <div className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                                    Out of Stock
                                  </div>
                                ) : product.stock <= (product.lowStockThreshold || 10) ? (
                                  <div className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                                    Low Stock
                                  </div>
                                ) : null}
                              </div>
                            )}
                          </div>

                          {/* Product Info */}
                          <div className="p-4">
                            <div className="mb-2">
                              <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                {product.category}
                              </span>
                            </div>
                            <div className="space-y-4 w-20 mb-2">
                              <Separator/>
                            </div>
                            <h3 className="truncate font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors text-base">
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
                                <div className="flex items-center space-x-1">
                                  {product.variants.slice(0, 2).map((variant, index) => (
                                    <div
                                      key={index}
                                      className="w-4 h-4 rounded-full border border-gray-300"
                                      style={{
                                        backgroundColor: variant.toLowerCase() === 'black' ? '#000' :
                                                       variant.toLowerCase() === 'white' ? '#fff' :
                                                       variant.toLowerCase() === 'red' ? '#ef4444' :
                                                       variant.toLowerCase() === 'blue' ? '#3b82f6' :
                                                       variant.toLowerCase() === 'green' ? '#10b981' :
                                                       variant.toLowerCase() === 'grey' || variant.toLowerCase() === 'gray' ? '#6b7280' :
                                                       '#9ca3af'
                                      }}
                                      title={variant}
                                    />
                                  ))}
                                  {product.variants.length > 2 && (
                                    <span className="text-xs text-gray-500">
                                      +{product.variants.length - 2}
                                    </span>
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

          {/* Desktop Navigation Buttons */}
          {maxDesktopSlides > 0 && (
            <>
              <button
                onClick={prevDesktopSlide}
                className="cursor-pointer absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white rounded-full p-3 shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors z-10"
              >
                <ChevronLeft className="h-5 w-5 text-gray-600" />
              </button>
              <button
                onClick={nextDesktopSlide}
                className="cursor-pointer absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white rounded-full p-3 shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors z-10"
              >
                <ChevronRight className="h-5 w-5 text-gray-600" />
              </button>
            </>
          )}

          {/* Desktop Dots Indicator */}
          {maxDesktopSlides > 0 && (
            <div className="flex justify-center space-x-2 mt-8">
              {Array.from({ length: maxDesktopSlides + 1 }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToDesktopSlide(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentDesktopIndex ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Mobile View All Link */}
        <div className="text-center mt-8 md:hidden mobile-safe-bottom">
          <Link
            href="/products"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
          >
            View All Products
          </Link>
        </div>
      </div>
    </section>
  );
}