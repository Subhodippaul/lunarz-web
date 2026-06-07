"use client";
import { useEffect, useState } from "react";
import { AdminProductService } from "@/lib/admin-services";
import { InventoryService, ProductCSVService } from "@/lib/inventory-services";
import { Product } from "@/lib/data";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Package, 
  Download, 
  Upload, 
  BarChart3,
  AlertTriangle,
  TrendingUp
} from "lucide-react";
import { ProductTableSkeleton } from "@/components/admin/skeleton-loaders";
import ProductModal from "@/components/admin/product-modal";
import StockModal from "@/components/admin/stock-modal";
import CSVImportModal from "@/components/admin/csv-import-modal";
import { useToast } from "@/components/ui/toast";
import { toDriveImageUrl } from "@/lib/drive-image";

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [isCSVImportModalOpen, setIsCSVImportModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const { addToast } = useToast();

  useEffect(() => {
    fetchProducts();
    fetchLowStockProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setFetchError(null);
      const fetchedProducts = await AdminProductService.getAllProducts();
      setProducts(fetchedProducts);
    } catch (error: any) {
      console.error("Error fetching products:", error);
      setFetchError(error?.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const fetchLowStockProducts = async () => {
    try {
      const lowStock = await InventoryService.getLowStockProducts();
      setLowStockProducts(lowStock);
    } catch (error) {
      console.error("Error fetching low stock products:", error);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        await AdminProductService.deleteProduct(id);
        setProducts(products.filter(p => p.id.toString() !== id));
        addToast({
          title: "Success",
          description: "Product deleted successfully",
          type: "success",
        });
      } catch (error) {
        console.error("Error deleting product:", error);
        addToast({
          title: "Error",
          description: "Failed to delete product",
          type: "error",
        });
      }
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    fetchProducts(); // Refresh products list
  };

  const handleStockManagement = (product: Product) => {
    setSelectedProduct(product);
    setIsStockModalOpen(true);
  };

  const handleStockModalClose = () => {
    setIsStockModalOpen(false);
    setSelectedProduct(null);
    fetchProducts();
    fetchLowStockProducts();
  };

  const handleExportCSV = () => {
    try {
      const csvContent = ProductCSVService.exportToCSV(products);
      ProductCSVService.downloadCSV(csvContent, `products-${new Date().toISOString().split('T')[0]}.csv`);
      addToast({
        title: "Success",
        description: "Products exported successfully",
        type: "success",
      });
    } catch (error) {
      addToast({
        title: "Error",
        description: "Failed to export products",
        type: "error",
      });
    }
  };

  const handleImportComplete = () => {
    fetchProducts();
    fetchLowStockProducts();
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStockStatus = (product: Product) => {
    const stock = product.stock || 0;
    const threshold = product.lowStockThreshold || 10;
    
    if (stock === 0) return { status: 'out', color: 'bg-red-100 text-red-800', text: 'Out of Stock' };
    if (stock <= threshold) return { status: 'low', color: 'bg-yellow-100 text-yellow-800', text: 'Low Stock' };
    return { status: 'good', color: 'bg-green-100 text-green-800', text: 'In Stock' };
  };

  if (loading) {
    return <ProductTableSkeleton />;
  }

  return (
    <div>
      {/* Fetch Error Banner */}
      {fetchError && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-2">
          <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-800">Failed to load products</p>
            <p className="text-sm text-red-700 mt-1">{fetchError}</p>
            <button
              onClick={() => { setLoading(true); fetchProducts(); }}
              className="mt-2 text-sm text-red-700 underline hover:no-underline"
            >
              Retry
            </button>
          </div>
        </div>
      )}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600 mt-1">
            Manage your product catalog and inventory
            {products.length > 0 && <span className="ml-2 text-sm font-medium text-blue-600">({products.length} total)</span>}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => setIsCSVImportModalOpen(true)}
            className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Upload className="h-5 w-5 mr-2" />
            Import CSV
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Download className="h-5 w-5 mr-2" />
            Export CSV
          </button>
          <button
            onClick={handleAddProduct}
            className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Product
          </button>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
            <h3 className="text-sm font-medium text-yellow-800">
              Low Stock Alert
            </h3>
          </div>
          <p className="text-sm text-yellow-700 mt-1">
            {lowStockProducts.length} product{lowStockProducts.length > 1 ? 's' : ''} running low on stock.
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {lowStockProducts.slice(0, 3).map(product => (
              <span key={product.id} className="inline-flex items-center px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                {product.name} ({product.stock || 0} left)
              </span>
            ))}
            {lowStockProducts.length > 3 && (
              <span className="inline-flex items-center px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                +{lowStockProducts.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search products by name, category, or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Products Table - Desktop */}
      <div className="hidden md:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SKU
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product) => {
                const stockStatus = getStockStatus(product);
                return (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="shrink-0 h-12 w-12">
                          <img
                            className="h-12 w-12 rounded-lg object-cover"
                            src={toDriveImageUrl(product.images[0]) || "/placeholder.jpg"}
                            alt={product.name}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {product.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {product.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{product.price.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${stockStatus.color}`}>
                          {product.stock || 0} units
                        </span>
                        <button
                          onClick={() => handleStockManagement(product)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded"
                          title="Manage Stock"
                        >
                          <BarChart3 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.sku || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded"
                          title="Edit Product"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id.toString())}
                          className="text-red-600 hover:text-red-900 p-1 rounded"
                          title="Delete Product"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Products Cards - Mobile */}
      <div className="md:hidden space-y-4">
        {filteredProducts.map((product) => {
          const stockStatus = getStockStatus(product);
          return (
            <div key={product.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-start space-x-4">
                <img
                  className="h-16 w-16 rounded-lg object-cover shrink-0"
                  src={product.images[0] || "/placeholder.jpg"}
                  alt={product.name}
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-gray-900 truncate">
                    {product.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">ID: {product.id}</p>
                  <div className="flex items-center mt-2 space-x-2">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {product.category}
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      ₹{product.price.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center mt-2 space-x-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${stockStatus.color}`}>
                      {product.stock || 0} units
                    </span>
                    {product.sku && (
                      <span className="text-xs text-gray-500">SKU: {product.sku}</span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col space-y-2">
                  <button
                    onClick={() => handleStockManagement(product)}
                    className="text-blue-600 hover:text-blue-900 p-2 rounded"
                    title="Manage Stock"
                  >
                    <BarChart3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleEditProduct(product)}
                    className="text-blue-600 hover:text-blue-900 p-2 rounded"
                    title="Edit Product"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(product.id.toString())}
                    className="text-red-600 hover:text-red-900 p-2 rounded"
                    title="Delete Product"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredProducts.length === 0 && !loading && (
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? "Try adjusting your search terms." : "Get started by adding a new product."}
          </p>
        </div>
      )}

      {/* Modals */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        product={editingProduct}
      />

      <StockModal
        isOpen={isStockModalOpen}
        onClose={handleStockModalClose}
        product={selectedProduct}
        onStockUpdate={handleStockModalClose}
      />

      <CSVImportModal
        isOpen={isCSVImportModalOpen}
        onClose={() => setIsCSVImportModalOpen(false)}
        onImportComplete={handleImportComplete}
      />
    </div>
  );
}