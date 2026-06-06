"use client";
import { useState, useEffect } from "react";
import { AdminProductService } from "@/lib/admin-services";
import { Product } from "@/lib/data";
import { X, Plus, Minus, Lock } from "lucide-react";

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null;
}

// ── Defaults & Constants ──────────────────────────────────────────────────────

const CATEGORIES = [
  "T-Shirts",
  "Hoodies",
  "Oversized Tees",
  "Graphic Tees",
  "Polo T-Shirts",
  "Sweatshirts",
  "Jackets",
  "Joggers",
  "Shorts",
  "Accessories",
];

const DEFAULT_PRICE = 1299;
const DEFAULT_ORIGINAL_PRICE = 1299;

const DEFAULT_DESCRIPTION = `This oversized tee brings all the attitude you need with none of the effort. Built with soft, breathable cotton, it delivers that lived-in comfort from the very first wear. Whether you're out with friends or lounging at home, this piece keeps your fit looking clean and effortless.

Style Tip:
Go bold by pairing it with relaxed-fit cargos and high-top sneakers. For a layered look, throw it over a long-sleeve tee or a lightweight flannel. Swap in slim black denim and minimal sneakers when you want a sharper, elevated street look.

Highlights:
Thick, premium 240 GSM fabric for a structured feel
Pure cotton that stays soft and airy all day
Washed finish for a naturally worn-in aesthetic
Oversized cut for total comfort and modern styling
Reinforced construction for long-lasting wear

Make it your everyday essential.
Easy to style, impossible to ignore.
Perfect for anyone who wants comfort, edge, and quality all in one fit.`;

const DEFAULT_MATERIAL = "100% Cotton | 240 GSM French Terry Cotton";
const DEFAULT_ORIGIN = "India";
const DEFAULT_MANUFACTURER =
  "Lunarz India 741, SATYA NARAYAN PALLY, DAKSHIN BEHALA ROAD, Sarsuna, South Twenty Four Parganas, Kolkata, West Bengal, 700061, India";

// ── Generators ────────────────────────────────────────────────────────────────

