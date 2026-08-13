import type React from "react";
import type { Metadata } from "next";
import { Poppins, Satisfy } from "next/font/google";
import "leaflet/dist/leaflet.css";
import "./globals.css";
import { SidebarProvider } from "@/components/providers/sidebar-provider";
import { AuthProvider } from "@/components/providers/auth-provider";
import { CartProvider } from "@/components/providers/cart-provider";
import { MenuProvider } from "@/components/providers/menu-provider";
import { FavoritesProvider } from "@/components/providers/favorites-provider";
import { ProductData } from "@/data/products";
import { Toaster } from "@/components/ui/toaster";
import { OrderSelectionProvider } from "@/components/providers/order-selection-provider";

import { AppQueryProvider } from "@/src/store";

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
});

const satisfy = Satisfy({
  weight: ["400"],
  subsets: ["latin"],
  variable: "--font-satisfy",
});

export const metadata: Metadata = {
  title: "BiteNest - Restaurant & Food Delivery",
  icons: {
    icon: "/logo/png",
  },
  description:
    "A modern restaurant point of sale system with e-commerce capabilities",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} ${satisfy.variable} font-poppins`}>
        <AppQueryProvider>
          <AuthProvider>
            <OrderSelectionProvider>
              <CartProvider>
                <MenuProvider>
                  <FavoritesProvider products={ProductData}>
                    <SidebarProvider>
                      {children}
                      <Toaster />
                    </SidebarProvider>
                  </FavoritesProvider>
                </MenuProvider>
              </CartProvider>
            </OrderSelectionProvider>
          </AuthProvider>
        </AppQueryProvider>
      </body>
    </html>
  );
}
