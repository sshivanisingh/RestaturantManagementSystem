"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";

import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import {
  Bike,
  CheckCircle2,
  Clock,
  IndianRupee,
  Loader2,
  LogOut,
  MapPin,
  Package,
  Phone,
  Power,
  RefreshCw,
  Star,
  Truck,
  User,
  Zap,
  Navigation2,
  ShoppingBag,
  History,
  Home,
} from "lucide-react";

import DeliveryMap from "../Deliverymap/Deliverymap";

import {
  useGetDeliveryBoyProfile,
  useToggleDeliveryBoyOnlineStatus,
  useUpdateDeliveryBoyLocation,
  useGetAvailableOrders,
  useAcceptOrder,
  useGetCurrentOrder,
  useUpdateDeliveryStatus,
  useGetDeliveryBoyOrderHistory,
  useLogoutDeliveryBoy,
} from "@/src/hooks/usedeliveryboy";

import type { AvailableOrder, VehicleType } from "@/src/types/api.types";

// ═══════════════════════════════════════════════════════════════════════════
// Session helpers
// ═══════════════════════════════════════════════════════════════════════════

const getDBUser = () => {
  if (typeof window === "undefined") return null;

  try {
    return JSON.parse(localStorage.getItem("db_user") ?? "null");
  } catch {
    return null;
  }
};

const clearDB = () => {
  ["db_accessToken", "db_refreshToken", "db_user"].forEach((key) => {
    localStorage.removeItem(key);
  });
};

// ═══════════════════════════════════════════════════════════════════════════
// Vehicle labels
// ═══════════════════════════════════════════════════════════════════════════

const vehicleLabel: Record<VehicleType, string> = {
  bike: "Bike",
  bicycle: "Bicycle",
  scooter: "Scooter",
  car: "Car",
};

// ═══════════════════════════════════════════════════════════════════════════
// Time helper
// ═══════════════════════════════════════════════════════════════════════════

const timeAgo = (iso: string) => {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);

  if (seconds < 60) {
    return `${seconds}s ago`;
  }

  if (seconds < 3600) {
    return `${Math.floor(seconds / 60)}m ago`;
  }

  return `${Math.floor(seconds / 3600)}h ago`;
};

// ═══════════════════════════════════════════════════════════════════════════
// Reusable Card
// ═══════════════════════════════════════════════════════════════════════════

