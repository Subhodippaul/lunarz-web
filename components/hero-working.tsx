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
    image: "/hero1.png",
  },
  {
    id: 2,
    title: "Anime Collection",
    subtitle: "Express Your Passion • Premium Quality",
    image: "/hero2.png", // Same working image
  },
  {
    id: 3,
    title: "Sports & Music Tees",
    subtitle: "Show Your Style • Comfort Guaranteed",
    image: "/hero3.png", // Same working image
  },
];

export default function HeroWorking() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);

  // Auto-slide functionality
  useEffect(() => {
    if (isPaused) return;

    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
      setProgress(0);
    }, 5000);

    return () => {
      clearInterval(slideInterval);
    };
  }, [currentSlide, isPaused]);

  const nextSlide = () => {
    setProgress(0);
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setProgress(0);
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const goToSlide = (index: number) => {
    if (index !== currentSlide) {
      setProgress(0);
      setCurrentSlide(index);
    }
  };

  return (
    <section 
      className="relative h-[70vh] overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slides Container */}
      <div className="relative w-full h-full">
        <div 
          className="flex w-full h-full transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {heroSlides.map((slide, index) => (
            <div
              key={slide.id}
              className="w-full h-full flex-shrink-0 relative"
            >
              {/* Background Image */}
              <div 
                className="w-full h-full bg-cover bg-center bg-no-repeat"
                style={{ 
                  backgroundImage: `url(${slide.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat'
                }}
              >
                {/* Content */}
                <div className="relative z-20 max-w-7xl mx-auto px-6 h-full flex items-center text-white">
                  <div className="max-w-2xl">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight drop-shadow-2xl">
                      {slide.title}
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-100 mb-8 drop-shadow-xl">
                      {slide.subtitle}
                    </p>
                    <Button 
                      size="lg" 
                      className="bg-white text-black hover:bg-gray-100 text-lg px-8 py-3 shadow-xl"
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
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2 transition-colors"
      >
        <ChevronLeft className="w-6 h-6 text-white" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2 transition-colors"
      >
        <ChevronRight className="w-6 h-6 text-white" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
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