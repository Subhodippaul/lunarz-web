"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Share2, ChevronDown, ChevronUp } from "lucide-react";
import { Product } from "@/lib/data";
import { useCart } from "@/lib/cart-context";
import { useToast } from "@/components/ui/toast";
import { Alert, AlertDescription, AlertIcon } from "@/components/ui/alert";
import { PRODUCT_DETAILS, CURRENCY, DEFAULTS, PRODUCTS, NAV_LINKS } from "@/lib/constants";

interface ProductDetailsProps {
  product: Product;
}

export default function ProductDetails({ product }: ProductDetailsProps) {
  const { dispatch } = useCart();
  const { addToast } = useToast();
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedVariant, setSelectedVariant] = useState<string>(product.variants?.[0] || "");
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showProductDetails, setShowProductDetails] = useState(false);
  const [showDescription, setShowDescription] = useState(false);

  const handleAddToCart = () => {
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

  const handleBuyNow = () => {
    if (!selectedSize) {
      addToast({
        title: "Size required",
        description: "Please select a size before proceeding to checkout.",
        type: "warning",
      });
      return;
    }
    
    // Add to cart first
    dispatch({
      type: "ADD_ITEM",
      payload: {
        product,
        quantity,
        selectedSize,
        selectedVariant: product.variants ? selectedVariant : undefined,
      },
    });

    // Redirect to checkout
    window.location.href = NAV_LINKS.checkout;
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Images */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
              Product Image {selectedImageIndex + 1}
            </div>
          </div>
          
          {/* Thumbnail Images */}
          <div className="grid grid-cols-4 gap-2">
            {product.images.map((_, index) => (
              <button
                key={index}
                onClick={() => setSelectedImageIndex(index)}
                className={`aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 ${
                  selectedImageIndex === index ? "border-black" : "border-transparent"
                }`}
              >
                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-xs text-gray-500">
                  {index + 1}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            <p className="text-gray-600 mb-4">{PRODUCT_DETAILS.newCollection}</p>
            <div className="text-2xl font-bold">{CURRENCY.symbol} {product.price}</div>
            <p className="text-sm text-gray-500">{PRODUCT_DETAILS.priceIncludesTax}</p>
          </div>

          {/* Variants */}
          {product.variants && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="font-medium">{PRODUCT_DETAILS.shopByVariant}</span>
              </div>
              <div className="flex gap-2">
                {product.variants.map((variant) => (
                  <button
                    key={variant}
                    onClick={() => setSelectedVariant(variant)}
                    className={`w-12 h-12 rounded border-2 ${
                      selectedVariant === variant ? "border-black" : "border-gray-300"
                    } bg-gray-100`}
                  >
                    <span className="sr-only">{variant}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size Selection */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium">{PRODUCT_DETAILS.selectSize}</span>
              <button className="text-sm text-blue-600 underline">{PRODUCT_DETAILS.sizeChart}</button>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`py-2 px-3 border rounded text-sm font-medium ${
                    selectedSize === size
                      ? "border-black bg-black text-white"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div>
            <span className="font-medium mb-3 block">{PRODUCT_DETAILS.quantity}</span>
            <select
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              className="border border-gray-300 rounded px-3 py-2 w-20"
            >
              {Array.from({ length: DEFAULTS.maxQuantity }, (_, i) => i + 1).map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button 
              className="w-full bg-red-500 hover:bg-red-600 text-white py-3"
              disabled={!selectedSize}
              onClick={handleAddToCart}
            >
              {PRODUCT_DETAILS.addToCart}
            </Button>
            <Button 
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3"
              disabled={!selectedSize}
              onClick={handleBuyNow}
            >
              {PRODUCT_DETAILS.buyNow}
            </Button>
          </div>

          {/* Share */}
          <div className="flex items-center gap-4">
            <span className="font-medium">{PRODUCT_DETAILS.share}</span>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm">
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Delivery Details */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium mb-2">{PRODUCT_DETAILS.deliveryDetails}</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={PRODUCT_DETAILS.enterPincode}
                  className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm"
                />
                <Button variant="outline" size="sm">
                  {PRODUCT_DETAILS.check}
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {PRODUCT_DETAILS.returnPolicy}
              </p>
            </CardContent>
          </Card>

          {/* Offer Banner */}
          <div className="bg-teal-100 p-3 rounded-lg">
            <p className="text-sm text-teal-800">
              {PRODUCT_DETAILS.earnPoints}
            </p>
          </div>

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
  );
}