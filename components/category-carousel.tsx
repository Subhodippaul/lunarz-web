"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductService } from "@/lib/supabase-services";

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
      image: "/regular_category.png",
      productCount: 1,
      slug: "regular",
    },
    {
      id: "2",
      name: "Oversized T-Shirts",
      image: "/oversized_category.png",
      productCount: 3,
      slug: "oversized",
    },
    {
      id: "3",
      name: "Hoodies",
      image: "/hoodie_category.png",
      productCount: 1,
      slug: "hoodie",
    },
    {
      id: "4",
      name: "Custom Tshirt",
      image: "/customize_category.png",
      productCount: 0,
      slug: "custom-products",
    },
  ];

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
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
      const products = await ProductService.getAllProducts();

      const categoryCount: { [key: string]: number } = {};
      products.forEach((product) => {
        const categorySlug = product.category
          .toLowerCase()
          .replace(/\s+/g, "-");
        categoryCount[categorySlug] = (categoryCount[categorySlug] || 0) + 1;
      });

      const updatedCategories = defaultCategories.map(
        (category) => (
          console.log("category.slug", categoryCount),
          {
            ...category,
            productCount: categoryCount[category.slug] || 0,
          }
        )
      );

      setCategories(updatedCategories);
    } catch (error) {
      console.error("Error loading categories:", error);
      setCategories(defaultCategories);
    } finally {
      setLoading(false);
    }
  };

  const getItemsPerView = () => {
    if (typeof window === "undefined") return Math.min(4, categories.length);

    const categoryCount = categories.length;

    if (window.innerWidth < 640) {
      return Math.min(2, categoryCount);
    }

    if (window.innerWidth < 768) {
      return Math.min(3, categoryCount);
    }

    return Math.min(4, categoryCount);
  };

  const needsNavigation = () => {
    const categoryCount = categories.length || defaultCategories.length;
    const itemsPerView = getItemsPerView();

    if (typeof window === "undefined") return categoryCount > 4;

    if (window.innerWidth < 768) {
      return categoryCount > itemsPerView;
    }

    return categoryCount > 4;
  };

  const getMaxIndex = () => {
    const itemsPerView = getItemsPerView();
    const categoryCount = categories.length || defaultCategories.length;

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
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const prevSlide = () => {
    const maxIndex = getMaxIndex();
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
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

  const getGridClasses = () => {
    const count = categories.length || defaultCategories.length;

    if (count === 1) return "grid-cols-1 justify-center max-w-xs mx-auto";
    if (count === 2) return "grid-cols-1 sm:grid-cols-2 max-w-lg mx-auto gap-8";
    if (count === 3)
      return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto gap-6";
    if (count === 4)
      return "grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto gap-6";

    return "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6";
  };

  if (loading) {
    return (
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Shop by Category
            </h2>
            <p className="text-gray-600">
              Discover our collection across different styles
            </p>
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
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Shop by Category
          </h2>
          <p className="text-gray-600">
            Discover our collection across different styles
          </p>
        </div>

        <div
          className="relative"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Navigation Arrows */}
          {needsNavigation() && (
            <>
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
            </>
          )}

          {/* Static grid layout */}
          <div className={`grid gap-6 ${getGridClasses()}`}>
            {categories.map((category) => {
              const isComingSoon = category.slug === "custom-tshirt";
              return (
                <div key={category.id}>
                  <Link
                    href={
                      isComingSoon
                        ? "#"
                        : category.slug === "custom-tshirt"
                        ? `/${category.slug}`
                        : `/products?category=${category.slug}`
                    }
                    onClick={isComingSoon ? (e) => e.preventDefault() : undefined}
                    className={`group block ${isComingSoon ? "cursor-not-allowed" : ""}`}
                  >
                    <div className="relative overflow-hidden rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
                      {/* Coming Soon Overlay */}
                      {isComingSoon && (
                        <div className="absolute inset-0 z-10 bg-black/50 flex flex-col items-center justify-center rounded-lg">
                          <span className="text-white font-bold text-lg tracking-wide">
                            Coming Soon
                          </span>
                          <span className="text-white/70 text-xs mt-1">
                            Stay tuned!
                          </span>
                        </div>
                      )}

                      {/* Category Image */}
                      <div className="aspect-square relative overflow-hidden">
                        <img
                          src={category.image}
                          alt={category.name}
                          className={`w-full h-full object-cover transition-transform duration-300 ${
                            isComingSoon
                              ? "grayscale opacity-60"
                              : "group-hover:scale-105"
                          }`}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                          }}
                        />
                      </div>

                      {/* Category Info */}
                      <div className="p-4 text-center">
                        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate w-full">
                          {category.name}
                        </h3>
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
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
