"use client";
import { useState, useEffect } from "react";
import { AdminOrderService, AdminProductService, AdminUserService } from "@/lib/admin-services";
import { Order, Address } from "@/lib/profile-data";
import { Product } from "@/lib/data";
import { X, Plus, Minus, Search } from "lucide-react";
import { useToast } from "@/components/ui/toast";

interface OrderFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  order?: (Order & { userId: string }) | null;
}

interface OrderItem {
  productId: string; // Changed from number to string
  name: string;
  size: string;
  variant?: string;
  quantity: number;
  price: number;
}

interface OrderFormData {
  orderNumber: string;
  status: Order["status"];
  items: OrderItem[];
  shippingAddress: Omit<Address, "id" | "isDefault">;
  userId: string;
}

export default function OrderFormModal({ isOpen, onClose, order }: OrderFormModalProps) {
  const [formData, setFormData] = useState<OrderFormData>({
    orderNumber: "",
    status: "pending",
    items: [],
    shippingAddress: {
      type: "home",
      fullName: "",
      phone: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      pincode: "",
      country: "India",
    },
    userId: "",
  });
  
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showProductSearch, setShowProductSearch] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchProducts();
      fetchUsers();
      
      if (order) {
        // Edit mode - populate form with existing order data
        setFormData({
          orderNumber: order.orderNumber,
          status: order.status,
          items: order.items,
          shippingAddress: {
            type: order.shippingAddress.type,
            fullName: order.shippingAddress.fullName,
            phone: order.shippingAddress.phone,
            addressLine1: order.shippingAddress.addressLine1,
            addressLine2: order.shippingAddress.addressLine2 || "",
            city: order.shippingAddress.city,
            state: order.shippingAddress.state,
            pincode: order.shippingAddress.pincode,
            country: order.shippingAddress.country,
          },
          userId: order.userId,
        });
      } else {
        // Add mode - generate new order number
        const orderNumber = `LNZ${Date.now().toString().slice(-6)}`;
        setFormData(prev => ({ ...prev, orderNumber }));
      }
    }
  }, [isOpen, order]);

  const fetchProducts = async () => {
    try {
      const fetchedProducts = await AdminProductService.getAllProducts();
      setProducts(fetchedProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const fetchedUsers = await AdminUserService.getAllUsers();
      setUsers(fetchedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.userId) {
        throw new Error("Please select a customer");
      }

      if (formData.items.length === 0) {
        throw new Error("Please add at least one item to the order");
      }

      const total = formData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      const orderData: Omit<Order, "id"> = {
        orderNumber: formData.orderNumber,
        date: new Date().toISOString(),
        status: formData.status,
        items: formData.items,
        total,
        shippingAddress: {
          ...formData.shippingAddress,
          id: `addr_${Date.now()}`,
          isDefault: false,
        },
      };

      if (order) {
        // Update existing order
        await AdminOrderService.updateOrderStatus(order.id, formData.status);
        addToast({
          title: "Success",
          description: "Order updated successfully.",
          type: "success",
        });
      } else {
        // Create new order
        await AdminOrderService.createOrder(formData.userId, orderData as any);
        addToast({
          title: "Success",
          description: "Order created successfully.",
          type: "success",
        });
      }

      onClose();
    } catch (error: any) {
      console.error("Error saving order:", error);
      addToast({
        title: "Error",
        description: error.message || "Failed to save order",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const addItem = (product: Product) => {
    const newItem: OrderItem = {
      productId: product.id,
      name: product.name,
      size: product.sizes[0] || "M",
      variant: product.variants?.[0],
      quantity: 1,
      price: product.price,
    };

    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem],
    }));
    setShowProductSearch(false);
    setSearchTerm("");
  };

  const updateItem = (index: number, field: keyof OrderItem, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const total = formData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />

        <div className="inline-block w-full max-w-4xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">
              {order ? "Edit Order" : "Create New Order"}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Order Details */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-900">Order Details</h4>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Order Number
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.orderNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, orderNumber: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer
                  </label>
                  <select
                    required
                    value={formData.userId}
                    onChange={(e) => setFormData(prev => ({ ...prev, userId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select a customer</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.uid}>
                        {user.name} ({user.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as Order["status"] }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-900">Shipping Address</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.shippingAddress.fullName}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        shippingAddress: { ...prev.shippingAddress, fullName: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.shippingAddress.phone}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        shippingAddress: { ...prev.shippingAddress, phone: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address Line 1
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.shippingAddress.addressLine1}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      shippingAddress: { ...prev.shippingAddress, addressLine1: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address Line 2 (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.shippingAddress.addressLine2}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      shippingAddress: { ...prev.shippingAddress, addressLine2: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.shippingAddress.city}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        shippingAddress: { ...prev.shippingAddress, city: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.shippingAddress.state}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        shippingAddress: { ...prev.shippingAddress, state: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pincode
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.shippingAddress.pincode}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        shippingAddress: { ...prev.shippingAddress, pincode: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-medium text-gray-900">Order Items</h4>
                <button
                  type="button"
                  onClick={() => setShowProductSearch(!showProductSearch)}
                  className="flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Item
                </button>
              </div>

              {/* Product Search */}
              {showProductSearch && (
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="max-h-40 overflow-y-auto space-y-2">
                    {filteredProducts.map((product) => (
                      <div
                        key={product.id}
                        onClick={() => addItem(product)}
                        className="flex items-center justify-between p-2 hover:bg-white rounded cursor-pointer"
                      >
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-gray-500">₹{product.price}</p>
                        </div>
                        <Plus className="h-4 w-4 text-blue-600" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Items List */}
              <div className="space-y-3">
                {formData.items.map((item, index) => (
                  <div key={index} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <div>
                          <label className="block text-xs text-gray-500">Size</label>
                          <select
                            value={item.size}
                            onChange={(e) => updateItem(index, "size", e.target.value)}
                            className="text-sm border border-gray-300 rounded px-2 py-1"
                          >
                            {products.find(p => p.id === item.productId)?.sizes.map(size => (
                              <option key={size} value={size}>{size}</option>
                            ))}
                          </select>
                        </div>
                        {item.variant && (
                          <div>
                            <label className="block text-xs text-gray-500">Variant</label>
                            <select
                              value={item.variant}
                              onChange={(e) => updateItem(index, "variant", e.target.value)}
                              className="text-sm border border-gray-300 rounded px-2 py-1"
                            >
                              {products.find(p => p.id === item.productId)?.variants?.map(variant => (
                                <option key={variant} value={variant}>{variant}</option>
                              ))}
                            </select>
                          </div>
                        )}
                        <div>
                          <label className="block text-xs text-gray-500">Quantity</label>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, "quantity", parseInt(e.target.value))}
                            className="w-16 text-sm border border-gray-300 rounded px-2 py-1"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500">Price</label>
                          <input
                            type="number"
                            value={item.price}
                            onChange={(e) => updateItem(index, "price", parseInt(e.target.value))}
                            className="w-20 text-sm border border-gray-300 rounded px-2 py-1"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₹{(item.price * item.quantity).toLocaleString()}</p>
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="text-red-600 hover:text-red-800 mt-1"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total */}
              {formData.items.length > 0 && (
                <div className="flex justify-end">
                  <div className="text-right">
                    <p className="text-lg font-semibold">Total: ₹{total.toLocaleString()}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-6">
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
                {loading ? "Saving..." : order ? "Update Order" : "Create Order"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}