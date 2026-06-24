"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ChevronDown, ChevronUp, ShoppingCart, AlertCircle, X, ChevronLeft, ChevronRight, Upload, ImageIcon, Trash2, Plus } from "lucide-react";
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

// Fixed set of sizes always shown on the product page
const ALL_SIZES = ["S", "M", "L", "XL", "XXL"];

export interface CustomDesignEntry {
  image: string; // base64 data URL
  fileName: string;
  note: string;
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

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Color+size level shared stock for the selected variant+size
  const [colorStock, setColorStock] = useState<number | null>(null);

  // Map of size → stock for the selected color, fetched from inventory
  const [sizeStockMap, setSizeStockMap] = useState<Record<string, number> | null>(null);
  const [sizesLoading, setSizesLoading] = useState(false);

  // ── Custom design upload (for "Customize" products) ──
  const isCustomizable = product.name.toLowerCase().includes("customize");
  const customDesignKey = `customDesigns:${product.id}`;
  const [customDesigns, setCustomDesigns] = useState<CustomDesignEntry[]>([]);
  const [showDesignDialog, setShowDesignDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<"cart" | "buy" | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load any previously-uploaded designs for this product from sessionStorage on mount
  useEffect(() => {
    if (!isCustomizable) return;
    try {
      const stored = sessionStorage.getItem(customDesignKey);
      if (stored) {
        const parsed: CustomDesignEntry[] = JSON.parse(stored);
        setCustomDesigns(parsed);
      }
    } catch {
      // ignore corrupt storage
    }
  }, [isCustomizable, customDesignKey]);

  const handleDesignFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      addToast({ title: "Invalid file", description: "Please upload an image file.", type: "error" });
      return;
    }

    // Cap file size to keep sessionStorage usage reasonable (base64 inflates size ~33%)
    const maxBytes = 5 * 1024 * 1024; // 5MB
    if (file.size > maxBytes) {
      addToast({ title: "File too large", description: "Please upload an image under 5MB.", type: "error" });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      // Functional updater: always appends to the TRUE latest array, never a stale
      // snapshot captured when the file was selected (fixes "2nd image overwrites 1st").
      setCustomDesigns(prev => {
        const next = [...prev, { image: dataUrl, fileName: file.name, note: "" }];
        try {
          sessionStorage.setItem(customDesignKey, JSON.stringify(next));
        } catch {
          addToast({
            title: "Storage error",
            description: "Couldn't save the design — try fewer or smaller images.",
            type: "error",
          });
        }
        return next;
      });
      addToast({ title: "Design added", description: "Add a note for this image if needed.", type: "success" });
    };
    reader.readAsDataURL(file);

