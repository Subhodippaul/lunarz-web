"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/lib/cart-context";
import { useToast } from "@/components/ui/toast";
import { useRouter } from "next/navigation";
import { InlineLoader } from "@/components/ui/loader";
import Image from "next/image";

interface CustomProduct {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  description: string;
  material: string;
  weight: string;
  sizes: string[];
  colors: string[];
  printArea: string;
}

export default function CustomizeYourTshirtPage() {
  const { dispatch } = useCart();
  const { addToast } = useToast();
  const router = useRouter();
  const [products, setProducts] = useState<CustomProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<CustomProduct | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [showModal, setShowModal] = useState(false);

  // Fetch products from API (which reads from Excel)
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/customize-products');
        const data = await response.json();
        
        if (data.success) {
          setProducts(data.products);
          console.log(`✅ Loaded ${data.count} products from Excel`);
        } else {
          throw new Error(data.error || 'Failed to load products');
        }
      } catch (error: any) {
        console.error('Error fetching products:', error);
        addToast({
          type: "error",
          title: "Failed to Load Products",
          description: "Could not load products from Excel file",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [addToast]);

  const handleProductClick = (product: CustomProduct) => {
    setSelectedProduct(product);
    setSelectedSize(product.sizes[0]);
    setSelectedColor(product.colors[0]);
    setQuantity(1);
    setShowModal(true);
  };

  const handleAddToCart = () => {
    if (!selectedProduct || !selectedSize || !selectedColor) {
      addToast({
        type: "error",
        title: "Selection Required",
        description: "Please select size and color",
      });
      return;
    }

    // Add to cart
    dispatch({
      type: "ADD_ITEM",
      payload: {
        product: {
          id: selectedProduct.id,
          name: selectedProduct.name,
          price: selectedProduct.price,
          category: selectedProduct.category,
          images: [selectedProduct.image],
          sizes: selectedProduct.sizes,
          description: selectedProduct.description,
          material: selectedProduct.material,
          care: "Machine wash cold",
          origin: "India",
          manufacturer: "Lunarz Custom",
        },
        quantity: quantity,
        selectedSize: selectedSize,
        selectedVariant: selectedColor,
      },
    });

    addToast({
      type: "success",
      title: "Added to Cart",
      description: `${selectedProduct.name} has been added to your cart`,
    });

    setShowModal(false);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push("/customize-checkout");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Customize Your T-Shirt
          </h1>
          <p className="text-lg md:text-xl opacity-90 max-w-2xl">
            Choose from our premium collection of blank t-shirts and create your unique design. 
            Perfect for personal style, events, or business branding.
          </p>
        </div>
      </div>

      {/* Features Section */}
      {!isLoading && products.length > 0 && (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-sm text-center">
            <div className="text-3xl mb-3">🎨</div>
            <h3 className="font-semibold mb-2">Custom Designs</h3>
            <p className="text-sm text-gray-600">Upload your own artwork or text</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm text-center">
            <div className="text-3xl mb-3">👕</div>
            <h3 className="font-semibold mb-2">Premium Quality</h3>
            <p className="text-sm text-gray-600">100% cotton & premium fabrics</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm text-center">
            <div className="text-3xl mb-3">🚚</div>
            <h3 className="font-semibold mb-2">Fast Delivery</h3>
            <p className="text-sm text-gray-600">Quick turnaround time</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm text-center">
            <div className="text-3xl mb-3">💯</div>
            <h3 className="font-semibold mb-2">Best Prices</h3>
            <p className="text-sm text-gray-600">Affordable custom printing</p>
          </div>
        </div>

        {/* Products Grid */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Choose Your Base T-Shirt</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <Card
                key={product.id}
                className="group cursor-pointer hover:shadow-xl transition-all duration-300 overflow-hidden"
                onClick={() => handleProductClick(product)}
              >
                <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent && !parent.querySelector('.placeholder-content')) {
                        const placeholder = document.createElement('div');
                        placeholder.className = 'placeholder-content absolute inset-0 flex flex-col items-center justify-center text-gray-400';
                        placeholder.innerHTML = `
                          <svg class="w-20 h-20 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p class="text-sm font-medium">${product.name}</p>
                        `;
                        parent.appendChild(placeholder);
                      }
                    }}
                  />
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-red-500 text-white">Customizable</Badge>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-1">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-2xl font-bold text-red-500">₹{product.price}</p>
                      <p className="text-xs text-gray-500">{product.material}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 mb-3">
                    <Badge variant="outline" className="text-xs">
                      {product.weight}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {product.colors.length} Colors
                    </Badge>
                  </div>
                  <Button
                    className="w-full bg-red-500 hover:bg-red-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleProductClick(product);
                    }}
                  >
                    Select & Customize
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* How It Works Section */}
        <div className="mt-16 bg-white rounded-lg p-8 shadow-sm">
          <h2 className="text-2xl font-bold mb-8 text-center">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-red-500">1</span>
              </div>
              <h3 className="font-semibold mb-2">Choose T-Shirt</h3>
              <p className="text-sm text-gray-600">
                Select your preferred style, size, and color
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-red-500">2</span>
              </div>
              <h3 className="font-semibold mb-2">Add to Cart</h3>
              <p className="text-sm text-gray-600">
                Add your selected t-shirt to the cart
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-red-500">3</span>
              </div>
              <h3 className="font-semibold mb-2">Complete Order</h3>
              <p className="text-sm text-gray-600">
                Proceed to checkout and complete payment
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-red-500">4</span>
              </div>
              <h3 className="font-semibold mb-2">Get Delivered</h3>
              <p className="text-sm text-gray-600">
                Receive your custom t-shirt at your doorstep
              </p>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="max-w-7xl mx-auto px-6 py-16">
          <InlineLoader text="Loading products from Excel..." size="lg" />
        </div>
      )}

      {/* No Products State */}
      {!isLoading && products.length === 0 && (
        <div className="max-w-7xl mx-auto px-6 py-16">
          <Card>
            <CardContent className="py-12 text-center">
              <div className="text-6xl mb-4">📄</div>
              <h2 className="text-2xl font-bold mb-2">No Products Found</h2>
              <p className="text-gray-600 mb-4">
                Please add products to <code className="bg-gray-100 px-2 py-1 rounded">data/products.xlsx</code>
              </p>
              <p className="text-sm text-gray-500">
                The Excel file should be in the project root at: <code>data/products.xlsx</code>
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Product Detail Modal */}
      {showModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold">{selectedProduct.name}</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Product Image */}
                <div className="relative aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                  <Image
                    src={selectedProduct.image}
                    alt={selectedProduct.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent && !parent.querySelector('.placeholder-content')) {
                        const placeholder = document.createElement('div');
                        placeholder.className = 'placeholder-content absolute inset-0 flex flex-col items-center justify-center text-gray-400';
                        placeholder.innerHTML = `
                          <svg class="w-32 h-32 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p class="text-lg font-medium">${selectedProduct.name}</p>
                        `;
                        parent.appendChild(placeholder);
                      }
                    }}
                  />
                </div>

                {/* Product Details */}
                <div>
                  <div className="mb-6">
                    <p className="text-3xl font-bold text-red-500 mb-2">
                      ₹{selectedProduct.price}
                    </p>
                    <p className="text-gray-600">{selectedProduct.description}</p>
                  </div>

                  {/* Specifications */}
                  <div className="mb-6 space-y-2">
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">Material:</span>
                      <span className="font-medium">{selectedProduct.material}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">Weight:</span>
                      <span className="font-medium">{selectedProduct.weight}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">Print Area:</span>
                      <span className="font-medium">{selectedProduct.printArea}</span>
                    </div>
                  </div>

                  {/* Size Selection */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-3">
                      Select Size
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {selectedProduct.sizes.map((size) => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`px-4 py-2 border rounded-lg font-medium transition-all ${
                            selectedSize === size
                              ? "bg-red-500 text-white border-red-500"
                              : "bg-white text-gray-700 border-gray-300 hover:border-red-500"
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Color Selection */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-3">
                      Select Color
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {selectedProduct.colors.map((color) => (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          className={`px-4 py-2 border rounded-lg font-medium transition-all ${
                            selectedColor === color
                              ? "bg-red-500 text-white border-red-500"
                              : "bg-white text-gray-700 border-gray-300 hover:border-red-500"
                          }`}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quantity Selection */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-3">
                      Quantity
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-10 h-10 border rounded-lg hover:bg-gray-100"
                      >
                        -
                      </button>
                      <span className="w-12 text-center font-medium">{quantity}</span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="w-10 h-10 border rounded-lg hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <Button
                      onClick={handleAddToCart}
                      className="flex-1 bg-white text-red-500 border-2 border-red-500 hover:bg-red-50"
                    >
                      Add to Cart
                    </Button>
                    <Button
                      onClick={handleBuyNow}
                      className="flex-1 bg-red-500 hover:bg-red-600"
                    >
                      Buy Now
                    </Button>
                  </div>

                  {/* Additional Info */}
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-900">
                      <strong>Note:</strong> After placing your order, our team will contact you 
                      to finalize your custom design. You can share your artwork, text, or design 
                      ideas via email or WhatsApp.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
