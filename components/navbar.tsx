"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ShoppingCart, User, LogOut, Home, Shirt, Search, ChevronDown, Grid3X3, Palette } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { SITE_CONFIG, NAV_LINKS, NAV_TEXT } from "@/lib/constants";
import LogoutModal from "@/components/admin/logout-modal";
import SearchBar from "@/components/search-bar";

export default function Navbar() {
  const { state } = useCart();
  const { state: authState, logout } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [uniqueId, setUniqueId] = useState<string | null>(null);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
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
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link href={NAV_LINKS.home} className="flex items-center shrink-0">
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

            {/* Center Section - Navigation + Search */}
            <div className="hidden md:flex items-center space-x-6 flex-1 justify-center max-w-xl ml-60">
              {/* Navigation Links */}
              <div className="flex items-center space-x-6">
                <Link 
                  href={NAV_LINKS.home} 
                  className={getMenuItemClasses(NAV_LINKS.home)}
                >
                  Home
                </Link>
                
                {/* Shop Dropdown */}
                <div className="relative group">
                  <button 
                    className={`${getMenuItemClasses(NAV_LINKS.shop)} flex items-center gap-1`}
                  >
                    Shop
                    <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />
                  </button>
                  
                  {/* Dropdown Menu */}
                  <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <Link 
                      href={NAV_LINKS.shop}
                      className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                    >
                      <Grid3X3 className="w-4 h-4" />
                      <div>
                        <div className="font-medium">All Products</div>
                        <div className="text-sm text-gray-500">Browse our complete collection</div>
                      </div>
                    </Link>
                    {/* <Link 
                      href={NAV_LINKS.customTshirt}
                      className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                    >
                      <Palette className="w-4 h-4" />
                      <div>
                        <div className="font-medium">Custom T-Shirts</div>
                        <div className="text-sm text-gray-500">Design your own unique style</div>
                      </div>
                    </Link> */}
                  </div>
                </div>
                
                <Link 
                  href="/about" 
                  className={getMenuItemClasses("/about")}
                >
                  About Us
                </Link>
              </div>

              {/* Search Bar */}
              <div className="ml-6">
                <SearchBar />
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-2 shrink-0">
              {/* Mobile Search Button */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setShowMobileSearch(!showMobileSearch)}
              >
                <Search className="w-5 h-5" />
              </Button>

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
                  {/* Desktop Profile Dropdown */}
                  <div className="hidden md:block relative group">
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
                      <ChevronDown className="w-3 h-3 transition-transform group-hover:rotate-180" />
                    </Button>
                    
                    {/* Profile Dropdown Menu */}
                    <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                      <Link 
                        href={NAV_LINKS.profile}
                        className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                      >
                        <User className="w-4 h-4" />
                        <span>My Profile</span>
                      </Link>
                      <div className="border-t border-gray-200 my-1"></div>
                      <button
                        onClick={handleLogoutClick}
                        className="flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors w-full text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>

                  {/* Mobile Logout Button */}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleLogoutClick}
                    className="md:hidden text-red-600 hover:text-red-700"
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
                  <Link href={uniqueId ? `${NAV_LINKS.signup}?uid=${uniqueId}` : NAV_LINKS.signup}>
                    <Button size="sm">Sign Up</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {showMobileSearch && (
          <div className="md:hidden border-t bg-gray-50 px-6 py-4">
            <SearchBar isMobile />
          </div>
        )}
      </nav>

      {/* Bottom Navigation Bar - Mobile Only */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="grid grid-cols-5 h-16">
          {/* Home */}
          <Link href={NAV_LINKS.home} className={getMobileNavClasses(NAV_LINKS.home)}>
            <Home className="w-6 h-6 mb-1" />
            <span>Home</span>
          </Link>

          {/* Shop */}
          <Link href={NAV_LINKS.shop} className={getMobileNavClasses(NAV_LINKS.shop)}>
            <Grid3X3 className="w-6 h-6 mb-1" />
            <span>Shop</span>
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