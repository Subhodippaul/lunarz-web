"use client";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  LogOut,
  Menu,
  Ticket
} from "lucide-react";
import AdminGuard from "@/components/admin/admin-guard";
import { ToastProvider } from "@/components/ui/toast";
import LogoutModal from "@/components/admin/logout-modal";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { state, logout } = useAuth();
  const router = useRouter();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = () => {
    logout();
    router.push("/");
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };

  const navigation = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Products", href: "/admin/products", icon: Package },
    { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Coupons", href: "/admin/coupons", icon: Ticket },
  ];

  return (
    <AdminGuard>
      <ToastProvider>
        <div className="min-h-screen bg-gray-50">
        {/* Sidebar */}
        <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
          <div className="flex h-16 items-center justify-center border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
          </div>
          
          <nav className="mt-8 px-4">
            <ul className="space-y-2">
              {navigation.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors"
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-700">
                    {state.user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">{state.user?.name}</p>
                <p className="text-xs text-gray-500">{state.user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogoutClick}
              className="flex items-center w-full px-4 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Logout
            </button>
          </div>
        </div>

        {/* Main content */}
        <div className="pl-64">
          <main className="py-8 px-8">
            {children}
          </main>
        </div>
        </div>

        {/* Logout Confirmation Modal */}
        <LogoutModal
          isOpen={showLogoutModal}
          onClose={handleLogoutCancel}
          onConfirm={handleLogoutConfirm}
          userName={state.user?.name}
        />
      </ToastProvider>
    </AdminGuard>
  );
}