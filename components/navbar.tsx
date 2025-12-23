"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShoppingCart, User, LogOut } from "lucide-react";
import SideCart from "./side-cart";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { SITE_CONFIG, NAV_LINKS, NAV_TEXT } from "@/lib/constants";

export default function Navbar() {
  const { state } = useCart();
  const { state: authState, logout } = useAuth();
  const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav className="border-b bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link href={NAV_LINKS.home} className="text-2xl font-bold">
          {SITE_CONFIG.name}
        </Link>
        <div className="flex gap-4 items-center">
          <Link href={NAV_LINKS.shop}>{NAV_TEXT.shop}</Link>
          <Link href={NAV_LINKS.cart} className="relative">
            <Button variant="ghost" size="sm">
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Button>
          </Link>
          <SideCart />
          
          {authState.isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link href={NAV_LINKS.profile}>
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
                  {authState.user?.name}
                </Button>
              </Link>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={logout}
                className="text-red-600 hover:text-red-700"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href={NAV_LINKS.login}>
                <Button variant="ghost" size="sm">{NAV_TEXT.login}</Button>
              </Link>
              <Link href={NAV_LINKS.signup}>
                <Button size="sm">Sign Up</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}