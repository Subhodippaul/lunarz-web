"use client";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  LogOut,
  Ticket,
  Settings,
  ArrowLeft,
  Menu,
  X,
  BarChart3,
  MessageCircle,
  Star,
  FileText,
  RotateCcw
} from "lucide-react";
import AdminGuard from "@/components/admin/admin-guard";
import { ToastProvider } from "@/components/ui/toast";
import LogoutModal from "@/components/admin/logout-modal";

// Separate component for the layout content that uses useSearchParams
function AdminLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const { state, logout } = useAuth();
  const router = useRouter();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [uniqueId, setUniqueId] = useState<string | null>(null);

  // Get unique ID from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUniqueId = localStorage.getItem('uniqueId');
      setUniqueId(storedUniqueId);
    }
  }, []);

  // Generate admin URL with required parameters
  const generateAdminUrl = (path: string) => {
    if (uniqueId && state.isAuthenticated) {
      return `${path}?uid=${uniqueId}&isAuthenticated=true`;
    }
    return path;
  };

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
    { name: "Inventory", href: "/admin/inventory", icon: BarChart3 },
    { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
    { name: "Returns", href: "/admin/returns", icon: RotateCcw },
    { name: "Invoices", href: "/admin/invoices", icon: FileText },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Reviews", href: "/admin/reviews", icon: Star },
    { name: "Support", href: "/admin/support", icon: MessageCircle },
    { name: "Coupons", href: "/admin/coupons", icon: Ticket },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <AdminGuard>
      <ToastProvider>
        <div className="min-h-screen bg-gray-50">
          {/* Mobile Header */}
          <div className="lg:hidden bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
            <div className="flex items-center justify-between px-4 py-3">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <Menu className="h-6 w-6" />
              </button>

              {/* Logo */}
              <Link href="/" className="text-xl font-bold text-blue-600">
                Lunarz Admin
              </Link>

              {/* Back to Website Button */}
              <Link
                href="/"
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back</span>
              </Link>
            </div>
          </div>

          {/* Mobile Sidebar Overlay */}
          {sidebarOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)} />
              <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl">
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  <Link href="/" className="text-lg font-bold text-blue-600">
                    Lunarz Admin
                  </Link>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                <nav className="mt-4 px-4">
                  <ul className="space-y-2">
                    {navigation.map((item) => (
                      <li key={item.name}>
                        <Link
                          href={generateAdminUrl(item.href)}
                          onClick={() => setSidebarOpen(false)}
                          className="flex items-center px-4 py-3 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors"
                        >
                          <item.icon className="mr-3 h-5 w-5" />
                          {item.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>

                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
                  <Link
                    href="/"
                    className="flex items-center gap-2 mb-4 px-4 py-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Website
                  </Link>
                  
                  <div className="flex items-center mb-4">
                    <div className="shrink-0">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-700">
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
            </div>
          )}

          {/* Desktop Sidebar - Always Visible */}
          <div className="fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg lg:block hidden">
            {/* Logo */}
            <div className="flex flex-col h-20 items-center justify-center border-b border-gray-200 px-4">
              <Link href="/" className="text-xl font-bold text-blue-600 mb-1">
                Lunarz Admin
              </Link>
            </div>
            
            <nav className="flex-1 px-4 overflow-y-auto">
              <ul className="space-y-2">
                {navigation.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={generateAdminUrl(item.href)}
                      className="flex items-center px-4 py-3 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors"
                    >
                      <item.icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Back to Website Button - Desktop */}
            <div className="px-4 py-3 border-t bg-white">
    <Link
      href="/"
      className="flex items-center gap-2 w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
    >
      <ArrowLeft className="h-4 w-4" />
      Back to Website
    </Link>
  </div>

            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
              <div className="flex items-center mb-4">
                <div className="shrink-0">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-700">
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
          <div className="lg:pl-64">
            <main className="py-4 px-4 sm:py-6 sm:px-6 lg:py-8 lg:px-8">
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

// Main layout component with Suspense boundary
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    }>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </Suspense>
  );
}