"use client";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { CURRENCY } from "@/lib/constants";

export default function ProductCard({ product }: any) {
  const [isHovered, setIsHovered] = useState(false);

  // Get primary and secondary images
  const primaryImage = product.images?.[0] || null;
  const secondaryImage = product.images?.[1] || null;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 group">
      <Link href={`/products/${product.id}`}>
        {/* Full Image Box */}
        <div 
          className="aspect-square bg-gray-100 relative overflow-hidden cursor-pointer"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {primaryImage ? (
            <div className="relative w-full h-full">
              {/* Primary Image */}
              <img
                src={primaryImage}
                alt={product.name}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
                  isHovered && secondaryImage ? 'opacity-0' : 'opacity-100'
                }`}
              />
              
              {/* Secondary Image (shows on hover) */}
              {secondaryImage && (
                <img
                  src={secondaryImage}
                  alt={`${product.name} - alternate view`}
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
                    isHovered ? 'opacity-100' : 'opacity-0'
                  }`}
                />
              )}
            </div>
          ) : (
            <div className="w-full h-full bg-linear-to-br from-gray-200 to-gray-300 flex items-center justify-center">
              <span className="text-gray-500 text-sm">Product Image</span>
            </div>
          )}
          
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-5 transition-all duration-300" />
          
          {/* Sale Badge */}
          {product.originalPrice && product.originalPrice > product.price && (
            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
              SALE
            </div>
          )}
        </div>
      </Link>
      
      <CardContent className="p-3 space-y-2">
        {/* Product Name */}
        <Link href={`/products/${product.id}`}>
          <h3 className="font-medium text-sm text-gray-900 hover:text-blue-600 transition-colors cursor-pointer">
            {product.name}
          </h3>
        </Link>
        
        {/* Divider */}
        <hr className="border-gray-200" />
        
        {/* Categories */}
        <div className="flex flex-wrap gap-1">
          <span className="inline-block px-1.5 py-0.5 text-xs font-medium text-gray-600 bg-gray-100 rounded">
            {product.category}
          </span>
        </div>
        
        {/* Price */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <p className="text-lg font-bold text-gray-900">
              {CURRENCY.symbol}{product.price?.toLocaleString() || product.price}
            </p>
            {product.originalPrice && product.originalPrice > product.price && (
              <p className="text-sm text-gray-500 line-through">
                {CURRENCY.symbol}{product.originalPrice.toLocaleString()}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
