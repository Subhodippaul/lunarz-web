"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CenteredLoader } from "@/components/ui/loader";
import { 
  User, 
  Package, 
  Settings,
  Plus,
  Edit,
  Trash2,
  RefreshCw
} from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/lib/auth-context";
import { PROFILE } from "@/lib/constants";
import { 
  Address,
  PaymentMethod
} from "@/lib/profile-data";
import { 
  AddressService,
  PaymentMethodService
} from "@/lib/supabase-services";
import { supabase } from "@/lib/supabase";
import AddressModal from "@/components/address-modal";
import PaymentModal from "@/components/payment-modal";
import OrdersWithActions from "@/components/orders-with-actions";
import ConfirmationDialog from "@/components/ui/confirmation-dialog";
import SuccessNotification from "@/components/ui/success-notification";

type TabType = "orders" | "addresses" | "payments" | "settings";

export default function ProfilePage() {
  const { addToast } = useToast();
  const { state: authState, refreshUser } = useAuth();
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

  // Profile update states
  const [profileData, setProfileData] = useState({
    name: '',
    email: ''
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Dialog states
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    type: 'profile' | 'password';
    title: string;
    message: string;
    loading: boolean;
  }>({
    isOpen: false,
    type: 'profile',
    title: '',
    message: '',
    loading: false
  });

  // Success notification state
  const [successNotification, setSuccessNotification] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
  }>({
    isOpen: false,
    title: '',
    message: ''
  });

  // Load data when user is authenticated
  useEffect(() => {
    if (authState.isAuthenticated && authState.user) {
      loadUserData();
      // Initialize profile data
      setProfileData({
        name: authState.user.name || '',
        email: authState.user.email || ''
      });
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

  const handleUpdateProfile = async () => {
    if (!authState.user) return;
    
    // Validation
    if (!profileData.name.trim()) {
      addToast({
        title: "Validation Error",
        description: "Name is required.",
        type: "error",
      });
      return;
    }

    if (!profileData.email.trim()) {
      addToast({
        title: "Validation Error", 
        description: "Email is required.",
        type: "error",
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(profileData.email)) {
      addToast({
        title: "Validation Error",
        description: "Please enter a valid email address.",
        type: "error",
      });
      return;
    }

    // Show confirmation dialog
    setConfirmDialog({
      isOpen: true,
      type: 'profile',
      title: 'Update Profile',
      message: 'Are you sure you want to update your profile information?',
      loading: false
    });
  };

  const handleChangePassword = async () => {
    // Validation
    if (!passwordData.currentPassword) {
      addToast({
        title: "Validation Error",
        description: "Current password is required.",
        type: "error",
      });
      return;
    }

    if (!passwordData.newPassword) {
      addToast({
        title: "Validation Error",
        description: "New password is required.",
        type: "error",
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      addToast({
        title: "Validation Error",
        description: "New password must be at least 6 characters long.",
        type: "error",
      });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      addToast({
        title: "Validation Error",
        description: "New password and confirm password do not match.",
        type: "error",
      });
      return;
    }

    // Show confirmation dialog
    setConfirmDialog({
      isOpen: true,
      type: 'password',
      title: 'Change Password',
      message: 'Are you sure you want to change your password? You will need to use the new password for future logins.',
      loading: false
    });
  };

  const handleConfirmAction = async () => {
    setConfirmDialog(prev => ({ ...prev, loading: true }));

    try {
      if (confirmDialog.type === 'profile') {
        // Update profile
        const response = await fetch('/api/profile/update', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: authState.user?.id,
            name: profileData.name,
            email: profileData.email
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to update profile');
        }

        // Refresh user data in auth context
        await refreshUser();

        // Show success notification
        setSuccessNotification({
          isOpen: true,
          title: 'Profile Updated',
          message: 'Your profile information has been updated successfully.'
        });

      } else if (confirmDialog.type === 'password') {
        // Handle password change with Supabase Auth
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || !user.email) {
          throw new Error('User not authenticated');
        }

        // Re-authenticate user with current password
        const credential = EmailAuthProvider.credential(user.email, passwordData.currentPassword);
        await reauthenticateWithCredential(user, credential);

        // Update password
        await updatePassword(user, passwordData.newPassword);

        // Clear password fields
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });

        // Show success notification
        setSuccessNotification({
          isOpen: true,
          title: 'Password Changed',
          message: 'Your password has been changed successfully.'
        });
      }

    } catch (error: any) {
      let errorMessage = error.message || "An error occurred. Please try again.";
      
      // Handle Supabase Auth errors
      if (error.message?.includes('Invalid login credentials')) {
        errorMessage = 'Current password is incorrect';
      } else if (error.message?.includes('Password')) {
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'New password is too weak';
      } else if (error.code === 'auth/requires-recent-login') {
        errorMessage = 'Please log out and log back in before changing your password';
      }
      
      addToast({
        title: "Error",
        description: errorMessage,
        type: "error",
      });
    } finally {
      setConfirmDialog(prev => ({ ...prev, isOpen: false, loading: false }));
    }
  };

  const tabs = [
    { id: "orders" as TabType, label: PROFILE.myOrders, icon: Package },
    // { id: "addresses" as TabType, label: PROFILE.addresses, icon: MapPin },
    // { id: "payments" as TabType, label: PROFILE.paymentMethods, icon: CreditCard },
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
      <CenteredLoader text="Loading your profile..." size="md" />
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
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.location.reload()}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800">
                  <strong>Order Management:</strong> You can return, exchange, or cancel your orders directly from this section. Actions available depend on order status and delivery date.
                </p>
                <div className="mt-2 text-sm text-blue-700">
                  <p>• <strong>Cancel:</strong> Available for pending/processing orders</p>
                  <p>• <strong>Return:</strong> Available within 30 days of delivery</p>
                  <p>• <strong>Exchange:</strong> Available within 15 days of delivery</p>
                </div>
              </div>
              
              {/* Orders List with Actions */}
              <OrdersWithActions />
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
                        {PROFILE.fullName} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {PROFILE.emailAddress} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        placeholder="Enter your email address"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button 
                      onClick={handleUpdateProfile}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {PROFILE.update} Profile
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setProfileData({
                          name: authState.user?.name || '',
                          email: authState.user?.email || ''
                        });
                      }}
                    >
                      Reset
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{PROFILE.changePassword}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {PROFILE.currentPassword} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="Enter your current password"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {PROFILE.newPassword} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="Enter your new password (min 6 characters)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {PROFILE.confirmPassword} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="Confirm your new password"
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button 
                      onClick={handleChangePassword}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Change Password
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setPasswordData({
                          currentPassword: '',
                          newPassword: '',
                          confirmPassword: ''
                        });
                      }}
                    >
                      Clear
                    </Button>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                    <h4 className="font-medium text-blue-900 mb-2">Password Requirements:</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• At least 6 characters long</li>
                      <li>• Should be different from your current password</li>
                      <li>• Use a combination of letters, numbers, and symbols for better security</li>
                    </ul>
                  </div>
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

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        onConfirm={handleConfirmAction}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={confirmDialog.type === 'profile' ? 'Update Profile' : 'Change Password'}
        type="info"
        loading={confirmDialog.loading}
      />

      {/* Success Notification */}
      <SuccessNotification
        isOpen={successNotification.isOpen}
        onClose={() => setSuccessNotification(prev => ({ ...prev, isOpen: false }))}
        title={successNotification.title}
        message={successNotification.message}
      />
    </div>
  );
}