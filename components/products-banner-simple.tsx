"use client";
import { ShoppingBag, Sparkles, Tag, TrendingUp } from "lucide-react";

export default function ProductsBannerSimple() {
  return (
    <div className="relative w-full mb-8">
      {/* Main Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-lg overflow-hidden">
        <div className="relative px-6 py-12 md:py-16 lg:py-20">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4yIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')]"></div>
          </div>

          <div className="relative max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              {/* Content */}
              <div className="text-white space-y-6">
                <div className="flex items-center space-x-2">
                  <Sparkles className="h-6 w-6" />
                  <span className="text-sm font-medium opacity-90">
                    Premium Collection
                  </span>
                </div>
                
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                  Discover Your
                  <span className="block text-yellow-300">Perfect Style</span>
                </h1>
                
                <p className="text-lg md:text-xl opacity-90 max-w-md">
                  Explore our curated collection of premium t-shirts, hoodies, and custom designs. 
                  Quality meets creativity in every piece.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <a
                    href="#products"
                    className="inline-flex items-center justify-center px-6 py-3 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-100 transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <ShoppingBag className="mr-2 h-5 w-5" />
                    Shop Now
                  </a>
                  
                  <a
                    href="/custom-tshirt"
                    className="inline-flex items-center justify-center px-6 py-3 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-gray-900 transition-colors duration-200"
                  >
                    <Sparkles className="mr-2 h-5 w-5" />
                    Custom Design
                  </a>
                </div>
              </div>

              {/* Visual Elements */}
              <div className="hidden lg:flex justify-center items-center">
                <div className="relative">
                  {/* Floating Icons */}
                  <div className="absolute -top-8 -right-8 w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center animate-bounce">
                    <Tag className="h-8 w-8 text-white" />
                  </div>
                  
                  <div className="absolute -bottom-8 -left-8 w-12 h-12 bg-yellow-300 bg-opacity-30 rounded-full flex items-center justify-center animate-pulse">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  
                  {/* Main Circle */}
                  <div className="w-80 h-80 bg-white bg-opacity-10 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <div className="w-64 h-64 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                      <ShoppingBag className="h-24 w-24 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Premium Quality</h3>
              <p className="text-sm text-gray-600">100% cotton, eco-friendly materials</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Trending Designs</h3>
              <p className="text-sm text-gray-600">Latest fashion trends & styles</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Tag className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Best Prices</h3>
              <p className="text-sm text-gray-600">Competitive pricing, great value</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}