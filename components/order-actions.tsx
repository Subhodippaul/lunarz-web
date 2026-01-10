"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  RotateCcw, 
  RefreshCw, 
  X, 
  Package, 
  AlertCircle,
  CheckCircle,
  Clock
} from "lucide-react";
import { OrderManagementService } from "@/lib/order-management-service";
import { useAuth } from "@/lib/auth-context";
import ReturnExchangeModal from "./return-exchange-modal";

interface OrderActionsProps {
  order: any;
  onOrderUpdate?: () => void;
}

export default function OrderActions({ order, onOrderUpdate }: OrderActionsProps) {
  const { state: authState } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'return' | 'exchange' | 'cancel'>('return');
  const [loading, setLoading] = useState(false);

  const orderEligibility = OrderManagementService.getOrderEligibility(order);

  const handleAction = (type: 'return' | 'exchange' | 'cancel') => {
    setModalType(type);
    setShowModal(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'processing':
        return <Package className="w-4 h-4 text-orange-500" />;
      case 'shipped':
        return <Package className="w-4 h-4 text-purple-500" />;
      case 'delivered':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'cancelled':
        return <X className="w-4 h-4 text-red-500" />;
      case 'returned':
        return <RotateCcw className="w-4 h-4 text-gray-500" />;
      case 'exchanged':
        return <RefreshCw className="w-4 h-4 text-blue-500" />;
      case 'return-requested':
        return <RotateCcw className="w-4 h-4 text-orange-500" />;
      case 'exchange-requested':
        return <RefreshCw className="w-4 h-4 text-orange-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'confirmed':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'processing':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'shipped':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'delivered':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'cancelled':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'returned':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      case 'exchanged':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'return-requested':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'exchange-requested':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-4">
      {/* Order Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getStatusIcon(order.status)}
          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
            {order.status === 'return-requested' ? 'Return Requested' :
             order.status === 'exchange-requested' ? 'Exchange Requested' :
             order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </span>
        </div>
        <div className="text-sm text-gray-500">
          Order #{order.id}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        {orderEligibility.canCancel && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleAction('cancel')}
            className="text-red-600 border-red-200 hover:bg-red-50"
            disabled={loading}
          >
            <X className="w-4 h-4 mr-2" />
            Cancel Order
          </Button>
        )}

        {orderEligibility.canReturn && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleAction('return')}
            className="text-orange-600 border-orange-200 hover:bg-orange-50"
            disabled={loading}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Return
          </Button>
        )}

        {orderEligibility.canExchange && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleAction('exchange')}
            className="text-blue-600 border-blue-200 hover:bg-blue-50"
            disabled={loading}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Exchange
          </Button>
        )}
      </div>

      {/* Eligibility Info */}
      {!orderEligibility.canCancel && !orderEligibility.canReturn && !orderEligibility.canExchange && (
        <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
          <AlertCircle className="w-4 h-4 inline mr-2" />
          {order.status === 'return-requested' ? 'Return request is pending review.' :
           order.status === 'exchange-requested' ? 'Exchange request is pending review.' :
           order.status === 'cancelled' ? 'This order has been cancelled.' :
           order.status === 'returned' ? 'This order has been returned.' :
           order.status === 'exchanged' ? 'This order has been exchanged.' :
           'No actions available for this order at the moment.'}
        </div>
      )}

      {/* Return/Exchange Modal */}
      <ReturnExchangeModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        order={order}
        type={modalType}
        onSuccess={() => {
          setShowModal(false);
          onOrderUpdate?.();
        }}
      />
    </div>
  );
}