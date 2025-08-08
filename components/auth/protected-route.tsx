"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LoginForm } from "./login-form";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export function ProtectedRoute({ children, requireAuth = true }: ProtectedRouteProps) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated && requireAuth) {
      // Don't redirect if we're already on the login page to avoid loops
      if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
        router.push("/login");
      }
    }
  }, [loading, isAuthenticated, requireAuth, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B19272] mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900">Loading...</h2>
        </div>
      </div>
    );
  }

  if (!isAuthenticated && requireAuth) {
    return <LoginForm />;
  }

  return <>{children}</>;
}

