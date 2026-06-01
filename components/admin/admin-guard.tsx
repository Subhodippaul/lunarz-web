"use client";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, Suspense } from "react";
import { useToast } from "@/components/ui/toast";
import { CenteredLoader } from "@/components/ui/loader";

interface AdminGuardProps {
  children: React.ReactNode;
}

function AdminGuardContent({ children }: AdminGuardProps) {
  const { state } = useAuth();
  const router = useRouter();
  const { addToast } = useToast();

  useEffect(() => {
    // Only act once auth has finished loading
    if (state.isLoading) return;

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
    }
  }, [state.isLoading, state.isAuthenticated, state.user?.isAdmin, router, addToast]);

  // Still resolving auth — show spinner
  if (state.isLoading) {
    return <CenteredLoader text="Loading..." size="lg" />;
  }

  // Auth resolved but not an admin — render nothing while redirect happens
  if (!state.isAuthenticated || !state.user?.isAdmin) {
    return null;
  }

  // Authenticated admin — render children immediately, no extra validation state
  return <>{children}</>;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  return (
    <Suspense fallback={<CenteredLoader text="Loading admin..." size="lg" />}>
      <AdminGuardContent>{children}</AdminGuardContent>
    </Suspense>
  );
}