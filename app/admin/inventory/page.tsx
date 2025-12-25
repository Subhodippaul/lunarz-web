"use client";
import { useEffect, useState } from "react";
import { AdminProductService } from "@/lib/admin-services";
import { InventoryService } from "@/lib/inventory-services";
import { Product, StockEntry } from "@/lib/data";
import { 
  Package, 
  TrendingDown, 
  AlertTriangle, 
  BarChart3,
  Search,
  Filter,
  Calendar
} from "lucide-react";
import { useToast } from "@/components/ui/toast";

export default function AdminInventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [outOfStockProducts, setOutOfStockProducts] = useState<Product[]>([]);
  const [recentStockEntries, setRecentStockEntries] = useState<StockEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<'all' | 'low' | 'out' | 'good'>('all');
  const { addToast } = useToast();

  useEffect(() => {
    fetchInventoryData();
  }, []);

  const fetchInventoryData = async () => {
    try {
      const [fetchedProducts, lowStock] = await Promise.all([
        AdminProductService.getAllProducts(),
        InventoryService.getLowStockProducts(),
      ]);

      setProducts(fetchedProducts);
      setLowStockProducts(lowStock);
      
      // Filter out of stock products
      const outOfStock = fetchedProducts.filter(product => (product.stock || 0) === 0);
      setOutOfStockProducts(outOfStock);

      // Get recent stock entries for all products
      const allStockEntries: StockEntry[] = [];
      for (const product of fetchedProducts.slice(0, 10)) { // Limit to first 10 for performance
        const entries = await InventoryService.getStockHistory(product.id);
        allStockEntries.push(...entries.slice(0, 3)); // Get latest 3 entries per product
      }
      
      // Sort by date and take the most recent 20
      const sortedEntries = allStockEntries
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 20);
      
      setRecentStockEntries(sortedEntries);
    } catch (error) {
      console.error("Error fetching inventory data:", error);
      addToast({
        title: "Error",
        description: "Failed to load inventory data",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStockStatus = (product: Product) => {
    const stock = product.stock || 0;
    const threshold = product.lowStockThreshold || 10;
    
    if (stock === 0) return { status: 'out', color: 'bg-red-100 text-red-800', text: 'Out of Stock' };
    if (stock <= threshold) return { status: 'low', color: 'bg-yellow-100 text-yellow-800', text: 'Low Stock' };
    return { status: 'good', color: 'bg-green-100 text-green-800', text: 'In Stock' };
  };

  const getStockIcon = (type: string) => {
    switch (type) {
      case 'in':
        return <div className="h-2 w-2 bg-green-500 rounded-full" />;
      case 'out':
        return <div className="h-2 w-2 bg-red-500 rounded-full" />;
      case 'adjustment':
        return <div className="h-2 w-2 bg-blue-500 rounded-full" />;
      default:
        return <div className="h-2 w-2 bg-gray-500 rounded-full" />;
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (!matchesSearch) return false;

    const stockStatus = getStockStatus(product);
    switch (filterStatus) {
      case 'low':
        return stockStatus.status === 'low';
      case 'out':
        return stockStatus.status === 'out';
      case 'good':
        return stockStatus.status === 'good';
      default:
        return true;
    }
  });

  const totalValue = products.reduce((sum, product) => sum + (product.price * (product.stock || 0)), 0);
  const totalItems = products.reduce((sum, product) => sum + (product.stock || 0), 0);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Inventory Dashboard</h1>
          <p className="text-gray-600 mt-1">Monitor stock levels and inventory movements</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Products</p>
              <p className="text-2xl font-bold text-gray-900">{products.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Stock</p>
              <p className="text-2xl font-bold text-gray-900">{totalItems.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Low Stock</p>
              <p className="text-2xl font-bold text-gray-900">{lowStockProducts.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <TrendingDown className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Out of Stock</p>
              <p className="text-2xl font-bold text-gray-900">{outOfStockProducts.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Product Stock Levels */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Product Stock Levels</h3>
              
              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                    className="pl-10 pr-8 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Products</option>
                    <option value="good">In Stock</option>
                    <option value="low">Low Stock</option>
                    <option value="out">Out of Stock</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      SKU
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Value
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProducts.slice(0, 10).map((product) => {
                    const stockStatus = getStockStatus(product);
                    const stockValue = product.price * (product.stock || 0);
                    
                    return (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <img
                              className="h-10 w-10 rounded-lg object-cover"
                              src={product.images[0] || "/placeholder.jpg"}
                              alt={product.name}
                            />
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {product.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {product.category}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {product.sku || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${stockStatus.color}`}>
                            {product.stock || 0} units
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ₹{stockValue.toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Recent Stock Movements */}
        <div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Recent Stock Movements</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentStockEntries.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-8">
                    No recent stock movements
                  </p>
                ) : (
                  recentStockEntries.map((entry) => {
                    const product = products.find(p => p.id === entry.productId);
                    return (
                      <div key={entry.id} className="flex items-start space-x-3">
                        <div className="shrink-0 mt-1">
                          {getStockIcon(entry.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {product?.name || 'Unknown Product'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {entry.reason} • {entry.type === 'out' ? '-' : '+'}{entry.quantity} units
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(entry.date).toLocaleDateString()} at{' '}
                            {new Date(entry.date).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Inventory Value Summary */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mt-6">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Inventory Value</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Inventory Value</span>
                  <span className="text-sm font-medium text-gray-900">
                    ₹{totalValue.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Average Product Value</span>
                  <span className="text-sm font-medium text-gray-900">
                    ₹{products.length > 0 ? Math.round(totalValue / products.length).toLocaleString() : 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Units</span>
                  <span className="text-sm font-medium text-gray-900">
                    {totalItems.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}