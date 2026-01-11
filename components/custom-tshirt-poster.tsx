"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Palette, Shirt, Sparkles, ArrowRight, Car, Upload } from "lucide-react";

export default function CustomTshirtPoster() {
  return (
    <section className="py-12 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-6">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 shadow-2xl">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-20 h-20 border-2 border-white rounded-full"></div>
            <div className="absolute top-20 right-20 w-16 h-16 border-2 border-white rounded-lg rotate-45"></div>
            <div className="absolute bottom-10 left-20 w-12 h-12 border-2 border-white rounded-full"></div>
            <div className="absolute bottom-20 right-10 w-24 h-24 border-2 border-white rounded-lg rotate-12"></div>
          </div>

          <div className="relative z-10 grid lg:grid-cols-2 gap-6 md:gap-8 items-center p-6 md:p-8 lg:p-12">
            {/* Left Content */}
            <div className="text-white space-y-6">
              <div className="flex items-center gap-2 text-yellow-300">
                <Sparkles className="w-5 h-5" />
                <span className="text-sm font-medium uppercase tracking-wide">Design Your Style</span>
              </div>
              
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
                Create Your
                <span className="block text-yellow-300">Custom T-Shirt</span>
              </h2>
              
              <p className="text-base sm:text-lg text-blue-100 leading-relaxed">
                Unleash your creativity! Design unique t-shirts with our easy-to-use customization tool. 
                Upload your artwork, choose colors, and create something truly yours.
              </p>

              {/* Features */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <Upload className="w-4 h-4" />
                  </div>
                  <span className="text-sm">Upload Your Design</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <Shirt className="w-4 h-4" />
                  </div>
                  <span className="text-sm">Perfect Size</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <span className="text-sm">Premium Quality</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <Car className="w-4 h-4" />
                  </div>
                  <span className="text-sm">Fast Delivery</span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-4">
                <Link href="/custom-tshirt">
                  <Button 
                    size="lg" 
                    className="w-full sm:w-auto bg-white text-purple-600 hover:bg-gray-100 font-semibold px-6 md:px-8 py-2.5 md:py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group"
                  >
                    Start Designing
                    <ArrowRight className="ml-2 w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/products">
                  <Button 
                    variant="ghost" 
                    size="lg"
                    // className="border-2"
                    className="w-full sm:w-auto border-2 border-white text-white hover:bg-white hover:text-purple-600 font-semibold px-6 md:px-8 py-2.5 md:py-3 rounded-full transition-all duration-300"
                  >
                    Browse Products
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Visual */}
            <div className="relative order-first lg:order-last">
              {/* T-Shirt Mockup */}
              <div className="relative mx-auto w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96">
                {/* Background Circle */}
                <div className="absolute inset-0 bg-white/10 rounded-full blur-3xl"></div>
                
                {/* T-Shirt Shape */}
                <div className="relative z-10 w-full h-full flex items-center justify-center">
                  <div className="w-48 h-48 sm:w-64 sm:h-64 lg:w-80 lg:h-80 relative">
                    {/* T-Shirt Base */}
                    <div className="absolute inset-0 bg-white rounded-3xl shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
                      {/* T-Shirt Design Area */}
                      <div className="absolute inset-8 bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl flex items-center justify-center">
                        <div className="text-center space-y-2">
                          <Shirt className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-purple-600" />
                          <p className="text-purple-600 font-semibold text-sm sm:text-base">Your Design Here</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Floating Elements */}
                    <div className="absolute bottom-30 -right-7 sm:bottom-50 sm:-right-4 w-10 h-10 sm:w-12 sm:h-12 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                      <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="absolute -bottom-3 -left-3 sm:-bottom-4 sm:-left-4 w-8 h-8 sm:w-10 sm:h-10 bg-pink-400 rounded-full shadow-lg animate-pulse"></div>
                  </div>
                </div>
              </div>

              {/* Floating Price Tag */}
              <div className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-yellow-400 text-purple-900 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full font-bold shadow-lg transform rotate-12 hover:rotate-0 transition-transform duration-300 text-sm sm:text-base">
                Starting ₹349
              </div>
            </div>
          </div>

         </div>
      </div>
    </section>
  );
}