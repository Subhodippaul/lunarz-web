"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Filter, X, ChevronDown } from "lucide-react";
import { CURRENCY } from "@/lib/constants";

interface FilterState {
  colors: string[];
  priceRange: { min: number; max: number };
  categories: string[];
  sizes: string[];
}

interface ProductFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  onClearFilters: () => void;
}

const AVAILABLE_COLORS = [
  { name: "Black", value: "black", color: "#000000" },
  { name: "White", value: "white", color: "#FFFFFF" },
  { name: "Red", value: "red", color: "#EF4444" },
  { name: "Blue", value: "blue", color: "#3B82F6" },
  { name: "Green", value: "green", color: "#10B981" },
  { name: "Yellow", value: "yellow", color: "#F59E0B" },
  { name: "Purple", value: "purple", color: "#8B5CF6" },
  { name: "Pink", value: "pink", color: "#EC4899" },
  { name: "Gray", value: "gray", color: "#6B7280" },
  { name: "Navy", value: "navy", color: "#1E3A8A" },
];

const PRICE_RANGES = [
  { label: "Under ₹500", min: 0, max: 500 },
  { label: "₹500 - ₹1000", min: 500, max: 1000 },
  { label: "₹1000 - ₹1500", min: 1000, max: 1500 },
  { label: "₹1500 - ₹2000", min: 1500, max: 2000 },
  { label: "Above ₹2000", min: 2000, max: 999999 },
];

const AVAILABLE_CATEGORIES = ["T-Shirts", "Anime", "Football", "Music", "Streetwear", "Casual", "Sports"];
const AVAILABLE_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];

export default function ProductFilters({
  filters,
  onFiltersChange,
  sortBy,
  onSortChange,
  onClearFilters,
}: ProductFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);

  const handleColorToggle = (color: string) => {
    const newColors = filters.colors.includes(color)
      ? filters.colors.filter(c => c !== color)
      : [...filters.colors, color];
    
    onFiltersChange({ ...filters, colors: newColors });
  };

  const handlePriceRangeChange = (range: { min: number; max: number }) => {
    onFiltersChange({ ...filters, priceRange: range });
  };

  const handleCategoryToggle = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter(c => c !== category)
      : [...filters.categories, category];
    
    onFiltersChange({ ...filters, categories: newCategories });
  };

  const handleSizeToggle = (size: string) => {
    const newSizes = filters.sizes.includes(size)
      ? filters.sizes.filter(s => s !== size)
      : [...filters.sizes, size];
    
    onFiltersChange({ ...filters, sizes: newSizes });
  };

  const hasActiveFilters = filters.colors.length > 0 || 
                          filters.categories.length > 0 || 
                          filters.sizes.length > 0 ||
                          (filters.priceRange.min > 0 || filters.priceRange.max < 999999);

  return (
    <div className="space-y-4">
      {/* Filter Toggle and Sort */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </Button>
          
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="text-red-600 hover:text-red-700"
            >
              <X className="w-4 h-4 mr-1" />
              Clear All
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Sort by:</span>
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">Featured</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="name-asc">Name: A to Z</SelectItem>
              <SelectItem value="name-desc">Name: Z to A</SelectItem>
              <SelectItem value="newest">Newest First</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Colors */}
              <div>
                <h3 className="font-semibold text-sm mb-3">Colors</h3>
                <div className="grid grid-cols-5 gap-2">
                  {AVAILABLE_COLORS.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => handleColorToggle(color.value)}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        filters.colors.includes(color.value)
                          ? 'border-blue-500 scale-110'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      style={{ 
                        backgroundColor: color.color,
                        border: color.value === 'white' ? '2px solid #e5e7eb' : undefined
                      }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h3 className="font-semibold text-sm mb-3">Price Range</h3>
                <div className="space-y-2">
                  {PRICE_RANGES.map((range, index) => (
                    <label key={index} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="priceRange"
                        checked={filters.priceRange.min === range.min && filters.priceRange.max === range.max}
                        onChange={() => handlePriceRangeChange(range)}
                        className="text-blue-600"
                      />
                      <span className="text-sm">{range.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Categories */}
              <div>
                <h3 className="font-semibold text-sm mb-3">Categories</h3>
                <div className="space-y-2">
                  {AVAILABLE_CATEGORIES.map((category) => (
                    <label key={category} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.categories.includes(category)}
                        onChange={() => handleCategoryToggle(category)}
                        className="text-blue-600"
                      />
                      <span className="text-sm">{category}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Sizes */}
              <div>
                <h3 className="font-semibold text-sm mb-3">Sizes</h3>
                <div className="grid grid-cols-4 gap-2">
                  {AVAILABLE_SIZES.map((size) => (
                    <button
                      key={size}
                      onClick={() => handleSizeToggle(size)}
                      className={`px-3 py-2 text-sm border rounded transition-colors ${
                        filters.sizes.includes(size)
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}