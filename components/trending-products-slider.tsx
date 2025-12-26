"use client";
import { useState, useEffect } from "react";
import { AdminProductService } from "@/lib/admin-services";
import { Product } from "@/lib/data";
import { ChevronLeft, ChevronRight, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator"

export default function TrendingProductsSlider() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetchTrendingProducts();
  }, []);

  const fetchTrendingProducts = async () => {
    try {
      // Get all products and simulate trending logic
      const allProducts = await AdminProductService.getAllProducts();
      
      // For now, we'll take the first 12 products as trending
      // In a real app, this would be based on sales data, views, etc.
      const trendingProducts = allProducts.slice(0, 12);
      setProducts(trendingProducts);
    } catch (error) {
      console.error("Error fetching trending products:", error);
      // Fallback to mock data if needed
    } finally {
      setLoading(false);
    }
  };

  const itemsPerSlide = 4;
  const maxSlides = Math.max(0, Math.ceil(products.length / itemsPerSlide) - 1);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev >= maxSlides ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxSlides : prev - 1));
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-100 rounded-lg">
                  <div className="aspect-square bg-gray-200 rounded-t-lg mb-4"></div>
                  <div className="p-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
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

        {/* Slider Container */}
        <div className="relative">
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {Array.from({ length: Math.ceil(products.length / itemsPerSlide) }).map((_, slideIndex) => (
                <div key={slideIndex} className="w-full flex-shrink-0">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {products
                      .slice(slideIndex * itemsPerSlide, (slideIndex + 1) * itemsPerSlide)
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

                            {/* Quick View Overlay */}
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="bg-white text-gray-900 px-4 py-2 rounded-lg font-medium">
                                  Quick View
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Product Info */}
                          <div className="p-4">
                            <div className="mb-2">
                              <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                {product.category}
                              </span>
                            </div>
                            <div className="space-y-4 w-20">
                            <Separator/>
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                              {product.name}
                            </h3>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <span className="text-lg font-bold text-gray-900">
                                  ₹{product.price.toLocaleString()}
                                </span>
                              </div>
                              
                              {product.variants && product.variants.length > 0 && (
                                <div className="flex items-center space-x-1">
                                  {product.variants.slice(0, 3).map((variant, index) => (
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
                                  {product.variants.length > 3 && (
                                    <span className="text-xs text-gray-500">
                                      +{product.variants.length - 3}
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

          {/* Navigation Buttons */}
          {maxSlides > 0 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white rounded-full p-3 shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors z-10"
                disabled={currentIndex === 0}
              >
                <ChevronLeft className="h-5 w-5 text-gray-600" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white rounded-full p-3 shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors z-10"
                disabled={currentIndex === maxSlides}
              >
                <ChevronRight className="h-5 w-5 text-gray-600" />
              </button>
            </>
          )}
        </div>

        {/* Dots Indicator */}
        {maxSlides > 0 && (
          <div className="flex justify-center space-x-2 mt-8">
            {Array.from({ length: maxSlides + 1 }).map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        )}

        {/* Mobile View All Link */}
        <div className="text-center mt-8 md:hidden">
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