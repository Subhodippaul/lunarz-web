"use client";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/ui/toast";
import { Upload, X, Palette, Ruler } from "lucide-react";
import SizeChart from "@/components/size-chart";
import { ProductService } from "@/lib/supabase-services";
import { Product } from "@/lib/data";
import Link from "next/link";

interface CustomDesign {
  image: string | null;
  text: string;
  textColor: string;
  textSize: number;
  textPosition: { x: number; y: number };
  imagePosition: { x: number; y: number };
  imageSize: number;
  rotation: number;
}

export default function CustomTshirtPage() {
  const { dispatch } = useCart();
  const { state: authState } = useAuth();
  const { addToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Product details
  const [selectedSize, setSelectedSize] = useState("M");
  const [selectedColor, setSelectedColor] = useState("white");
  const [selectedProductType, setSelectedProductType] = useState("regular");
  const [quantity, setQuantity] = useState(1);
  const [price] = useState(899); // Base price for custom t-shirt

  // Custom product types from database
  const [customProducts, setCustomProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Design state
  const [design, setDesign] = useState<CustomDesign>({
    image: null,
    text: "",
    textColor: "#000000",
    textSize: 24,
    textPosition: { x: 50, y: 30 },
    imagePosition: { x: 50, y: 60 },
    imageSize: 100,
    rotation: 0
  });

  // UI state
  const [activeTab, setActiveTab] = useState<"upload" | "text">("upload");
  const [isDragging, setIsDragging] = useState(false);
  const [showSizeChart, setShowSizeChart] = useState(false);

  // Fetch custom product types from database
  useEffect(() => {
    fetchCustomProducts();
  }, []);

  const fetchCustomProducts = async () => {
    try {
      setLoading(true);
      const allProducts = await ProductService.getAllProducts();
      
      // Filter for custom product types (Regular T-shirt, Oversized T-shirt, Hoodie)
      const customTypes = allProducts.filter(product => 
        product.category === "Custom T-Shirts" || 
        product.name.toLowerCase().includes("regular") ||
        product.name.toLowerCase().includes("oversized") ||
        product.name.toLowerCase().includes("hoodie")
      );
      
      setCustomProducts(customTypes);
    } catch (error) {
      console.error("Error fetching custom products:", error);
      addToast({
        title: "Error",
        description: "Failed to load product types",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const tshirtColors = [
    { name: "White", value: "white", color: "#FFFFFF", border: "#E5E7EB" },
    { name: "Black", value: "black", color: "#000000", border: "#000000" },
    { name: "Navy", value: "navy", color: "#1E3A8A", border: "#1E3A8A" },
    { name: "Red", value: "red", color: "#DC2626", border: "#DC2626" },
    { name: "Green", value: "green", color: "#16A34A", border: "#16A34A" },
    { name: "Gray", value: "gray", color: "#6B7280", border: "#6B7280" },
  ];

  const sizes = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];

  // Handle file processing
  const processFile = (file: File) => {
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      addToast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
        type: "error"
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setDesign(prev => ({
        ...prev,
        image: e.target?.result as string
      }));
      setActiveTab("upload");
    };
    reader.readAsDataURL(file);
  };

  // Handle image upload from input
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        processFile(file);
      }
    }
  };

  // Add to cart
  const handleAddToCart = () => {
    if (!authState.isAuthenticated) {
      addToast({
        title: "Login required",
        description: "Please login to add items to cart",
        type: "error"
      });
      return;
    }

    if (!design.image) {
      addToast({
        title: "Image required",
        description: "Please upload an image for your custom design",
        type: "error"
      });
      return;
    }

    // Find the selected product type
    const selectedProduct = customProducts.find(p => p.id === selectedProductType);
    const productName = selectedProduct ? selectedProduct.name : "Custom T-Shirt";
    const productPrice = selectedProduct ? selectedProduct.price : price;

    const customProduct = {
      id: `custom-${selectedProductType}-${Date.now()}`,
      name: `${productName} - ${selectedColor.charAt(0).toUpperCase() + selectedColor.slice(1)}`,
      price: productPrice,
      image: selectedProduct?.images?.[0] || "/custom-tshirt-preview.jpg",
      category: "Custom Products",
      size: selectedSize,
      color: selectedColor,
      productType: selectedProductType,
      customDesign: design,
      isCustom: true
    };

    dispatch({
      type: "ADD_ITEM",
      payload: { ...customProduct, quantity }
    });

    addToast({
      title: "Added to cart!",
      description: `${productName} (${selectedSize}, ${selectedColor}) added to cart`,
      type: "success"
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <nav className="text-sm text-gray-600 mb-4">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/products" className="hover:text-blue-600">Products</Link>
          <span className="mx-2">/</span>
          <span>Custom T-Shirt</span>
        </nav>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          Design Your Custom T-Shirt
        </h1>
        <p className="text-lg text-gray-600">
          Upload your design and create a unique t-shirt just for you
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Side - Design Tools */}
        <div className="space-y-6">
          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab("upload")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === "upload"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Upload className="h-4 w-4 inline mr-2" />
              Upload Image
            </button>
            {/* <button
              onClick={() => setActiveTab("text")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === "text"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Palette className="h-4 w-4 inline mr-2" />
              Add Text
            </button> */}
          </div>

          {/* Upload Tab */}
          {activeTab === "upload" && (
            <Card>
              <CardHeader>
                <CardTitle>Upload Your Design</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    isDragging
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    Drop your image here, or click to browse
                  </p>
                  <p className="text-sm text-gray-600 mb-4">
                    Supports PNG, JPG, GIF up to 5MB
                  </p>
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                  >
                    Choose File
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>

                {design.image && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Uploaded Image</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setDesign(prev => ({ ...prev, image: null }))}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <img
                      src={design.image}
                      alt="Uploaded design"
                      className="w-20 h-20 object-cover rounded border"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          )}

        </div>

        {/* Right Side - T-Shirt Images & Options */}
        <div className="space-y-6">
          {/* Custom Product Gallery */}
          <Card>
            <CardHeader>
              <CardTitle>Choose Your Style</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="aspect-square bg-gray-200 rounded-lg mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                    </div>
                  ))}
                </div>
              ) : customProducts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {customProducts.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => setSelectedProductType(product.id)}
                      className={`group relative overflow-hidden rounded-lg border-2 transition-all ${
                        selectedProductType === product.id
                          ? "border-blue-500 ring-2 ring-blue-200"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="aspect-square bg-gray-50 overflow-hidden">
                        {product.images && product.images.length > 0 ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-gray-100 to-gray-200">
                            <span className="text-gray-400 text-sm">No Image</span>
                          </div>
                        )}
                      </div>
                      <div className="p-3 text-center">
                        <h3 className="font-medium text-gray-900 mb-1">{product.name}</h3>
                        <p className="text-sm text-gray-600">₹{product.price.toLocaleString()}</p>
                      </div>
                      {selectedProductType === product.id && (
                        <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No custom product types available</p>
                  <p className="text-sm text-gray-400">
                    Please add "Regular T-shirt", "Oversized T-shirt", and "Hoodie" products from the admin panel
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Product Options */}
          <Card>
            <CardHeader>
              <CardTitle>Customize Your T-Shirt</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Color Selection */}
              <div>
                <Label className="text-base font-medium mb-3 block">Color</Label>
                <div className="grid grid-cols-3 gap-3">
                  {tshirtColors.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setSelectedColor(color.value)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        selectedColor === color.value
                          ? "border-blue-500 ring-2 ring-blue-200"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div
                        className="w-8 h-8 rounded-full mx-auto mb-2"
                        style={{
                          backgroundColor: color.color,
                          border: `2px solid ${color.border}`
                        }}
                      />
                      <span className="text-sm font-medium">{color.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Selection */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-base font-medium">Size</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSizeChart(true)}
                    className="text-xs"
                  >
                    <Ruler className="h-3 w-3 mr-1" />
                    Size Chart
                  </Button>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${
                        selectedSize === size
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div>
                <Label className="text-base font-medium mb-3 block">Quantity</Label>
                <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    -
                  </Button>
                  <span className="text-lg font-medium w-12 text-center">{quantity}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(Math.min(10, quantity + 1))}
                    disabled={quantity >= 10}
                  >
                    +
                  </Button>
                </div>
              </div>

              {/* Price */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-medium">Total Price:</span>
                  <span className="text-2xl font-bold text-blue-600">
                    ₹{((customProducts.find(p => p.id === selectedProductType)?.price || price) * quantity).toLocaleString()}
                  </span>
                </div>

                <Button
                  onClick={handleAddToCart}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
                  size="lg"
                  disabled={!selectedProductType || customProducts.length === 0}
                >
                  Add to Cart
                </Button>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>

      {/* Size Chart Modal */}
      <SizeChart
        isOpen={showSizeChart}
        onClose={() => setShowSizeChart(false)}
        productType={
          customProducts.find(p => p.id === selectedProductType)?.name?.toLowerCase().includes('hoodie') 
            ? 'hoodie' 
            : 't-shirt'
        }
      />
    </div>
  );
}