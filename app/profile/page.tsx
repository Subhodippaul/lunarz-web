"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Package, 
  MapPin, 
  CreditCard, 
  Settings,
  Plus,
  Edit,
  Trash2,
  Eye,
  X
} from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { PROFILE, CURRENCY } from "@/lib/constants";
import { 
  mockOrders, 
  mockAddresses, 
  mockPaymentMethods, 
  mockUserProfile,
  Order,
  Address,
  PaymentMethod
} from "@/lib/profile-data";
import AddressModal from "@/components/address-modal";
import PaymentModal from "@/components/payment-modal";

type TabType = "orders" | "addresses" | "payments" | "settings";

export default function ProfilePage() {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<TabType>("orders");
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [addresses, setAddresses] = useState<Address[]>(mockAddresses);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(mockPaymentMethods);
  const [userProfile, setUserProfile] = useState(mockUserProfile);
  
  // Modal states
  const [addressModal, setAddressModal] = useState<{
    isOpen: boolean;
    mode: "add" | "edit";
    address?: Address;
  }>({ isOpen: false, mode: "add" });
  
  const [paymentModal, setPaymentModal] = useState<{
    isOpen: boolean;
    mode: "add" | "edit";
    card?: PaymentMethod;
  }>({ isOpen: false, mode: "add" });

  const handleCancelOrder = (orderId: string) => {
    setOrders(orders.map(order => 
      order.id === orderId 
        ? { ...order, status: "cancelled" as const }
        : order
    ));
    addToast({
      title: "Order cancelled",
      description: "Your order has been cancelled successfully.",
      variant: "success",
    });
  };

  const handleDeleteAddress = (addressId: string) => {
    setAddresses(addresses.filter(addr => addr.id !== addressId));
    addToast({
      title: "Address deleted",
      description: "The address has been removed from your account.",
      variant: "success",
    });
  };

  const handleSetDefaultAddress = (addressId: string) => {
    setAddresses(addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === addressId
    })));
    addToast({
      title: "Default address updated",
      description: "Your default shipping address has been changed.",
      variant: "success",
    });
  };

  const handleDeleteCard = (cardId: string) => {
    setPaymentMethods(paymentMethods.filter(card => card.id !== cardId));
    addToast({
      title: "Payment method removed",
      description: "The card has been removed from your account.",
      variant: "success",
    });
  };

  const handleSaveAddress = (addressData: Omit<Address, "id">) => {
    if (addressModal.mode === "add") {
      const newAddress: Address = {
        ...addressData,
        id: `addr${Date.now()}`,
      };
      setAddresses([...addresses, newAddress]);
      addToast({
        title: "Address added",
        description: "New address has been saved to your account.",
        variant: "success",
      });
    } else if (addressModal.address) {
      setAddresses(addresses.map(addr => 
        addr.id === addressModal.address!.id 
          ? { ...addressData, id: addressModal.address!.id }
          : addr
      ));
      addToast({
        title: "Address updated",
        description: "Your address has been updated successfully.",
        variant: "success",
      });
    }
  };

  const handleSaveCard = (cardData: Omit<PaymentMethod, "id">) => {
    if (paymentModal.mode === "add") {
      const newCard: PaymentMethod = {
        ...cardData,
        id: `card${Date.now()}`,
      };
      setPaymentMethods([...paymentMethods, newCard]);
      addToast({
        title: "Payment method added",
        description: "New card has been saved to your account.",
        variant: "success",
      });
    } else if (paymentModal.card) {
      setPaymentMethods(paymentMethods.map(card => 
        card.id === paymentModal.card!.id 
          ? { ...cardData, id: paymentModal.card!.id }
          : card
      ));
      addToast({
        title: "Payment method updated",
        description: "Your card details have been updated successfully.",
        variant: "success",
      });
    }
  };

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "confirmed": return "bg-blue-100 text-blue-800";
      case "shipped": return "bg-purple-100 text-purple-800";
      case "delivered": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: Order["status"]) => {
    switch (status) {
      case "pending": return PROFILE.pending;
      case "confirmed": return PROFILE.confirmed;
      case "shipped": return PROFILE.shipped;
      case "delivered": return PROFILE.delivered;
      case "cancelled": return PROFILE.cancelled;
      default: return status;
    }
  };

  const tabs = [
    { id: "orders" as TabType, label: PROFILE.myOrders, icon: Package },
    { id: "addresses" as TabType, label: PROFILE.addresses, icon: MapPin },
    { id: "payments" as TabType, label: PROFILE.paymentMethods, icon: CreditCard },
    { id: "settings" as TabType, label: PROFILE.accountSettings, icon: Settings },
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
          <User className="w-8 h-8 text-gray-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">{PROFILE.pageTitle}</h1>
          <p className="text-gray-600">{userProfile.fullName}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        activeTab === tab.id
                          ? "bg-red-50 text-red-600 border border-red-200"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {activeTab === "orders" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">{PROFILE.myOrders}</h2>
              </div>
              
              <div className="space-y-4">
                {orders.map((order) => (
                  <Card key={order.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold">
                            {PROFILE.orderNumber}{order.orderNumber}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {PROFILE.orderDate}: {new Date(order.date).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge className={getStatusColor(order.status)}>
                          {getStatusText(order.status)}
                        </Badge>
                      </div>

                      <div className="space-y-2 mb-4">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span>
                              {item.name} ({item.size}
                              {item.variant && `, ${item.variant}`}) × {item.quantity}
                            </span>
                            <span>{CURRENCY.symbol}{(item.price * item.quantity).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="font-semibold">
                          {PROFILE.orderTotal}: {CURRENCY.symbol}{order.total.toLocaleString()}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-2" />
                            {PROFILE.viewDetails}
                          </Button>
                          {order.status === "pending" && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleCancelOrder(order.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <X className="w-4 h-4 mr-2" />
                              {PROFILE.cancelOrder}
                            </Button>
                          )}
                          {(order.status === "shipped" || order.status === "delivered") && (
                            <Button variant="outline" size="sm">
                              {PROFILE.trackOrder}
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === "addresses" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">{PROFILE.addresses}</h2>
                <Button onClick={() => setAddressModal({ isOpen: true, mode: "add" })}>
                  <Plus className="w-4 h-4 mr-2" />
                  {PROFILE.addNewAddress}
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map((address) => (
                  <Card key={address.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold capitalize">{address.type}</h3>
                            {address.isDefault && (
                              <Badge variant="secondary">{PROFILE.defaultAddress}</Badge>
                            )}
                          </div>
                          <p className="font-medium">{address.fullName}</p>
                          <p className="text-sm text-gray-600">{address.phone}</p>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteAddress(address.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="text-sm text-gray-600 mb-4">
                        <p>{address.addressLine1}</p>
                        {address.addressLine2 && <p>{address.addressLine2}</p>}
                        <p>{address.city}, {address.state} {address.pincode}</p>
                        <p>{address.country}</p>
                      </div>

                      {!address.isDefault && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                          onClick={() => handleSetDefaultAddress(address.id)}
                        >
                          {PROFILE.setAsDefault}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === "payments" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">{PROFILE.paymentMethods}</h2>
                <Button onClick={() => setPaymentModal({ isOpen: true, mode: "add" })}>
                  <Plus className="w-4 h-4 mr-2" />
                  {PROFILE.addNewCard}
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {paymentMethods.map((card) => (
                  <Card key={card.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold capitalize">{card.type} Card</h3>
                            {card.isDefault && (
                              <Badge variant="secondary">Default</Badge>
                            )}
                          </div>
                          <p className="text-lg font-mono">
                            {PROFILE.cardEnding}{card.cardNumber}
                          </p>
                          <p className="text-sm text-gray-600">{card.cardholderName}</p>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteCard(card.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600">
                        {PROFILE.expiresOn} {card.expiryMonth}/{card.expiryYear}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold">{PROFILE.accountSettings}</h2>
              
              <Card>
                <CardHeader>
                  <CardTitle>{PROFILE.personalInfo}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {PROFILE.fullName}
                      </label>
                      <input
                        type="text"
                        value={userProfile.fullName}
                        onChange={(e) => setUserProfile({...userProfile, fullName: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {PROFILE.emailAddress}
                      </label>
                      <input
                        type="email"
                        value={userProfile.email}
                        onChange={(e) => setUserProfile({...userProfile, email: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {PROFILE.phoneNumber}
                      </label>
                      <input
                        type="tel"
                        value={userProfile.phone}
                        onChange={(e) => setUserProfile({...userProfile, phone: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                  <Button onClick={() => addToast({
                    title: "Profile updated",
                    description: "Your profile information has been saved successfully.",
                    variant: "success",
                  })}>
                    {PROFILE.update}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{PROFILE.changePassword}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {PROFILE.currentPassword}
                    </label>
                    <input
                      type="password"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {PROFILE.newPassword}
                    </label>
                    <input
                      type="password"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {PROFILE.confirmPassword}
                    </label>
                    <input
                      type="password"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <Button>
                    {PROFILE.update}
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <AddressModal
        isOpen={addressModal.isOpen}
        onClose={() => setAddressModal({ isOpen: false, mode: "add" })}
        onSave={handleSaveAddress}
        address={addressModal.address}
        mode={addressModal.mode}
      />

      <PaymentModal
        isOpen={paymentModal.isOpen}
        onClose={() => setPaymentModal({ isOpen: false, mode: "add" })}
        onSave={handleSaveCard}
        card={paymentModal.card}
        mode={paymentModal.mode}
      />
    </div>
  );
}