"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "../providers/auth-provider";
import { useUserLogout } from "@/src/hooks/useUser";

const NAV_LINKS = [
  { label: "Home", href: "/resturent" },
  { label: "Reservations", href: "/userreservation" },
  { label: "Items", href: "/items" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [menuOpen, setMenuOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const { mutateAsync: logout } = useUserLogout();

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <nav className="w-full bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* ── Logo ──────────────────────────────────────────────────────── */}
          <Link href="/" className="flex items-center shrink-0">
            <img
              src="/logo.png"
              alt="BiteNest"
              className="h-12 w-auto object-contain"
            />
          </Link>

          {/* ── Desktop nav links ──────────────────────────────────────────── */}
          <div className="hidden md:flex items-center gap-0.5">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`
                    relative px-4 py-2 text-sm font-poppins font-medium rounded-lg
                    transition-all duration-150
                    ${
                      isActive
                        ? "text-[hsl(var(--brand-primary))] bg-orange-50"
                        : "text-gray-600 hover:text-[hsl(var(--brand-primary))] hover:bg-orange-50"
                    }
                  `}
                >
                  {link.label}
                  {isActive && (
                    <span
                      className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                      style={{ background: "hsl(var(--brand-primary))" }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* ── Right side ────────────────────────────────────────────────── */}
          <div className="flex items-center gap-3">
            {/* Sign In button — desktop */}
            {!isAuthenticated && (
              <Link
                href="/login"
                className="hidden md:inline-flex items-center justify-center
                  h-9 px-5 rounded-lg text-sm font-poppins font-semibold text-white
                  bg-gradient-to-r from-[hsl(var(--brand-primary))] to-[hsl(var(--brand-secondary))]
                  transition-opacity duration-150 hover:opacity-90 active:opacity-80"
              >
                Sign In
              </Link>
            )}

            {/* Profile dropdown */}
            {isAuthenticated && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="relative rounded-full ring-2 ring-transparent
                      hover:ring-orange-200 transition-all focus:outline-none"
                  >
                    <Avatar className="h-9 w-9 cursor-pointer">
                      <AvatarImage src="/avatar.png" alt="Profile" />
                      <AvatarFallback
                        className="text-white text-sm font-poppins font-semibold"
                        style={{ background: "hsl(var(--brand-primary))" }}
                      >
                        {user?.name
                          ? (user.name as string).charAt(0).toUpperCase()
                          : "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white bg-green-500" />
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="end"
                  className="w-52 rounded-xl p-1.5 shadow-lg border border-gray-100"
                >
                  <DropdownMenuLabel className="px-2 py-1.5">
                    <p className="text-sm font-poppins font-semibold text-gray-800">
                      {user?.name as string}
                    </p>
                    <p className="text-xs font-poppins text-gray-400 truncate">
                      {user?.email as string}
                    </p>
                  </DropdownMenuLabel>

                  <DropdownMenuSeparator className="my-1" />

                  <DropdownMenuItem asChild>
                    <Link
                      href={
                        user?.role === "customer"
                          ? "/customer/dashboard"
                          : "/admin"
                      }
                      className="flex items-center gap-2 px-2 py-2 rounded-lg text-sm font-poppins cursor-pointer"
                    >
                      <span>👤</span> My Dashboard
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className="my-1" />

                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-2 py-2 rounded-lg text-sm font-poppins cursor-pointer text-red-500 focus:text-red-500 focus:bg-red-50"
                  >
                    <span>🚪</span> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Hamburger — mobile only */}
            <button
              className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-orange-50 hover:text-[hsl(var(--brand-primary))] transition-colors"
              onClick={() => setMenuOpen((p) => !p)}
              aria-label="Toggle menu"
            >
              <div className="w-5 flex flex-col gap-[5px]">
                <span
                  className={`block h-0.5 rounded bg-current transition-all duration-200
                    ${menuOpen ? "rotate-45 translate-y-[7px]" : ""}`}
                />
                <span
                  className={`block h-0.5 rounded bg-current transition-all duration-200
                    ${menuOpen ? "opacity-0" : ""}`}
                />
                <span
                  className={`block h-0.5 rounded bg-current transition-all duration-200
                    ${menuOpen ? "-rotate-45 -translate-y-[7px]" : ""}`}
                />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile menu ───────────────────────────────────────────────────── */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 border-t border-gray-100
          ${menuOpen ? "max-h-80" : "max-h-0"}`}
      >
        <div className="px-4 pt-2 pb-4 space-y-1 bg-white">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`
                  flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-poppins font-medium transition-colors
                  ${
                    isActive
                      ? "bg-orange-50 text-[hsl(var(--brand-primary))]"
                      : "text-gray-600 hover:bg-orange-50 hover:text-[hsl(var(--brand-primary))]"
                  }
                `}
              >
                {isActive && (
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ background: "hsl(var(--brand-primary))" }}
                  />
                )}
                {link.label}
              </Link>
            );
          })}

          {/* Sign In — mobile */}
          {!isAuthenticated && (
            <div className="pt-2">
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center w-full h-10 rounded-lg
                  text-sm font-poppins font-semibold text-white
                  bg-gradient-to-r from-[hsl(var(--brand-primary))] to-[hsl(var(--brand-secondary))]
                  transition-opacity hover:opacity-90"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
