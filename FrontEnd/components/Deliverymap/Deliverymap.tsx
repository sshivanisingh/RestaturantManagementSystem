"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  Navigation2,
  Phone,
  Package,
  Loader2,
  MapPin,
  AlertCircle,
  WifiOff,
  ChevronDown,
  ChevronUp,
  Copy,
  Volume2,
  CheckCircle2,
  Clock,
  X,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────
export interface DeliveryMapProps {
  driverLat: number;
  driverLng: number;
  customerAddress: string;
  customerLat?: number;
  customerLng?: number;
  orderId: string;
  customerName?: string;
  customerPhone?: string;
  totalItems: number;
  totalAmount: number;
  deliveryStatus: string;
  viewAs?: "driver" | "customer";
  onClose?: () => void;
  onMarkDelivered?: () => void;
  isMarkingDelivered?: boolean;
}

interface EtaInfo {
  durationText: string;
  distanceText: string;
  durationSeconds: number;
}
interface StepInfo {
  instruction: string;
  distance: string;
  maneuver: string;
  startLat: number;
  startLng: number;
}

// ── Maps loader ────────────────────────────────────────────────────
const KEY = process.env.GOOGLE_MAPS_API_KEY ?? "";
let loadPromise: Promise<void> | null = null;

function loadGMaps(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if ((window as any).google?.maps?.Map) return Promise.resolve();
  if (loadPromise) return loadPromise;
  loadPromise = new Promise((ok, fail) => {
    const s = document.createElement("script");
    s.src = `https://maps.googleapis.com/maps/api/js?key=${KEY}&libraries=geometry,places`;
    s.async = true;
    s.onload = () => ok();
    s.onerror = () => fail(new Error("Maps load error"));
    document.head.appendChild(s);
  });
  return loadPromise;
}

function geocodeAddr(
  address: string,
): Promise<google.maps.LatLngLiteral | null> {
  return new Promise((resolve) => {
    const G = (window as any).google?.maps;
    if (!G) return resolve(null);
    new G.Geocoder().geocode({ address }, (r: any[], s: string) =>
      s === "OK" && r?.[0]
        ? resolve({
            lat: r[0].geometry.location.lat(),
            lng: r[0].geometry.location.lng(),
          })
        : resolve(null),
    );
  });
}

