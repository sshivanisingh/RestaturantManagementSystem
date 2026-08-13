"use client"

import {
  Menu, Settings, LogOut, User, Package,
  LayoutDashboard, Store, List, ClipboardList,
  TableIcon, CalendarRange, Truck, Calculator,
  ShoppingCart, Heart, Home, Boxes,
} from "lucide-react"
import { Button }       from "@/components/ui/button"
import Link             from "next/link"
import { usePathname }  from "next/navigation"
import { useSidebar }   from "./providers/sidebar-provider"
import { cn }           from "@/lib/utils"
import { useAuth }      from "./providers/auth-provider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { motion }       from "framer-motion"
import { useState, useEffect }     from "react"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"

// ─── Nav Groups ────────────────────────────────────────────────────────────────
const adminNavGroups = [
  {
    label: "Main",
    items: [
      { icon: LayoutDashboard, label: "Dashboard",      href: "/admin",              exact: true },
      { icon: List,            label: "Categories",     href: "/admin/categories" },
      { icon: Store,           label: "Menu Items",     href: "/admin/products" },
      { icon: Package,         label: "Orders",         href: "/admin/orders" },
      { icon: Boxes,           label: "Inventory",      href: "/admin/inventory" },
      { icon: ClipboardList,   label: "Reports",        href: "/admin/reports" },
    ],
  },
  {
    label: "Services",
    items: [
      { icon: TableIcon,     label: "Table Services", href: "/admin/table-services" },
      { icon: CalendarRange, label: "Reservation",    href: "/admin/reservation" },
      { icon: Truck,         label: "Delivery",       href: "/admin/delivery" },
    ],
  },
  {
    label: "Other",
    items: [
      { icon: Settings, label: "Settings", href: "/admin/settings" },
    ],
  },
]

const customerNavGroups = [
  {
    label: "Menu",
    items: [
      { icon: Home,         label: "Dashboard", href: "/customer/dashboard", exact: true },
      { icon: ShoppingCart, label: "Cart",      href: "/customer/cart" },
      { icon: Heart,        label: "Favorites", href: "/customer/favorites" },
      { icon: Package,      label: "My Orders", href: "/customer/orders" },
      { icon: User,         label: "Profile",   href: "/customer/profile" },
      { icon: Settings,     label: "Settings",  href: "/customer/settings" },
    ],
  },
]


// ─── Shimmer Skeleton ─────────────────────────────────────────────────────────
function Shimmer({ className = "" }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden bg-gray-100 rounded ${className}`}>
      <div
        className="absolute inset-0 -translate-x-full"
        style={{
          background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)",
          animation : "shimmer 1.5s infinite",
        }}
      />
    </div>
  )
}

function SidebarSkeleton() {
  return (
    <>
      {/* User card skeleton */}
      <div className="mx-4 mb-4 p-3 rounded-xl border border-gray-100 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Shimmer className="w-10 h-10 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Shimmer className="h-3.5 w-3/4 rounded" />
            <Shimmer className="h-2.5 w-full rounded" />
            <Shimmer className="h-4 w-16 rounded-full" />
          </div>
        </div>
      </div>

      {/* Nav group skeletons */}
      {[
        { label: "Main",     count: 5 },
        { label: "Services", count: 4 },
        { label: "Other",    count: 1 },
      ].map((group) => (
        <div key={group.label} className="mb-5 px-4">
          {/* Group label */}
          <Shimmer className="h-2.5 w-16 mb-3 rounded" />
          {/* Items */}
          {Array.from({ length: group.count }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 mb-2 px-2 py-1.5">
              <Shimmer className="w-4 h-4 rounded flex-shrink-0" />
              <Shimmer className={`h-3 rounded ${i % 3 === 0 ? "w-3/4" : i % 3 === 1 ? "w-2/3" : "w-1/2"}`} />
            </div>
          ))}
        </div>
      ))}

      {/* Logout skeleton */}
      <div className="px-4 py-4 border-t border-gray-100 flex-shrink-0">
        <div className="flex items-center gap-3 px-2 py-1.5">
          <Shimmer className="w-4 h-4 rounded flex-shrink-0" />
          <Shimmer className="h-3 w-16 rounded" />
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0%   { transform: translateX(-100%) }
          100% { transform: translateX(200%) }
        }
      `}</style>
    </>
  )
}

// ─── NavGroup ─────────────────────────────────────────────────────────────────
function NavGroup({ label, items, baseDelay = 0 }: {
  label: string
  items: { icon: any; label: string; href: string; exact?: boolean }[]
  baseDelay?: number
}) {
  const pathname = usePathname()

  return (
    <div className="mb-4">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 mb-2">
        {label}
      </p>
      {items.map((item, index) => {
        const isActive = item.exact
          ? pathname === item.href
          : pathname === item.href || pathname.startsWith(item.href + "/")

        return (
          <motion.div
            key={item.href}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: baseDelay + index * 0.05 }}
          >
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start mb-1",
                isActive
                  ? "bg-gradient-to-r from-brand-primary/10 to-purple-500/10 text-brand-primary font-medium"
                  : "text-gray-600",
                "hover:bg-gradient-to-r hover:from-brand-primary/5 hover:to-purple-500/5"
              )}
              asChild
            >
              <Link href={item.href}>
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
              </Link>
            </Button>
          </motion.div>
        )
      })}
    </div>
  )
}

