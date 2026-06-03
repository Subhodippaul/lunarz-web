"use client";
import Link from "next/link";
import { ImageOff, ShoppingBag } from "lucide-react";

export default function AdvertisementSection() {
  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-stretch gap-0 rounded-2xl overflow-hidden shadow-2xl">

          {/* ── LEFT: Text content ── */}
          <div className="flex-1 bg-linear-to-br from-gray-900 to-gray-800 flex flex-col justify-center px-8 py-10 md:px-12 md:py-14">
            {/* Label */}
            <span className="inline-block text-xs font-bold tracking-widest uppercase text-yellow-400 mb-4">
              ⚽ FIFA World Cup Collection
            </span>

            {/* Headline */}
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight mb-4">
              T-Shirts Made for<br />
              <span className="text-yellow-400">True Fans</span>
            </h2>

            {/* Sub-text */}
            <p className="text-gray-400 text-base md:text-lg mb-8 max-w-md">
              Represent your nation on and off the pitch. Premium oversized tees
              with iconic football designs — built for the beautiful game.
            </p>

            {/* Features row */}
            <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-400 mb-10">
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 shrink-0" />
                100% Cotton
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 shrink-0" />
                Oversized Fit
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 shrink-0" />
                Free Shipping
              </li>
            </ul>

            {/* CTA */}
            <Link
              href="/products"
              className="inline-flex items-center gap-2 self-start bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold px-8 py-3.5 rounded-full transition-colors text-base shadow-lg"
            >
              <ShoppingBag className="w-5 h-5" />
              Buy Now
            </Link>
          </div>

          {/* ── RIGHT: Image placeholder ── */}
          <div className="w-full md:w-[520px] shrink-0 bg-gray-800 flex items-center justify-center min-h-[280px] md:min-h-0">
            {/* Replace this div with an <Image> once the photo is ready */}
            <div className="flex flex-col items-center gap-3 text-gray-600 select-none">
              <ImageOff className="w-14 h-14" />
              <span className="text-sm font-medium tracking-wide">Image coming soon</span>
              <span className="text-xs text-gray-700">Recommended: 840 × 560 px</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
