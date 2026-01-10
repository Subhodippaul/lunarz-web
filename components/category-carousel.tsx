"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductService } from "@/lib/firebase-services";

interface Category {
  id: string;
  name: string;
  image: string;
  productCount: number;
  slug: string;
}

export default function CategoryCarousel() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const carouselRef = useRef<HTMLDivElement>(null);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  // Default categories with fallback images
  const defaultCategories: Category[] = [
    {
      id: "1",
      name: "Regular T-Shirts",
      image: "/categories/tshirts.jpg",
      productCount: 0,
      slug: "t-shirts"
    },
    {
      id: "2", 
      name: "Oversized T-Shirts",
      image: "/categories/hoodies.jpg",
      productCount: 0,
      slug: "hoodies"
    },
    {
      id: "3", 
      name: "Hoodies",
      image: "/categories/hoodies.jpg",
      productCount: 0,
      slug: "hoodies"
    },
    {
      id: "4", 
      name: "Custom Tshirt",
      image: "/categories/hoodies.jpg",
      productCount: 0,
      slug: "hoodies"
    },
  ];

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    // Only auto-play if we need navigation (carousel mode)
    if (isAutoPlaying && needsNavigation()) {
      autoPlayRef.current = setInterval(() => {
        setCurrentIndex((prevIndex) => {
          const maxIndex = getMaxIndex();
          return prevIndex >= maxIndex ? 0 : prevIndex + 1;
        });
      }, 4000);
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [isAutoPlaying, categories.length]);

  const loadCategories = async () => {
    try {
      // Get all products to count categories
      const products = await ProductService.getAllProducts();
      
      // Count products per category
      const categoryCount: { [key: string]: number } = {};
      products.forEach(product => {
        const categorySlug = product.category.toLowerCase().replace(/\s+/g, '-');
        categoryCount[categorySlug] = (categoryCount[categorySlug] || 0) + 1;
      });

      // Update default categories with actual product counts
      const updatedCategories = defaultCategories.map(category => ({
        ...category,
        productCount: categoryCount[category.slug] || 0
      }));

      setCategories(updatedCategories);
    } catch (error) {
      console.error("Error loading categories:", error);
      // Use default categories if loading fails
      setCategories(defaultCategories);
    } finally {
      setLoading(false);
    }
  };

  const getItemsPerView = () => {
    if (typeof window === 'undefined') return Math.min(4, categories.length);
    
    const categoryCount = categories.length;
    
    // Mobile: Show 2 items max, but adjust if fewer categories
    if (window.innerWidth < 640) {
      return Math.min(2, categoryCount);
    }
    
    // Tablet: Show 3 items max, but adjust if fewer categories
    if (window.innerWidth < 768) {
      return Math.min(3, categoryCount);
    }
    
    // Desktop: Show 4 items max - this will trigger carousel mode if more than 4
    return Math.min(4, categoryCount);
  };

  // Check if we need navigation arrows
  const needsNavigation = () => {
    const categoryCount = categories.length || defaultCategories.length;
    const itemsPerView = getItemsPerView();
    
    if (typeof window === 'undefined') return categoryCount > 4;
    
    // Mobile: Always show navigation if more than items per view
    if (window.innerWidth < 768) {
      return categoryCount > itemsPerView;
    }
    
    // Desktop: Show navigation if more than 4 categories
    return categoryCount > 4;
  };

  const getMaxIndex = () => {
    const itemsPerView = getItemsPerView();
    const categoryCount = categories.length || defaultCategories.length;
    
    // If we have fewer categories than items per view, no scrolling needed
    if (categoryCount <= itemsPerView) {
      return 0;
    }
    
    return Math.max(0, categoryCount - itemsPerView);
  };

  const goToSlide = (index: number) => {
    const maxIndex = getMaxIndex();
    setCurrentIndex(Math.max(0, Math.min(index, maxIndex)));
  };

  const nextSlide = () => {
    const maxIndex = getMaxIndex();
    setCurrentIndex(prev => prev >= maxIndex ? 0 : prev + 1);
  };

  const prevSlide = () => {
    const maxIndex = getMaxIndex();
    setCurrentIndex(prev => prev <= 0 ? maxIndex : prev - 1);
  };

  const handleMouseEnter = () => {
    setIsAutoPlaying(false);
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
    }
  };

  const handleMouseLeave = () => {
    setIsAutoPlaying(true);
  };

  // Get grid classes based on category count
  const getGridClasses = () => {
    const count = categories.length || defaultCategories.length;
    
    if (count === 1) return "grid-cols-1 justify-center max-w-xs mx-auto";
    if (count === 2) return "grid-cols-1 sm:grid-cols-2 max-w-lg mx-auto gap-8";
    if (count === 3) return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto gap-6";
    if (count === 4) return "grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto gap-6";
    
    // 5 or more categories - use full responsive grid
    return "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6";
  };

  if (loading) {
    return (
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Shop by Category</h2>
            <p className="text-gray-600">Discover our collection across different styles</p>
          </div>
          <div className={`grid gap-6 ${getGridClasses()}`}>
            {defaultCategories.map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gray-300 rounded-lg aspect-square mb-3"></div>
                <div className="bg-gray-300 h-4 rounded mb-2"></div>
                <div className="bg-gray-300 h-3 rounded w-2/3 mx-auto"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Shop by Category</h2>
          <p className="text-gray-600">Discover our collection across different styles</p>
        </div>

        <div 
          className="relative"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Navigation Arrows - Show based on needsNavigation logic */}
          {needsNavigation() && (
            <>
              {/* Desktop Navigation Arrows */}
              <button
                onClick={prevSlide}
                className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow"
                aria-label="Previous categories"
              >
                <ChevronLeft className="h-6 w-6 text-gray-600" />
              </button>

              <button
                onClick={nextSlide}
                className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow"
                aria-label="Next categories"
              >
                <ChevronRight className="h-6 w-6 text-gray-600" />
              </button>

              {/* Mobile Navigation Arrows */}
              <button
                onClick={prevSlide}
                className="flex md:hidden absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow"
                aria-label="Previous categories"
              >
                <ChevronLeft className="h-5 w-5 text-gray-600" />
              </button>

              <button
                onClick={nextSlide}
                className="flex md:hidden absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow"
                aria-label="Next categories"
              >
                <ChevronRight className="h-5 w-5 text-gray-600" />
              </button>
            </>
          )}

          {/* Carousel Container - Use grid layout if no navigation needed, carousel if navigation needed */}
          {!needsNavigation() ? (
            // Static grid layout when all categories fit
            <div className={`grid gap-6 ${getGridClasses()}`}>
              {categories.map((category) => (
                <div key={category.id}>
                  <Link
                    href={`/products?category=${category.slug}`}
                    className="group block"
                  >
                    <div className="relative overflow-hidden rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
                      {/* Category Image */}
                      <div className="aspect-square relative overflow-hidden">
                        <img
                          src={category.image}
                          alt={category.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            // Fallback to a placeholder if image fails to load
                            const target = e.target as HTMLImageElement;
                            target.src = `https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop&crop=center`;
                          }}
                        />
                        
                        {/* Overlay */}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-300"></div>
                        
                        {/* Product Count Badge */}
                        {category.productCount > 0 && (
                          <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                            {category.productCount}
                          </div>
                        )}
                      </div>

                      {/* Category Info */}
                      <div className="p-4 text-center">
                        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors
               truncate w-full">
  {category.name}
</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {category.productCount > 0 
                            ? `${category.productCount} ${category.productCount === 1 ? 'item' : 'items'}`
                            : 'Coming Soon'
                          }
                        </p>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            // Carousel layout when categories exceed viewport
            <div className="overflow-hidden" ref={carouselRef}>
              <div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{
                  transform: `translateX(-${currentIndex * (100 / getItemsPerView())}%)`
                }}
              >
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="shrink-0 px-3"
                    style={{ width: `${100 / getItemsPerView()}%` }}
                  >
                    <Link
                      href={`/products?category=${category.slug}`}
                      className="group block"
                    >
                      <div className="relative overflow-hidden rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
                        {/* Category Image */}
                        <div className="aspect-square relative overflow-hidden">
                          <img
                            src={category.image}
                            alt={category.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              // Fallback to a placeholder if image fails to load
                              const target = e.target as HTMLImageElement;
                              target.src = `https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop&crop=center`;
                            }}
                          />
                          
                          {/* Overlay */}
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-300"></div>
                          
                          {/* Product Count Badge */}
                          {category.productCount > 0 && (
                            <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                              {category.productCount}
                            </div>
                          )}
                        </div>

                        {/* Category Info */}
                        <div className="p-4 text-center">
                          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {category.name}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {category.productCount > 0 
                              ? `${category.productCount} ${category.productCount === 1 ? 'item' : 'items'}`
                              : 'Coming Soon'
                            }
                          </p>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dots Indicator - Show for carousel mode */}
          {needsNavigation() && (
            <div className="flex justify-center mt-6 space-x-2">
              {Array.from({ length: getMaxIndex() + 1 }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentIndex ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* View All Categories Link */}
        <div className="text-center mt-8">
          <Link
            href="/products"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            View All Products
            <ChevronRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}