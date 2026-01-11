"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Upload, Trash2, AlertCircle, CheckCircle } from "lucide-react";
import { OrderManagementService } from "@/lib/order-management-service";
import { useAuth } from "@/lib/auth-context";

interface ReturnExchangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
  type: 'return' | 'exchange' | 'cancel';
  onSuccess: () => void;
}

export default function ReturnExchangeModal({ 
  isOpen, 
  onClose, 
  order, 
  type, 
  onSuccess 
}: ReturnExchangeModalProps) {
  const { state: authState } = useAuth();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    reason: '',
    description: '',
    selectedItems: [] as any[],
    pickupAddress: {
      fullName: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      pincode: ''
    },
    images: [] as string[]
  });

  const reasons = type === 'return' 
    ? OrderManagementService.getReturnReasons()
    : type === 'exchange'
    ? OrderManagementService.getExchangeReasons()
    : OrderManagementService.getCancelReasons();

  useEffect(() => {
    if (isOpen && order?.items) {
      // Initialize selected items with all order items
      setFormData(prev => ({
        ...prev,
        selectedItems: order.items.map((item: any) => ({
          ...item,
          selected: true,
          returnQuantity: item.quantity,
          exchangeSize: item.size,
          exchangeColor: item.color || item.variant
        }))
      }));
    }
  }, [isOpen, order]);

  const handleItemSelection = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      selectedItems: prev.selectedItems.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const selectedItems = formData.selectedItems
        .filter(item => item.selected)
        .map(item => ({
          productId: item.productId || item.id,
          productName: item.name,
          quantity: type === 'cancel' ? item.quantity : (item.returnQuantity || item.quantity),
          size: item.size,
          color: item.color || item.variant || '',
          price: item.price,
          ...(type === 'exchange' && {
            exchangeSize: item.exchangeSize,
            exchangeColor: item.exchangeColor
          })
        }));

      if (selectedItems.length === 0) {
        alert('Please select at least one item');
        return;
      }

      // For cancel orders, skip address validation
      if (type !== 'cancel') {
        const { fullName, phone, address, city, state, pincode } = formData.pickupAddress;
        if (!fullName || !phone || !address || !city || !state || !pincode) {
          alert('Please fill in all required address fields');
          return;
        }
      }

      const requestData: any = {
        orderId: order.id,
        userId: authState.user?.id || '',
        type,
        reason: formData.reason,
        items: selectedItems,
        userEmail: authState.user?.email,
        userName: authState.user?.name || authState.user?.email
      };

      // Only add optional fields if they have values
      if (formData.description) {
        requestData.description = formData.description;
      }

      if (type !== 'cancel' && formData.pickupAddress) {
        requestData.pickupAddress = formData.pickupAddress;
      }

      if (formData.images && formData.images.length > 0) {
        requestData.images = formData.images;
      }

      const response = await fetch('/api/orders/return-exchange', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit request');
      }
      
      // Show success message
      alert(`${type.charAt(0).toUpperCase() + type.slice(1)} request submitted successfully! Request ID: ${result.requestId}`);
      
      // Call onSuccess to refresh the orders list and close modal
      onSuccess();
    } catch (error: any) {
      console.error('Error submitting request:', error);
      alert(`Failed to submit request: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const getTitle = () => {
    switch (type) {
      case 'return': return 'Return Items';
      case 'exchange': return 'Exchange Items';
      case 'cancel': return 'Cancel Order';
      default: return 'Request';
    }
  };

  const getDescription = () => {
    switch (type) {
      case 'return': return 'Select items you want to return and provide a reason.';
      case 'exchange': return 'Select items you want to exchange and specify new preferences.';
      case 'cancel': return 'Cancel your order and provide a reason.';
      default: return '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold">{getTitle()}</h2>
            <p className="text-gray-600 text-sm mt-1">{getDescription()}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Step 1: Select Items and Reason */}
          {step === 1 && (
            <div className="space-y-6">
              {/* Items Selection */}
              <div>
                <h3 className="font-medium mb-4">Select Items</h3>
                <div className="space-y-3">
                  {formData.selectedItems.map((item, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-start gap-4">
                        <input
                          type="checkbox"
                          checked={item.selected}
                          onChange={(e) => handleItemSelection(index, 'selected', e.target.checked)}
                          className="mt-1"
                        />
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-3">
                            <img
                              src={item.image || '/placeholder.jpg'}
                              alt={item.name}
                              className="w-16 h-16 object-cover rounded"
                            />
                            <div className="flex-1">
                              <h4 className="font-medium">{item.name}</h4>
                              <p className="text-sm text-gray-600">
                                Size: {item.size} | Color: {item.color || item.variant || 'N/A'} | Price: ₹{item.price}
                              </p>
                              <p className="text-sm text-gray-600">
                                Ordered Quantity: {item.quantity}
                              </p>
                            </div>
                          </div>

                          {item.selected && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {type !== 'cancel' && (
                                <div>
                                  <label className="block text-sm font-medium mb-1">
                                    {type === 'return' ? 'Return' : 'Exchange'} Quantity
                                  </label>
                                  <Input
                                    type="number"
                                    min="1"
                                    max={item.quantity}
                                    value={item.returnQuantity || item.quantity}
                                    onChange={(e) => handleItemSelection(index, 'returnQuantity', parseInt(e.target.value))}
                                  />
                                </div>
                              )}

                              {type === 'exchange' && (
                                <>
                                  <div>
                                    <label className="block text-sm font-medium mb-1">New Size</label>
                                    <Select
                                      value={item.exchangeSize}
                                      onValueChange={(value) => handleItemSelection(index, 'exchangeSize', value)}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select size" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="XS">XS</SelectItem>
                                        <SelectItem value="S">S</SelectItem>
                                        <SelectItem value="M">M</SelectItem>
                                        <SelectItem value="L">L</SelectItem>
                                        <SelectItem value="XL">XL</SelectItem>
                                        <SelectItem value="XXL">XXL</SelectItem>
                                        <SelectItem value="XXXL">XXXL</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <div>
                                    <label className="block text-sm font-medium mb-1">New Color</label>
                                    <Select
                                      value={item.exchangeColor}
                                      onValueChange={(value) => handleItemSelection(index, 'exchangeColor', value)}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select color" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="Black">Black</SelectItem>
                                        <SelectItem value="White">White</SelectItem>
                                        <SelectItem value="Red">Red</SelectItem>
                                        <SelectItem value="Blue">Blue</SelectItem>
                                        <SelectItem value="Green">Green</SelectItem>
                                        <SelectItem value="Grey">Grey</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Reason for {type} <span className="text-red-500">*</span>
                </label>
                <Select
                  value={formData.reason}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, reason: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a reason" />
                  </SelectTrigger>
                  <SelectContent>
                    {reasons.map((reason) => (
                      <SelectItem key={reason} value={reason}>
                        {reason}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Additional Details (Optional)
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Provide any additional details about your request..."
                  rows={3}
                />
              </div>

              {/* Next Button */}
              <div className="flex justify-end">
                {type === 'cancel' ? (
                  <Button
                    onClick={handleSubmit}
                    disabled={loading || !formData.reason || formData.selectedItems.filter(item => item.selected).length === 0}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {loading ? 'Submitting...' : 'Cancel Order'}
                  </Button>
                ) : (
                  <Button
                    onClick={() => setStep(2)}
                    disabled={!formData.reason || formData.selectedItems.filter(item => item.selected).length === 0}
                  >
                    Next: Address Details
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Address Details (for return/exchange only) */}
          {step === 2 && type !== 'cancel' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-medium mb-4">Pickup Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={formData.pickupAddress.fullName}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        pickupAddress: { ...prev.pickupAddress, fullName: e.target.value }
                      }))}
                      placeholder="Enter full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={formData.pickupAddress.phone}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        pickupAddress: { ...prev.pickupAddress, phone: e.target.value }
                      }))}
                      placeholder="Enter phone number"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">
                      Address <span className="text-red-500">*</span>
                    </label>
                    <Textarea
                      value={formData.pickupAddress.address}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        pickupAddress: { ...prev.pickupAddress, address: e.target.value }
                      }))}
                      placeholder="Enter complete address"
                      rows={2}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      City <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={formData.pickupAddress.city}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        pickupAddress: { ...prev.pickupAddress, city: e.target.value }
                      }))}
                      placeholder="Enter city"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      State <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={formData.pickupAddress.state}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        pickupAddress: { ...prev.pickupAddress, state: e.target.value }
                      }))}
                      placeholder="Enter state"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Pincode <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={formData.pickupAddress.pincode}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        pickupAddress: { ...prev.pickupAddress, pincode: e.target.value }
                      }))}
                      placeholder="Enter pincode"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                >
                  Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={loading || !formData.pickupAddress.fullName || !formData.pickupAddress.phone || !formData.pickupAddress.address}
                >
                  {loading ? 'Submitting...' : 'Submit Request'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}