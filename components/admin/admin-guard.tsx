"use client";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
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
  const { addToast } = useToast();
  const [isValidating, setIsValidating] = useState(true);

  useEffect(() => {
    if (!state.isLoading) {
      // Check authentication
      if (!state.isAuthenticated) {
        router.push("/login");
        return;
      }

      // Check admin privileges
      if (!state.user?.isAdmin) {
        router.push("/");
        addToast({
          title: "Access Denied",
          description: "Admin privileges required.",
          type: "error",
        });
        return;
      }

      // All validations passed
      setIsValidating(false);
    }
  }, [state.isLoading, state.isAuthenticated, state.user?.isAdmin, router, addToast]);

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