// ─── Logout Modal ─────────────────────────────────────────────────────────────
function LogoutModal({ open, onConfirm, onCancel }: {
  open: boolean; onConfirm: () => void; onCancel: () => void
}) {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent className="max-w-sm rounded-none p-0 overflow-hidden gap-0 shadow-md">
        
        <div className="px-6 pt-6 pb-6 space-y-4">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-poppins font-semibold text-gray-800">
              Sign out of your account?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm font-poppins text-gray-400">
              Your session will end. You will need to sign in again to continue.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-2 !mt-0">
            <AlertDialogCancel onClick={onCancel}
              className="flex-1 h-10 font-poppins text-sm rounded-none border-gray-200">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={onConfirm}
              className="flex-1 h-10 font-poppins text-sm text-white rounded-md"
              style={{ background: "hsl(var(--brand-primary))" }}>
              Sign Out
            </AlertDialogAction>
          </AlertDialogFooter>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// ─── Main SidebarNav ──────────────────────────────────────────────────────────
export function SidebarNav() {
  const { isSidebarOpen, toggleSidebar } = useSidebar()
  const { user, isAuthenticated, logout, isLoading } = useAuth()
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [loggingOut,      setLoggingOut]      = useState(false)

  const navGroups = (user as any)?.role === "customer"
    ? customerNavGroups
    : adminNavGroups

  return (
    <>
      <LogoutModal
        open={showLogoutModal}
        onConfirm={() => {
          setShowLogoutModal(false)
          setLoggingOut(true)
          logout()
        }}
        onCancel={() => setShowLogoutModal(false)}
      />

      {/* Mobile menu toggle */}
      <Button
        variant="ghost" size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={toggleSidebar}
      >
        <Menu className="h-6 w-6" />
      </Button>

      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* ── Sidebar shell ──
          Key fix: ONE scrollable container (the nav area), 
          outer wrapper is fixed height with NO overflow.
          Logo + user card = fixed top (flex-shrink-0)
          Nav = flex-1 overflow-y-auto  ← only scrollable part
          Logout = fixed bottom (flex-shrink-0)
      ── */}
      <aside className={cn(
        "fixed top-0 left-0 z-40 w-64 h-screen",
        "transition-transform duration-300 ease-in-out md:translate-x-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full",
      )}>
        {/*
          flex-col + h-full = sidebar takes full viewport height
          overflow-hidden on the outer = kills the page-level scrollbar
          Only the <nav> section inside scrolls
        */}
        <div className="flex flex-col h-full bg-white border-r overflow-hidden">

          {/* ── Logo — never scrolls ─────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-3 px-4 pt-5 pb-4 flex-shrink-0"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-primary via-orange-500
              to-brand-secondary flex items-center justify-center text-white font-bold text-xl shadow-lg">
              <span className="font-satisfy">C</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-satisfy text-xl bg-gradient-to-r from-brand-primary to-brand-secondary
                bg-clip-text text-transparent leading-tight truncate">
                WebX Chili Eats
              </span>
              <span className="text-xs text-gray-500">Delicious &amp; Fresh</span>
            </div>
          </motion.div>

          {/* ── Logout full-screen overlay ───────────────── */}
          {loggingOut && (
            <div className="absolute inset-0 z-50 bg-white/90 flex flex-col items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: "hsl(var(--brand-primary)/12%)" }}>
                <LogOut className="w-5 h-5" style={{ color: "hsl(var(--brand-primary))" }} />
              </div>
              <p className="text-xs font-poppins text-gray-500">Signing out…</p>
            </div>
          )}

          {/* ── Shimmer OR real content ───────────────────── */}
          {isLoading ? (
            /* Real auth loading state from useAuth() */
            <div className="flex flex-col flex-1 overflow-hidden">
              <SidebarSkeleton />
            </div>
          ) : (
            <>
              {/* ── User card — never scrolls ──────────────── */}
              {isAuthenticated && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4 }}
                  className="mx-4 mb-4 p-3 rounded-xl bg-gradient-to-r from-orange-50 to-pink-50
                    border border-pink-100 flex-shrink-0"
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      {(user as any)?.avatar && (
                        <AvatarImage src={(user as any).avatar} alt={(user as any)?.name || "avatar"} />
                      )}
                      <AvatarFallback className="bg-gradient-to-br from-brand-primary to-brand-secondary text-white">
                        {(user as any)?.name?.charAt(0)?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{(user as any)?.name}</p>
                      <p className="text-xs text-gray-500 truncate">{(user as any)?.email}</p>
                      <span className="text-xs px-2 py-0.5 rounded-full font-poppins capitalize mt-0.5 inline-block"
                        style={{
                          background: "hsl(var(--brand-primary)/10)",
                          color     : "hsl(var(--brand-primary))",
                        }}>
                        {(user as any)?.role}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ── Nav — only scrollable zone ─────────────── */}
              <nav className="flex-1 overflow-y-auto px-4 scrollbar-hide">
                {navGroups.map((group, i) => (
                  <NavGroup
                    key={group.label}
                    label={group.label}
                    items={group.items}
                    baseDelay={0.05 + i * 0.08}
                  />
                ))}
              </nav>

              {/* ── Logout / Login — pinned bottom ─────────── */}
              <div className="px-4 py-4 border-t border-gray-100 flex-shrink-0">
                {isAuthenticated ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-gray-600 hover:text-red-500 hover:bg-red-50"
                      onClick={() => setShowLogoutModal(true)}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    <Button variant="ghost" className="w-full justify-start text-gray-600" asChild>
                      <Link href="/login">
                        <User className="mr-2 h-4 w-4" />
                        Login
                      </Link>
                    </Button>
                  </motion.div>
                )}
              </div>
            </>
          )}

        </div>
      </aside>
    </>
  )
}