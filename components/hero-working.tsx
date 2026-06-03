"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getActiveBannerSlides, type BannerSlide } from "@/lib/banner-services";

export default function HeroWorking() {
  const router = useRouter();
  const [slides, setSlides] = useState<BannerSlide[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getActiveBannerSlides().then((data) => {
      setSlides(data);
      setLoaded(true);
    });
  }, []);

  // Auto-slide — only when there is more than one slide
  useEffect(() => {
    if (slides.length <= 1 || isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length, currentSlide, isPaused]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  const goToSlide = (i: number) => setCurrentSlide(i);

  // Hide hero entirely when: still loading OR no active slides
  if (!loaded || slides.length === 0) return null;

  const multiSlide = slides.length > 1;

  return (
    <section
      className="relative overflow-hidden bg-black"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`transition-opacity duration-700 ease-in-out ${
            index === currentSlide
              ? "opacity-100 relative z-10"
              : "opacity-0 absolute inset-0 z-0 pointer-events-none"
          }`}
        >
          {/* ── MOBILE: natural height, 3:4 image ── */}
          <div
            className="block md:hidden relative w-full cursor-pointer"
            onClick={() => router.push(slide.href)}
          >
            <Image
              src={slide.mobile_url}
              alt="Banner"
              width={0}
              height={0}
              sizes="100vw"
              priority={index === 0}
              className="w-full h-auto"
            />
          </div>

          {/* ── DESKTOP: 16:7 ratio, object-cover ── */}
          <div
            className="hidden md:block relative w-full aspect-16/7 cursor-pointer"
            onClick={() => router.push(slide.href)}
          >
            <Image
              src={slide.desktop_url}
              alt="Banner"
              fill
              sizes="100vw"
              priority={index === 0}
              className="object-cover"
            />
          </div>
        </div>
      ))}

      {/* Arrows — only when more than one slide */}
      {multiSlide && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-30 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-1.5 sm:p-2 transition-colors"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-30 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-1.5 sm:p-2 transition-colors"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </button>
        </>
      )}

      {/* Dots — only when more than one slide */}
      {multiSlide && (
        <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goToSlide(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-colors ${
                i === currentSlide ? "bg-white" : "bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
