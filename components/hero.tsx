"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { HERO, NAV_LINKS } from "@/lib/constants";

const heroSlides = [
  {
    id: 1,
    title: "Premium Oversized T-Shirts",
    subtitle: "Anime • Football • Music • Streetwear",
    image: "/hero-1.jpg",
    bgColor: "bg-black",
  },
  {
    id: 2,
    title: "Anime Collection",
    subtitle: "Express Your Passion • Premium Quality",
    image: "/hero-2.jpg",
    bgColor: "bg-linear-to-r from-purple-900 to-blue-900",
  },
  {
    id: 3,
    title: "Sports & Music Tees",
    subtitle: "Show Your Style • Comfort Guaranteed",
    image: "/hero-3.jpg",
    bgColor: "bg-linear-to-r from-green-900 to-teal-900",
  },
  {
    id: 4,
    title: "Streetwear Essentials",
    subtitle: "Urban Style • Modern Comfort",
    image: "/hero-4.jpg",
    bgColor: "bg-linear-to-r from-gray-900 to-slate-900",
  },
];

export default function Hero() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-slide functionality
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <section className="relative h-[70vh] overflow-hidden">
      {/* Slides */}
      <div className="relative w-full h-full">
        {heroSlides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-transform duration-500 ease-in-out ${
              index === currentSlide ? "translate-x-0" : 
              index < currentSlide ? "-translate-x-full" : "translate-x-full"
            }`}
          >
            <div className={`w-full h-full ${slide.bgColor} text-white relative`}>
              {/* Background Image Placeholder */}
              <div className="absolute inset-0 bg-black bg-opacity-40" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
              
              {/* Content */}
              <div className="relative z-10 max-w-7xl mx-auto px-6 h-full flex items-center">
                <div className="max-w-2xl">
                  <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                    {slide.title}
                  </h1>
                  <p className="text-xl md:text-2xl text-gray-300 mb-8">
                    {slide.subtitle}
                  </p>
                  <Button 
                    size="lg" 
                    className="bg-white text-black hover:bg-gray-100 text-lg px-8 py-3"
                    onClick={() => router.push(NAV_LINKS.shop)}
                  >
                    {HERO.cta}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2 transition-colors"
      >
        <ChevronLeft className="w-6 h-6 text-white" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2 transition-colors"
      >
        <ChevronRight className="w-6 h-6 text-white" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-colors ${
              index === currentSlide ? "bg-white" : "bg-white/50"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
