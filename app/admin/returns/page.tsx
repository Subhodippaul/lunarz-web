"use client";
import { useState, useEffect } from "react";
import { OrderManagementService, ReturnExchangeRequest } from "@/lib/order-management-service";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Package, 
  Calendar, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock,
  RotateCcw,
  RefreshCw,
  X as XIcon
} from "lucide-react";
import { CenteredLoader } from "@/components/ui/loader";

export default function AdminReturnsPage() {
  const [requests, setRequests] = useState<ReturnExchangeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<ReturnExchangeRequest | null>(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [updateForm, setUpdateForm] = useState({
    status: '',
    adminNotes: '',
    refundAmount: ''
  });

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const allRequests = await OrderManagementService.getAllRequests();
      setRequests(allRequests);
    } catch (error) {
      console.error("Error loading requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRequest = async () => {
    if (!selectedRequest || !updateForm.status) return;

    try {
      setUpdateLoading(true);
      
      const response = await fetch('/api/orders/update-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId: selectedRequest.id,
          status: updateForm.status,
          adminNotes: updateForm.adminNotes,
          refundAmount: updateForm.refundAmount ? parseFloat(updateForm.refundAmount) : undefined,
          userEmail: 'customer@example.com', // This should come from the request data
          userName: 'Customer Name', // This should come from the request data
          orderId: selectedRequest.orderId,
          type: selectedRequest.type
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update request');
      }

      alert('Request updated successfully!');
      setSelectedRequest(null);
      setUpdateForm({ status: '', adminNotes: '', refundAmount: '' });
      loadRequests();
    } catch (error) {
      console.error('Error updating request:', error);
      alert('Failed to update request. Please try again.');
    } finally {
      setUpdateLoading(false);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'processing':
        return <Package className="w-4 h-4 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'return':
        return <RotateCcw className="w-4 h-4 text-orange-500" />;
      case 'exchange':
        return <RefreshCw className="w-4 h-4 text-blue-500" />;
      case 'cancel':
        return <XIcon className="w-4 h-4 text-red-500" />;
      default:
        return <Package className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'approved':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'rejected':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'processing':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'completed':
        return 'text-green-700 bg-green-100 border-green-300';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const filteredRequests = requests.filter(request => {
    const statusMatch = filterStatus === 'all' || request.status === filterStatus;
    const typeMatch = filterType === 'all' || request.type === filterType;
    return statusMatch && typeMatch;
  });

  if (loading) {
    return <CenteredLoader text="Loading requests..." size="lg" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Return & Exchange Requests</h1>
          <p className="text-gray-600">Manage customer return, exchange, and cancellation requests</p>
        </div>
        <Button onClick={loadRequests} variant="outline">
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 p-4 bg-white rounded-lg border">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Status:</label>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Type:</label>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="return">Return</SelectItem>
              <SelectItem value="exchange">Exchange</SelectItem>
              <SelectItem value="cancel">Cancel</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="text-sm text-gray-600">
          Showing {filteredRequests.length} of {requests.length} requests
        </div>
      </div>

      {/* Requests List */}
      {filteredRequests.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Requests Found</h3>
          <p className="text-gray-600">No return/exchange requests match your current filters.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((request) => (
            <div key={request.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {/* Request Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {getTypeIcon(request.type)}
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-lg">
                          {request.type.charAt(0).toUpperCase() + request.type.slice(1)} Request
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(request.status)}`}>
                          {getStatusIcon(request.status)}
                          <span className="ml-1">{request.status.charAt(0).toUpperCase() + request.status.slice(1)}</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(request.requestDate)}
                        </div>
                        <div>Order #{request.orderId}</div>
                        <div>Request #{request.id}</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedRequest(selectedRequest?.id === request.id ? null : request)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      {selectedRequest?.id === request.id ? 'Hide Details' : 'View Details'}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Request Details (Expandable) */}
              {selectedRequest?.id === request.id && (
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Request Info */}
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-3">Request Details</h4>
                        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                          <div><strong>Reason:</strong> {request.reason}</div>
                          {request.description && (
                            <div><strong>Description:</strong> {request.description}</div>
                          )}
                          <div><strong>Request Date:</strong> {formatDate(request.requestDate)}</div>
                          {request.responseDate && (
                            <div><strong>Response Date:</strong> {formatDate(request.responseDate)}</div>
                          )}
                        </div>
                      </div>

                      {/* Items */}
                      <div>
                        <h4 className="font-medium mb-3">Items</h4>
                        <div className="space-y-2">
                          {request.items.map((item, index) => (
                            <div key={index} className="bg-gray-50 p-3 rounded-lg">
                              <div className="font-medium">{item.productName}</div>
                              <div className="text-sm text-gray-600">
                                Quantity: {item.quantity} | Price: ₹{item.price.toLocaleString()}
                              </div>
                              {item.size && <div className="text-sm text-gray-600">Size: {item.size}</div>}
                              {item.color && <div className="text-sm text-gray-600">Color: {item.color}</div>}
                              {item.exchangeSize && (
                                <div className="text-sm text-blue-600">Exchange Size: {item.exchangeSize}</div>
                              )}
                              {item.exchangeColor && (
                                <div className="text-sm text-blue-600">Exchange Color: {item.exchangeColor}</div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Pickup Address */}
                      {request.pickupAddress && (
                        <div>
                          <h4 className="font-medium mb-3 flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            Pickup Address
                          </h4>
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="font-medium">{request.pickupAddress.fullName}</p>
                            <p className="text-sm text-gray-600">{request.pickupAddress.phone}</p>
                            <p className="text-sm text-gray-600 mt-1">
                              {request.pickupAddress.address}<br />
                              {request.pickupAddress.city}, {request.pickupAddress.state} - {request.pickupAddress.pincode}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Update Request */}
                    <div className="space-y-4">
                      <h4 className="font-medium">Update Request</h4>
                      <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Status</label>
                          <Select
                            value={updateForm.status}
                            onValueChange={(value) => setUpdateForm(prev => ({ ...prev, status: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="approved">Approved</SelectItem>
                              <SelectItem value="rejected">Rejected</SelectItem>
                              <SelectItem value="processing">Processing</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {request.type === 'return' && (
                          <div>
                            <label className="block text-sm font-medium mb-2">Refund Amount (₹)</label>
                            <Input
                              type="number"
                              value={updateForm.refundAmount}
                              onChange={(e) => setUpdateForm(prev => ({ ...prev, refundAmount: e.target.value }))}
                              placeholder="Enter refund amount"
                            />
                          </div>
                        )}

                        <div>
                          <label className="block text-sm font-medium mb-2">Admin Notes</label>
                          <Textarea
                            value={updateForm.adminNotes}
                            onChange={(e) => setUpdateForm(prev => ({ ...prev, adminNotes: e.target.value }))}
                            placeholder="Add notes for the customer..."
                            rows={3}
                          />
                        </div>

                        <Button
                          onClick={handleUpdateRequest}
                          disabled={updateLoading || !updateForm.status}
                          className="w-full"
                        >
                          {updateLoading ? 'Updating...' : 'Update Request'}
                        </Button>
                      </div>

                      {/* Current Admin Notes */}
                      {request.adminNotes && (
                        <div>
                          <h5 className="font-medium mb-2">Previous Admin Notes</h5>
                          <div className="bg-blue-50 p-3 rounded-lg text-sm">
                            {request.adminNotes}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}