"use client";
import { useAuth } from "@/lib/auth-context";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { useToast } from "@/components/ui/toast";
import { CenteredLoader } from "@/components/ui/loader";

interface AdminGuardProps {
  children: React.ReactNode;
}

// Separate component that uses useSearchParams
function AdminGuardContent({ children }: AdminGuardProps) {
  const { state } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast } = useToast();
  const [isValidating, setIsValidating] = useState(true);

  console.log('AdminGuard state:', state);

  useEffect(() => {
    if (!state.isLoading) {
      // First check authentication and admin privileges
      if (!state.isAuthenticated) {
        router.push("/login");
        return;
      } 
      
      if (!state.user?.isAdmin) {
        router.push("/");
        addToast({
          title: "Access Denied",
          description: "Admin privileges required.",
          type: "error",
        });
        return;
      }

      // Now validate URL parameters for admin access
      if (typeof window !== 'undefined') {
        const validateAdminAccess = () => {
          const urlUid = searchParams.get('uid');
          const urlIsAuthenticated = searchParams.get('isAuthenticated');
          const localStorageUid = localStorage.getItem('uniqueId');
          
          console.log('Admin URL uid:', urlUid);
          console.log('Admin URL isAuthenticated:', urlIsAuthenticated);
          console.log('Admin LocalStorage uid:', localStorageUid);
          console.log('User isAuthenticated:', state.isAuthenticated);
          
          // If URL doesn't have required parameters, redirect to home page
          if (!urlUid || !urlIsAuthenticated) {
            addToast({
              title: "Access Denied",
              description: "Please access admin through proper authentication.",
              type: "error",
            });
            router.push("/");
            return;
          }
          
          // Validate uid parameter against localStorage
          if (!localStorageUid || urlUid !== localStorageUid) {
            addToast({
              title: "Session Invalid",
              description: "Please login again to access admin.",
              type: "error",
            });
            router.push("/");
            return;
          }
          
          // Validate isAuthenticated parameter
          if (urlIsAuthenticated !== 'true' || !state.isAuthenticated) {
            addToast({
              title: "Authentication Required",
              description: "Please login again to access admin.",
              type: "error",
            });
            router.push("/");
            return;
          }
          
          // All validations passed
          setIsValidating(false);
        };

        // Try validation immediately, then with a delay if localStorage is empty
        const localStorageUid = localStorage.getItem('uniqueId');
        if (localStorageUid) {
          validateAdminAccess();
        } else {
          // If localStorage is empty, wait a bit for UniqueIdGenerator to finish
          setTimeout(validateAdminAccess, 500);
        }
      }
    }
  }, [state.isLoading, state.isAuthenticated, state.user?.isAdmin, router, searchParams, addToast]);

  // Show loading while validating
  if (state.isLoading || isValidating) {
    return (
      <CenteredLoader 
        text={state.isLoading ? "Loading..." : "Validating admin access..."}
        size="lg"
      />
    );
  }

  if (!state.isAuthenticated || !state.user?.isAdmin) {
    return null;
  }

  return <>{children}</>;
}

// Main AdminGuard component with Suspense boundary
export default function AdminGuard({ children }: AdminGuardProps) {
  return (
    <Suspense fallback={
      <CenteredLoader text="Loading admin..." size="lg" />
    }>
      <AdminGuardContent>{children}</AdminGuardContent>
    </Suspense>
  );
}