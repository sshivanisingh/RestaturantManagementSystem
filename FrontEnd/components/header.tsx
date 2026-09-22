"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { Search, ShoppingCart, Heart, MenuIcon } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useSidebar } from "./providers/sidebar-provider";
import { useAuth } from "./providers/auth-provider";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useFavorites } from "./providers/favorites-provider";
import { useCart } from "./providers/cart-provider";

export function Header() {
  // ============================================================
  // STATE
  // ============================================================

  const [isClient, setIsClient] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState("");

  // ============================================================
  // HOOKS
  // ============================================================

  const { toggleSidebar } = useSidebar();

  const { user, isAuthenticated, logout } = useAuth();

  const { favorites } = useFavorites();
  const { items } = useCart();

  const router = useRouter();

  // ============================================================
  // CLIENT SIDE
  // ============================================================

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  // ============================================================
  // SEARCH
  // ============================================================

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const query = localSearchQuery.trim();

    if (query) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  // ============================================================
  // USER / RESTAURANT DATA
  //
  // Your Restaurant schema has:
  //
  // name  -> restaurant name
  // logo  -> restaurant logo
  // email -> restaurant email
  // ============================================================

  const restaurantName = (user as any)?.name || "Restaurant";

  const restaurantLogo = (user as any)?.logo || "";

  const restaurantEmail = (user as any)?.email || "";

  // ============================================================
  // GENERATE INITIALS
  //
  // Works for ANY restaurant name.
  //
  // The Saffron Saga -> TSS
  // BiteNest Restaurant -> BR
  // Spice Garden -> SG
  // Royal Taj Restaurant -> RTR
  // McDonald's -> M
  // ============================================================

  const getRestaurantInitials = (name: string) => {
    if (!name || !name.trim()) {
      return "R";
    }

    const words = name.trim().split(/\s+/).filter(Boolean);

    // One-word restaurant
    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }

    // Multiple words
    return words
      .map((word) => word.charAt(0).toUpperCase())
      .slice(0, 3)
      .join("");
  };

  const restaurantInitials = getRestaurantInitials(restaurantName);

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <motion.div
      initial={{
        y: -20,
        opacity: 0,
      }}
      animate={{
        y: 0,
        opacity: 1,
      }}
      transition={{
        duration: 0.5,
      }}
      className="
        bg-white
        p-4
        flex
        items-center
        justify-end
        gap-4
        border-b
        sticky
        top-0
        z-30
        shadow-sm
      "
    >
      {/* ====================================================== */}
      {/* MOBILE MENU */}
      {/* ====================================================== */}

      <div className="md:hidden flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={toggleSidebar}>
          <MenuIcon className="h-5 w-5" />
        </Button>

        {/* Dynamic Restaurant Name */}

        <span
          className="
            font-satisfy
            text-xl
            bg-gradient-to-r
            from-brand-primary
            to-brand-secondary
            bg-clip-text
            text-transparent
            truncate
            max-w-[180px]
          "
        >
          {restaurantName}
        </span>
      </div>

      {/* ====================================================== */}
      {/* SEARCH */}
      {/* ====================================================== */}

      <div className="flex-1 relative max-w-xl">
        <form onSubmit={handleSearch} className="relative">
          <Search
            className="
              absolute
              left-3
              top-1/2
              -translate-y-1/2
              text-gray-400
            "
          />

          <Input
            type="text"
            placeholder="Search products..."
            className="
              pl-10
              w-full
              pr-16
              bg-gray-50
              border-gray-200
              focus:bg-white
              transition-colors
            "
            value={localSearchQuery}
            onChange={(e) => setLocalSearchQuery(e.target.value)}
          />

          <Button
            type="submit"
            size="sm"
            className="
              absolute
              right-1
              top-1/2
              -translate-y-1/2
              h-8
              bg-gradient-to-r
              from-brand-primary
              to-brand-secondary
              text-white
            "
          >
            Search
          </Button>
        </form>
      </div>

      {/* ====================================================== */}
      {/* RIGHT SIDE */}
      {/* ====================================================== */}

      <div className="flex items-center gap-2">
        {/* ==================================================== */}
        {/* FAVORITES */}
        {/* ==================================================== */}

        <Link href="/favorites">
          <Button variant="ghost" size="icon" className="relative group">
            <Heart
              className="
                h-5
                w-5
                group-hover:text-red-500
                transition-colors
              "
            />

            {favorites.length > 0 && (
              <Badge
                className="
                  absolute
                  -top-1
                  -right-1
                  h-5
                  w-5
                  flex
                  items-center
                  justify-center
                  p-0
                  bg-gradient-to-r
                  from-red-500
                  to-pink-500
                  text-white
                "
              >
                {favorites.length}
              </Badge>
            )}
          </Button>
        </Link>

        {/* ==================================================== */}
        {/* CART */}
        {/* ==================================================== */}

        <Link href="/cart">
          <Button variant="ghost" size="icon" className="relative group">
            <ShoppingCart
              className="
                h-5
                w-5
                group-hover:text-brand-primary
                transition-colors
              "
            />

            {items.length > 0 && (
              <Badge
                className="
                  absolute
                  -top-1
                  -right-1
                  h-5
                  w-5
                  flex
                  items-center
                  justify-center
                  p-0
                  bg-gradient-to-r
                  from-brand-primary
                  to-brand-secondary
                  text-white
                "
              >
                {items.length}
              </Badge>
            )}
          </Button>
        </Link>

        {/* ==================================================== */}
        {/* AUTHENTICATED USER */}
        {/* ==================================================== */}

        {isAuthenticated ? (
          <DropdownMenu>
            {/* ================================================== */}
            {/* AVATAR */}
            {/* ================================================== */}

            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar
                  className="
                    h-8
                    w-8
                    ring-2
                    ring-brand-primary/20
                  "
                >
                  {/* Uploaded Restaurant Logo */}

                  {restaurantLogo ? (
                    <AvatarImage
                      src={restaurantLogo}
                      alt={`${restaurantName} logo`}
                      className="object-cover"
                    />
                  ) : null}

                  {/* Initials when there is no logo */}

                  <AvatarFallback
                    className="
                      bg-gradient-to-br
                      from-brand-primary
                      to-brand-secondary
                      text-white
                      font-semibold
                      text-xs
                    "
                  >
                    {restaurantInitials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>

            {/* ================================================== */}
            {/* DROPDOWN */}
            {/* ================================================== */}

            <DropdownMenuContent align="end" className="w-60 p-2">
              {/* ================================================= */}
              {/* RESTAURANT INFORMATION */}
              {/* ================================================= */}

              <div className="flex items-center gap-3 p-2">
                {/* Restaurant Logo */}

                <Avatar className="h-10 w-10 shrink-0">
                  {restaurantLogo ? (
                    <AvatarImage
                      src={restaurantLogo}
                      alt={`${restaurantName} logo`}
                      className="object-cover"
                    />
                  ) : null}

                  <AvatarFallback
                    className="
                      bg-gradient-to-br
                      from-brand-primary
                      to-brand-secondary
                      text-white
                      font-semibold
                      text-xs
                    "
                  >
                    {restaurantInitials}
                  </AvatarFallback>
                </Avatar>

                {/* Restaurant Name */}

                <div className="flex flex-col min-w-0">
                  <p className="text-sm font-semibold truncate">
                    {restaurantName}
                  </p>

                  <p className="text-xs text-gray-500 truncate">
                    {restaurantEmail}
                  </p>
                </div>
              </div>

              <div className="h-px bg-gray-200 my-1" />

              {/* ================================================= */}
              {/* PROFILE */}
              {/* ================================================= */}

              <DropdownMenuItem asChild className="cursor-pointer">
                <Link href="/profile" className="flex items-center">
                  <span
                    className="
                      bg-gradient-to-r
                      from-brand-primary
                      to-brand-secondary
                      w-2
                      h-2
                      rounded-full
                      mr-2
                    "
                  />
                  My Profile
                </Link>
              </DropdownMenuItem>

              {/* ================================================= */}
              {/* MY ORDERS */}
              {/* ================================================= */}

              {user?.role !== "admin" &&
                user?.role !== "product" &&
                user?.role !== "accounting" && (
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/orders" className="flex items-center">
                      <span
                        className="
                          bg-gradient-to-r
                          from-brand-primary
                          to-brand-secondary
                          w-2
                          h-2
                          rounded-full
                          mr-2
                        "
                      />
                      My Orders
                    </Link>
                  </DropdownMenuItem>
                )}

              {/* ================================================= */}
              {/* ADMIN DASHBOARD */}
              {/* ================================================= */}

              {user?.role === "admin" && (
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href="/admin" className="flex items-center">
                    <span
                      className="
                        bg-gradient-to-r
                        from-purple-500
                        to-blue-500
                        w-2
                        h-2
                        rounded-full
                        mr-2
                      "
                    />
                    Admin Dashboard
                  </Link>
                </DropdownMenuItem>
              )}

              <div className="h-px bg-gray-200 my-1" />

              {/* ================================================= */}
              {/* LOGOUT */}
              {/* ================================================= */}

              <DropdownMenuItem
                onClick={logout}
                className="
                  cursor-pointer
                  text-red-500
                  focus:text-red-500
                "
              >
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          /* ==================================================== */
          /* LOGIN */
          /* ==================================================== */

          <Button
            variant="default"
            size="sm"
            asChild
            className="
              bg-gradient-to-r
              from-brand-primary
              to-brand-secondary
              text-white
            "
          >
            <Link href="/login">Login</Link>
          </Button>
        )}
      </div>
    </motion.div>
  );
}
