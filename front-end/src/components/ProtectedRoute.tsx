import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import UseProfile from "../hooks/UseProfile";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { profile } = UseProfile();
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);

  const isAuthenticated = useMemo(() => {
    return Boolean(profile?._id && profile?.token);
  }, [profile?._id, profile?.token]);

  useEffect(() => {
    if (isAuthenticated) {
      setIsCheckingAuth(false);
      return;
    }

    let hasStoredProfile = false;
    try {
      const stored = localStorage.getItem("profile");
      if (stored) {
        const parsed = JSON.parse(stored);
        hasStoredProfile = Boolean(parsed?._id && parsed?.token);
      }
    } catch (error) {
      localStorage.removeItem("profile");
    }

    const timeout = window.setTimeout(() => {
      setIsCheckingAuth(false);
    }, hasStoredProfile ? 120 : 0);

    return () => window.clearTimeout(timeout);
  }, [isAuthenticated]);

  if (isCheckingAuth) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-900 text-gray-100">
        <p className="text-sm font-medium">Checking session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
