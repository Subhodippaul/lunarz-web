"use client";
import { useState } from "react";
import { X, ShoppingBag, Zap, Gift, Truck } from "lucide-react";
import Link from "next/link";

export default function AdvertisementSection() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) {
    return null;
  }

  return (
    <section className="py-16 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div 
          className="absolute top-0 left-0 w-full h-full"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        ></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative">
        {/* Close Button */}
        {/* <button
          onClick={() => setIsVisible(false)}
          className="absolute top-0 right-6 text-white/80 hover:text-white transition-colors z-10"
        >
          <X className="h-6 w-6" />
        </button> */}

        {/* Desktop Layout */}
        <div className="hidden md:grid md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-white">
            <div className="flex items-center space-x-2 mb-4">
              <Zap className="h-8 w-8 text-yellow-300" />
              <span className="text-yellow-300 font-semibold text-lg">Limited Time Offer</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
              Starting from <span className="text-yellow-300">₹349</span>
            </h2>
            <p className="text-xl mb-6 text-white/90">
              Premium quality t-shirts and hoodies at unbeatable prices. Comfort meets style!
            </p>
            
            {/* Features */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="flex items-center space-x-2">
                <Truck className="h-5 w-5 text-green-300" />
                <span className="text-sm">Free Shipping</span>
              </div>
              <div className="flex items-center space-x-2">
                <Gift className="h-5 w-5 text-pink-300" />
                <span className="text-sm">Free Gift Wrap</span>
              </div>
              <div className="flex items-center space-x-2">
                <ShoppingBag className="h-5 w-5 text-blue-300" />
                <span className="text-sm">Easy Returns</span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-yellow-300" />
                <span className="text-sm">24/7 Support</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/products"
                className="bg-white text-purple-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors text-center"
              >
                Shop Now
              </Link>
              <Link
                href="/products?category=t-shirts"
                className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-purple-600 transition-colors text-center"
              >
                View T-Shirts
              </Link>
            </div>
          </div>

          {/* Right Content - Promotional Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-white">
              <div className="text-3xl font-bold text-yellow-300 mb-2">₹349</div>
              <div className="text-sm mb-2">Starting</div>
              <div className="text-xs text-white/80">Basic T-Shirts</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-white">
              <div className="text-3xl font-bold text-green-300 mb-2">₹599</div>
              <div className="text-sm mb-2">Starting</div>
              <div className="text-xs text-white/80">Premium T-Shirts</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-white">
              <div className="text-3xl font-bold text-pink-300 mb-2">₹899</div>
              <div className="text-sm mb-2">Starting</div>
              <div className="text-xs text-white/80">Basic Hoodies</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-white">
              <div className="text-3xl font-bold text-blue-300 mb-2">₹1299</div>
              <div className="text-sm mb-2">Starting</div>
              <div className="text-xs text-white/80">Premium Hoodies</div>
            </div>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden text-center text-white">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Zap className="h-6 w-6 text-yellow-300" />
            <span className="text-yellow-300 font-semibold">Limited Time Offer</span>
          </div>
          
          <h2 className="text-3xl font-bold mb-4 leading-tight">
            Starting from <span className="text-yellow-300">₹349</span>
          </h2>
          
          <p className="text-lg mb-6 text-white/90">
            Premium t-shirts & hoodies at amazing prices!
          </p>

          {/* Mobile Promotional Grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-2xl font-bold text-yellow-300">₹349</div>
              <div className="text-xs text-white/80">Basic T-Shirts</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-2xl font-bold text-green-300">₹599</div>
              <div className="text-xs text-white/80">Premium Tees</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-2xl font-bold text-pink-300">₹899</div>
              <div className="text-xs text-white/80">Basic Hoodies</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-2xl font-bold text-blue-300">₹1299</div>
              <div className="text-xs text-white/80">Premium Hoodies</div>
            </div>
          </div>

          {/* Mobile Features */}
          <div className="grid grid-cols-2 gap-3 mb-6 text-sm">
            <div className="flex items-center justify-center space-x-1">
              <Truck className="h-4 w-4 text-green-300" />
              <span>Free Shipping</span>
            </div>
            <div className="flex items-center justify-center space-x-1">
              <Gift className="h-4 w-4 text-pink-300" />
              <span>Free Gift Wrap</span>
            </div>
          </div>

          {/* Mobile CTA Buttons */}
          <div className="space-y-3">
            <Link
              href="/products"
              className="block bg-white text-purple-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors"
            >
              Shop Now
            </Link>
            <Link
              href="/products?category=hoodies"
              className="block border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-purple-600 transition-colors"
            >
              View Hoodies
            </Link>
          </div>
        </div>

        {/* Countdown Timer (Optional) */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-2 text-white">
            <Zap className="h-4 w-4 text-yellow-300" />
            <span className="text-sm font-medium">New arrivals dropping soon!</span>
          </div>
        </div>
      </div>
    </section>
  );
}