function computeHeading(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number },
): number {
  const dLon = ((to.lng - from.lng) * Math.PI) / 180;
  const lat1 = (from.lat * Math.PI) / 180,
    lat2 = (to.lat * Math.PI) / 180;
  const y = Math.sin(dLon) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

function parseInstruction(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getTurnArrow(maneuver: string): string {
  if (!maneuver) return "↑";
  if (maneuver.includes("right")) return "↱";
  if (maneuver.includes("left")) return "↰";
  if (maneuver.includes("uturn")) return "↩";
  if (maneuver.includes("roundabout")) return "↻";
  return "↑";
}

// ── Light map style ────────────────────────────────────────────────
const MAP_STYLE: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#f0f0f0" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#555" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#f0f0f0" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#333" }],
  },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#ffffff" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#e0e0e0" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#777" }],
  },
  {
    featureType: "road.arterial",
    elementType: "geometry",
    stylers: [{ color: "#ffffff" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#f5f0e8" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#ddd" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#666" }],
  },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  {
    featureType: "landscape.natural",
    elementType: "geometry",
    stylers: [{ color: "#e8f5e9" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry.fill",
    stylers: [{ color: "#e8f5e9" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#c8e6f5" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9ab" }],
  },
];

// ── Navigation arrow overlay ───────────────────────────────────────
function makeNavArrow(
  G: any,
  lat: number,
  lng: number,
  heading: number,
  map: any,
) {
  if (!document.getElementById("_nav_css")) {
    const s = document.createElement("style");
    s.id = "_nav_css";
    s.textContent =
      "@keyframes navRing{0%{transform:scale(.4);opacity:.5}100%{transform:scale(2.2);opacity:0}}";
    document.head.appendChild(s);
  }

  class NavOverlay extends G.OverlayView {
    _pos: any;
    _div: HTMLDivElement | null = null;
    _inner: HTMLElement | null = null;
    constructor() {
      super();
      this._pos = new G.LatLng(lat, lng);
    }

    onAdd() {
      const d = document.createElement("div");
      d.style.cssText =
        "position:absolute;pointer-events:none;user-select:none;";
      d.innerHTML = `
        <div style="position:relative;width:58px;height:58px;transform:translate(-50%,-50%)">
          <div style="position:absolute;inset:0;border-radius:50%;background:#1565C0;animation:navRing 2s ease-out infinite;"></div>
          <div style="position:absolute;inset:0;border-radius:50%;background:#1565C0;animation:navRing 2s ease-out 0.85s infinite;"></div>
          <div id="_nav_inner" style="position:absolute;inset:7px;border-radius:50%;
            background:#1976D2;border:3px solid white;
            box-shadow:0 4px 16px rgba(25,118,210,.6);
            display:flex;align-items:center;justify-content:center;
            transform:rotate(${heading}deg);">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <polygon points="9,2 15,15 9,11 3,15" fill="white"/>
            </svg>
          </div>
        </div>`;
      this._div = d;
      this._inner = d.querySelector("#_nav_inner");
      this.getPanes()!.overlayMouseTarget.appendChild(d);
    }

    draw() {
      if (!this._div) return;
      const pt = this.getProjection().fromLatLngToDivPixel(this._pos)!;
      this._div.style.left = pt.x + "px";
      this._div.style.top = pt.y + "px";
    }

    onRemove() {
      this._div?.parentNode?.removeChild(this._div);
      this._div = null;
    }
    setHeading(deg: number) {
      if (this._inner) this._inner.style.transform = `rotate(${deg}deg)`;
    }

    moveTo(toLat: number, toLng: number) {
      const fLat = this._pos.lat(),
        fLng = this._pos.lng();
      const t0 = performance.now(),
        dur = 1200;
      const step = (now: number) => {
        const p = Math.min((now - t0) / dur, 1);
        const ep = p < 0.5 ? 2 * p * p : -1 + (4 - 2 * p) * p;
        this._pos = new G.LatLng(
          fLat + (toLat - fLat) * ep,
          fLng + (toLng - fLng) * ep,
        );
        this.draw();
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }
  }

  const o = new NavOverlay();
  o.setMap(map);
  return o;
}

// ── Destination pin ────────────────────────────────────────────────
const destIconUrl = () =>
  `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="52" height="66" viewBox="0 0 52 66">
  <path d="M26 0C11.6 0 0 11.6 0 26c0 21 26 40 26 40s26-19 26-40C52 11.6 40.4 0 26 0z"
    fill="#E53935" stroke="white" stroke-width="2.5"/>
  <circle cx="26" cy="26" r="14" fill="white"/>
  <circle cx="26" cy="26" r="8"  fill="#E53935"/>
</svg>`)}`;

// ── Slide to confirm ───────────────────────────────────────────────
function SlideToConfirm({
  onConfirm,
  isLoading,
}: {
  onConfirm: () => void;
  isLoading?: boolean;
}) {
  const [x, setX] = useState(0);
  const [done, setDone] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const startX = useRef(0);

  const getMax = () => (trackRef.current?.clientWidth ?? 300) - 66;

  const onStart = (cx: number) => {
    if (done || isLoading) return;
    dragging.current = true;
    startX.current = cx - x;
  };
  const onMove = (cx: number) => {
    if (!dragging.current) return;
    const nx = Math.max(0, Math.min(cx - startX.current, getMax()));
    setX(nx);
    if (nx >= getMax() - 4) {
      dragging.current = false;
      setDone(true);
      onConfirm();
    }
  };
  const onEnd = () => {
    if (!done) {
      dragging.current = false;
      setX(0);
    }
  };

  return (
    <div
      ref={trackRef}
      className="relative h-14 rounded-2xl overflow-hidden select-none"
      style={{ background: done ? "#14532d" : "#16a34a" }}
      onMouseMove={(e) => onMove(e.clientX)}
      onMouseUp={onEnd}
      onMouseLeave={onEnd}
      onTouchMove={(e) => {
        e.preventDefault();
        onMove(e.touches[0].clientX);
      }}
      onTouchEnd={onEnd}
    >
      <span
        className="absolute inset-0 flex items-center justify-center text-white/90 text-sm font-semibold tracking-wide pointer-events-none"
        style={{ paddingLeft: 64, opacity: done ? 0 : 1 }}
      >
        {isLoading ? "Confirming…" : "Slide to confirm delivery"}
      </span>
      {done && (
        <span className="absolute inset-0 flex items-center justify-center text-white text-sm font-semibold pointer-events-none gap-2">
          <CheckCircle2 className="w-4 h-4" /> Delivered!
        </span>
      )}
      <div
        className="absolute top-1 left-1 bottom-1 w-14 rounded-xl bg-white shadow-lg flex items-center justify-center z-10"
        style={{
          transform: `translateX(${x}px)`,
          transition: dragging.current ? "none" : "transform 0.25s ease",
          cursor: done ? "default" : "grab",
        }}
        onMouseDown={(e) => {
          e.preventDefault();
          onStart(e.clientX);
        }}
        onTouchStart={(e) => onStart(e.touches[0].clientX)}
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 text-green-700 animate-spin" />
        ) : done ? (
          <CheckCircle2 className="w-5 h-5 text-green-700" />
        ) : (
          <span className="text-green-700 font-bold text-xl select-none">
            »
          </span>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════
export default function DeliveryMap({
  driverLat,
  driverLng,
  customerAddress,
  customerLat,
  customerLng,
  orderId,
  customerName,
  customerPhone,
  totalItems,
  totalAmount,
  deliveryStatus,
  viewAs = "driver",
  onClose,
  onMarkDelivered,
  isMarkingDelivered,
}: DeliveryMapProps) {
  const divRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const driverRef = useRef<any>(null);
  const polylinesRef = useRef<any[]>([]);
  const prevLL = useRef({ lat: driverLat, lng: driverLng });
  const headingRef = useRef(0);

  type MapStatus =
    | "loading"
    | "gps_wait"
    | "geocoding"
    | "routing"
    | "ready"
    | "error";
  const [status, setStatus] = useState<MapStatus>("loading");
  const [errMsg, setErrMsg] = useState("");
  const [dest, setDest] = useState<google.maps.LatLngLiteral | null>(
    customerLat && customerLng ? { lat: customerLat, lng: customerLng } : null,
  );
  const [eta, setEta] = useState<EtaInfo | null>(null);
  const [steps, setSteps] = useState<StepInfo[]>([]);
  const [stepIdx, setStepIdx] = useState(0);
  const [items, setItems] = useState(false);
  const [copied, setCopied] = useState(false);

  const hasGPS = driverLat !== 0 || driverLng !== 0;
  const currentStep = steps[stepIdx] ?? null;

  const deliveryTime = eta
    ? new Date(Date.now() + eta.durationSeconds * 1000).toLocaleTimeString(
        "en-IN",
        { hour: "2-digit", minute: "2-digit", hour12: true },
      )
    : "—";

  const copyOrderId = () => {
    navigator.clipboard?.writeText(orderId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const openDirections = () => {
    if (!dest) return;
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${dest.lat},${dest.lng}&travelmode=driving`,
      "_blank",
    );
  };

  // ── Draw route ─────────────────────────────────────────────────
  const drawRoute = useCallback(
    (fLat: number, fLng: number, tLat: number, tLng: number, map: any) => {
      const G = (window as any).google.maps;
      polylinesRef.current.forEach((p) => p.setMap(null));
      polylinesRef.current = [];

      new G.DirectionsService().route(
        {
          origin: { lat: fLat, lng: fLng },
          destination: { lat: tLat, lng: tLng },
          travelMode: G.TravelMode.DRIVING,
        },
        (result: any, s: string) => {
          if (s !== "OK" || !result) return;
          const path = result.routes[0].overview_path;
          const leg = result.routes[0]?.legs[0];

          if (leg?.steps) {
            setSteps(
              leg.steps.map((st: any) => ({
                instruction: parseInstruction(st.html_instructions ?? ""),
                distance: st.distance?.text ?? "",
                maneuver: st.maneuver ?? "",
                startLat: st.start_location.lat(),
                startLng: st.start_location.lng(),
              })),
            );
          }
          if (leg)
            setEta({
              durationText: leg.duration.text,
              distanceText: leg.distance.text,
              durationSeconds: leg.duration.value,
            });

          polylinesRef.current = [
            new G.Polyline({
              path,
              map,
              strokeColor: "white",
              strokeWeight: 14,
              strokeOpacity: 0.8,
              zIndex: 1,
            }),
            new G.Polyline({
              path,
              map,
              strokeColor: "#2196F3",
              strokeWeight: 6,
              strokeOpacity: 1,
              zIndex: 2,
            }),
          ];
          setStatus("ready");
        },
      );
    },
    [],
  );

  // ── Init map ───────────────────────────────────────────────────
  const initMap = useCallback(
    (dLat: number, dLng: number, destination: google.maps.LatLngLiteral) => {
      if (!divRef.current) return;
      const G = (window as any).google.maps;
      if (mapRef.current) {
        mapRef.current.unbindAll();
        mapRef.current = null;
      }

      const map = new G.Map(divRef.current, {
        center: { lat: dLat, lng: dLng },
        zoom: 14,
        disableDefaultUI: true,
        gestureHandling: "greedy",
        styles: MAP_STYLE,
      });
      mapRef.current = map;

      driverRef.current = makeNavArrow(G, dLat, dLng, headingRef.current, map);
      new G.Marker({
        position: destination,
        map,
        icon: {
          url: destIconUrl(),
          scaledSize: new G.Size(52, 66),
          anchor: new G.Point(26, 66),
        },
      });

      const bounds = new G.LatLngBounds();
      bounds.extend({ lat: dLat, lng: dLng });
      bounds.extend(destination);
      map.fitBounds(bounds, { top: 160, bottom: 60, left: 50, right: 50 });

      setStatus("routing");
      drawRoute(dLat, dLng, destination.lat, destination.lng, map);
    },
    [drawRoute],
  );

  // ── Boot ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!KEY) {
      setErrMsg("GOOGLE_MAPS_API_KEY missing");
      setStatus("error");
      return;
    }
    if (!hasGPS) {
      setStatus("gps_wait");
      return;
    }

    const boot = async () => {
      try {
        setStatus("loading");
        await loadGMaps();
        let destination = dest;
        if (!destination) {
          setStatus("geocoding");
          destination = await geocodeAddr(customerAddress);
          if (!destination) {
            setErrMsg(`Address not found: "${customerAddress}"`);
            setStatus("error");
            return;
          }
          setDest(destination);
        }
        initMap(driverLat, driverLng, destination);
      } catch (e: any) {
        setErrMsg(e?.message ?? "Map failed");
        setStatus("error");
      }
    };
    boot();
    return () => {
      driverRef.current?.setMap(null);
      polylinesRef.current.forEach((p) => p.setMap(null));
      mapRef.current?.unbindAll();
    };
  }, [hasGPS, dest]);

  // ── Live driver update ─────────────────────────────────────────
  useEffect(() => {
    if (!driverRef.current || !dest || !mapRef.current || status !== "ready")
      return;
    if (prevLL.current.lat === driverLat && prevLL.current.lng === driverLng)
      return;

    const h = computeHeading(prevLL.current, {
      lat: driverLat,
      lng: driverLng,
    });
    headingRef.current = h;
    driverRef.current.setHeading(h);
    driverRef.current.moveTo(driverLat, driverLng);
    prevLL.current = { lat: driverLat, lng: driverLng };

    if (steps.length > 0 && stepIdx < steps.length - 1) {
      const next = steps[stepIdx + 1];
      if (
        Math.sqrt(
          (next.startLat - driverLat) ** 2 + (next.startLng - driverLng) ** 2,
        ) *
          111000 <
        60
      )
        setStepIdx((i) => i + 1);
    }
    drawRoute(driverLat, driverLng, dest.lat, dest.lng, mapRef.current);
  }, [driverLat, driverLng]);

  const reCenter = () => {
    if (!mapRef.current || !dest) return;
    const G = (window as any).google.maps;
    const b = new G.LatLngBounds();
    b.extend({ lat: driverLat, lng: driverLng });
    b.extend(dest);
    mapRef.current.fitBounds(b, { top: 160, bottom: 60, left: 50, right: 50 });
  };

  // ── ORDER INFO PANEL (shared by desktop sidebar + mobile sheet) ─
  const InfoPanel = () => (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
            {deliveryStatus === "out_for_delivery"
              ? "🔴 LIVE"
              : "Active Delivery"}
          </p>
          <p className="text-lg font-bold text-gray-800 mt-0.5">{orderId}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-orange-50 text-orange-600 border border-orange-100">
            {deliveryStatus === "out_for_delivery"
              ? "🛵 On the way"
              : deliveryStatus.replace(/_/g, " ")}
          </span>
          {onClose && (
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* ETA cards */}
      {eta && (
        <div className="grid grid-cols-3 gap-2 px-4 py-3 border-b border-gray-100 flex-shrink-0">
          {[
            {
              icon: <MapPin className="w-3.5 h-3.5 text-blue-500" />,
              label: "Distance",
              val: eta.distanceText,
            },
            {
              icon: <Clock className="w-3.5 h-3.5 text-orange-500" />,
              label: "ETA",
              val: eta.durationText,
            },
            {
              icon: <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />,
              label: "Arrival",
              val: deliveryTime,
            },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-xl p-2.5 text-center"
              style={{ background: "#f8fafc", border: "1px solid #e8f0fe" }}
            >
              <div className="flex justify-center mb-1">{s.icon}</div>
              <p className="text-xs font-bold text-gray-800 leading-tight">
                {s.val}
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Customer */}
      <div className="px-4 py-3 border-b border-gray-100 flex-shrink-0">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-2">
          {viewAs === "customer" ? "Order from" : "Deliver to"}
        </p>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, #f97316, #fb923c)",
              }}
            >
              {(customerName?.[0] ?? "C").toUpperCase()}
            </div>
            <div className="min-w-0">
              {customerName && (
                <p className="text-sm font-bold text-gray-800">
                  {customerName}
                </p>
              )}
              <div className="flex items-start gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-gray-500 leading-snug">
                  {customerAddress}
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-1.5 flex-shrink-0">
            {viewAs === "driver" && customerPhone && (
              <a
                href={`tel:${customerPhone}`}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold"
                style={{
                  background: "#eff6ff",
                  color: "#2563eb",
                  border: "1.5px solid #bfdbfe",
                }}
              >
                <Phone className="w-3 h-3" /> Call
              </a>
            )}
            <button
              onClick={openDirections}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold"
              style={{
                background: "#f0fdf4",
                color: "#16a34a",
                border: "1.5px solid #bbf7d0",
              }}
            >
              <Navigation2 className="w-3 h-3" /> Directions
            </button>
          </div>
        </div>
      </div>

      {/* Order ID + copy */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
            Order ID
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-sm font-bold text-gray-800">{orderId}</p>
            <button
              onClick={copyOrderId}
              className="text-gray-400 hover:text-blue-500"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
            {copied && <span className="text-xs text-blue-500">Copied!</span>}
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
            Amount
          </p>
          <p className="text-sm font-bold text-gray-800 mt-0.5">
            ₹{totalAmount.toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      {/* Items */}
      <button
        onClick={() => setItems((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 border-b border-gray-100 flex-shrink-0 hover:bg-gray-50"
      >
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600 font-medium">
            {totalItems} item{totalItems !== 1 ? "s" : ""}
          </span>
        </div>
        {items ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Slide to confirm */}
      {viewAs === "driver" &&
        deliveryStatus === "out_for_delivery" &&
        onMarkDelivered && (
          <div className="px-4 pb-6 pt-3 flex-shrink-0">
            <SlideToConfirm
              onConfirm={onMarkDelivered}
              isLoading={isMarkingDelivered}
            />
            <p className="text-center text-xs text-gray-400 mt-2">
              🔄 Location updates every 10 seconds
            </p>
          </div>
        )}
    </div>
  );

  // ── RENDER ─────────────────────────────────────────────────────
  return (
    /*
      Layout:
      Mobile  (<lg): flex-col — map top (flex-1) + bottom sheet
      Desktop (≥lg): flex-row — map left (flex-1) + right panel (380px)
    */
    <div className="fixed inset-0 z-50 flex flex-col lg:flex-row bg-white">
      {/* ═══════════════ MAP SECTION ══════════════════════════════ */}
      <div
        className="relative flex-1 min-h-0 lg:min-h-full overflow-hidden"
        style={{ minHeight: "55vh" }}
      >
        {/* Map canvas */}
        <div ref={divRef} className="absolute inset-0" />

        {/* Loading / Error */}
        {status !== "ready" && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/90">
            <div className="flex flex-col items-center gap-4 px-8 text-center max-w-xs">
              {status === "error" ? (
                <AlertCircle className="w-12 h-12 text-red-400" />
              ) : status === "gps_wait" ? (
                <WifiOff className="w-12 h-12 text-blue-400" />
              ) : (
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-blue-600">
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                </div>
              )}
              <p className="text-gray-700 font-semibold text-sm">
                {status === "error"
                  ? errMsg
                  : status === "gps_wait"
                    ? "Waiting for GPS…"
                    : status === "geocoding"
                      ? "Finding delivery location…"
                      : status === "routing"
                        ? "Calculating route…"
                        : "Loading map…"}
              </p>
              {status === "gps_wait" && (
                <p className="text-gray-400 text-xs">
                  Please allow location access
                </p>
              )}
            </div>
          </div>
        )}

        {/* ── Navigation instruction (top-left compact) ── */}
        {status === "ready" && (
          <div
            className="absolute top-3 left-3 z-10 flex flex-col gap-1.5"
            style={{ maxWidth: 220 }}
          >
            {/* Turn instruction pill */}
            <div
              className="flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-2xl bg-white shadow-md"
              style={{ border: "1px solid #e5e7eb" }}
            >
              <div
                className="rounded-xl flex items-center justify-center flex-shrink-0 bg-blue-600"
                style={{ width: 36, height: 36 }}
              >
                <span className="text-white text-lg leading-none">
                  {currentStep ? getTurnArrow(currentStep.maneuver) : "↑"}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-gray-800 font-bold text-sm leading-tight">
                  {currentStep?.distance ?? eta?.distanceText ?? "—"}
                </p>
                <p className="text-gray-400 text-[10px] truncate leading-tight mt-0.5">
                  {currentStep?.instruction ?? "Follow the route"}
                </p>
              </div>
            </div>

            {/* Stats compact pill */}
            <div
              className="flex items-center rounded-xl bg-white shadow-md overflow-hidden"
              style={{ border: "1px solid #e5e7eb" }}
            >
              {[
                { val: eta?.distanceText ?? "—", label: "km" },
                { val: eta?.durationText ?? "—", label: "ETA" },
                { val: deliveryTime, label: "Delivery" },
              ].map((s, i) => (
                <div
                  key={s.label}
                  className="flex-1 text-center py-1.5"
                  style={{ borderRight: i < 2 ? "1px solid #e5e7eb" : "none" }}
                >
                  <p className="text-gray-800 text-[11px] font-bold leading-tight">
                    {s.val}
                  </p>
                  <p className="text-gray-400 text-[9px]">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Floating map buttons ── */}
        {status === "ready" && (
          <>
            <div
              className="absolute right-3 z-10 flex flex-col gap-2"
              style={{ bottom: 12 }}
            >
              <button
                onClick={reCenter}
                className="w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center border border-gray-100"
              >
                <Navigation2 className="w-4 h-4 text-gray-600" />
              </button>
              <button className="w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center border border-gray-100">
                <Volume2 className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            <button
              className="absolute left-3 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white shadow-lg border border-gray-100"
              style={{ bottom: 12 }}
            >
              <span className="text-yellow-500 text-xs">⚠</span>
              <span className="text-gray-600 text-xs font-medium">
                Report Issue
              </span>
            </button>
          </>
        )}
      </div>

      {/* ═══════════════ INFO PANEL ═══════════════════════════════
          Desktop : fixed right sidebar (380px)
          Mobile  : bottom sheet (auto height, rounded top)
      ═══════════════════════════════════════════════════════════ */}

      {/* Mobile bottom sheet */}
      <div
        className="lg:hidden bg-white rounded-t-3xl shadow-2xl flex-shrink-0"
        style={{
          maxHeight: "45vh",
          overflowY: "auto",
          borderTop: "1px solid #e5e7eb",
        }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>
        <InfoPanel />
      </div>

      {/* Desktop right sidebar */}
      <div
        className="hidden lg:flex flex-col w-[380px] bg-white border-l border-gray-100"
        style={{ boxShadow: "-2px 0 12px rgba(0,0,0,0.04)" }}
      >
        <InfoPanel />
      </div>
    </div>
  );
}
