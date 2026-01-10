"use client";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, ShoppingBag, Sparkles, Zap } from "lucide-react";

interface BannerSlide {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  backgroundImage: string;
  backgroundColor: string;
  textColor: string;
  icon: React.ReactNode;
}

const bannerSlides: BannerSlide[] = [
  // {
  //   id: 1,
  //   title: "New Collection",
  //   subtitle: "Fresh Designs Just Dropped",
  //   description: "Discover our latest collection of premium t-shirts with unique designs",
  //   buttonText: "Shop Now",
  //   buttonLink: "/products?category=new-arrivals",
  //   backgroundImage: "/api/placeholder/1200/400",
  //   backgroundColor: "bg-gradient-to-r from-blue-600 to-purple-600",
  //   textColor: "text-white",
  //   icon: <Sparkles className="h-6 w-6" />
  // },
  // {
  //   id: 2,
  //   title: "Limited Edition",
  //   subtitle: "Exclusive Anime Collection",
  //   description: "Get your hands on limited edition anime-inspired designs before they're gone",
  //   buttonText: "Explore",
  //   buttonLink: "/products?category=anime",
  //   backgroundImage: "/api/placeholder/1200/400",
  //   backgroundColor: "bg-gradient-to-r from-red-500 to-pink-500",
  //   textColor: "text-white",
  //   icon: <Zap className="h-6 w-6" />
  // },
  {
    id: 3,
    title: "All T-Shirts",
    subtitle: "Customer Favorites",
    description: "Shop the most loved designs by our community of fashion enthusiasts",
    buttonText: "View All",
    buttonLink: "/products?sort=popular",
    backgroundImage: "/api/placeholder/1200/400",
    backgroundColor: "bg-gradient-to-r from-green-500 to-teal-500",
    textColor: "text-white",
    icon: <ShoppingBag className="h-6 w-6" />
  }
];

export default function ProductsBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-slide functionality
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + bannerSlides.length) % bannerSlides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const currentBanner = bannerSlides[currentSlide];

  return (
    <div 
      className="relative w-full h-64 md:h-80 lg:h-96 overflow-hidden rounded-lg mb-8"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      {/* Background */}
      <div className={`absolute inset-0 ${currentBanner.backgroundColor}`}>
        {/* Optional background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')]"></div>
        </div>
      </div>

      {/* Content */}
      <div className="relative h-full flex items-center">
        <div className="max-w-7xl mx-auto px-6 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Text Content */}
            <div className={`${currentBanner.textColor} space-y-4`}>
              <div className="flex items-center space-x-2">
                {currentBanner.icon}
                <span className="text-sm font-medium opacity-90">
                  {currentBanner.subtitle}
                </span>
              </div>
              
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                {currentBanner.title}
              </h2>
              
              <p className="text-lg md:text-xl opacity-90 max-w-md">
                {currentBanner.description}
              </p>
              
             
            </div>

            {/* Visual Element */}
            <div className="hidden lg:flex justify-center items-center">
              <div className="relative">
                {/* Decorative circles */}
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-white bg-opacity-20 rounded-full animate-pulse"></div>
                <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-white bg-opacity-30 rounded-full animate-pulse delay-1000"></div>
                
                {/* Main visual */}
                <div className="w-64 h-64 bg-white bg-opacity-10 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <div className="text-6xl">
                    {currentBanner.icon}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Arrows
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-full transition-all duration-200 backdrop-blur-sm"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-full transition-all duration-200 backdrop-blur-sm"
        aria-label="Next slide"
      >
        <ChevronRight className="h-6 w-6" />
      </button> */}

      {/* Slide Indicators */}
      {/* <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {bannerSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-200 ${
              index === currentSlide
                ? "bg-white"
                : "bg-white bg-opacity-50 hover:bg-opacity-75"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div> */}

      {/* Progress Bar */}
      {/* <div className="absolute bottom-0 left-0 w-full h-1 bg-white bg-opacity-20">
        <div
          className="h-full bg-white transition-all duration-300 ease-linear"
          style={{
            width: `${((currentSlide + 1) / bannerSlides.length) * 100}%`,
          }}
        />
      </div> */}
    </div>
  );
}