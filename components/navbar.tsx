"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ShoppingCart, User, LogOut, Home, Grid3X3, Shirt } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { SITE_CONFIG, NAV_LINKS, NAV_TEXT } from "@/lib/constants";
import LogoutModal from "@/components/admin/logout-modal";

export default function Navbar() {
  const { state } = useCart();
  const { state: authState, logout } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [uniqueId, setUniqueId] = useState<string | null>(null);
  const pathname = usePathname();
  const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);

  // Get unique ID from localStorage on client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const updateUniqueId = () => {
        const storedUniqueId = localStorage.getItem('uniqueId');
        setUniqueId(storedUniqueId);
      };

      // Initial check
      updateUniqueId();

      // Listen for storage events (when localStorage changes)
      window.addEventListener('storage', updateUniqueId);

      // Listen for custom uniqueIdUpdated event
      window.addEventListener('uniqueIdUpdated', updateUniqueId);

      // Also check periodically in case events don't fire
      const interval = setInterval(updateUniqueId, 1000);

      return () => {
        window.removeEventListener('storage', updateUniqueId);
        window.removeEventListener('uniqueIdUpdated', updateUniqueId);
        clearInterval(interval);
      };
    }
  }, []);

  const handleLogoutClick = () => {
    console.log("Logout button clicked"); // Debug log
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = () => {
    console.log("Logout confirmed"); // Debug log
    logout();
    setShowLogoutModal(false);
  };

  const handleLogoutCancel = () => {
    console.log("Logout cancelled"); // Debug log
    setShowLogoutModal(false);
  };

  // Helper function to check if a menu item is active
  const isActiveRoute = (route: string) => {
    if (route === NAV_LINKS.home) {
      return pathname === route;
    }
    return pathname.startsWith(route);
  };

  // Helper function to get menu item classes for desktop
  const getMenuItemClasses = (route: string) => {
    const baseClasses = "text-gray-700 hover:text-gray-900 transition-colors";
    const activeClasses = "font-bold text-gray-900";
    return isActiveRoute(route) ? `${baseClasses} ${activeClasses}` : baseClasses;
  };

  // Helper function to get mobile nav item classes
  const getMobileNavClasses = (route: string) => {
    const baseClasses = "flex flex-col items-center justify-center py-2 px-1 text-xs transition-colors";
    const activeClasses = "text-blue-600 font-semibold";
    const inactiveClasses = "text-gray-600 hover:text-gray-900";
    return isActiveRoute(route) ? `${baseClasses} ${activeClasses}` : `${baseClasses} ${inactiveClasses}`;
  };

  return (
    <>
      {/* Top Navigation Bar */}
      <nav className="border-b bg-white sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          {/* Logo */}
          <Link href={NAV_LINKS.home} className="flex items-center">
            {!logoError ? (
              <img 
                src="/logo.png" 
                alt={SITE_CONFIG.name || "Logo"} 
                className="h-5 w-auto"
                onError={() => setLogoError(true)}
              />
            ) : (
              <span className="text-2xl font-bold">
                {SITE_CONFIG.name || "LUNARZ"}
              </span>
            )}
          </Link>

          {/* Desktop Navigation Links - Hidden on mobile */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href={NAV_LINKS.home} 
              className={getMenuItemClasses(NAV_LINKS.home)}
            >
              Home
            </Link>
            <Link 
              href={NAV_LINKS.shop} 
              className={getMenuItemClasses(NAV_LINKS.shop)}
            >
              {NAV_TEXT.shop}
            </Link>
            <Link 
              href={NAV_LINKS.customTshirt} 
              className={getMenuItemClasses(NAV_LINKS.customTshirt)}
            >
              {NAV_TEXT.customTshirt}
            </Link>
            <Link 
              href="/about" 
              className={getMenuItemClasses("/about")}
            >
              About Us
            </Link>
            <Link 
              href="/categories" 
              className={getMenuItemClasses("/categories")}
            >
              Categories
            </Link>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2">
            {/* Admin Button (if admin) */}
            {authState.isAuthenticated && authState.user?.isAdmin && (
              <Link href={uniqueId ? `/admin?uid=${uniqueId}&isAuthenticated=true` : "/admin"}
                    onClick={() => console.log('Admin link clicked. UniqueId:', uniqueId, 'URL:', uniqueId ? `/admin?uid=${uniqueId}&isAuthenticated=true` : "/admin")}>
                <Button size="sm" className="bg-purple-700 text-white hover:bg-black hover:text-white">
                  Admin
                </Button>
              </Link>
            )}

            {/* Desktop Cart - Hidden on mobile */}
            <Link href={NAV_LINKS.cart} className="relative hidden md:block">
              <Button variant="ghost" size="sm">
                <ShoppingCart className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Button>
            </Link>

            {/* Authentication Section */}
            {authState.isAuthenticated ? (
              <div className="flex items-center space-x-2">
                {/* Desktop Profile - Hidden on mobile */}
                <Link href={NAV_LINKS.profile} className="hidden md:block">
                  <Button variant="ghost" size="sm" className="flex items-center gap-2">
                    {authState.user?.avatar ? (
                      <img 
                        src={authState.user.avatar} 
                        alt={authState.user.name}
                        className="w-6 h-6 rounded-full"
                      />
                    ) : (
                      <User className="w-4 h-4" />
                    )}
                    <span className="hidden lg:inline">{authState.user?.name}</span>
                  </Button>
                </Link>

                {/* Logout */}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleLogoutClick}
                  className="text-red-600 hover:text-red-700"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href={uniqueId ? `${NAV_LINKS.login}?uid=${uniqueId}` : NAV_LINKS.login} 
                      onClick={() => console.log('Login link clicked. UniqueId:', uniqueId, 'URL:', uniqueId ? `${NAV_LINKS.login}?uid=${uniqueId}` : NAV_LINKS.login)}>
                  <Button variant="outline" size="sm">{NAV_TEXT.login}</Button>
                </Link>
                <Link href={NAV_LINKS.signup}>
                  <Button size="sm">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Bottom Navigation Bar - Mobile Only */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="grid grid-cols-4 h-16">
          {/* Home */}
          <Link href={NAV_LINKS.home} className={getMobileNavClasses(NAV_LINKS.home)}>
            <Home className="w-6 h-6 mb-1" />
            <span>Home</span>
          </Link>

          {/* Custom T-Shirt */}
          <Link href={NAV_LINKS.customTshirt} className={getMobileNavClasses(NAV_LINKS.customTshirt)}>
            <Shirt className="w-6 h-6 mb-1" />
            <span>Custom</span>
          </Link>

          {/* Cart */}
          <Link href={NAV_LINKS.cart} className={`${getMobileNavClasses(NAV_LINKS.cart)} relative`}>
            <div className="relative">
              <ShoppingCart className="w-6 h-6 mb-1" />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </div>
            <span>Cart</span>
          </Link>

          {/* Profile */}
          <Link href={NAV_LINKS.profile} className={getMobileNavClasses(NAV_LINKS.profile)}>
            {authState.user?.avatar ? (
              <img 
                src={authState.user.avatar} 
                alt={authState.user.name}
                className="w-6 h-6 rounded-full mb-1"
              />
            ) : (
              <User className="w-6 h-6 mb-1" />
            )}
            <span>Profile</span>
          </Link>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={handleLogoutCancel}
        onConfirm={handleLogoutConfirm}
        userName={authState.user?.name}
      />
    </>
  );
}