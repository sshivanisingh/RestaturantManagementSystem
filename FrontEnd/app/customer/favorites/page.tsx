"use client";

import { Button } from "@/components/ui/button";
import { Heart, ShoppingBag, ShoppingCart, Zap } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/components/providers/auth-provider";
import { useToast } from "@/components/ui/use-toast";
import { ProductCard } from "@/components/product-card";
import { useGetWishlist, useToggleWishlist } from "@/src/hooks/useUser";
import { useOrderSelection } from "@/components/providers/order-selection-provider";
import { useRouter } from "next/navigation";

const SESSION_KEY = "BiteNest_order_selection";
const RESTAURANT_ID = process.env.NEXT_PUBLIC_RESTAURANT_ID!;

function FavoritesContent() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const { data: wishlistResponse, isLoading } = useGetWishlist();
  const wishlistItems = wishlistResponse?.data || [];

  const { selectedItems, totalItems, totalPrice, clearSelection } =
    useOrderSelection();

  const handleProceedToCheckout = () => {
    if (!isAuthenticated) {
      router.push("/login?redirect=/checkout");
      return;
    }
    if (selectedItems.length === 0) return;

    const items = selectedItems.map((i) => ({
      id: i.id,
      title: i.title,
      price: i.price,
      quantity: i.quantity,
      image: i.image,
      type: i.type,
      restaurantId: (i as any).restaurantId || RESTAURANT_ID,
    }));

    sessionStorage.setItem(SESSION_KEY, JSON.stringify(items));
    router.push("/checkout?source=selection");
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-gradient-to-b from-purple-50 to-pink-50 flex items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md mx-auto border border-pink-100"
        >
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 rounded-full bg-pink-100 flex items-center justify-center">
              <Heart className="h-10 w-10 text-brand-primary" />
            </div>
          </div>
          <h2 className="text-2xl font-medium mb-2">Please Login</h2>
          <p className="text-gray-600 mb-6">
            Please login to view your wishlist items.
          </p>
          <Button
            className="bg-gradient-to-r from-brand-primary to-purple-600 hover:from-brand-primary/90 hover:to-purple-700 text-white"
            size="lg"
            asChild
          >
            <Link href="/login">Login to Continue</Link>
          </Button>
        </motion.div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-gradient-to-b from-purple-50 to-pink-50 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-purple-50 to-pink-50 min-h-full pb-28">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-satisfy mb-2 bg-gradient-to-r from-brand-primary to-purple-600 bg-clip-text text-transparent">
            Your Favorites
          </h1>
          <p className="text-gray-600">All your favorite dishes in one place</p>
          {wishlistItems.length > 0 && (
            <p className="text-sm text-gray-400 mt-1">
              Click <strong className="text-brand-primary">Order Now</strong> on
              any item to select it, then tap{" "}
              <strong className="text-brand-primary">Proceed to Order</strong>{" "}
              below
            </p>
          )}
        </motion.div>

        {wishlistItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistItems?.map((item: any, index: number) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative group"
              >
                <ProductCard product={item} />
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md mx-auto border border-pink-100"
          >
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 rounded-full bg-pink-100 flex items-center justify-center">
                <Heart className="h-10 w-10 text-brand-primary" />
              </div>
            </div>
            <h2 className="text-2xl font-medium mb-2">No favorites yet</h2>
            <p className="text-gray-600 mb-6">
              Start adding your favorite dishes to create your personal
              collection
            </p>
            <Button
              className="bg-gradient-to-r from-brand-primary to-purple-600 hover:from-brand-primary/90 hover:to-purple-700 text-white"
              size="lg"
              asChild
            >
              <Link href="/">
                <ShoppingBag className="mr-2 h-5 w-5" />
                Browse Menu
              </Link>
            </Button>
          </motion.div>
        )}
      </div>

      {/* Floating Order Bar */}
      <AnimatePresence>
        {selectedItems.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 md:left-64"
          >
            <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4">
                <div>
                  <p className="text-sm text-gray-500 font-medium">
                    {totalItems} item{totalItems !== 1 ? "s" : ""} selected
                  </p>
                  <p className="text-xl font-bold text-gray-900">
                    ₹{totalPrice.toLocaleString("en-IN")}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={clearSelection}
                    className="text-xs text-gray-400 hover:text-gray-600 underline"
                  >
                    Clear
                  </button>
                  <Button
                    onClick={handleProceedToCheckout}
                    className="bg-brand-primary hover:bg-brand-primary/90 text-white px-6 py-2.5 rounded-xl font-semibold flex items-center gap-2"
                  >
                    <Zap className="h-4 w-4" />
                    Proceed to Order
                  </Button>
                </div>
              </div>
              {/* Mini item preview */}
              <div className="bg-gray-50 px-5 py-2 flex items-center gap-2 overflow-x-auto">
                {selectedItems.map((item) => (
                  <span
                    key={item.id}
                    className="flex-shrink-0 text-xs bg-white border border-gray-200 rounded-full px-3 py-1 text-gray-700"
                  >
                    {item.title} × {item.quantity}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FavoritesPage() {
  return <FavoritesContent />;
}
