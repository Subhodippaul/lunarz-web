"use client";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface AdminGuardProps {
  children: React.ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const { state } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!state.isLoading) {
      if (!state.isAuthenticated) {
        router.push("/login");
      } else if (!state.user?.isAdmin) {
        router.push("/");
        alert("Access denied. Admin privileges required.");
      }
    }
  }, [state.isLoading, state.isAuthenticated, state.user?.isAdmin, router]);

  if (state.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!state.isAuthenticated || !state.user?.isAdmin) {
    return null;
  }

  return <>{children}</>;
}