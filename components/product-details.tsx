"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, ShoppingCart, AlertCircle } from "lucide-react";
import { Product } from "@/lib/data";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/ui/toast";
import { PRODUCT_DETAILS, CURRENCY, NAV_LINKS } from "@/lib/constants";
import RelatedProducts from "./related-products";
import { toDriveImageUrl } from "@/lib/drive-image";
import SizeChart from "./size-chart";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface ProductDetailsProps {
  product: Product;
}

export default function ProductDetails({ product }: ProductDetailsProps) {
  const { dispatch, state: cartState } = useCart();
  const { state: authState } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedVariant, setSelectedVariant] = useState<string>(product.variants?.[0] || "");
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showProductDetails, setShowProductDetails] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const [isInCart, setIsInCart] = useState(false);
  const [showSizeChart, setShowSizeChart] = useState(false);

  // Stock status
  const isOutOfStock = product.stock !== undefined && product.stock <= 0;
  const isLowStock =
    !isOutOfStock &&
    product.stock !== undefined &&
    product.lowStockThreshold !== undefined &&
    product.stock <= product.lowStockThreshold;

  // Get current images based on selected variant, converting Drive URLs at display time
  const getCurrentImages = (): string[] => {
    const raw: string[] =
      product.colorImages && selectedVariant && product.colorImages[selectedVariant]
        ? product.colorImages[selectedVariant]
        : Array.isArray(product.images)
        ? product.images
        : typeof product.images === 'string' && (product.images as string).trim()
        ? [product.images as unknown as string]
        : [];
    return raw.map(toDriveImageUrl);
  };

  const currentImages = getCurrentImages();

  // Check if product is in cart
  useEffect(() => {
    const productInCart = cartState.items.some(item => 
      item.product.id === product.id && 
      item.selectedSize === selectedSize &&
      item.selectedVariant === selectedVariant
    );
    setIsInCart(productInCart);
  }, [cartState.items, product.id, selectedSize, selectedVariant]);

  // Reset image index when variant changes
  useEffect(() => {
    setSelectedImageIndex(0);
  }, [selectedVariant]);

  const handleAddToCart = () => {
    if (isOutOfStock) return;

    // Check if user is authenticated
    if (!authState.isAuthenticated) {
      // Store current page URL for redirect after login
      const currentUrl = window.location.pathname + window.location.search;
      localStorage.setItem('redirectAfterLogin', currentUrl);
      
      // Get unique ID and redirect to login
      const uniqueId = localStorage.getItem('uniqueId');
      const loginUrl = uniqueId ? `${NAV_LINKS.login}?uid=${uniqueId}` : NAV_LINKS.login;
      
      addToast({
        title: "Login Required",
        description: "Please login to add items to your cart.",
        type: "warning",
      });
      
      router.push(loginUrl);
      return;
    }

    if (!selectedSize) {
      addToast({
        title: "Size required",
        description: "Please select a size before adding to cart.",
        type: "warning",
      });
      return;
    }
    
    dispatch({
      type: "ADD_ITEM",
      payload: {
        product,
        quantity,
        selectedSize,
        selectedVariant: product.variants ? selectedVariant : undefined,
      },
    });

    addToast({
      title: "Added to cart!",
      description: `${product.name} has been added to your cart.`,
      type: "success",
    });
  };

  const handleGoToCart = () => {
    router.push(NAV_LINKS.cart);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;

    // Check if user is authenticated
    if (!authState.isAuthenticated) {
      // Store current page URL for redirect after login
      const currentUrl = window.location.pathname + window.location.search;
      localStorage.setItem('redirectAfterLogin', currentUrl);
      
      // Get unique ID and redirect to login
      const uniqueId = localStorage.getItem('uniqueId');
      const loginUrl = uniqueId ? `${NAV_LINKS.login}?uid=${uniqueId}` : NAV_LINKS.login;
      
      addToast({
        title: "Login Required",
        description: "Please login to purchase products.",
        type: "warning",
      });
      
      router.push(loginUrl);
      return;
    }

    if (!selectedSize) {
      addToast({
        title: "Size required",
        description: "Please select a size before proceeding to checkout.",
        type: "warning",
      });
      return;
    }
    
    // Add to cart first if not already in cart
    if (!isInCart) {
      dispatch({
        type: "ADD_ITEM",
        payload: {
          product,
          quantity,
          selectedSize,
          selectedVariant: product.variants ? selectedVariant : undefined,
        },
      });
    }

    // Redirect to checkout
    router.push(NAV_LINKS.checkout);
  };

  return (
    <>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-gray-800 transition-colors">Home</Link>
          <span className="text-gray-300">/</span>
          <Link href="/products" className="hover:text-gray-800 transition-colors">Products</Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-900 font-medium truncate max-w-[200px] sm:max-w-xs">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
              {currentImages && currentImages.length > 0 ? (
                <img
                  src={currentImages[selectedImageIndex]}
                  alt={`${product.name} - ${selectedVariant || 'Default'}`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-linear-to-br from-gray-200 to-gray-300 flex items-center justify-center text-gray-500">
                  Product Image {selectedImageIndex + 1}
                </div>
              )}
            </div>
            
            {/* Thumbnail Images */}
            <div className="grid grid-cols-4 gap-2">
              {currentImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 ${
                    selectedImageIndex === index ? "border-black" : "border-transparent"
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} thumbnail ${index + 1}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              <p className="text-gray-600 mb-4">{PRODUCT_DETAILS.brand_name}</p>
              <div className="flex items-center gap-3 flex-wrap mb-1">
                {/* Sale price */}
                <div className="text-2xl font-bold text-gray-900">
                  {CURRENCY.symbol} {product.price.toLocaleString()}
                </div>
                {/* MRP strikethrough */}
                {product.originalPrice && product.originalPrice > product.price && (
                  <>
                    <div className="text-lg text-gray-400 line-through">
                      {CURRENCY.symbol} {product.originalPrice.toLocaleString()}
                    </div>
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                      {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% off
                    </span>
                  </>
                )}
                {isOutOfStock && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                    <AlertCircle className="h-3 w-3" />
                    Out of Stock
                  </span>
                )}
                {isLowStock && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">
                    <AlertCircle className="h-3 w-3" />
                    Only {product.stock} left
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500">{PRODUCT_DETAILS.priceIncludesTax}</p>
            </div>

            {/* Variants/Colors */}
            {product.variants && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="font-medium">{PRODUCT_DETAILS.shopByVariant}</span>
                  {selectedVariant && (
                    <span className="text-sm text-gray-600">- {selectedVariant}</span>
                  )}
                </div>
                <div className="flex gap-3">
                  {product.variants.map((variant) => (
                    <button
                      key={variant}
                      onClick={() => setSelectedVariant(variant)}
                      className={`px-4 py-2 rounded-lg border-2 transition-all ${
                        selectedVariant === variant 
                          ? "border-black bg-black text-white" 
                          : "border-gray-300 hover:border-gray-400 bg-white"
                      }`}
                    >
                      <span className="text-sm font-medium">{variant}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium">{PRODUCT_DETAILS.selectSize}</span>
                <button 
                  onClick={() => setShowSizeChart(true)}
                  className="text-sm text-blue-600 underline hover:text-blue-700 transition-colors"
                >
                  {PRODUCT_DETAILS.sizeChart}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {["S", "M", "L", "XL", "XXL"].map((size) => {
                  const available = product.sizes.includes(size);
                  const selected = selectedSize === size;
                  return (
                    <button
                      key={size}
                      disabled={!available}
                      onClick={() => available && setSelectedSize(size)}
                      className={`relative min-w-[48px] py-2 px-3 border-2 rounded text-sm font-medium transition-colors
                        ${selected
                          ? "border-black bg-black text-white"
                          : available
                          ? "border-gray-300 hover:border-gray-400 text-gray-800"
                          : "border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50"
                        }`}
                    >
                      {size}
                      {/* strikethrough line for out-of-stock */}
                      {!available && (
                        <span
                          className="absolute inset-0 flex items-center justify-center pointer-events-none"
                          aria-hidden="true"
                        >
                          <span className="block w-full h-px bg-gray-300 rotate-[-20deg]" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity + Cart — same row */}
            <div className="flex items-center gap-3">
              {/* +/- quantity control */}
              <div className={`flex items-center border rounded-lg overflow-hidden shrink-0 ${isOutOfStock ? "border-gray-200 opacity-40" : "border-gray-300"}`}>
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={isOutOfStock}
                  className="w-9 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors text-lg font-medium disabled:cursor-not-allowed"
                >
                  −
                </button>
                <span className="w-9 h-10 flex items-center justify-center text-sm font-semibold border-x border-gray-300">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                  disabled={isOutOfStock}
                  className="w-9 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors text-lg font-medium disabled:cursor-not-allowed"
                >
                  +
                </button>
              </div>

              {/* Add to Cart / Go to Cart / Out of Stock */}
              {isOutOfStock ? (
                <Button className="flex-1 bg-gray-200 text-gray-500 py-3 cursor-not-allowed" disabled>
                  Out of Stock
                </Button>
              ) : isInCart ? (
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3"
                  onClick={handleGoToCart}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Go to Cart
                </Button>
              ) : (
                <Button
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3"
                  disabled={!selectedSize}
                  onClick={handleAddToCart}
                >
                  {PRODUCT_DETAILS.addToCart}
                </Button>
              )}
            </div>

            {/* Buy Now */}
            <Button
              className={`w-full py-3 text-white ${
                isOutOfStock
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-orange-500 hover:bg-orange-600"
              }`}
              disabled={isOutOfStock || !selectedSize}
              onClick={handleBuyNow}
            >
              {isOutOfStock ? "Currently Unavailable" : PRODUCT_DETAILS.buyNow}
            </Button>

            {/* Out of stock notice */}
            {isOutOfStock && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                <p className="text-sm text-red-700">
                  This product is currently out of stock. Please check back later or explore similar products below.
                </p>
              </div>
            )}

            {/* Info Banner — only shown when product is available */}
            {!isOutOfStock && (
            <div className="bg-teal-50 border border-teal-200 rounded-lg p-3 space-y-2">
              <div className="flex items-start gap-2">
                <span className="text-teal-600 mt-0.5 shrink-0">🚚</span>
                <p className="text-sm text-teal-800">
                  <span className="font-medium">Estimated delivery:</span> Up to 7 days
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-teal-600 mt-0.5 shrink-0">🏷️</span>
                <p className="text-sm text-teal-800">
                  <span className="font-medium">Unlock ₹200 OFF instantly!</span> Use code{" "}
                  <span className="font-mono font-bold bg-teal-100 px-1.5 py-0.5 rounded text-teal-900">SAVE200</span>{" "}
                  at checkout.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-teal-600 mt-0.5 shrink-0">🔒</span>
                <p className="text-sm text-teal-800">
                  Secure transactions with hassle-free payment methods.
                </p>
              </div>
            </div>
            )}

            {/* Product Details Accordion */}
            <div className="space-y-2">
              <button
                onClick={() => setShowProductDetails(!showProductDetails)}
                className="flex items-center justify-between w-full p-3 border rounded-lg"
              >
                <span className="font-medium">{PRODUCT_DETAILS.productDetails}</span>
                {showProductDetails ? <ChevronUp /> : <ChevronDown />}
              </button>
              {showProductDetails && (
                <div className="p-4 border rounded-lg space-y-3">
                  <div>
                    <h4 className="font-medium">{PRODUCT_DETAILS.materialCare}</h4>
                    <p className="text-sm text-gray-600">{product.material}</p>
                  </div>
                  <div>
                    <h4 className="font-medium">{PRODUCT_DETAILS.countryOrigin}</h4>
                    <p className="text-sm text-gray-600">{product.origin}</p>
                  </div>
                  <div>
                    <h4 className="font-medium">{PRODUCT_DETAILS.manufacturer}</h4>
                    <p className="text-sm text-gray-600">{product.manufacturer}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Product Description Accordion */}
            <div className="space-y-2">
              <button
                onClick={() => setShowDescription(!showDescription)}
                className="flex items-center justify-between w-full p-3 border rounded-lg"
              >
                <span className="font-medium">{PRODUCT_DETAILS.productDescription}</span>
                {showDescription ? <ChevronUp /> : <ChevronDown />}
              </button>
              {showDescription && (
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-gray-600">{product.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      <RelatedProducts currentProduct={product} />

      {/* Size Chart Modal */}
      <SizeChart 
        isOpen={showSizeChart}
        onClose={() => setShowSizeChart(false)}
        productType={
          product.category.toLowerCase().includes('hoodie') ? 'hoodie' :
          product.category.toLowerCase().includes('t-shirt') || product.category.toLowerCase().includes('tee') ? 't-shirt' :
          'general'
        }
      />
    </>
  );
}