"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useGetProfile } from "@/src/hooks";
import { useRouter } from "next/navigation";

type AuthContextType = {
  user: Record<string, unknown> | null;
  role: "restaurant" | "customer" | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const router = useRouter();
 
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
   
    setToken(localStorage.getItem("accessToken"));

  
    const handleStorage = () => {
      setToken(localStorage.getItem("accessToken"));
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  
  useEffect(() => {
    const unsubscribe = queryClient.getQueryCache().subscribe(() => {
      // setTimeout defers setState out of the render cycle (prevents "setState during render" warning)
      const newToken = localStorage.getItem("accessToken");
      setTimeout(() => setToken((prev) => (prev !== newToken ? newToken : prev)), 0);
    });
    return () => unsubscribe();
  }, [queryClient]);

  const { data: profileData, isLoading } = useGetProfile({
    enabled: !!token,
  });

  const user = profileData?.data?.data ?? null;
  const role = profileData?.data?.role ?? null;

  const logout = () => {
    localStorage.removeItem("accessToken");
    setToken(null);
    queryClient.clear();
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{ user, role, isLoading, isAuthenticated: !!user, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};