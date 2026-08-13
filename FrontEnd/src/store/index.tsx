"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools }               from "@tanstack/react-query-devtools";
import { type ReactNode }                   from "react";

// ─── Query Client ─────────────────────────────────────────────────────────────
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime:            30 * 1000,        // 30s — cached data shows instantly on re-visit
      gcTime:               10 * 60 * 1000,  // 10 min in memory
      retry:                1,
      refetchOnWindowFocus: false,
      refetchOnReconnect:   true,
    },
    mutations: {
      retry: 0,
    },
  },
});

// ─── Provider ─────────────────────────────────────────────────────────────────
interface AppQueryProviderProps {
  children: ReactNode;
}

export const AppQueryProvider = ({ children }: AppQueryProviderProps) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.VITE_API_BASE_URL && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
};