function generateSKU(): string {
  const prefix = "LNZ";
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const random = Array.from({ length: 6 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join("");
  return `${prefix}-${random}`;
}

function generateBarcode(): string {
  // 13-digit EAN-style barcode
  const digits = Array.from({ length: 12 }, () => Math.floor(Math.random() * 10)).join("");
  // Calculate check digit (EAN-13)
  const sum = digits
    .split("")
    .reduce((acc, d, i) => acc + parseInt(d) * (i % 2 === 0 ? 1 : 3), 0);
  const check = (10 - (sum % 10)) % 10;
  return digits + check;
}

// ── Empty form factory ────────────────────────────────────────────────────────

function newFormData() {
  return {
    name: "",
    price: DEFAULT_PRICE,
    originalPrice: DEFAULT_ORIGINAL_PRICE,
    category: "",
    description: DEFAULT_DESCRIPTION,
    material: DEFAULT_MATERIAL,
    care: "Machine wash cold with like colors. Do not bleach. Tumble dry low. Iron inside out on low heat.",
    origin: DEFAULT_ORIGIN,
    manufacturer: DEFAULT_MANUFACTURER,
    images: [""],
    variants: [""],
    sizes: [""],
    colorImages: {} as { [color: string]: string[] },
    relatedProducts: [""],
    stock: 0,
    lowStockThreshold: 10,
    sku: generateSKU(),
    barcode: generateBarcode(),
  };
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ProductModal({ isOpen, onClose, product }: ProductModalProps) {
  const [formData, setFormData] = useState(newFormData());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (product) {
      // Edit mode — load existing values
      setFormData({
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice ?? DEFAULT_ORIGINAL_PRICE,
        category: product.category,
        description: product.description || DEFAULT_DESCRIPTION,
        material: product.material || DEFAULT_MATERIAL,
        care: product.care || "",
        origin: product.origin || DEFAULT_ORIGIN,
        manufacturer: product.manufacturer || DEFAULT_MANUFACTURER,
        images: product.images.length > 0 ? product.images : [""],
        variants: product.variants && product.variants.length > 0 ? product.variants : [""],
        sizes: product.sizes.length > 0 ? product.sizes : [""],
        colorImages: product.colorImages || {},
        relatedProducts:
          product.relatedProducts && product.relatedProducts.length > 0
            ? product.relatedProducts
            : [""],
        stock: product.stock || 0,
        lowStockThreshold: product.lowStockThreshold || 10,
        // SKU and barcode are locked from the original — never regenerated
        sku: product.sku || generateSKU(),
        barcode: product.barcode || generateBarcode(),
      });
    } else {
      // Add mode — fresh defaults with new SKU/barcode
      setFormData(newFormData());
    }
  }, [product, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const productData = {
        ...formData,
        images: formData.images.filter((img) => img.trim() !== ""),
        variants: formData.variants.filter((v) => v.trim() !== ""),
        sizes: formData.sizes.filter((s) => s.trim() !== ""),
        relatedProducts: formData.relatedProducts.filter((id) => id.trim() !== ""),
      };

      if (product) {
        await AdminProductService.updateProduct(product.id, productData);
      } else {
        await AdminProductService.addProduct(productData);
      }

      onClose();
    } catch (error) {
      console.error("Error saving product:", error);
      alert("Failed to save product. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const addArrayItem = (field: "images" | "variants" | "sizes" | "relatedProducts") => {
    setFormData((prev) => ({ ...prev, [field]: [...prev[field], ""] }));
  };

  const removeArrayItem = (
    field: "images" | "variants" | "sizes" | "relatedProducts",
    index: number
  ) => {
    setFormData((prev) => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) }));
  };

  const updateArrayItem = (
    field: "images" | "variants" | "sizes" | "relatedProducts",
    index: number,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].map((item, i) => (i === index ? value : item)),
    }));
  };

  const addColorImage = (color: string) => {
    setFormData((prev) => ({
      ...prev,
      colorImages: { ...prev.colorImages, [color]: [...(prev.colorImages[color] || []), ""] },
    }));
  };

  const removeColorImage = (color: string, index: number) => {
    setFormData((prev) => ({
      ...prev,
      colorImages: {
        ...prev.colorImages,
        [color]: prev.colorImages[color]?.filter((_, i) => i !== index) || [],
      },
    }));
  };

  const updateColorImage = (color: string, index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      colorImages: {
        ...prev.colorImages,
        [color]: prev.colorImages[color]?.map((item, i) => (i === index ? value : item)) || [],
      },
    }));
  };

  if (!isOpen) return null;

  // Shared input / textarea class
  const inputCls =
    "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent";
  const readonlyCls =
    "w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed select-none text-sm font-mono";

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 transition-opacity bg-black/30 backdrop-blur-sm"
          onClick={onClose}
        />

        <div className="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">
              {product ? "Edit Product" : "Add New Product"}
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name + Price + Original Price */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                  className={inputCls}
                  placeholder="Enter product name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sale Price (₹)
                </label>
          
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, price: parseInt(e.target.value) || 0 }))
                  }
                  className={inputCls}
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Original Price / MRP (₹)
                </label>
                
                <input
                  type="number"
                  min="0"
                  value={formData.originalPrice}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, originalPrice: parseInt(e.target.value) || 0 }))
                  }
                  className={inputCls}
                  placeholder="1299"
                />
              </div>
            </div>

            {/* Discount preview */}
            {formData.originalPrice > formData.price && formData.price > 0 && (
              <div className="flex items-center gap-2 text-sm bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                <span className="text-gray-400 line-through">₹{formData.originalPrice.toLocaleString()}</span>
                <span className="font-bold text-gray-900">₹{formData.price.toLocaleString()}</span>
                <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                  {Math.round(((formData.originalPrice - formData.price) / formData.originalPrice) * 100)}% off
                </span>
                <span className="text-gray-400 text-xs ml-1">— customer preview</span>
              </div>
            )}

            {/* Category dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData((p) => ({ ...p, category: e.target.value }))}
                className={inputCls}
              >
                <option value="">Select a category</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Description — pre-filled, editable */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <p className="text-xs text-gray-400 mb-2">
                Pre-filled with the default Lunarz description. Edit freely.
              </p>
              <textarea
                required
                rows={8}
                value={formData.description}
                onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                className={inputCls}
              />
            </div>

            {/* Material + Care */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Material</label>
                <p className="text-xs text-gray-400 mb-2">Pre-filled. Edit if needed.</p>
                <input
                  type="text"
                  required
                  value={formData.material}
                  onChange={(e) => setFormData((p) => ({ ...p, material: e.target.value }))}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Care Instructions
                </label>
                <p className="text-xs text-gray-400 mb-2">Pre-filled. Edit if needed.</p>
                <input
                  type="text"
                  required
                  value={formData.care}
                  onChange={(e) => setFormData((p) => ({ ...p, care: e.target.value }))}
                  className={inputCls}
                  placeholder="e.g. Machine wash cold"
                />
              </div>
            </div>

            {/* Origin + Manufacturer — pre-filled, editable */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Origin</label>
                <p className="text-xs text-gray-400 mb-2">Pre-filled. Edit if needed.</p>
                <input
                  type="text"
                  required
                  value={formData.origin}
                  onChange={(e) => setFormData((p) => ({ ...p, origin: e.target.value }))}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Manufacturer</label>
                <p className="text-xs text-gray-400 mb-2">Pre-filled. Edit if needed.</p>
                <input
                  type="text"
                  required
                  value={formData.manufacturer}
                  onChange={(e) => setFormData((p) => ({ ...p, manufacturer: e.target.value }))}
                  className={inputCls}
                />
              </div>
            </div>

            {/* ── Inventory ── */}
            <div className="border-t border-gray-200 pt-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Inventory</h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Initial Stock Quantity
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, stock: parseInt(e.target.value) || 0 }))
                    }
                    className={inputCls}
                    placeholder="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Use Stock Management for future updates.
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Low Stock Threshold
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.lowStockThreshold}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        lowStockThreshold: parseInt(e.target.value) || 10,
                      }))
                    }
                    className={inputCls}
                    placeholder="10"
                  />
                  <p className="text-xs text-gray-500 mt-1">Alert when stock falls below this.</p>
                </div>
              </div>

              {/* SKU + Barcode — auto-generated, read-only */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <label className="block text-sm font-medium text-gray-700">SKU</label>
                    <Lock className="h-3 w-3 text-gray-400" />
                    <span className="text-xs text-gray-400">Auto-generated</span>
                  </div>
                  <div className={readonlyCls}>{formData.sku}</div>
                  <p className="text-xs text-gray-500 mt-1">
                    Assigned automatically and cannot be changed.
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <label className="block text-sm font-medium text-gray-700">Barcode</label>
                    <Lock className="h-3 w-3 text-gray-400" />
                    <span className="text-xs text-gray-400">Auto-generated</span>
                  </div>
                  <div className={readonlyCls}>{formData.barcode}</div>
                  <p className="text-xs text-gray-500 mt-1">
                    EAN-13 barcode assigned automatically.
                  </p>
                </div>
              </div>
            </div>

            {/* Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Images (URLs)
              </label>
              {formData.images.map((image, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <input
                    type="url"
                    value={image}
                    onChange={(e) => updateArrayItem("images", index, e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {formData.images.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayItem("images", index)}
                      className="p-2 text-red-600 hover:text-red-800"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem("images")}
                className="flex items-center text-sm text-blue-600 hover:text-blue-800"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Image
              </button>
            </div>

            {/* Variants */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Variants (Colors)
              </label>
              {formData.variants.map((variant, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <input
                    type="text"
                    value={variant}
                    onChange={(e) => updateArrayItem("variants", index, e.target.value)}
                    placeholder="e.g. Black, White, Red"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {formData.variants.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayItem("variants", index)}
                      className="p-2 text-red-600 hover:text-red-800"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem("variants")}
                className="flex items-center text-sm text-blue-600 hover:text-blue-800"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Variant
              </button>
            </div>

            {/* Sizes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Available Sizes
              </label>
              {formData.sizes.map((size, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <input
                    type="text"
                    value={size}
                    onChange={(e) => updateArrayItem("sizes", index, e.target.value)}
                    placeholder="e.g. XS, S, M, L, XL"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {formData.sizes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayItem("sizes", index)}
                      className="p-2 text-red-600 hover:text-red-800"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem("sizes")}
                className="flex items-center text-sm text-blue-600 hover:text-blue-800"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Size
              </button>
            </div>

            {/* Color-wise Images */}
            {formData.variants.some((v) => v.trim() !== "") && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color-wise Images
                </label>
                <p className="text-xs text-gray-500 mb-4">
                  Add specific images for each color variant.
                </p>
                {formData.variants
                  .filter((v) => v.trim() !== "")
                  .map((color) => (
                    <div key={color} className="mb-4 p-4 border border-gray-200 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">{color} Images</h4>
                      {(formData.colorImages[color] || []).map((image, index) => (
                        <div key={index} className="flex items-center space-x-2 mb-2">
                          <input
                            type="url"
                            value={image}
                            onChange={(e) => updateColorImage(color, index, e.target.value)}
                            placeholder={`https://example.com/${color.toLowerCase()}-image.jpg`}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <button
                            type="button"
                            onClick={() => removeColorImage(color, index)}
                            className="p-2 text-red-600 hover:text-red-800"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addColorImage(color)}
                        className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add {color} Image
                      </button>
                    </div>
                  ))}
              </div>
            )}

            {/* Related Products */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Related Products (Product IDs)
              </label>
              <p className="text-xs text-gray-500 mb-2">
                Shown as "You might also like" on the product page.
              </p>
              {formData.relatedProducts.map((productId, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <input
                    type="text"
                    value={productId}
                    onChange={(e) => updateArrayItem("relatedProducts", index, e.target.value)}
                    placeholder="e.g. 1, 2, 3"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {formData.relatedProducts.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayItem("relatedProducts", index)}
                      className="p-2 text-red-600 hover:text-red-800"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem("relatedProducts")}
                className="flex items-center text-sm text-blue-600 hover:text-blue-800"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Related Product
              </button>
            </div>

            {/* Footer */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Saving..." : product ? "Update Product" : "Add Product"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
