"use client";
import { useState, useEffect } from "react";
import { Product } from "@/lib/data";
import { ProductService } from "@/lib/firebase-services";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

interface RelatedProductsProps {
  currentProduct: Product;
}

export default function RelatedProducts({ currentProduct }: RelatedProductsProps) {
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    fetchRelatedProducts();
  }, [currentProduct.id]);

  const fetchRelatedProducts = async () => {
    try {
      setLoading(true);
      let products: Product[] = [];

      // First try to get specifically related products if defined
      if (currentProduct.relatedProducts && currentProduct.relatedProducts.length > 0) {
        const relatedPromises = currentProduct.relatedProducts.map(id => 
          ProductService.getProductById(id)
        );
        const relatedResults = await Promise.all(relatedPromises);
        products = relatedResults.filter(p => p !== null) as Product[];
      }

      // If no specific related products or not enough, get products from same category
      if (products.length < 4) {
        const allProducts = await ProductService.getAllProducts();
        const categoryProducts = allProducts
          .filter(p => 
            p.category === currentProduct.category && 
            p.id !== currentProduct.id &&
            !products.some(rp => rp.id === p.id)
          )
          .slice(0, 4 - products.length);
        
        products = [...products, ...categoryProducts];
      }

      // If still not enough, get any other products
      if (products.length < 4) {
        const allProducts = await ProductService.getAllProducts();
        const otherProducts = allProducts
          .filter(p => 
            p.id !== currentProduct.id &&
            !products.some(rp => rp.id === p.id)
          )
          .slice(0, 4 - products.length);
        
        products = [...products, ...otherProducts];
      }

      setRelatedProducts(products.slice(0, 8)); // Max 8 products
    } catch (error) {
      console.error("Error fetching related products:", error);
    } finally {
      setLoading(false);
    }
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => 
      prev + 4 >= relatedProducts.length ? 0 : prev + 4
    );
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => 
      prev - 4 < 0 ? Math.max(0, relatedProducts.length - 4) : prev - 4
    );
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold mb-8">Related Products</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-square bg-gray-200 rounded-lg mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (relatedProducts.length === 0) {
    return null;
  }

  const visibleProducts = relatedProducts.slice(currentSlide, currentSlide + 4);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 border-t border-gray-200">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold">You might also like</h2>
        {relatedProducts.length > 4 && (
          <div className="flex gap-2">
            <button
              onClick={prevSlide}
              className="p-2 rounded-full border border-gray-300 hover:bg-gray-50"
              disabled={currentSlide === 0}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={nextSlide}
              className="p-2 rounded-full border border-gray-300 hover:bg-gray-50"
              disabled={currentSlide + 4 >= relatedProducts.length}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {visibleProducts.map((product) => (
          <Link key={product.id} href={`/products/${product.id}`}>
            <div className="group cursor-pointer">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                ) : (
                  <div className="w-full h-full bg-linear-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                    <span className="text-gray-500 text-sm">No Image</span>
                  </div>
                )}
              </div>
              <h3 className="font-medium text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                {product.name}
              </h3>
              <p className="text-gray-600 text-sm mb-2">{product.category}</p>
              <p className="font-bold text-gray-900">₹{product.price.toLocaleString()}</p>
            </div>
          </Link>
        ))}
      </div>

      {relatedProducts.length > 4 && (
        <div className="flex justify-center mt-6">
          <div className="flex gap-2">
            {Array.from({ length: Math.ceil(relatedProducts.length / 4) }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index * 4)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  Math.floor(currentSlide / 4) === index ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}