    // allow re-selecting the same file again later
    e.target.value = "";
  };

  const updateDesignNote = (index: number, note: string) => {
    setCustomDesigns(prev => {
      const next = prev.map((d, i) => (i === index ? { ...d, note } : d));
      try { sessionStorage.setItem(customDesignKey, JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const removeDesign = (index: number) => {
    setCustomDesigns(prev => {
      const next = prev.filter((_, i) => i !== index);
      try { sessionStorage.setItem(customDesignKey, JSON.stringify(next)); } catch {}
      return next;
    });
  };

  // After designs are uploaded inside the dialog, resume whichever action triggered it
  const handleDesignDialogContinue = () => {
    setShowDesignDialog(false);
    if (pendingAction === "cart") proceedAddToCart();
    if (pendingAction === "buy") proceedBuyNow();
    setPendingAction(null);
  };

  // When variant changes → fetch all size stocks for this color+category
  useEffect(() => {
    if (!selectedVariant) { setSizeStockMap(null); setSelectedSize(""); return; }
    setSizesLoading(true);
    setSizeStockMap(null);
    fetch(
      `/api/color-inventory/sizes?color=${encodeURIComponent(selectedVariant)}&category=${encodeURIComponent(product.category)}`
    )
      .then(r => r.ok ? r.json() : { sizes: [] })
      .then(d => {
        const rows: { size: string; stock: number }[] = d.sizes ?? [];
        if (rows.length === 0) {
          const allDisabled: Record<string, number> = {};
          for (const s of ALL_SIZES) allDisabled[s] = 0;
          setSizeStockMap(allDisabled);
          setSelectedSize("");
          return;
        }
        const map: Record<string, number> = {};
        for (const row of rows) map[row.size] = row.stock;
        setSizeStockMap(map);
        setSelectedSize(prev => {
          if (!prev) return prev;
          const stockVal = map[prev];
          if (stockVal === undefined || stockVal <= 0) return "";
          return prev;
        });
      })
      .catch(() => setSizeStockMap({}))
      .finally(() => setSizesLoading(false));
  }, [selectedVariant, product.category]);

  const isSizeDisabled = (size: string): boolean => {
    if (sizeStockMap === null) return true;
    if (Object.keys(sizeStockMap).length === 0) return false;
    const stock = sizeStockMap[size];
    return stock === undefined || stock <= 0;
  };

  const hasInventoryData = sizeStockMap !== null && Object.keys(sizeStockMap).length > 0;
  const allSizesOutOfStock = hasInventoryData && ALL_SIZES.every(s => isSizeDisabled(s));

  // When size changes → fetch specific stock for that color+size+category
  useEffect(() => {
    if (!selectedVariant || !selectedSize) { setColorStock(null); return; }
    fetch(
      `/api/color-inventory?color=${encodeURIComponent(selectedVariant)}&size=${encodeURIComponent(selectedSize)}&category=${encodeURIComponent(product.category)}`
    )
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setColorStock(d.stock); })
      .catch(() => {});
  }, [selectedVariant, selectedSize, product.category]);

  const effectiveStock = colorStock !== null ? colorStock : (product.stock ?? undefined);

  const isOutOfStock = allSizesOutOfStock || (effectiveStock !== undefined && effectiveStock <= 0 && !!selectedSize);

  const isLowStock =
    !isOutOfStock &&
    effectiveStock !== undefined &&
    product.lowStockThreshold !== undefined &&
    effectiveStock <= product.lowStockThreshold;

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

  // Lightbox handlers
  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = useCallback(() => setLightboxOpen(false), []);

  const lightboxPrev = useCallback(() =>
    setLightboxIndex(i => (i - 1 + currentImages.length) % currentImages.length),
    [currentImages.length]
  );

  const lightboxNext = useCallback(() =>
    setLightboxIndex(i => (i + 1) % currentImages.length),
    [currentImages.length]
  );

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") lightboxPrev();
      if (e.key === "ArrowRight") lightboxNext();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [lightboxOpen, closeLightbox, lightboxPrev, lightboxNext]);

  // Prevent body scroll when lightbox is open
  useEffect(() => {
    if (lightboxOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [lightboxOpen]);

  const proceedAddToCart = () => {
    dispatch({
      type: "ADD_ITEM",
      payload: {
        product,
        quantity,
        selectedSize,
        selectedVariant: product.variants ? selectedVariant : undefined,
        // Attach custom design data so it travels through cart → checkout → order email
        ...(isCustomizable && customDesigns.length > 0
          ? { isCustom: true, customDesigns }
          : {}),
      },
    });

    addToast({
      title: "Added to cart!",
      description: `${product.name} has been added to your cart.`,
      type: "success",
    });
  };

  const proceedBuyNow = () => {
    if (!isInCart) {
      dispatch({
        type: "ADD_ITEM",
        payload: {
          product,
          quantity,
          selectedSize,
          selectedVariant: product.variants ? selectedVariant : undefined,
          ...(isCustomizable && customDesigns.length > 0
            ? { isCustom: true, customDesigns }
            : {}),
        },
      });
    }

    router.push(NAV_LINKS.checkout);
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;

    if (!authState.isAuthenticated) {
      const currentUrl = window.location.pathname + window.location.search;
      localStorage.setItem('redirectAfterLogin', currentUrl);
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

    if (isSizeDisabled(selectedSize)) {
      addToast({
        title: "Size unavailable",
        description: `${selectedSize} is out of stock for this color. Please choose another size.`,
        type: "error",
      });
      setSelectedSize("");
      return;
    }

    if (isCustomizable && customDesigns.length === 0) {
      setPendingAction("cart");
      setShowDesignDialog(true);
      return;
    }

    proceedAddToCart();
  };

  const handleGoToCart = () => {
    router.push(NAV_LINKS.cart);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;

    if (!authState.isAuthenticated) {
      const currentUrl = window.location.pathname + window.location.search;
      localStorage.setItem('redirectAfterLogin', currentUrl);
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

    if (isSizeDisabled(selectedSize)) {
      addToast({
        title: "Size unavailable",
        description: `${selectedSize} is out of stock for this color. Please choose another size.`,
        type: "error",
      });
      setSelectedSize("");
      return;
    }

    if (isCustomizable && customDesigns.length === 0) {
      setPendingAction("buy");
      setShowDesignDialog(true);
      return;
    }

    proceedBuyNow();
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
            <div
              className="aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-zoom-in relative group"
              onClick={() => openLightbox(selectedImageIndex)}
            >
              {currentImages && currentImages.length > 0 ? (
                <>
                  <img
                    src={currentImages[selectedImageIndex]}
                    alt={`${product.name} - ${selectedVariant || 'Default'}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {/* Zoom hint overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200 flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                      Click to preview
                    </span>
                  </div>
                </>
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
                  className={`aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 transition-all hover:opacity-90 ${
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
                <div className="text-2xl font-bold text-gray-900">
                  {CURRENCY.symbol} {product.price.toLocaleString()}
                </div>
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
                    Only {effectiveStock} left
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500">{PRODUCT_DETAILS.priceIncludesTax}</p>
            </div>

            {/* Custom design status banner */}
            {isCustomizable && (
              <div
                className={`rounded-lg border p-3 ${
                  customDesigns.length > 0 ? "border-green-200 bg-green-50" : "border-amber-200 bg-amber-50"
                }`}
              >
                {customDesigns.length > 0 ? (
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex -space-x-2 shrink-0">
                        {customDesigns.slice(0, 3).map((d, i) => (
                          <img
                            key={i}
                            src={d.image}
                            alt={`Design ${i + 1}`}
                            className="w-10 h-10 rounded object-cover border-2 border-white shadow-sm"
                          />
                        ))}
                      </div>
                      <p className="text-sm font-medium text-green-800">
                        {customDesigns.length} design{customDesigns.length > 1 ? "s" : ""} uploaded
                      </p>
                    </div>
                    <button
                      onClick={() => setShowDesignDialog(true)}
                      className="text-xs font-medium text-green-700 underline hover:text-green-800 shrink-0"
                    >
                      Edit
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <ImageIcon className="h-5 w-5 text-amber-600 shrink-0" />
                    <p className="text-sm text-amber-800">
                      This is a customizable product — you'll need to upload your design before checkout.
                    </p>
                  </div>
                )}
              </div>
            )}

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

              {sizeStockMap === null && sizesLoading ? (
                <div className="flex flex-wrap gap-2">
                  {ALL_SIZES.map(s => (
                    <div key={s} className="min-w-[48px] h-10 bg-gray-100 animate-pulse rounded border-2 border-gray-100 flex items-center justify-center">
                      <span className="text-xs text-gray-300">{s}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {ALL_SIZES.map((size) => {
                    const disabled = isSizeDisabled(size);
                    const selected = selectedSize === size;
                    return (
                      <button
                        key={size}
                        type="button"
                        disabled={disabled}
                        onClick={() => { if (!disabled) setSelectedSize(size); }}
                        className={[
                          "relative min-w-[48px] py-2 px-3 border-2 rounded text-sm font-medium transition-colors select-none",
                          selected
                            ? "border-black bg-black text-white"
                            : disabled
                            ? "border-gray-200 text-gray-300 bg-gray-50 cursor-not-allowed"
                            : "border-gray-300 hover:border-gray-400 text-gray-800 cursor-pointer",
                        ].join(" ")}
                        style={disabled ? { pointerEvents: "none" } : undefined}
                      >
                        {size}
                        {disabled && (
                          <span className="absolute inset-0 overflow-hidden rounded" aria-hidden="true">
                            <span className="absolute top-1/2 left-0 w-full h-px bg-gray-300 -translate-y-1/2 rotate-[-20deg] scale-x-125 origin-center" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {allSizesOutOfStock && (
                <div className="flex items-center gap-2 mt-3 p-2.5 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                  <p className="text-xs text-red-700 font-medium">
                    This color is currently out of stock in all sizes.
                  </p>
                </div>
              )}

              {sizesLoading && (
                <p className="text-xs text-gray-400 mt-2 animate-pulse">Checking availability…</p>
              )}
            </div>

            {/* Quantity + Cart */}
            <div className="flex items-center gap-3">
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

            {/* Info Banner */}
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

      {/* Custom Design Upload Dialog — multiple images, each with its own note */}
      <Dialog open={showDesignDialog} onOpenChange={setShowDesignDialog}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Upload your design{customDesigns.length > 1 ? "s" : ""}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              This product is customizable. Upload one or more images of the design you'd like printed, with an optional note for each.
            </p>

            {customDesigns.map((design, index) => (
              <div key={index} className="flex gap-3 p-3 border border-gray-200 rounded-lg">
                <img
                  src={design.image}
                  alt={`Design ${index + 1}`}
                  className="w-20 h-20 rounded object-cover border border-gray-300 shrink-0"
                />
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-medium text-gray-700 truncate">{design.fileName}</p>
                    <button
                      onClick={() => removeDesign(index)}
                      className="p-1 hover:bg-red-50 rounded-full transition-colors shrink-0"
                      aria-label="Remove design"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-red-500" />
                    </button>
                  </div>
                  <Textarea
                    value={design.note}
                    onChange={(e) => updateDesignNote(index, e.target.value)}
                    placeholder="Add a note (placement, size, color preference...)"
                    rows={2}
                    className="text-sm resize-none"
                  />
                </div>
              </div>
            ))}

            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-lg py-4 hover:border-gray-400 hover:bg-gray-50 transition-colors"
            >
              <Plus className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600 font-medium">
                {customDesigns.length === 0 ? "Upload an image" : "Add another image"}
              </span>
            </button>
            <p className="text-xs text-gray-400 text-center">PNG, JPG up to 5MB each</p>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleDesignFileChange}
              className="hidden"
            />

            <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
              <p className="text-xs text-blue-700">
                Your design images and notes will be sent to our team along with your order confirmation email.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowDesignDialog(false); setPendingAction(null); }}>
              Cancel
            </Button>
            <Button
              className="bg-red-500 hover:bg-red-600 text-white"
              disabled={customDesigns.length === 0}
              onClick={handleDesignDialogContinue}
            >
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90"
          onClick={closeLightbox}
        >
          {/* Close button */}
          <button
            className="absolute top-4 right-4 text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors z-10"
            onClick={closeLightbox}
            aria-label="Close preview"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Prev arrow */}
          {currentImages.length > 1 && (
            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-white/10 hover:bg-white/25 rounded-full p-3 transition-colors z-10"
              onClick={(e) => { e.stopPropagation(); lightboxPrev(); }}
              aria-label="Previous image"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* Main lightbox image */}
          <div
            className="max-w-4xl max-h-[75vh] w-full px-16 flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={currentImages[lightboxIndex]}
              alt={`${product.name} preview ${lightboxIndex + 1}`}
              referrerPolicy="no-referrer"
              className="max-h-[75vh] max-w-full object-contain rounded-lg shadow-2xl"
            />
          </div>

          {/* Next arrow */}
          {currentImages.length > 1 && (
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-white/10 hover:bg-white/25 rounded-full p-3 transition-colors z-10"
              onClick={(e) => { e.stopPropagation(); lightboxNext(); }}
              aria-label="Next image"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}

          {/* Thumbnail strip */}
          {currentImages.length > 1 && (
            <div
              className="flex gap-2 mt-4 px-4 overflow-x-auto max-w-full pb-1"
              onClick={(e) => e.stopPropagation()}
            >
              {currentImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setLightboxIndex(idx)}
                  className={`shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-all ${
                    lightboxIndex === idx
                      ? "border-white scale-105"
                      : "border-white/30 opacity-60 hover:opacity-90"
                  }`}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${idx + 1}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Counter */}
          <p className="text-white/60 text-sm mt-3">
            {lightboxIndex + 1} / {currentImages.length}
          </p>
        </div>
      )}
    </>
  );
}