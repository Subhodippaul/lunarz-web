"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Minus, Plus, ShoppingCart, Heart, Share2, ArrowLeft } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/ui/toast";
import { Product } from "@/lib/data";
import { ProductService } from "@/lib/firebase-services";
import { PRODUCT_DETAILS, CURRENCY, DEFAULTS } from "@/lib/constants";

export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { state: cartState, dispatch } = useCart();
  const { state: authState } = useAuth();
  const { addToast } = useToast();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>(DEFAULTS.defaultSize);
  const [selectedVariant, setSelectedVariant] = useState("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (params.id) {
      loadProduct(params.id as string);
    }
  }, [params.id]);

  const loadProduct = async (id: string) => {
    try {
      setLoading(true);
      const fetchedProduct = await ProductService.getProductById(id);
      if (fetchedProduct) {
        setProduct(fetchedProduct);
        if (fetchedProduct.variants && fetchedProduct.variants.length > 0) {
          setSelectedVariant(fetchedProduct.variants[0]);
        }
      } else {
        // Product not found
        router.push('/products');
      }
    } catch (error) {
      console.error("Error loading product:", error);
      addToast({
        type: "error",
        title: "Error",
        description: "Failed to load product details"
      });
      router.push('/products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;

    dispatch({
      type: "ADD_ITEM",
      payload: {
        product,
        quantity,
        selectedSize,
        selectedVariant,
      },
    });

    addToast({
      type: "success",
      title: "Added to Cart",
      description: `${product.name} has been added to your cart`
    });
  };

  const handleBuyNow = () => {
    if (!authState.user) {
      addToast({
        type: "error",
        title: "Login Required",
        description: "Please login to proceed with purchase"
      });
      router.push('/login');
      return;
    }

    handleAddToCart();
    router.push('/checkout');
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-4">
              <div className="aspect-square bg-gray-200 rounded-lg"></div>
              <div className="grid grid-cols-4 gap-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="aspect-square bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
        <p className="text-gray-600 mb-6">The product you're looking for doesn't exist.</p>
        <Button onClick={() => router.push('/products')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Products
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Images */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
            {product.images && product.images.length > 0 ? (
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-linear-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                <span className="text-gray-500">Product Image</span>
              </div>
            )}
          </div>

          {/* Thumbnail Images */}
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square bg-gray-100 rounded overflow-hidden border-2 transition-colors ${
                    selectedImage === index ? 'border-blue-500' : 'border-transparent'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          {/* Product Name and Category */}
          <div>
            <Badge className="mb-2">{PRODUCT_DETAILS.newCollection}</Badge>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
            <p className="text-gray-600">{product.category}</p>
          </div>

          {/* Price */}
          <div className="flex items-center gap-4">
            <span className="text-3xl font-bold text-gray-900">
              {CURRENCY.symbol}{product.price.toLocaleString()}
            </span>
            <span className="text-sm text-gray-500">{PRODUCT_DETAILS.priceIncludesTax}</span>
          </div>

          {/* Variants/Colors */}
          {product.variants && product.variants.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">{PRODUCT_DETAILS.shopByVariant}</h3>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((variant) => (
                  <button
                    key={variant}
                    onClick={() => setSelectedVariant(variant)}
                    className={`px-4 py-2 border rounded-lg transition-colors ${
                      selectedVariant === variant
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {variant}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sizes */}
          <div>
            <h3 className="font-semibold mb-3">{PRODUCT_DETAILS.selectSize}</h3>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-4 py-2 border rounded-lg transition-colors ${
                    selectedSize === size
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div>
            <h3 className="font-semibold mb-3">{PRODUCT_DETAILS.quantity}</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center border rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 hover:bg-gray-100"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 py-2 font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(DEFAULTS.maxQuantity, quantity + 1))}
                  className="p-2 hover:bg-gray-100"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <span className="text-sm text-gray-500">Max {DEFAULTS.maxQuantity} per order</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button
                onClick={handleAddToCart}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                {PRODUCT_DETAILS.addToCart}
              </Button>
              <Button
                onClick={handleBuyNow}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                {PRODUCT_DETAILS.buyNow}
              </Button>
            </div>
            
            <div className="flex gap-4">
              <Button variant="outline" className="w-full">
                <Share2 className="w-4 h-4 mr-2" />
                {PRODUCT_DETAILS.share}
              </Button>
            </div>
          </div>

          {/* Product Details */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="font-semibold text-lg">{PRODUCT_DETAILS.productDetails}</h3>
              
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-medium">{PRODUCT_DETAILS.materialCare}</span>
                  <p className="text-gray-600">{product.material}</p>
                  <p className="text-gray-600">{product.care}</p>
                </div>
                
                <div>
                  <span className="font-medium">{PRODUCT_DETAILS.countryOrigin}</span>
                  <p className="text-gray-600">{product.origin}</p>
                </div>
                
                <div>
                  <span className="font-medium">{PRODUCT_DETAILS.manufacturer}</span>
                  <p className="text-gray-600">{product.manufacturer}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Product Description */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-3">{PRODUCT_DETAILS.productDescription}</h3>
              <p className="text-gray-600">{product.description}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}