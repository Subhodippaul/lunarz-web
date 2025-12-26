"use client";
import { useState, useEffect } from "react";
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
import { useAuth } from "@/lib/auth-context";
import { PROFILE, CURRENCY } from "@/lib/constants";
import { 
  Order,
  Address,
  PaymentMethod
} from "@/lib/profile-data";
import { 
  AddressService,
  PaymentMethodService,
  UserService
} from "@/lib/firebase-services";
import { OrderService } from "@/lib/order-services";
import AddressModal from "@/components/address-modal";
import PaymentModal from "@/components/payment-modal";
import OrderTracking from "@/components/order-tracking";

type TabType = "orders" | "addresses" | "payments" | "settings";

export default function ProfilePage() {
  const { addToast } = useToast();
  const { state: authState } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("orders");
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  
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

  // Load data when user is authenticated
  useEffect(() => {
    if (authState.isAuthenticated && authState.user) {
      loadUserData();
    }
  }, [authState.isAuthenticated, authState.user]);

  const loadUserData = async () => {
    if (!authState.user) return;
    
    setLoading(true);
    try {
      const [userAddresses, userPaymentMethods] = await Promise.all([
        AddressService.getUserAddresses(authState.user.id),
        PaymentMethodService.getUserPaymentMethods(authState.user.id),
      ]);

      setAddresses(userAddresses);
      setPaymentMethods(userPaymentMethods);
    } catch (error) {
      console.error("Error loading user data:", error);
      addToast({
        title: "Error loading data",
        description: "Failed to load your profile data. Please try again.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    try {
      await AddressService.deleteAddress(addressId);
      setAddresses(addresses.filter(addr => addr.id !== addressId));
      addToast({
        title: "Address deleted",
        description: "The address has been removed from your account.",
        type: "success",
      });
    } catch (error) {
      addToast({
        title: "Error",
        description: "Failed to delete address. Please try again.",
        type: "error",
      });
    }
  };

  const handleSetDefaultAddress = async (addressId: string) => {
    if (!authState.user) return;
    
    try {
      await AddressService.setDefaultAddress(authState.user.id, addressId);
      setAddresses(addresses.map(addr => ({
        ...addr,
        isDefault: addr.id === addressId
      })));
      addToast({
        title: "Default address updated",
        description: "Your default shipping address has been changed.",
        type: "success",
      });
    } catch (error) {
      addToast({
        title: "Error",
        description: "Failed to update default address. Please try again.",
        type: "error",
      });
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    try {
      await PaymentMethodService.deletePaymentMethod(cardId);
      setPaymentMethods(paymentMethods.filter(card => card.id !== cardId));
      addToast({
        title: "Payment method removed",
        description: "The card has been removed from your account.",
        type: "success",
      });
    } catch (error) {
      addToast({
        title: "Error",
        description: "Failed to delete payment method. Please try again.",
        type: "error",
      });
    }
  };

  const handleSaveAddress = async (addressData: Omit<Address, "id">) => {
    if (!authState.user) return;
    
    try {
      if (addressModal.mode === "add") {
        const newAddressId = await AddressService.addAddress(authState.user.id, addressData);
        const newAddress: Address = {
          ...addressData,
          id: newAddressId,
        };
        setAddresses([newAddress, ...addresses]);
        addToast({
          title: "Address added",
          description: "New address has been saved to your account.",
          type: "success",
        });
      } else if (addressModal.address) {
        await AddressService.updateAddress(addressModal.address.id, addressData);
        setAddresses(addresses.map(addr => 
          addr.id === addressModal.address!.id 
            ? { ...addressData, id: addressModal.address!.id }
            : addr
        ));
        addToast({
          title: "Address updated",
          description: "Your address has been updated successfully.",
          type: "success",
        });
      }
    } catch (error) {
      addToast({
        title: "Error",
        description: "Failed to save address. Please try again.",
        type: "error",
      });
    }
  };

  const handleSaveCard = async (cardData: Omit<PaymentMethod, "id">) => {
    if (!authState.user) return;
    
    try {
      if (paymentModal.mode === "add") {
        const newCardId = await PaymentMethodService.addPaymentMethod(authState.user.id, cardData);
        const newCard: PaymentMethod = {
          ...cardData,
          id: newCardId,
        };
        setPaymentMethods([newCard, ...paymentMethods]);
        addToast({
          title: "Payment method added",
          description: "New card has been saved to your account.",
          type: "success",
        });
      } else if (paymentModal.card) {
        await PaymentMethodService.updatePaymentMethod(paymentModal.card.id, cardData);
        setPaymentMethods(paymentMethods.map(card => 
          card.id === paymentModal.card!.id 
            ? { ...cardData, id: paymentModal.card!.id }
            : card
        ));
        addToast({
          title: "Payment method updated",
          description: "Your card details have been updated successfully.",
          type: "success",
        });
      }
    } catch (error) {
      addToast({
        title: "Error",
        description: "Failed to save payment method. Please try again.",
        type: "error",
      });
    }
  };

  const handleUpdateProfile = async (updates: { name?: string; email?: string; phone?: string }) => {
    if (!authState.user) return;
    
    try {
      await UserService.updateUserProfile(authState.user.id, updates);
      addToast({
        title: "Profile updated",
        description: "Your profile information has been saved successfully.",
        type: "success",
      });
    } catch (error) {
      addToast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        type: "error",
      });
    }
  };

  const tabs = [
    { id: "orders" as TabType, label: PROFILE.myOrders, icon: Package },
    { id: "addresses" as TabType, label: PROFILE.addresses, icon: MapPin },
    { id: "payments" as TabType, label: PROFILE.paymentMethods, icon: CreditCard },
    { id: "settings" as TabType, label: PROFILE.accountSettings, icon: Settings },
  ];

  // Show loading state
  if (!authState.isAuthenticated) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p>Please login to view your profile.</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p>Loading your profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
          {authState.user?.avatar ? (
            <img 
              src={authState.user.avatar} 
              alt={authState.user.name}
              className="w-16 h-16 rounded-full"
            />
          ) : (
            <User className="w-8 h-8 text-gray-600" />
          )}
        </div>
        <div>
          <h1 className="text-3xl font-bold">{PROFILE.pageTitle}</h1>
          <p className="text-gray-600">{authState.user?.name}</p>
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
              
              <OrderTracking showViewAll={false} />
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
                        defaultValue={authState.user?.name}
                        id="profileName"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {PROFILE.emailAddress}
                      </label>
                      <input
                        type="email"
                        defaultValue={authState.user?.email}
                        id="profileEmail"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                  <Button onClick={() => {
                    const nameInput = document.getElementById('profileName') as HTMLInputElement;
                    const emailInput = document.getElementById('profileEmail') as HTMLInputElement;
                    
                    handleUpdateProfile({
                      name: nameInput.value,
                      email: emailInput.value,
                    });
                  }}>
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