"use client";
import { useState, useEffect } from "react";
import { InventoryService } from "@/lib/inventory-services";
import { Product, StockEntry } from "@/lib/data";
import { X, Plus, Minus, Package, TrendingUp, TrendingDown, RotateCcw } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/lib/auth-context";

interface StockModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onStockUpdate: () => void;
}

export default function StockModal({ isOpen, onClose, product, onStockUpdate }: StockModalProps) {
  const [stockHistory, setStockHistory] = useState<StockEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: 'in' as 'in' | 'out' | 'adjustment',
    quantity: 0,
    reason: '',
    reference: '',
    notes: '',
  });
  const { addToast } = useToast();
  const { state } = useAuth();

  useEffect(() => {
    if (isOpen && product) {
      fetchStockHistory();
      resetForm();
    }
  }, [isOpen, product]);

  const fetchStockHistory = async () => {
    if (!product) return;
    
    try {
      const history = await InventoryService.getStockHistory(product.id);
      setStockHistory(history);
    } catch (error) {
      console.error("Error fetching stock history:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'in',
      quantity: 0,
      reason: '',
      reference: '',
      notes: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !state.user) return;

    setLoading(true);
    try {
      // await InventoryService.addStockEntry(
      //   product.id,
      //   formData.type,
      //   formData.quantity,
      //   formData.reason,
      //   state.user.id,
      //   formData.reference || undefined,
      //   formData.notes || undefined
      // );

      addToast({
        title: "Success",
        description: "Stock updated successfully",
        type: "success",
      });

      resetForm();
      fetchStockHistory();
      onStockUpdate();
    } catch (error: any) {
      addToast({
        title: "Error",
        description: error.message || "Failed to update stock",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStockIcon = (type: string) => {
    switch (type) {
      case 'in':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'out':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'adjustment':
        return <RotateCcw className="h-4 w-4 text-blue-600" />;
      default:
        return <Package className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStockColor = (type: string) => {
    switch (type) {
      case 'in':
        return 'text-green-600 bg-green-50';
      case 'out':
        return 'text-red-600 bg-red-50';
      case 'adjustment':
        return 'text-blue-600 bg-blue-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />

        <div className="inline-block w-full max-w-4xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                Stock Management - {product.name}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Current Stock: <span className="font-medium">{product.stock || 0}</span> units
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Stock Entry Form */}
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-900">Add Stock Entry</h4>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Entry Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="in">Stock In (Add)</option>
                    <option value="out">Stock Out (Remove)</option>
                    <option value="adjustment">Adjustment (Set Total)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.quantity}
                    onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={formData.type === 'adjustment' ? 'New total stock' : 'Quantity to add/remove'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason
                  </label>
                  <select
                    value={formData.reason}
                    onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select reason</option>
                    {formData.type === 'in' && (
                      <>
                        <option value="Purchase">Purchase</option>
                        <option value="Return">Customer Return</option>
                        <option value="Production">Production</option>
                        <option value="Transfer In">Transfer In</option>
                      </>
                    )}
                    {formData.type === 'out' && (
                      <>
                        <option value="Sale">Sale</option>
                        <option value="Damage">Damage</option>
                        <option value="Loss">Loss</option>
                        <option value="Transfer Out">Transfer Out</option>
                        <option value="Sample">Sample</option>
                      </>
                    )}
                    {formData.type === 'adjustment' && (
                      <>
                        <option value="Physical Count">Physical Count</option>
                        <option value="System Correction">System Correction</option>
                        <option value="Opening Balance">Opening Balance</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reference (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.reference}
                    onChange={(e) => setFormData(prev => ({ ...prev, reference: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Order ID, Invoice #, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Additional notes..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? "Updating..." : "Update Stock"}
                </button>
              </form>
            </div>

            {/* Stock History */}
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-900">Stock History</h4>
              
              <div className="max-h-96 overflow-y-auto space-y-3">
                {stockHistory.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-8">
                    No stock history available
                  </p>
                ) : (
                  stockHistory.map((entry) => (
                    <div key={entry.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2">
                          {getStockIcon(entry.type)}
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {entry.reason}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(entry.date).toLocaleDateString()} at{' '}
                              {new Date(entry.date).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStockColor(entry.type)}`}>
                            {entry.type === 'out' ? '-' : '+'}{entry.quantity}
                          </span>
                        </div>
                      </div>
                      
                      {entry.reference && (
                        <p className="text-xs text-gray-500 mt-2">
                          Ref: {entry.reference}
                        </p>
                      )}
                      
                      {entry.notes && (
                        <p className="text-xs text-gray-600 mt-2">
                          {entry.notes}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}