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
      name: "T-Shirts",
      image: "/categories/tshirts.jpg",
      productCount: 0,
      slug: "t-shirts"
    },
    {
      id: "2", 
      name: "Hoodies",
      image: "/categories/hoodies.jpg",
      productCount: 0,
      slug: "hoodies"
    },
    {
      id: "3",
      name: "Accessories",
      image: "/categories/accessories.jpg", 
      productCount: 0,
      slug: "accessories"
    },
    {
      id: "4",
      name: "Streetwear",
      image: "/categories/streetwear.jpg",
      productCount: 0,
      slug: "streetwear"
    },
    {
      id: "5",
      name: "Anime",
      image: "/categories/anime.jpg",
      productCount: 0,
      slug: "anime"
    },
    {
      id: "6",
      name: "Sports",
      image: "/categories/sports.jpg",
      productCount: 0,
      slug: "sports"
    },
    {
      id: "7",
      name: "Music",
      image: "/categories/music.jpg",
      productCount: 0,
      slug: "music"
    },
    {
      id: "8",
      name: "Gaming",
      image: "/categories/gaming.jpg",
      productCount: 0,
      slug: "gaming"
    }
  ];

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (isAutoPlaying && categories.length > 0) {
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
    if (typeof window === 'undefined') return 4;
    if (window.innerWidth < 640) return 2; // Mobile
    if (window.innerWidth < 768) return 3; // Tablet
    if (window.innerWidth < 1024) return 4; // Small desktop
    return 5; // Large desktop
  };

  const getMaxIndex = () => {
    const itemsPerView = getItemsPerView();
    return Math.max(0, categories.length - itemsPerView);
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

  if (loading) {
    return (
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Shop by Category</h2>
            <p className="text-gray-600">Discover our collection across different styles</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gray-300 rounded-lg aspect-square mb-3"></div>
                <div className="bg-gray-300 h-4 rounded mb-2"></div>
                <div className="bg-gray-300 h-3 rounded w-2/3"></div>
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
          {/* Navigation Arrows - Desktop */}
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

          {/* Carousel Container */}
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

          {/* Dots Indicator - Mobile */}
          <div className="flex justify-center mt-6 space-x-2 md:hidden">
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