function Card({
  children,
  className = "",
  accent = false,
}: {
  children: React.ReactNode;
  className?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl p-4 ${className}`}
      style={
        accent
          ? {
              background:
                "linear-gradient(135deg, hsl(var(--brand-primary)/8%), hsl(var(--brand-accent)/5%))",
              border: "1.5px solid hsl(var(--brand-primary)/20%)",
            }
          : {
              background: "#fff",
              border: "1px solid hsl(var(--brand-muted))",
              boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            }
      }
    >
      {children}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Section label
// ═══════════════════════════════════════════════════════════════════════════

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-poppins font-semibold uppercase tracking-widest text-gray-400 mb-3">
      {children}
    </p>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Skeleton
// ═══════════════════════════════════════════════════════════════════════════

function SkeletonCard() {
  return (
    <div
      className="rounded-2xl p-4 animate-pulse"
      style={{
        background: "#fff",
        border: "1px solid hsl(var(--brand-muted))",
      }}
    >
      <div className="h-4 bg-gray-100 rounded w-1/2 mb-2" />
      <div className="h-3 bg-gray-100 rounded w-3/4" />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Main dashboard
// ═══════════════════════════════════════════════════════════════════════════

export default function DeliveryDashboard() {
  const router = useRouter();

  const { toast } = useToast();

  const localUser = getDBUser();

  // ════════════════════════════════════════════════════════════════════════
  // UI state
  // ════════════════════════════════════════════════════════════════════════

  const [tab, setTab] = useState<"home" | "history" | "profile">("home");

  const [confirmOrder, setConfirmOrder] = useState<AvailableOrder | null>(null);

  const [deliverDialog, setDeliverDialog] = useState(false);

  const [mapOpen, setMapOpen] = useState(false);

  const [driverCoords, setDriverCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const locationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const watchIdRef = useRef<number | null>(null);

  const [gpsLoading, setGpsLoading] = useState(false);

  // ════════════════════════════════════════════════════════════════════════
  // Queries
  // ════════════════════════════════════════════════════════════════════════

  const { data: profileData, isLoading: profileLoading } =
    useGetDeliveryBoyProfile();

  const profile = profileData?.data;

  const isOnline = profile?.isOnline ?? false;

  const {
    data: availableData,
    isLoading: ordersLoading,
    refetch: refetchOrders,
    isFetching: ordersFetching,
  } = useGetAvailableOrders({
    enabled: isOnline && !profile?.currentOrderId,

    refetchInterval: isOnline ? 15_000 : false,
  });

  const availableOrders = availableData?.data ?? [];

  const { data: currentData, refetch: refetchCurrent } = useGetCurrentOrder();

  const currentOrder = currentData?.data?.order ?? null;

  const { data: historyData } = useGetDeliveryBoyOrderHistory({
    page: 1,
    limit: 20,
  });

  const history = historyData?.data?.orders ?? [];

  // ════════════════════════════════════════════════════════════════════════
  // Mutations
  // ════════════════════════════════════════════════════════════════════════

  const { mutate: toggleOnline, isPending: togglingOnline } =
    useToggleDeliveryBoyOnlineStatus({
      onSuccess: (res) => {
        const online = res.data.isOnline;

        toast({
          title: online ? "🟢 You're Online!" : "⚫ Offline",
        });

        if (online) {
          startGPS();
        } else {
          stopGPS();
        }
      },

      onError: (err) => {
        toast({
          title: "Error",
          description: err.message,
          variant: "destructive",
        });
      },
    });

  const { mutate: updateLocation } = useUpdateDeliveryBoyLocation();

  const { mutate: acceptOrder, isPending: accepting } = useAcceptOrder({
    onSuccess: () => {
      toast({
        title: "✅ Order Accepted!",
      });

      setConfirmOrder(null);

      refetchCurrent();
    },

    onError: (err) => {
      toast({
        title: "Order taken",
        description: err.message,
        variant: "destructive",
      });

      setConfirmOrder(null);

      refetchOrders();
    },
  });

  const { mutate: updateStatus, isPending: updatingStatus } =
    useUpdateDeliveryStatus({
      onSuccess: (_, vars) => {
        if (vars.deliverystatus === "delivered") {
          toast({
            title: "🎉 Delivered!",
          });

          setDeliverDialog(false);

          setMapOpen(false);
        } else {
          toast({
            title: "🛵 On the way!",
          });

          setMapOpen(true);
        }

        refetchCurrent();
      },

      onError: (err) => {
        toast({
          title: "Error",
          description: err.message,
          variant: "destructive",
        });
      },
    });

  const { mutate: logoutMutate, isPending: loggingOut } = useLogoutDeliveryBoy({
    onSuccess: () => {
      clearDB();
      router.push("/deliveryboy/login");
    },

    onError: () => {
      clearDB();
      router.push("/deliveryboy/login");
    },
  });

  // ════════════════════════════════════════════════════════════════════════
  // GPS tracking
  // ════════════════════════════════════════════════════════════════════════

  const onGPSSuccess = (position: GeolocationPosition) => {
    const { latitude, longitude } = position.coords;

    updateLocation({
      latitude,
      longitude,
    });

    setDriverCoords({
      lat: latitude,
      lng: longitude,
    });
  };

  const startGPS = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      return;
    }

    // Immediate location
    navigator.geolocation.getCurrentPosition(
      onGPSSuccess,

      (error) => {
        console.warn("GPS:", error.message);
      },

      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      },
    );

    // Continuous GPS watch
    watchIdRef.current = navigator.geolocation.watchPosition(
      onGPSSuccess,

      (error) => {
        console.warn("GPS watch:", error.message);
      },

      {
        enableHighAccuracy: true,
        maximumAge: 0,
      },
    );

    // Backup GPS interval
    locationIntervalRef.current = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        onGPSSuccess,
        () => {},

        {
          enableHighAccuracy: true,
          maximumAge: 5000,
        },
      );
    }, 10_000);
  };

  const stopGPS = () => {
    if (locationIntervalRef.current) {
      clearInterval(locationIntervalRef.current);

      locationIntervalRef.current = null;
    }

    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);

      watchIdRef.current = null;
    }
  };

  useEffect(() => {
    if (isOnline) {
      startGPS();
    }

    return () => {
      stopGPS();
    };
  }, [isOnline]);

  // ════════════════════════════════════════════════════════════════════════
  // Authentication
  // ════════════════════════════════════════════════════════════════════════

  useEffect(() => {
    if (!localUser && !profileLoading) {
      router.push("/deliveryboy/login");
    }
  }, [localUser, profileLoading, router]);

  // ════════════════════════════════════════════════════════════════════════
  // Open delivery map
  // ════════════════════════════════════════════════════════════════════════

  const handleOpenMap = () => {
    if (driverCoords) {
      setMapOpen(true);
      return;
    }

    if (typeof navigator === "undefined" || !navigator.geolocation) {
      toast({
        title: "GPS not supported",
        description: "Your device doesn't support geolocation.",
        variant: "destructive",
      });

      return;
    }

    setGpsLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        onGPSSuccess(position);

        setGpsLoading(false);

        setMapOpen(true);
      },

      () => {
        setGpsLoading(false);

        toast({
          title: "Location access denied",

          description:
            "Please allow location access in your browser and try again.",

          variant: "destructive",
        });
      },

      {
        enableHighAccuracy: true,
        timeout: 10000,
      },
    );
  };

  // ════════════════════════════════════════════════════════════════════════
  // Loading
  // ════════════════════════════════════════════════════════════════════════

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-3">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto shadow-md"
            style={{
              background: "hsl(var(--brand-primary))",
            }}
          >
            <Bike className="w-7 h-7 text-white" />
          </div>

          <Loader2
            className="w-5 h-5 animate-spin mx-auto"
            style={{
              color: "hsl(var(--brand-primary))",
            }}
          />
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════
  // FULL SCREEN DELIVERY MAP
  // ════════════════════════════════════════════════════════════════════════

  if (mapOpen && currentOrder) {
    /*
     * IMPORTANT:
     *
     * GeoJSON coordinates are stored as:
     *
     * [longitude, latitude]
     *
     * Therefore:
     *
     * coordinates[0] = longitude
     * coordinates[1] = latitude
     *
     * We support the main expected structure:
     *
     * currentOrder.customerLocation.coordinates
     *
     * and a few fallback structures so that
     * the frontend doesn't break if your API
     * returns the coordinates slightly differently.
     */

    const orderData = currentOrder as any;

    let customerLat: number | undefined;

    let customerLng: number | undefined;

    // ─────────────────────────────────────────────────────────────────────
    // Option 1: GeoJSON
    // customerLocation: {
    //   type: "Point",
    //   coordinates: [lng, lat]
    // }
    // ─────────────────────────────────────────────────────────────────────

    const geoCoordinates = orderData?.customerLocation?.coordinates;

    if (
      Array.isArray(geoCoordinates) &&
      geoCoordinates.length >= 2 &&
      typeof geoCoordinates[0] === "number" &&
      typeof geoCoordinates[1] === "number"
    ) {
      customerLng = geoCoordinates[0];

      customerLat = geoCoordinates[1];
    }

    // ─────────────────────────────────────────────────────────────────────
    // Option 2:
    // deliveryInfo.coordinates
    // ─────────────────────────────────────────────────────────────────────

    const deliveryCoordinates = orderData?.deliveryInfo?.coordinates;

    if (
      customerLat === undefined &&
      customerLng === undefined &&
      Array.isArray(deliveryCoordinates) &&
      deliveryCoordinates.length >= 2
    ) {
      if (
        typeof deliveryCoordinates[0] === "number" &&
        typeof deliveryCoordinates[1] === "number"
      ) {
        customerLng = deliveryCoordinates[0];

        customerLat = deliveryCoordinates[1];
      }
    }

    // ─────────────────────────────────────────────────────────────────────
    // Option 3:
    // deliveryInfo.location.coordinates
    // ─────────────────────────────────────────────────────────────────────

    const locationCoordinates = orderData?.deliveryInfo?.location?.coordinates;

    if (
      customerLat === undefined &&
      customerLng === undefined &&
      Array.isArray(locationCoordinates) &&
      locationCoordinates.length >= 2
    ) {
      if (
        typeof locationCoordinates[0] === "number" &&
        typeof locationCoordinates[1] === "number"
      ) {
        customerLng = locationCoordinates[0];

        customerLat = locationCoordinates[1];
      }
    }

    // ─────────────────────────────────────────────────────────────────────
    // Option 4:
    // customerLocation: {
    //   latitude,
    //   longitude
    // }
    // ─────────────────────────────────────────────────────────────────────

    if (customerLat === undefined || customerLng === undefined) {
      const latitude = orderData?.customerLocation?.latitude;

      const longitude = orderData?.customerLocation?.longitude;

      if (typeof latitude === "number" && typeof longitude === "number") {
        customerLat = latitude;
        customerLng = longitude;
      }
    }

    console.log("[DeliveryMap] Driver coordinates:", driverCoords);

    console.log("[DeliveryMap] Customer coordinates:", {
      lat: customerLat,
      lng: customerLng,
    });

    return (
      <DeliveryMap
        driverLat={driverCoords?.lat ?? 0}
        driverLng={driverCoords?.lng ?? 0}
        customerLat={customerLat}
        customerLng={customerLng}
        customerAddress={[
          currentOrder.deliveryInfo?.address,

          currentOrder.deliveryInfo?.city,

          currentOrder.deliveryInfo?.pincode,
        ]
          .filter(Boolean)
          .join(", ")}
        orderId={currentOrder.orderId}
        customerName={
          typeof currentOrder.userId === "object" && currentOrder.userId
            ? (currentOrder.userId as any).name
            : undefined
        }
        customerPhone={
          typeof currentOrder.userId === "object" && currentOrder.userId
            ? (currentOrder.userId as any).phone
            : undefined
        }
        totalItems={currentOrder.items.length}
        totalAmount={currentOrder.pricing.total}
        deliveryStatus={currentOrder.deliverystatus}
        viewAs="driver"
        onClose={() => setMapOpen(false)}
        onMarkDelivered={() =>
          updateStatus({
            orderId: currentOrder._id,

            deliverystatus: "delivered",
          })
        }
        isMarkingDelivered={updatingStatus}
      />
    );
  }

  // ════════════════════════════════════════════════════════════════════════
  // MAIN DASHBOARD
  // ════════════════════════════════════════════════════════════════════════

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen overflow-hidden">
        {/* ═══════════════════════════════════════════════════════════════
            Desktop Sidebar
        ═══════════════════════════════════════════════════════════════ */}

        <aside
          className="hidden lg:flex flex-col w-72 border-r bg-white"
          style={{
            borderColor: "hsl(var(--brand-muted))",
          }}
        >
          <div
            className="h-1 w-full"
            style={{
              background:
                "linear-gradient(90deg, hsl(var(--brand-primary)), hsl(var(--brand-accent)))",
            }}
          />

          {/* Profile */}
          <div
            className="p-6 border-b"
            style={{
              borderColor: "hsl(var(--brand-muted))",
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white text-lg"
                style={{
                  background:
                    "linear-gradient(135deg, hsl(var(--brand-primary)), hsl(var(--brand-accent)/80%))",
                }}
              >
                {(profile?.name ?? "D")[0]}
              </div>

              <div className="min-w-0">
                <p
                  className="font-poppins font-bold text-sm truncate"
                  style={{
                    color: "hsl(var(--brand-dark))",
                  }}
                >
                  {profile?.name}
                </p>

                <p className="font-poppins text-xs text-gray-400 truncate">
                  {profile?.email}
                </p>

                <div className="flex items-center gap-1.5 mt-1">
                  <span
                    className={`w-1.5 h-1.5 rounded-full inline-block ${
                      isOnline ? "animate-pulse" : ""
                    }`}
                    style={{
                      background: isOnline ? "hsl(142 76% 45%)" : "#d1d5db",
                    }}
                  />

                  <span
                    className="text-[11px] font-poppins"
                    style={{
                      color: isOnline ? "hsl(142 76% 36%)" : "#9ca3af",
                    }}
                  >
                    {isOnline ? "Online" : "Offline"}
                  </span>
                </div>
              </div>
            </div>

            {/* Online toggle */}
            <button
              onClick={() => toggleOnline(!isOnline)}
              disabled={togglingOnline}
              className="mt-4 w-full h-10 rounded-xl font-poppins font-semibold text-sm flex items-center justify-center gap-2 transition-all"
              style={
                isOnline
                  ? {
                      background: "hsl(142 76% 45%/10%)",
                      color: "hsl(142 76% 36%)",
                      border: "1.5px solid hsl(142 76% 45%/25%)",
                    }
                  : {
                      background: "hsl(var(--brand-primary))",
                      color: "white",
                      boxShadow: "0 4px 12px hsl(var(--brand-primary)/25%)",
                    }
              }
            >
              {togglingOnline ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isOnline ? (
                <>
                  <Power className="w-4 h-4" />
                  Go Offline
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Go Online
                </>
              )}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {(
              [
                {
                  key: "home",
                  icon: <Home className="w-4 h-4" />,
                  label: "Dashboard",
                },
                {
                  key: "history",
                  icon: <History className="w-4 h-4" />,
                  label: "My Deliveries",
                },
                {
                  key: "profile",
                  icon: <User className="w-4 h-4" />,
                  label: "Profile",
                },
              ] as const
            ).map(({ key, icon, label }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-poppins font-medium text-sm transition-all text-left"
                style={
                  tab === key
                    ? {
                        background: "hsl(var(--brand-primary)/10%)",
                        color: "hsl(var(--brand-primary))",
                      }
                    : {
                        color: "#6b7280",
                      }
                }
              >
                {icon}
                {label}

                {tab === key && (
                  <span
                    className="ml-auto w-1.5 h-1.5 rounded-full"
                    style={{
                      background: "hsl(var(--brand-primary))",
                    }}
                  />
                )}
              </button>
            ))}
          </nav>

          {/* Stats */}
          <div
            className="p-4 border-t space-y-3"
            style={{
              borderColor: "hsl(var(--brand-muted))",
            }}
          >
            {[
              {
                label: "Deliveries",
                value: profile?.totalDeliveries ?? 0,
                color: "var(--brand-primary)",
              },
              {
                label: "Rating",
                value: profile?.averageRating
                  ? `${profile.averageRating.toFixed(1)}★`
                  : "—",
                color: "var(--brand-accent)",
              },
              {
                label: "Earnings",
                value: `₹${(profile?.totalEarnings ?? 0).toLocaleString(
                  "en-IN",
                )}`,
                color: "142 76% 36%",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex items-center justify-between"
              >
                <span className="text-xs font-poppins text-gray-400">
                  {stat.label}
                </span>

                <span
                  className="text-sm font-poppins font-bold"
                  style={{
                    color: `hsl(${stat.color})`,
                  }}
                >
                  {stat.value}
                </span>
              </div>
            ))}
          </div>

          {/* Logout */}
          <div className="p-4">
            <button
              onClick={() => logoutMutate()}
              disabled={loggingOut}
              className="w-full flex items-center justify-center gap-2 h-10 rounded-xl font-poppins text-sm font-medium text-red-500 hover:bg-red-50 transition-all"
              style={{
                border: "1px solid #fecaca",
              }}
            >
              {loggingOut ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <LogOut className="w-4 h-4" />
              )}
              Sign Out
            </button>
          </div>
        </aside>

        {/* ═══════════════════════════════════════════════════════════════
            Main content
        ═══════════════════════════════════════════════════════════════ */}

        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Mobile top bar */}
          <div
            className="lg:hidden sticky top-0 z-20 bg-white/95 backdrop-blur-md px-4 py-3"
            style={{
              borderBottom: "1px solid hsl(var(--brand-muted))",
            }}
          >
            <div
              className="h-0.5 absolute top-0 left-0 right-0"
              style={{
                background:
                  "linear-gradient(90deg, hsl(var(--brand-primary)), hsl(var(--brand-accent)))",
              }}
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm text-white"
                  style={{
                    background:
                      "linear-gradient(135deg, hsl(var(--brand-primary)), hsl(var(--brand-accent)/80%))",
                  }}
                >
                  {(profile?.name ?? "D")[0]}
                </div>

                <div>
                  <p
                    className="text-sm font-poppins font-semibold leading-none"
                    style={{
                      color: "hsl(var(--brand-dark))",
                    }}
                  >
                    {profile?.name}
                  </p>

                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span
                      className={`w-1.5 h-1.5 rounded-full inline-block ${
                        isOnline ? "animate-pulse" : ""
                      }`}
                      style={{
                        background: isOnline ? "hsl(142 76% 45%)" : "#d1d5db",
                      }}
                    />

                    <span className="text-xs font-poppins text-gray-400">
                      {isOnline ? "Online" : "Offline"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleOnline(!isOnline)}
                  disabled={togglingOnline}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-poppins font-semibold transition-all"
                  style={
                    isOnline
                      ? {
                          background: "hsl(142 76% 45%/10%)",
                          color: "hsl(142 76% 36%)",
                          border: "1.5px solid hsl(142 76% 45%/25%)",
                        }
                      : {
                          background: "hsl(var(--brand-muted))",
                          color: "#6b7280",
                          border: "1.5px solid hsl(var(--brand-muted))",
                        }
                  }
                >
                  {togglingOnline ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Power className="w-3 h-3" />
                  )}

                  {isOnline ? "Online" : "Go Online"}
                </button>

                <button
                  onClick={() => logoutMutate()}
                  disabled={loggingOut}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                  style={{
                    border: "1.5px solid hsl(var(--brand-muted))",
                  }}
                >
                  {loggingOut ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <LogOut className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Desktop header */}
          <div
            className="hidden lg:flex items-center justify-between px-8 py-5 bg-white border-b"
            style={{
              borderColor: "hsl(var(--brand-muted))",
            }}
          >
            <div>
              <h1
                className="text-xl font-satisfy"
                style={{
                  color: "hsl(var(--brand-primary))",
                }}
              >
                {tab === "home"
                  ? "Dashboard"
                  : tab === "history"
                    ? "My Deliveries"
                    : "Profile"}
              </h1>

              <p className="text-xs font-poppins text-gray-400 mt-0.5">
                {new Date().toLocaleDateString("en-IN", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </p>
            </div>

            {isOnline && driverCoords && (
              <div
                className="flex items-center gap-2 px-3 py-1.5 rounded-full"
                style={{
                  background: "hsl(142 76% 45%/8%)",
                  border: "1px solid hsl(142 76% 45%/20%)",
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full animate-pulse inline-block"
                  style={{
                    background: "hsl(142 76% 45%)",
                  }}
                />

                <span
                  className="text-xs font-poppins font-semibold"
                  style={{
                    color: "hsl(142 76% 36%)",
                  }}
                >
                  GPS Active
                </span>
              </div>
            )}
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-auto scrollbar-hide px-4 lg:px-8 pt-5 pb-24 lg:pb-8 space-y-5">
            {/* ═════════════════════════════════════════════════════════
                HOME
            ═════════════════════════════════════════════════════════ */}

            {tab === "home" && (
              <>
                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    {
                      label: "Deliveries",
                      value: profile?.totalDeliveries ?? 0,
                      icon: <Package className="w-4 h-4" />,
                      color: "var(--brand-primary)",
                    },

                    {
                      label: "Rating",
                      value:
                        profile?.totalRatings && profile.averageRating > 0
                          ? `${profile.averageRating.toFixed(1)}★`
                          : "—",
                      icon: <Star className="w-4 h-4" />,
                      color: "var(--brand-accent)",
                    },

                    {
                      label: "Earnings",
                      value: `₹${(profile?.totalEarnings ?? 0).toLocaleString(
                        "en-IN",
                      )}`,
                      icon: <IndianRupee className="w-4 h-4" />,
                      color: "142 76% 36%",
                    },
                  ].map((stat) => (
                    <Card key={stat.label}>
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center mb-2"
                        style={{
                          background: `hsl(${stat.color}/12%)`,
                          color: `hsl(${stat.color})`,
                        }}
                      >
                        {stat.icon}
                      </div>

                      <p
                        className="text-base font-poppins font-bold leading-none"
                        style={{
                          color: "hsl(var(--brand-dark))",
                        }}
                      >
                        {stat.value}
                      </p>

                      <p className="text-xs font-poppins text-gray-400 mt-0.5">
                        {stat.label}
                      </p>
                    </Card>
                  ))}
                </div>

                {/* Active order */}
                {currentOrder ? (
                  <Card accent>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center"
                          style={{
                            background: "hsl(var(--brand-primary)/15%)",
                          }}
                        >
                          <Truck
                            className="w-4 h-4"
                            style={{
                              color: "hsl(var(--brand-primary))",
                            }}
                          />
                        </div>

                        <div>
                          <p
                            className="text-[10px] font-poppins font-semibold uppercase tracking-widest"
                            style={{
                              color: "hsl(var(--brand-primary))",
                            }}
                          >
                            Active Order
                          </p>

                          <p
                            className="text-sm font-poppins font-bold"
                            style={{
                              color: "hsl(var(--brand-dark))",
                            }}
                          >
                            {currentOrder.orderId}
                          </p>
                        </div>
                      </div>

                      <span
                        className="text-xs font-poppins font-semibold px-2.5 py-1 rounded-full capitalize"
                        style={{
                          background:
                            currentOrder.deliverystatus === "out_for_delivery"
                              ? "hsl(var(--brand-primary)/12%)"
                              : "hsl(142 76% 45%/10%)",

                          color:
                            currentOrder.deliverystatus === "out_for_delivery"
                              ? "hsl(var(--brand-primary))"
                              : "hsl(142 76% 36%)",
                        }}
                      >
                        {currentOrder.deliverystatus.replace(/_/g, " ")}
                      </span>
                    </div>

                    {/* Customer */}
                    <div
                      className="rounded-xl p-3 space-y-2 mb-3"
                      style={{
                        background: "hsl(var(--brand-muted))",
                      }}
                    >
                      {typeof currentOrder.userId === "object" &&
                        currentOrder.userId && (
                          <div className="flex items-center gap-2">
                            <User className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />

                            <span
                              className="text-sm font-poppins font-medium"
                              style={{
                                color: "hsl(var(--brand-dark))",
                              }}
                            >
                              {(currentOrder.userId as any).name}
                            </span>

                            <a
                              href={`tel:${(currentOrder.userId as any).phone}`}
                              className="ml-auto flex items-center gap-1 text-xs font-poppins font-semibold px-2.5 py-1 rounded-full"
                              style={{
                                background: "hsl(var(--brand-primary)/12%)",
                                color: "hsl(var(--brand-primary))",
                              }}
                            >
                              <Phone className="w-3 h-3" />
                              Call
                            </a>
                          </div>
                        )}

                      <div className="flex items-start gap-2">
                        <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />

                        <span className="text-sm font-poppins text-gray-500">
                          {currentOrder.deliveryInfo.address},{" "}
                          {currentOrder.deliveryInfo.city}
                        </span>
                      </div>
                    </div>

                    {/* Amount */}
                    <div className="flex items-center justify-between text-sm font-poppins mb-3">
                      <span className="text-gray-400">
                        {currentOrder.items.length} items
                      </span>

                      <span
                        className="font-bold"
                        style={{
                          color: "hsl(var(--brand-dark))",
                        }}
                      >
                        ₹{currentOrder.pricing.total.toLocaleString("en-IN")}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-2">
                      {/* Assigned */}
                      {currentOrder.deliverystatus === "assigned" && (
                        <Button
                          disabled={updatingStatus}
                          onClick={() =>
                            updateStatus({
                              orderId: currentOrder._id,
                              deliverystatus: "out_for_delivery",
                            })
                          }
                          className="h-10 rounded-xl text-sm font-poppins font-semibold text-white gap-2"
                          style={{
                            background: "hsl(var(--brand-secondary))",
                          }}
                        >
                          {updatingStatus ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Navigation2 className="w-4 h-4" />
                          )}
                          On My Way
                        </Button>
                      )}

                      {/* Out for delivery */}
                      {currentOrder.deliverystatus === "out_for_delivery" && (
                        <>
                          <Button
                            onClick={handleOpenMap}
                            disabled={gpsLoading}
                            className="h-10 rounded-xl text-sm font-poppins font-semibold text-white gap-2"
                            style={{
                              background:
                                "linear-gradient(135deg, hsl(var(--brand-primary)), hsl(var(--brand-accent)/80%))",

                              boxShadow:
                                "0 3px 10px hsl(var(--brand-primary)/25%)",
                            }}
                          >
                            {gpsLoading ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Getting GPS…
                              </>
                            ) : (
                              <>
                                <MapPin className="w-4 h-4" />
                                Track Route
                              </>
                            )}
                          </Button>

                          <Button
                            disabled={updatingStatus}
                            onClick={() => setDeliverDialog(true)}
                            className="h-10 rounded-xl text-sm font-poppins font-semibold text-white gap-2"
                            style={{
                              background: "hsl(142 76% 36%)",
                            }}
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            Delivered
                          </Button>
                        </>
                      )}

                      {/* Refresh */}
                      {currentOrder.deliverystatus === "assigned" && (
                        <Button
                          variant="outline"
                          onClick={() => refetchCurrent()}
                          className="h-10 rounded-xl text-sm font-poppins gap-2 text-gray-500"
                          style={{
                            borderColor: "hsl(var(--brand-muted))",
                          }}
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          Refresh
                        </Button>
                      )}
                    </div>
                  </Card>
                ) : isOnline ? (
                  <>
                    {/* Available orders */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <SectionLabel>Available Orders</SectionLabel>

                        <button
                          onClick={() => refetchOrders()}
                          disabled={ordersFetching}
                          className="text-xs font-poppins font-semibold flex items-center gap-1"
                          style={{
                            color: "hsl(var(--brand-primary))",
                            opacity: ordersFetching ? 0.5 : 1,
                          }}
                        >
                          <RefreshCw
                            className={`w-3 h-3 ${
                              ordersFetching ? "animate-spin" : ""
                            }`}
                          />
                          Refresh
                        </button>
                      </div>

                      {ordersLoading &&
                        [1, 2].map((item) => <SkeletonCard key={item} />)}

                      {!ordersLoading && availableOrders.length === 0 && (
                        <Card className="py-10 text-center">
                          <ShoppingBag className="w-10 h-10 mx-auto mb-3 text-gray-200" />

                          <p className="font-poppins font-medium text-gray-500 text-sm">
                            No orders available
                          </p>

                          <p className="font-poppins text-gray-400 text-xs mt-1">
                            New orders will appear here automatically
                          </p>
                        </Card>
                      )}

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                        {availableOrders.map((order) => (
                          <Card key={order._id}>
                            <div className="flex items-start justify-between gap-3 mb-2">
                              <div>
                                <p
                                  className="text-sm font-poppins font-bold"
                                  style={{
                                    color: "hsl(var(--brand-dark))",
                                  }}
                                >
                                  {order.orderId}
                                </p>

                                <p className="text-xs font-poppins text-gray-400 mt-0.5">
                                  {timeAgo(order.createdAt)}
                                </p>
                              </div>

                              <span
                                className="text-lg font-poppins font-bold flex-shrink-0"
                                style={{
                                  color: "hsl(var(--brand-primary))",
                                }}
                              >
                                ₹{order.pricing.total.toLocaleString("en-IN")}
                              </span>
                            </div>

                            <div className="flex items-start gap-2 mb-3">
                              <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />

                              <p className="text-xs font-poppins text-gray-500 line-clamp-2">
                                {order.deliveryInfo.address},{" "}
                                {order.deliveryInfo.city}
                              </p>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5 text-xs font-poppins text-gray-400">
                                <Package className="w-3.5 h-3.5" />
                                {order.items.length} item
                                {order.items.length > 1 ? "s" : ""}
                                {order.pricing.deliveryCharge > 0 && (
                                  <span
                                    className="ml-2"
                                    style={{
                                      color: "hsl(142 76% 40%)",
                                    }}
                                  >
                                    +₹
                                    {order.pricing.deliveryCharge} earn
                                  </span>
                                )}
                              </div>

                              <Button
                                size="sm"
                                onClick={() => setConfirmOrder(order)}
                                className="rounded-xl h-8 px-4 text-xs font-poppins font-semibold text-white"
                                style={{
                                  background:
                                    "linear-gradient(135deg, hsl(var(--brand-primary)), hsl(var(--brand-accent)/80%))",
                                }}
                              >
                                Accept
                              </Button>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  /* Offline */
                  <Card className="py-12 text-center space-y-4">
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto"
                      style={{
                        background: "hsl(var(--brand-muted))",
                      }}
                    >
                      <Power className="w-8 h-8 text-gray-300" />
                    </div>

                    <div>
                      <p
                        className="font-poppins font-semibold"
                        style={{
                          color: "hsl(var(--brand-dark))",
                        }}
                      >
                        You're Offline
                      </p>

                      <p className="text-sm font-poppins text-gray-400 mt-1">
                        Go online to start receiving orders
                      </p>
                    </div>

                    <Button
                      disabled={togglingOnline}
                      onClick={() => toggleOnline(true)}
                      className="font-poppins font-semibold text-white px-8 rounded-xl gap-2 shadow-md"
                      style={{
                        background: "hsl(142 76% 36%)",
                        boxShadow: "0 4px 12px hsl(142 76% 36%/25%)",
                      }}
                    >
                      {togglingOnline ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Zap className="w-4 h-4" />
                      )}
                      Go Online
                    </Button>
                  </Card>
                )}
              </>
            )}

            {/* ═════════════════════════════════════════════════════════
                HISTORY
            ═════════════════════════════════════════════════════════ */}

            {tab === "history" && (
              <div className="space-y-3">
                <SectionLabel>Delivery History</SectionLabel>

                {history.length === 0 && (
                  <Card className="py-10 text-center">
                    <Package className="w-10 h-10 mx-auto mb-3 text-gray-200" />

                    <p className="font-poppins text-gray-400 text-sm">
                      No deliveries yet
                    </p>
                  </Card>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {history.map((item) => (
                    <Card key={item._id}>
                      <div className="flex items-center justify-between mb-2">
                        <p
                          className="text-sm font-poppins font-bold"
                          style={{
                            color: "hsl(var(--brand-dark))",
                          }}
                        >
                          {item.orderId}
                        </p>

                        <span
                          className="text-sm font-poppins font-bold"
                          style={{
                            color: "hsl(142 76% 36%)",
                          }}
                        >
                          ₹{item.pricing.total.toLocaleString("en-IN")}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs font-poppins text-gray-400 mb-2">
                        <MapPin className="w-3 h-3" />
                        {item.deliveryInfo.address}, {item.deliveryInfo.city}
                      </div>

                      {item.deliveryRating?.rating && (
                        <div className="flex items-center gap-1 mb-1">
                          {[...Array(5)].map((_, index) => (
                            <Star
                              key={index}
                              className="w-3 h-3"
                              style={{
                                fill:
                                  index < item.deliveryRating!.rating!
                                    ? "hsl(var(--brand-accent))"
                                    : "transparent",

                                color:
                                  index < item.deliveryRating!.rating!
                                    ? "hsl(var(--brand-accent))"
                                    : "#e5e7eb",
                              }}
                            />
                          ))}
                        </div>
                      )}

                      <p className="text-xs font-poppins text-gray-300">
                        {timeAgo(item.createdAt)}
                      </p>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* ═════════════════════════════════════════════════════════
                PROFILE
            ═════════════════════════════════════════════════════════ */}

            {tab === "profile" && (
              <div className="space-y-4 max-w-lg">
                <Card>
                  <div className="flex items-center gap-4 mb-5">
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold font-poppins text-white shadow-md"
                      style={{
                        background:
                          "linear-gradient(135deg, hsl(var(--brand-primary)), hsl(var(--brand-accent)/80%))",
                      }}
                    >
                      {(profile?.name ?? "D")[0]}
                    </div>

                    <div>
                      <p
                        className="text-lg font-poppins font-bold"
                        style={{
                          color: "hsl(var(--brand-dark))",
                        }}
                      >
                        {profile?.name}
                      </p>

                      <p className="text-sm font-poppins text-gray-400">
                        {profile?.email}
                      </p>

                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span
                          className="text-xs font-poppins font-semibold px-2.5 py-0.5 rounded-full"
                          style={
                            profile?.isApproved
                              ? {
                                  background: "hsl(142 76% 45%/12%)",
                                  color: "hsl(142 76% 36%)",
                                }
                              : {
                                  background: "hsl(var(--brand-accent)/15%)",
                                  color: "hsl(var(--brand-accent))",
                                }
                          }
                        >
                          {profile?.isApproved ? "✓ Approved" : "Pending"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div
                    className="space-y-3 pt-4"
                    style={{
                      borderTop: "1px solid hsl(var(--brand-muted))",
                    }}
                  >
                    {[
                      {
                        icon: <Phone className="w-4 h-4" />,
                        label: "Phone",
                        value: profile?.phone ?? "—",
                      },

                      {
                        icon: <Bike className="w-4 h-4" />,
                        label: "Vehicle",
                        value: `${
                          vehicleLabel[profile?.vehicleType ?? "bike"]
                        }${
                          profile?.vehicleNumber
                            ? ` · ${profile.vehicleNumber}`
                            : ""
                        }`,
                      },

                      {
                        icon: <Clock className="w-4 h-4" />,
                        label: "Joined",
                        value: profile?.createdAt
                          ? new Date(profile.createdAt).toLocaleDateString(
                              "en-IN",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              },
                            )
                          : "—",
                      },
                    ].map(({ icon, label, value }) => (
                      <div key={label} className="flex items-center gap-3">
                        <span className="text-gray-300 flex-shrink-0">
                          {icon}
                        </span>

                        <span className="text-xs font-poppins text-gray-400 w-20 flex-shrink-0">
                          {label}
                        </span>

                        <span
                          className="text-sm font-poppins font-medium truncate"
                          style={{
                            color: "hsl(var(--brand-dark))",
                          }}
                        >
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>

                <Button
                  variant="outline"
                  onClick={() => logoutMutate()}
                  disabled={loggingOut}
                  className="w-full h-11 rounded-xl font-poppins font-semibold gap-2 text-red-500 hover:bg-red-50 hover:border-red-200 transition-all"
                  style={{
                    border: "1.5px solid #fecaca",
                  }}
                >
                  {loggingOut ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <LogOut className="w-4 h-4" />
                  )}
                  Sign Out
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          Mobile bottom navigation
      ═══════════════════════════════════════════════════════════════ */}

      <div
        className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md z-20"
        style={{
          borderTop: "1px solid hsl(var(--brand-muted))",
        }}
      >
        <div className="grid grid-cols-3 max-w-md mx-auto py-2">
          {(
            [
              {
                key: "home",
                icon: <Home className="w-5 h-5" />,
                label: "Home",
              },

              {
                key: "history",
                icon: <History className="w-5 h-5" />,
                label: "History",
              },

              {
                key: "profile",
                icon: <User className="w-5 h-5" />,
                label: "Profile",
              },
            ] as const
          ).map(({ key, icon, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className="flex flex-col items-center gap-1 py-1.5 transition-all"
              style={{
                color: tab === key ? "hsl(var(--brand-primary))" : "#9ca3af",
              }}
            >
              {icon}

              <span className="text-[10px] font-poppins font-medium">
                {label}
              </span>

              {tab === key && (
                <span
                  className="w-4 h-0.5 rounded-full -mt-0.5"
                  style={{
                    background: "hsl(var(--brand-primary))",
                  }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          Accept order dialog
      ═══════════════════════════════════════════════════════════════ */}

      <Dialog open={!!confirmOrder} onOpenChange={() => setConfirmOrder(null)}>
        <DialogContent className="max-w-sm rounded-2xl bg-white">
          <DialogHeader>
            <DialogTitle
              className="font-poppins"
              style={{
                color: "hsl(var(--brand-dark))",
              }}
            >
              Accept this order?
            </DialogTitle>
          </DialogHeader>

          {confirmOrder && (
            <div
              className="rounded-xl p-3 space-y-2.5 my-1"
              style={{
                background: "hsl(var(--brand-muted))",
              }}
            >
              <div className="flex items-center justify-between">
                <span
                  className="text-sm font-poppins font-bold"
                  style={{
                    color: "hsl(var(--brand-dark))",
                  }}
                >
                  {confirmOrder.orderId}
                </span>

                <span
                  className="font-poppins font-bold"
                  style={{
                    color: "hsl(var(--brand-primary))",
                  }}
                >
                  ₹{confirmOrder.pricing.total.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />

                <p className="text-xs font-poppins text-gray-500">
                  {confirmOrder.deliveryInfo.address},{" "}
                  {confirmOrder.deliveryInfo.city}
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setConfirmOrder(null)}
              className="rounded-xl font-poppins text-gray-500"
              style={{
                borderColor: "hsl(var(--brand-muted))",
              }}
            >
              Cancel
            </Button>

            <Button
              disabled={accepting}
              onClick={() => confirmOrder && acceptOrder(confirmOrder._id)}
              className="rounded-xl font-poppins font-semibold text-white gap-2"
              style={{
                background:
                  "linear-gradient(135deg, hsl(var(--brand-primary)), hsl(var(--brand-accent)/80%))",
              }}
            >
              {accepting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              Accept Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══════════════════════════════════════════════════════════════
          Delivered dialog
      ═══════════════════════════════════════════════════════════════ */}

      <Dialog open={deliverDialog} onOpenChange={setDeliverDialog}>
        <DialogContent className="max-w-sm rounded-2xl bg-white">
          <DialogHeader>
            <DialogTitle
              className="font-poppins"
              style={{
                color: "hsl(var(--brand-dark))",
              }}
            >
              Confirm Delivery?
            </DialogTitle>
          </DialogHeader>

          <p className="text-sm font-poppins text-gray-500 py-2">
            Confirm you have handed over the order to the customer.
          </p>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDeliverDialog(false)}
              className="rounded-xl font-poppins text-gray-500"
              style={{
                borderColor: "hsl(var(--brand-muted))",
              }}
            >
              Cancel
            </Button>

            <Button
              disabled={updatingStatus}
              onClick={() =>
                currentOrder &&
                updateStatus({
                  orderId: currentOrder._id,
                  deliverystatus: "delivered",
                })
              }
              className="rounded-xl font-poppins font-semibold text-white gap-2"
              style={{
                background: "hsl(142 76% 36%)",
                boxShadow: "0 4px 12px hsl(142 76% 36%/25%)",
              }}
            >
              {updatingStatus ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              Yes, Delivered!
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Toaster />
    </div>
  );
}
