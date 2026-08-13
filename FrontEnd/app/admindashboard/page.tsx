"use client"
import React, { useState, useRef } from "react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";

// ── Static Data ──────────────────────────────────────────────
const revenueData = [
  { day: "Mon", revenue: 4200, orders: 38 },
  { day: "Tue", revenue: 5800, orders: 52 },
  { day: "Wed", revenue: 3900, orders: 35 },
  { day: "Thu", revenue: 7200, orders: 64 },
  { day: "Fri", revenue: 9100, orders: 81 },
  { day: "Sat", revenue: 11400, orders: 98 },
  { day: "Sun", revenue: 8600, orders: 74 },
];

const categoryData = [
  { name: "Breakfast", value: 32, color: "#f97316" },
  { name: "Main Course", value: 28, color: "#0ea5e9" },
  { name: "Desserts", value: 18, color: "#eab308" },
  { name: "Beverages", value: 14, color: "#22c55e" },
  { name: "Snacks", value: 8, color: "#a855f7" },
];

const initialCategories = [
  { id: 1, name: "Breakfast", description: "Morning meals", items: 12, active: true },
  { id: 2, name: "Main Course", description: "Full meals", items: 18, active: true },
  { id: 3, name: "Desserts", description: "Sweet treats", items: 9, active: true },
  { id: 4, name: "Beverages", description: "Drinks & juices", items: 15, active: false },
  { id: 5, name: "Snacks", description: "Light bites", items: 7, active: true },
];

const initialMenuItems = [
  { id: 1, name: "Fresh Vegetable Salad", category: "Breakfast", price: 14.39, originalPrice: 17.99, discountPercent: 20, type: "Veg", available: true, active: true, orders: 142, image: null as string | null, emoji: "🥗", description: "Fresh organic salad", prepTime: 15, servingSize: "1 person" },
  { id: 2, name: "Grilled Chicken Burger", category: "Main Course", price: 12.99, originalPrice: 12.99, discountPercent: 0, type: "Non-Veg", available: true, active: true, orders: 98, image: null, emoji: "🍔", description: "Juicy grilled chicken", prepTime: 20, servingSize: "1 person" },
  { id: 3, name: "Mango Smoothie", category: "Beverages", price: 6.49, originalPrice: 8.00, discountPercent: 19, type: "Vegan", available: false, active: true, orders: 76, image: null, emoji: "🥭", description: "Fresh mango blend", prepTime: 5, servingSize: "350ml" },
  { id: 4, name: "Chocolate Lava Cake", category: "Desserts", price: 8.99, originalPrice: 8.99, discountPercent: 0, type: "Veg", available: true, active: true, orders: 201, image: null, emoji: "🍰", description: "Warm chocolate cake", prepTime: 25, servingSize: "1 piece" },
  { id: 5, name: "Paneer Tikka", category: "Snacks", price: 10.50, originalPrice: 13.00, discountPercent: 19, type: "Veg", available: true, active: false, orders: 54, image: null, emoji: "🫕", description: "Spiced cottage cheese", prepTime: 30, servingSize: "4 pieces" },
];

const initialOrders = [
  { id: "#ORD-001", customer: "Rahul Sharma", items: ["Fresh Vegetable Salad", "Mango Smoothie"], total: 20.88, status: "delivered", time: "12:30 PM", table: "Table 4", payment: "Online" },
  { id: "#ORD-002", customer: "Priya Singh", items: ["Grilled Chicken Burger", "Chocolate Lava Cake"], total: 21.98, status: "preparing", time: "12:45 PM", table: "Table 2", payment: "Cash" },
  { id: "#ORD-003", customer: "Amit Kumar", items: ["Paneer Tikka", "Mango Smoothie"], total: 16.99, status: "pending", time: "1:00 PM", table: "Table 7", payment: "Online" },
  { id: "#ORD-004", customer: "Sneha Patel", items: ["Chocolate Lava Cake"], total: 8.99, status: "ready", time: "1:10 PM", table: "Table 1", payment: "Card" },
  { id: "#ORD-005", customer: "Vikram Nair", items: ["Fresh Vegetable Salad", "Grilled Chicken Burger", "Chocolate Lava Cake"], total: 36.37, status: "delivered", time: "1:20 PM", table: "Table 5", payment: "Online" },
  { id: "#ORD-006", customer: "Deepa Menon", items: ["Mango Smoothie", "Paneer Tikka"], total: 16.99, status: "cancelled", time: "1:35 PM", table: "Takeaway", payment: "Cash" },
  { id: "#ORD-007", customer: "Arjun Reddy", items: ["Grilled Chicken Burger"], total: 12.99, status: "preparing", time: "1:40 PM", table: "Table 3", payment: "Online" },
  { id: "#ORD-008", customer: "Kavya Nair", items: ["Fresh Vegetable Salad", "Chocolate Lava Cake"], total: 23.38, status: "pending", time: "1:55 PM", table: "Table 6", payment: "Card" },
];

const topItems = [
  { name: "Chocolate Lava Cake", orders: 201, revenue: 1806.99 },
  { name: "Fresh Vegetable Salad", orders: 142, revenue: 2043.38 },
  { name: "Grilled Chicken Burger", orders: 98, revenue: 1273.02 },
  { name: "Spicy Ramen Bowl", orders: 87, revenue: 1391.13 },
  { name: "Mango Smoothie", orders: 76, revenue: 493.24 },
];

// ── Icons ─────────────────────────────────────────────────────
const Icon = ({ name, size = 18, color = "currentColor" }: { name: string; size?: number; color?: string }) => {
  const icons = {
    dashboard: <><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></>,
    category:  <><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></>,
    menu:      <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>,
    revenue:   <><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></>,
    orders:    <><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></>,
    reports:   <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></>,
    settings:  <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></>,
    logout:    <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></>,
    plus:      <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
    edit:      <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></>,
    trash:     <><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6m4-6v6"/><path d="M9 6V4h6v2"/></>,
    bell:      <><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></>,
    search:    <><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>,
    upload:    <><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></>,
    eye:       <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>,
    trend:     <><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></>,
    star:      <><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></>,
    clock:     <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>,
    check:     <><polyline points="20 6 9 17 4 12"/></>,
    x:         <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
    chef:      <><path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z"/><line x1="6" y1="17" x2="18" y2="17"/></>,
    image:     <><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></>,
    close:     <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {icons[name as keyof typeof icons]}
    </svg>
  );
};

const BRAND = "#f97316";
const BRAND2 = "#0ea5e9";

// ── Toggle ────────────────────────────────────────────────────
const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
  <div onClick={onChange} style={{
    width: 42, height: 24, borderRadius: 12, cursor: "pointer",
    background: checked ? BRAND : "#e2e8f0",
    position: "relative", transition: "background 0.3s", flexShrink: 0,
    boxShadow: checked ? `0 0 0 3px ${BRAND}22` : "none",
  }}>
    <div style={{
      width: 18, height: 18, borderRadius: "50%",
      background: "#fff",
      position: "absolute", top: 3,
      left: checked ? 21 : 3,
      transition: "left 0.25s cubic-bezier(.4,0,.2,1)",
      boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
    }} />
  </div>
);

// ── Badge ─────────────────────────────────────────────────────
const Badge = ({ label, color, bg }: { label: string; color: string; bg: string }) => (
  <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20,
    background: bg, color, fontWeight: 600, whiteSpace: "nowrap" }}>
    {label}
  </span>
);

// ── Stat Card ─────────────────────────────────────────────────
const StatCard = ({ label, value, sub, icon, color, trend, delay = 0 }: { label: string; value: React.ReactNode; sub: string; icon: string; color: string; trend: number; delay?: number }) => (
  <div style={{
    background: "#fff", borderRadius: 20, padding: "22px 24px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)",
    display: "flex", flexDirection: "column", gap: 14,
    animation: `fadeSlideUp 0.5s ease both`,
    animationDelay: `${delay}ms`,
    border: "1px solid rgba(0,0,0,0.04)",
  }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <div>
        <p style={{ margin: 0, fontSize: 12, color: "#94a3b8", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>{label}</p>
        <h2 style={{ margin: "6px 0 0", fontSize: 30, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.5px" }}>{value}</h2>
      </div>
      <div style={{ width: 48, height: 48, borderRadius: 14, background: `linear-gradient(135deg, ${color}22, ${color}44)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: `0 4px 12px ${color}33` }}>
        <Icon name={icon} size={22} color={color} />
      </div>
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span style={{ fontSize: 12, color: trend > 0 ? "#22c55e" : trend < 0 ? "#ef4444" : "#94a3b8",
        fontWeight: 700, background: trend > 0 ? "#dcfce7" : trend < 0 ? "#fee2e2" : "#f1f5f9",
        padding: "2px 8px", borderRadius: 20 }}>
        {trend > 0 ? "▲" : trend < 0 ? "▼" : "—"} {Math.abs(trend)}%
      </span>
      <span style={{ fontSize: 12, color: "#94a3b8" }}>{sub}</span>
    </div>
  </div>
);

// ── Order Status Config ───────────────────────────────────────
const statusConfig = {
  pending:   { label: "Pending",   bg: "#fef3c7", color: "#d97706", icon: "clock" },
  preparing: { label: "Preparing", bg: "#dbeafe", color: "#2563eb", icon: "chef" },
  ready:     { label: "Ready",     bg: "#dcfce7", color: "#16a34a", icon: "check" },
  delivered: { label: "Delivered", bg: "#f0fdf4", color: "#15803d", icon: "check" },
  cancelled: { label: "Cancelled", bg: "#fee2e2", color: "#dc2626", icon: "x" },
};

// ── Image Upload Box ──────────────────────────────────────────
const ImageUploadBox = ({ value, onChange }: { value: string; onChange: (url: string) => void }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div
      onClick={() => inputRef.current?.click()}
      style={{
        border: `2px dashed ${value ? BRAND : "#e2e8f0"}`,
        borderRadius: 14, height: 120, cursor: "pointer",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: 8,
        background: value ? "#fff7ed" : "#fafafa",
        transition: "all 0.2s", position: "relative", overflow: "hidden",
      }}>
      <input ref={inputRef} type="file" accept="image/*" style={{ display: "none" }}
        onChange={e => { const f = e.target.files?.[0]; if (f) onChange(URL.createObjectURL(f)); }} />
      {value ? (
        <>
          <img src={value} alt="preview" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.35)",
            display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#fff", fontSize: 12, fontWeight: 600 }}>Click to change</span>
          </div>
        </>
      ) : (
        <>
          <Icon name="image" size={28} color="#cbd5e1" />
          <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500 }}>Upload Image</span>
          <span style={{ fontSize: 11, color: "#cbd5e1" }}>PNG, JPG up to 5MB</span>
        </>
      )}
    </div>
  );
};

// ── Modal Wrapper ─────────────────────────────────────────────
const Modal = ({ open, onClose, title, children, width = 520 }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode; width?: number }) => {
  if (!open) return null;
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000, backdropFilter: "blur(4px)",
      animation: "fadeIn 0.2s ease",
    }}>
      <div style={{
        background: "#fff", borderRadius: 20, width, maxWidth: "95vw",
        maxHeight: "90vh", overflowY: "auto",
        boxShadow: "0 25px 60px rgba(0,0,0,0.25)",
        animation: "slideUp 0.25s cubic-bezier(.4,0,.2,1)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "20px 24px", borderBottom: "1px solid #f1f5f9" }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#0f172a" }}>{title}</h3>
          <button onClick={onClose}
            style={{ background: "#f1f5f9", border: "none", borderRadius: 8,
              width: 32, height: 32, cursor: "pointer", display: "flex",
              alignItems: "center", justifyContent: "center" }}>
            <Icon name="close" size={16} color="#64748b" />
          </button>
        </div>
        <div style={{ padding: 24 }}>{children}</div>
      </div>
    </div>
  );
};

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 14px", border: "1.5px solid #e2e8f0",
  borderRadius: 10, fontSize: 13, outline: "none", boxSizing: "border-box",
  background: "#fafafa", transition: "border 0.2s",
  fontFamily: "inherit",
};

const labelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 6, display: "block" };

// ════════════════════════════════════════════════════════════
export default function RestaurantDashboard() {
  const [activeNav, setActiveNav] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [cats, setCats] = useState(initialCategories);
  const [items, setItems] = useState(initialMenuItems);
  const [orders, setOrders] = useState(initialOrders);
  const [orderFilter, setOrderFilter] = useState("all");
  const [searchItem, setSearchItem] = useState("");

  // Modals
  const [catModal, setCatModal] = useState(false);
  const [editCatModal, setEditCatModal] = useState(false);
  const [editingCat, setEditingCat] = useState<any>(null);
  const [itemModal, setItemModal] = useState(false);
  const [editItemModal, setEditItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [orderDetailModal, setOrderDetailModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  // Forms
  const [newCat, setNewCat] = useState({ name: "", description: "" });
  const [newItem, setNewItem] = useState({
    name: "", category: "Breakfast", price: "", discountPercent: 0,
    type: "Veg", description: "", prepTime: "", servingSize: "1 person",
    image: "" as string | null, emoji: "🍽️"
  });

  // Category CRUD
  const addCat = () => {
    if (!newCat.name.trim()) return;
    setCats(c => [...c, { id: Date.now(), name: newCat.name.trim(), description: newCat.description.trim(), items: 0, active: true }]);
    setNewCat({ name: "", description: "" }); setCatModal(false);
  };
  const saveCat = () => {
    if (!editingCat?.name?.trim()) return;
    setCats(c => c.map(x => x.id === editingCat.id ? { ...x, name: editingCat.name, description: editingCat.description } : x));
    setEditCatModal(false); setEditingCat(null);
  };
  const toggleCat = (id: number) => setCats(c => c.map(x => x.id === id ? { ...x, active: !x.active } : x));
  const deleteCat = (id: number) => setCats(c => c.filter(x => x.id !== id));

  // Menu CRUD
  const addMenuItem = () => {
    if (!newItem.name || !newItem.price) return;
    const price = parseFloat(newItem.price);
    const disc = parseFloat(String(newItem.discountPercent)) || 0;
    const discPrice = disc > 0 ? parseFloat((price - price * disc / 100).toFixed(2)) : price;
    setItems(i => [...i, { id: Date.now(), ...newItem, prepTime: parseInt(String(newItem.prepTime)) || 0, price: discPrice, originalPrice: price, orders: 0, available: true, active: true }]);
    setNewItem({ name: "", category: "Breakfast", price: "", discountPercent: 0, type: "Veg", description: "", prepTime: "", servingSize: "1 person", image: "", emoji: "🍽️" });
    setItemModal(false);
  };
  const saveItem = () => {
    if (!editingItem) return;
    setItems(i => i.map(x => x.id === editingItem.id ? { ...x, ...editingItem } : x));
    setEditItemModal(false); setEditingItem(null);
  };
  const toggleItem = (id: number) => setItems(i => i.map(x => x.id === id ? { ...x, active: !x.active } : x));
  const toggleAvail = (id: number) => setItems(i => i.map(x => x.id === id ? { ...x, available: !x.available } : x));
  const deleteItem_ = (id: number) => setItems(i => i.filter(x => x.id !== id));

  // Order
  const updateOrderStatus = (id: string, status: string) => setOrders(o => o.map(x => x.id === id ? { ...x, status } : x));
  const filteredOrders = orderFilter === "all" ? orders : orders.filter(o => o.status === orderFilter);
  const filteredItems = items.filter(x =>
    x.name.toLowerCase().includes(searchItem.toLowerCase()) ||
    x.category.toLowerCase().includes(searchItem.toLowerCase())
  );

  const navItems = [
    { id: "dashboard",  label: "Dashboard",  icon: "dashboard" },
    { id: "categories", label: "Categories", icon: "category" },
    { id: "menu",       label: "Menu Items",  icon: "menu" },
    { id: "orders",     label: "Orders",      icon: "orders", badge: orders.filter(o => o.status === "pending").length },
    { id: "reports",    label: "Reports",     icon: "reports" },
    { id: "settings",   label: "Settings",    icon: "settings" },
  ];

  // ── SIDEBAR ────────────────────────────────────────
  const Sidebar = () => (
    <div style={{
      width: sidebarOpen ? 248 : 72,
      height: "100vh",
      position: "sticky",
      top: 0,
      background: "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)",
      display: "flex", flexDirection: "column",
      transition: "width 0.3s cubic-bezier(.4,0,.2,1)",
      overflow: "hidden", flexShrink: 0,
      zIndex: 100,
      boxShadow: "4px 0 24px rgba(0,0,0,0.15)",
    }}>
      {/* Logo */}
      <div style={{ padding: "18px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)",
        display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12,
          background: `linear-gradient(135deg, ${BRAND}, #fb923c)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 20, flexShrink: 0,
          boxShadow: `0 4px 16px ${BRAND}55`,
        }}>🍽️</div>
        {sidebarOpen && (
          <div style={{ overflow: "hidden" }}>
            <div style={{ color: "#fff", fontWeight: 800, fontSize: 15, letterSpacing: "-0.3px", whiteSpace: "nowrap" }}>
              Spice Garden
            </div>
            <div style={{ color: "#64748b", fontSize: 11, fontWeight: 500 }}>Admin Dashboard</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "16px 10px", display: "flex", flexDirection: "column", gap: 4, overflowY: "auto" }}>
        {navItems.map(n => {
          const active = activeNav === n.id;
          return (
            <button key={n.id} onClick={() => setActiveNav(n.id)}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: sidebarOpen ? "11px 14px" : "11px",
                justifyContent: sidebarOpen ? "flex-start" : "center",
                borderRadius: 12, border: "none", cursor: "pointer",
                width: "100%", textAlign: "left", position: "relative",
                background: active
                  ? `linear-gradient(135deg, ${BRAND}ee, #fb923c)`
                  : "transparent",
                color: active ? "#fff" : "#94a3b8",
                transition: "all 0.2s",
                boxShadow: active ? `0 4px 16px ${BRAND}44` : "none",
              }}>
              <span style={{ flexShrink: 0, opacity: active ? 1 : 0.8 }}>
                <Icon name={n.icon} size={18} color={active ? "#fff" : "#94a3b8"} />
              </span>
              {sidebarOpen && (
                <span style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap" }}>{n.label}</span>
              )}
              {(n.badge ?? 0) > 0 && (
                <span style={{
                  marginLeft: "auto", background: active ? "rgba(255,255,255,0.3)" : BRAND,
                  color: "#fff", fontSize: 10, fontWeight: 800,
                  padding: "1px 6px", borderRadius: 10, minWidth: 18, textAlign: "center",
                }}>{n.badge}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div style={{ padding: "12px 10px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        {sidebarOpen && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
            background: "rgba(255,255,255,0.04)", borderRadius: 12, marginBottom: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%",
              background: `linear-gradient(135deg, ${BRAND}, #fb923c)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontWeight: 800, fontSize: 13, flexShrink: 0 }}>A</div>
            <div style={{ overflow: "hidden" }}>
              <div style={{ color: "#e2e8f0", fontSize: 13, fontWeight: 600, whiteSpace: "nowrap" }}>Admin</div>
              <div style={{ color: "#64748b", fontSize: 11, whiteSpace: "nowrap" }}>admin@spice.com</div>
            </div>
          </div>
        )}
        <button style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: sidebarOpen ? "10px 14px" : "10px",
          justifyContent: sidebarOpen ? "flex-start" : "center",
          borderRadius: 12, border: "none", cursor: "pointer", width: "100%",
          background: "rgba(239,68,68,0.1)", color: "#ef4444",
        }}>
          <Icon name="logout" size={16} color="#ef4444" />
          {sidebarOpen && <span style={{ fontSize: 13, fontWeight: 600 }}>Logout</span>}
        </button>
      </div>
    </div>
  );

  // ── TOPBAR ────────────────────────────────────────
  const Topbar = ({ title }: { title: string }) => (
    <div style={{
      height: 64, background: "rgba(255,255,255,0.92)",
      backdropFilter: "blur(12px)",
      borderBottom: "1px solid rgba(0,0,0,0.06)",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 24px", gap: 16,
      position: "sticky", top: 0, zIndex: 50,
      boxShadow: "0 2px 16px rgba(0,0,0,0.05)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <button onClick={() => setSidebarOpen(s => !s)}
          style={{ background: "#f1f5f9", border: "none", cursor: "pointer",
            width: 36, height: 36, borderRadius: 10, color: "#64748b",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "background 0.2s" }}>
          <Icon name="menu" size={18} />
        </button>
        <div>
          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.3px" }}>
            {title}
          </h1>
          <p style={{ margin: 0, fontSize: 11, color: "#94a3b8" }}>
            {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ position: "relative" }}>
          <div style={{ width: 38, height: 38, borderRadius: 12, background: "#fff7ed",
            display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
            border: "1.5px solid #fed7aa" }}>
            <Icon name="bell" size={16} color={BRAND} />
          </div>
          <div style={{ position: "absolute", top: -3, right: -3, width: 14, height: 14,
            background: "#ef4444", borderRadius: "50%", border: "2px solid #fff",
            fontSize: 8, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800 }}>3</div>
        </div>
        <div style={{ width: 38, height: 38, borderRadius: 12,
          background: `linear-gradient(135deg, ${BRAND}, #fb923c)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#fff", fontWeight: 800, fontSize: 15,
          boxShadow: `0 4px 12px ${BRAND}44`, cursor: "pointer" }}>A</div>
      </div>
    </div>
  );

  // ── DASHBOARD PAGE ────────────────────────────────
  const DashboardPage = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <style>{`
        @keyframes fadeSlideUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        @keyframes slideUp { from { opacity:0; transform:translateY(30px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100%{transform:scale(1);} 50%{transform:scale(1.05);} }
      `}</style>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
        <StatCard label="Total Revenue" value="₹50,200" sub="vs last week" icon="revenue" color="#f97316" trend={12.4} delay={0} />
        <StatCard label="Total Orders" value="442" sub="vs last week" icon="orders" color="#0ea5e9" trend={8.1} delay={80} />
        <StatCard label="Menu Items" value={items.length} sub="active items" icon="menu" color="#22c55e" trend={3.2} delay={160} />
        <StatCard label="Categories" value={cats.length} sub="total" icon="category" color="#a855f7" trend={0} delay={240} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
        <div style={{ background: "#fff", borderRadius: 20, padding: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.04)", animation: "fadeSlideUp 0.5s ease 0.3s both" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "#0f172a" }}>Weekly Revenue</h3>
              <p style={{ margin: "2px 0 0", fontSize: 12, color: "#94a3b8" }}>Last 7 days performance</p>
            </div>
            <span style={{ fontSize: 12, background: "#fff7ed", color: BRAND, padding: "5px 12px", borderRadius: 20, fontWeight: 700, border: "1px solid #fed7aa" }}>This Week</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={BRAND} stopOpacity={0.2}/>
                  <stop offset="95%" stopColor={BRAND} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 8px 30px rgba(0,0,0,0.12)" }} />
              <Area type="monotone" dataKey="revenue" stroke={BRAND} strokeWidth={3} fill="url(#rev)" dot={{ fill: BRAND, strokeWidth: 0, r: 4 }} activeDot={{ r: 6, fill: BRAND }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: "#fff", borderRadius: 20, padding: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.04)", animation: "fadeSlideUp 0.5s ease 0.4s both" }}>
          <h3 style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 800, color: "#0f172a" }}>Sales by Category</h3>
          <p style={{ margin: "0 0 12px", fontSize: 12, color: "#94a3b8" }}>Order distribution</p>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" innerRadius={48} outerRadius={72} dataKey="value" paddingAngle={4}>
                {categoryData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 12px", marginTop: 4 }}>
            {categoryData.map((c, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: c.color }} />
                <span style={{ color: "#64748b" }}>{c.name} ({c.value}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={{ background: "#fff", borderRadius: 20, padding: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.04)", animation: "fadeSlideUp 0.5s ease 0.5s both" }}>
          <h3 style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 800, color: "#0f172a" }}>Daily Orders</h3>
          <p style={{ margin: "0 0 16px", fontSize: 12, color: "#94a3b8" }}>Orders per day this week</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={revenueData} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "none" }} />
              <Bar dataKey="orders" fill={BRAND2} radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: "#fff", borderRadius: 20, padding: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.04)", animation: "fadeSlideUp 0.5s ease 0.6s both" }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 800, color: "#0f172a" }}>🏆 Top Selling Items</h3>
          {topItems.map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 0", borderBottom: i < topItems.length - 1 ? "1px solid #f8fafc" : "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ width: 24, height: 24, borderRadius: "50%", fontSize: 10, fontWeight: 800,
                  background: i === 0 ? "#fef3c7" : i === 1 ? "#f1f5f9" : i === 2 ? "#fff7ed" : "#fafafa",
                  color: i === 0 ? "#d97706" : i === 1 ? "#64748b" : i === 2 ? "#ea580c" : "#94a3b8",
                  display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {i + 1}
                </span>
                <div>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#1e293b" }}>{item.name}</p>
                  <p style={{ margin: 0, fontSize: 11, color: "#94a3b8" }}>{item.orders} orders</p>
                </div>
              </div>
              <span style={{ fontSize: 13, fontWeight: 800, color: "#22c55e" }}>₹{item.revenue.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── CATEGORIES PAGE ───────────────────────────────
  const CategoriesPage = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <style>{`@keyframes fadeSlideUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }`}</style>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <p style={{ margin: 0, color: "#64748b", fontSize: 14 }}><b style={{ color: "#0f172a" }}>{cats.length}</b> categories total</p>
        <button onClick={() => setCatModal(true)}
          style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px",
            background: `linear-gradient(135deg, ${BRAND}, #fb923c)`, color: "#fff",
            border: "none", borderRadius: 12, cursor: "pointer", fontSize: 13, fontWeight: 700,
            boxShadow: `0 4px 14px ${BRAND}44` }}>
          <Icon name="plus" size={16} color="#fff" /> Add Category
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {cats.map((cat, idx) => (
          <div key={cat.id} style={{
            background: "#fff", borderRadius: 16, padding: 22,
            boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)",
            border: `1px solid ${cat.active ? BRAND + "33" : "#f1f5f9"}`,
            animation: `fadeSlideUp 0.4s ease ${idx * 60}ms both`,
            transition: "box-shadow 0.2s",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#0f172a" }}>{cat.name}</h3>
                <p style={{ margin: "4px 0 0", fontSize: 12, color: "#94a3b8" }}>{cat.description || "No description"}</p>
              </div>
              <Toggle checked={cat.active} onChange={() => toggleCat(cat.id)} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Badge label={cat.active ? "Active" : "Inactive"} color={cat.active ? "#16a34a" : "#94a3b8"} bg={cat.active ? "#dcfce7" : "#f1f5f9"} />
                <span style={{ fontSize: 12, color: "#94a3b8" }}>{cat.items} items</span>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => { setEditingCat({ ...cat }); setEditCatModal(true); }}
                  style={{ background: "#eff6ff", border: "none", borderRadius: 8, padding: "7px", cursor: "pointer" }}>
                  <Icon name="edit" size={14} color="#3b82f6" />
                </button>
                <button onClick={() => deleteCat(cat.id)}
                  style={{ background: "#fff5f5", border: "none", borderRadius: 8, padding: "7px", cursor: "pointer" }}>
                  <Icon name="trash" size={14} color="#ef4444" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Category Modal */}
      <Modal open={catModal} onClose={() => setCatModal(false)} title="Add New Category">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div><label style={labelStyle}>Category Name *</label>
            <input style={inputStyle} placeholder="e.g. Breakfast" value={newCat.name}
              onChange={e => setNewCat({ ...newCat, name: e.target.value })} /></div>
          <div><label style={labelStyle}>Description</label>
            <input style={inputStyle} placeholder="Short description..." value={newCat.description}
              onChange={e => setNewCat({ ...newCat, description: e.target.value })} /></div>
          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <button onClick={addCat}
              style={{ flex: 1, padding: "12px", background: `linear-gradient(135deg, ${BRAND}, #fb923c)`,
                color: "#fff", border: "none", borderRadius: 12, cursor: "pointer", fontWeight: 700, fontSize: 14 }}>
              Create Category
            </button>
            <button onClick={() => setCatModal(false)}
              style={{ padding: "12px 20px", background: "#f1f5f9", border: "none", borderRadius: 12, cursor: "pointer", fontWeight: 600 }}>
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Category Modal */}
      <Modal open={editCatModal} onClose={() => setEditCatModal(false)} title="Edit Category">
        {editingCat && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div><label style={labelStyle}>Category Name *</label>
              <input style={inputStyle} value={editingCat.name}
                onChange={e => setEditingCat({ ...editingCat, name: e.target.value })} /></div>
            <div><label style={labelStyle}>Description</label>
              <input style={inputStyle} value={editingCat.description || ""}
                onChange={e => setEditingCat({ ...editingCat, description: e.target.value })} /></div>
            <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
              <button onClick={saveCat}
                style={{ flex: 1, padding: "12px", background: `linear-gradient(135deg, ${BRAND}, #fb923c)`,
                  color: "#fff", border: "none", borderRadius: 12, cursor: "pointer", fontWeight: 700, fontSize: 14 }}>
                Save Changes
              </button>
              <button onClick={() => setEditCatModal(false)}
                style={{ padding: "12px 20px", background: "#f1f5f9", border: "none", borderRadius: 12, cursor: "pointer", fontWeight: 600 }}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );

  // ── MENU PAGE ─────────────────────────────────────
  const MenuPage = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <style>{`@keyframes fadeSlideUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }`}</style>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1, maxWidth: 340 }}>
          <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)" }}>
            <Icon name="search" size={15} color="#94a3b8" />
          </span>
          <input value={searchItem} onChange={e => setSearchItem(e.target.value)}
            placeholder="Search menu items..."
            style={{ ...inputStyle, paddingLeft: 38 }} />
        </div>
        <button onClick={() => setItemModal(true)}
          style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 20px",
            background: `linear-gradient(135deg, ${BRAND}, #fb923c)`, color: "#fff",
            border: "none", borderRadius: 12, cursor: "pointer", fontSize: 13, fontWeight: 700,
            boxShadow: `0 4px 14px ${BRAND}44`, whiteSpace: "nowrap" }}>
          <Icon name="plus" size={16} color="#fff" /> Add Item
        </button>
      </div>

      <div style={{ background: "#fff", borderRadius: 20, overflow: "hidden",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)",
        border: "1px solid rgba(0,0,0,0.04)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "linear-gradient(90deg, #f8fafc, #f1f5f9)" }}>
              {["Item", "Category", "Price", "Type", "Available", "Active", "Orders", "Actions"].map(h => (
                <th key={h} style={{ padding: "13px 16px", textAlign: "left", fontSize: 11,
                  fontWeight: 700, color: "#64748b", borderBottom: "1px solid #f1f5f9",
                  letterSpacing: "0.05em", textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item, i) => (
              <tr key={item.id} style={{
                borderBottom: "1px solid #f8fafc",
                background: "#fff",
                transition: "background 0.15s",
                animation: `fadeSlideUp 0.35s ease ${i * 40}ms both`,
              }}>
                <td style={{ padding: "13px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, overflow: "hidden",
                      background: "#f8fafc", flexShrink: 0, display: "flex",
                      alignItems: "center", justifyContent: "center",
                      border: "1px solid #f1f5f9", fontSize: 22 }}>
                      {item.image ? <img src={item.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : item.emoji}
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{item.name}</p>
                      <p style={{ margin: 0, fontSize: 11, color: "#94a3b8" }}>{item.prepTime ? `${item.prepTime} min` : "—"}</p>
                    </div>
                  </div>
                </td>
                <td style={{ padding: "13px 16px" }}>
                  <Badge label={item.category} color="#475569" bg="#f1f5f9" />
                </td>
                <td style={{ padding: "13px 16px" }}>
                  <div>
                    <span style={{ fontWeight: 800, color: BRAND, fontSize: 14 }}>₹{item.price}</span>
                    {item.originalPrice > item.price && (
                      <span style={{ fontSize: 11, color: "#94a3b8", textDecoration: "line-through", marginLeft: 5 }}>₹{item.originalPrice}</span>
                    )}
                    {item.discountPercent > 0 && (
                      <div><Badge label={`${item.discountPercent}% off`} color="#16a34a" bg="#dcfce7" /></div>
                    )}
                  </div>
                </td>
                <td style={{ padding: "13px 16px" }}>
                  <Badge
                    label={item.type}
                    color={item.type === "Veg" ? "#16a34a" : item.type === "Vegan" ? "#2563eb" : "#dc2626"}
                    bg={item.type === "Veg" ? "#dcfce7" : item.type === "Vegan" ? "#dbeafe" : "#fee2e2"}
                  />
                </td>
                <td style={{ padding: "13px 16px" }}><Toggle checked={item.available} onChange={() => toggleAvail(item.id)} /></td>
                <td style={{ padding: "13px 16px" }}><Toggle checked={item.active} onChange={() => toggleItem(item.id)} /></td>
                <td style={{ padding: "13px 16px", fontSize: 13, color: "#475569", fontWeight: 700 }}>{item.orders}</td>
                <td style={{ padding: "13px 16px" }}>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => { setEditingItem({ ...item }); setEditItemModal(true); }}
                      style={{ background: "#eff6ff", border: "none", borderRadius: 8, padding: "7px", cursor: "pointer" }}>
                      <Icon name="edit" size={13} color="#3b82f6" />
                    </button>
                    <button onClick={() => deleteItem_(item.id)}
                      style={{ background: "#fff5f5", border: "none", borderRadius: 8, padding: "7px", cursor: "pointer" }}>
                      <Icon name="trash" size={13} color="#ef4444" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Item Modal */}
      <Modal open={itemModal} onClose={() => setItemModal(false)} title="Add New Menu Item" width={580}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div style={{ gridColumn: "1/-1" }}>
            <label style={labelStyle}>Item Image</label>
            <ImageUploadBox value={newItem.image ?? ""} onChange={v => setNewItem({ ...newItem, image: v })} />
          </div>
          <div style={{ gridColumn: "1/-1" }}>
            <label style={labelStyle}>Item Name *</label>
            <input style={inputStyle} placeholder="e.g. Fresh Vegetable Salad" value={newItem.name}
              onChange={e => setNewItem({ ...newItem, name: e.target.value })} />
          </div>
          <div>
            <label style={labelStyle}>Category *</label>
            <select style={inputStyle} value={newItem.category} onChange={e => setNewItem({ ...newItem, category: e.target.value })}>
              {cats.map(c => <option key={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Type *</label>
            <select style={inputStyle} value={newItem.type} onChange={e => setNewItem({ ...newItem, type: e.target.value })}>
              {["Veg", "Non-Veg", "Vegan"].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Price (₹) *</label>
            <input style={inputStyle} type="number" placeholder="0.00" value={newItem.price}
              onChange={e => setNewItem({ ...newItem, price: e.target.value })} />
          </div>
          <div>
            <label style={labelStyle}>Discount %</label>
            <input style={inputStyle} type="number" placeholder="0" value={newItem.discountPercent}
              onChange={e => setNewItem({ ...newItem, discountPercent: parseFloat(e.target.value) || 0 })} />
          </div>
          <div>
            <label style={labelStyle}>Prep Time (mins)</label>
            <input style={inputStyle} type="number" placeholder="20" value={newItem.prepTime}
              onChange={e => setNewItem({ ...newItem, prepTime: e.target.value })} />
          </div>
          <div>
            <label style={labelStyle}>Serving Size</label>
            <input style={inputStyle} placeholder="1 person" value={newItem.servingSize}
              onChange={e => setNewItem({ ...newItem, servingSize: e.target.value })} />
          </div>
          <div style={{ gridColumn: "1/-1" }}>
            <label style={labelStyle}>Description</label>
            <textarea style={{ ...inputStyle, resize: "none", height: 72 }} placeholder="Short description..."
              value={newItem.description} onChange={e => setNewItem({ ...newItem, description: e.target.value })} />
          </div>
          <div style={{ gridColumn: "1/-1", display: "flex", gap: 10 }}>
            <button onClick={addMenuItem}
              style={{ flex: 1, padding: "13px", background: `linear-gradient(135deg, ${BRAND}, #fb923c)`,
                color: "#fff", border: "none", borderRadius: 12, cursor: "pointer", fontWeight: 700, fontSize: 14 }}>
              Add to Menu
            </button>
            <button onClick={() => setItemModal(false)}
              style={{ padding: "13px 20px", background: "#f1f5f9", border: "none", borderRadius: 12, cursor: "pointer", fontWeight: 600 }}>
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Item Modal */}
      <Modal open={editItemModal} onClose={() => setEditItemModal(false)} title="Edit Menu Item" width={580}>
        {editingItem && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div style={{ gridColumn: "1/-1" }}>
              <label style={labelStyle}>Item Image</label>
              <ImageUploadBox value={editingItem.image} onChange={v => setEditingItem({ ...editingItem, image: v })} />
            </div>
            <div style={{ gridColumn: "1/-1" }}>
              <label style={labelStyle}>Item Name *</label>
              <input style={inputStyle} value={editingItem.name}
                onChange={e => setEditingItem({ ...editingItem, name: e.target.value })} />
            </div>
            <div>
              <label style={labelStyle}>Category</label>
              <select style={inputStyle} value={editingItem.category} onChange={e => setEditingItem({ ...editingItem, category: e.target.value })}>
                {cats.map(c => <option key={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Type</label>
              <select style={inputStyle} value={editingItem.type} onChange={e => setEditingItem({ ...editingItem, type: e.target.value })}>
                {["Veg", "Non-Veg", "Vegan"].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Price (₹)</label>
              <input style={inputStyle} type="number" value={editingItem.price}
                onChange={e => setEditingItem({ ...editingItem, price: parseFloat(e.target.value) })} />
            </div>
            <div>
              <label style={labelStyle}>Discount %</label>
              <input style={inputStyle} type="number" value={editingItem.discountPercent}
                onChange={e => setEditingItem({ ...editingItem, discountPercent: parseFloat(e.target.value) })} />
            </div>
            <div style={{ gridColumn: "1/-1" }}>
              <label style={labelStyle}>Description</label>
              <textarea style={{ ...inputStyle, resize: "none", height: 72 }}
                value={editingItem.description}
                onChange={e => setEditingItem({ ...editingItem, description: e.target.value })} />
            </div>
            <div style={{ gridColumn: "1/-1", display: "flex", gap: 10 }}>
              <button onClick={saveItem}
                style={{ flex: 1, padding: "13px", background: `linear-gradient(135deg, ${BRAND}, #fb923c)`,
                  color: "#fff", border: "none", borderRadius: 12, cursor: "pointer", fontWeight: 700, fontSize: 14 }}>
                Save Changes
              </button>
              <button onClick={() => setEditItemModal(false)}
                style={{ padding: "13px 20px", background: "#f1f5f9", border: "none", borderRadius: 12, cursor: "pointer", fontWeight: 600 }}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );

  // ── ORDERS PAGE ───────────────────────────────────
  const OrdersPage = () => {
    const counts = {
      all: orders.length,
      pending: orders.filter(o => o.status === "pending").length,
      preparing: orders.filter(o => o.status === "preparing").length,
      ready: orders.filter(o => o.status === "ready").length,
      delivered: orders.filter(o => o.status === "delivered").length,
      cancelled: orders.filter(o => o.status === "cancelled").length,
    };
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <style>{`@keyframes fadeSlideUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }`}</style>

        {/* Summary Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
          {[
            { key: "pending",   label: "Pending",   color: "#d97706", bg: "#fef3c7" },
            { key: "preparing", label: "Preparing", color: "#2563eb", bg: "#dbeafe" },
            { key: "ready",     label: "Ready",     color: "#16a34a", bg: "#dcfce7" },
            { key: "delivered", label: "Delivered", color: "#15803d", bg: "#f0fdf4" },
            { key: "cancelled", label: "Cancelled", color: "#dc2626", bg: "#fee2e2" },
          ].map((s, i) => (
            <div key={s.key}
              onClick={() => setOrderFilter(orderFilter === s.key ? "all" : s.key)}
              style={{
                background: orderFilter === s.key ? s.bg : "#fff",
                borderRadius: 16, padding: "16px 18px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.06)",
                border: `1.5px solid ${orderFilter === s.key ? s.color + "55" : "transparent"}`,
                cursor: "pointer", transition: "all 0.2s",
                animation: `fadeSlideUp 0.4s ease ${i * 60}ms both`,
              }}>
              <p style={{ margin: 0, fontSize: 11, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</p>
              <h2 style={{ margin: "4px 0 0", fontSize: 28, fontWeight: 800, color: s.color }}>{counts[s.key as keyof typeof counts]}</h2>
            </div>
          ))}
        </div>

        {/* Filter Tabs */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {["all", "pending", "preparing", "ready", "delivered", "cancelled"].map(f => (
            <button key={f} onClick={() => setOrderFilter(f)}
              style={{
                padding: "7px 16px", borderRadius: 20, border: "1.5px solid",
                borderColor: orderFilter === f ? BRAND : "#e2e8f0",
                background: orderFilter === f ? BRAND : "#fff",
                color: orderFilter === f ? "#fff" : "#64748b",
                fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.2s",
                textTransform: "capitalize",
              }}>{f === "all" ? `All (${counts.all})` : `${f} (${counts[f as keyof typeof counts]})`}
            </button>
          ))}
        </div>

        {/* Orders Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
          {filteredOrders.map((order, i) => {
            const s = statusConfig[order.status as keyof typeof statusConfig];
            return (
              <div key={order.id}
                style={{
                  background: "#fff", borderRadius: 18, padding: 20,
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)",
                  border: "1px solid rgba(0,0,0,0.04)",
                  animation: `fadeSlideUp 0.4s ease ${i * 50}ms both`,
                  transition: "box-shadow 0.2s",
                }}>
                {/* Order Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "#0f172a" }}>{order.id}</h3>
                      <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20,
                        background: s.bg, color: s.color, fontWeight: 700 }}>
                        {s.label}
                      </span>
                    </div>
                    <p style={{ margin: "4px 0 0", fontSize: 12, color: "#64748b", fontWeight: 500 }}>
                      👤 {order.customer} &nbsp;·&nbsp; 🪑 {order.table}
                    </p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ margin: 0, fontSize: 18, fontWeight: 800, color: BRAND }}>₹{order.total}</p>
                    <p style={{ margin: "2px 0 0", fontSize: 11, color: "#94a3b8" }}>⏱ {order.time}</p>
                  </div>
                </div>

                {/* Items */}
                <div style={{ background: "#f8fafc", borderRadius: 10, padding: "10px 14px", marginBottom: 14 }}>
                  {order.items.map((item, j) => (
                    <div key={j} style={{ fontSize: 12, color: "#475569", padding: "2px 0",
                      borderBottom: j < order.items.length - 1 ? "1px dashed #e2e8f0" : "none",
                      display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ color: BRAND }}>•</span> {item}
                    </div>
                  ))}
                </div>

                {/* Payment */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <Badge label={`💳 ${order.payment}`} color="#475569" bg="#f1f5f9" />
                  <Badge label={`${order.items.length} item${order.items.length > 1 ? "s" : ""}`} color="#64748b" bg="#f8fafc" />
                </div>

                {/* Action Buttons */}
                <div style={{ display: "flex", gap: 8 }}>
                  {order.status === "pending" && (
                    <button onClick={() => updateOrderStatus(order.id, "preparing")}
                      style={{ flex: 1, padding: "9px", background: "#dbeafe", color: "#2563eb",
                        border: "none", borderRadius: 10, cursor: "pointer", fontSize: 12, fontWeight: 700 }}>
                      🍳 Start Preparing
                    </button>
                  )}
                  {order.status === "preparing" && (
                    <button onClick={() => updateOrderStatus(order.id, "ready")}
                      style={{ flex: 1, padding: "9px", background: "#dcfce7", color: "#16a34a",
                        border: "none", borderRadius: 10, cursor: "pointer", fontSize: 12, fontWeight: 700 }}>
                      ✅ Mark Ready
                    </button>
                  )}
                  {order.status === "ready" && (
                    <button onClick={() => updateOrderStatus(order.id, "delivered")}
                      style={{ flex: 1, padding: "9px", background: "#f0fdf4", color: "#15803d",
                        border: "none", borderRadius: 10, cursor: "pointer", fontSize: 12, fontWeight: 700 }}>
                      🚀 Mark Delivered
                    </button>
                  )}
                  {(order.status === "delivered" || order.status === "cancelled") && (
                    <div style={{ flex: 1, padding: "9px", background: "#f8fafc", color: "#94a3b8",
                      borderRadius: 10, fontSize: 12, fontWeight: 600, textAlign: "center" }}>
                      {order.status === "delivered" ? "✓ Completed" : "✗ Cancelled"}
                    </div>
                  )}
                  {(order.status === "pending" || order.status === "preparing") && (
                    <button onClick={() => updateOrderStatus(order.id, "cancelled")}
                      style={{ padding: "9px 14px", background: "#fff5f5", color: "#ef4444",
                        border: "none", borderRadius: 10, cursor: "pointer", fontSize: 12, fontWeight: 700 }}>
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {filteredOrders.length === 0 && (
          <div style={{ background: "#fff", borderRadius: 20, padding: 48, textAlign: "center",
            color: "#94a3b8", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
            <p style={{ margin: 0, fontWeight: 600 }}>No {orderFilter} orders found</p>
          </div>
        )}
      </div>
    );
  };

  // ── REPORTS PAGE ──────────────────────────────────
  const ReportsPage = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <style>{`@keyframes fadeSlideUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }`}</style>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {[
          { label: "Best Day", value: "Saturday", sub: "₹11,400 revenue", icon: "star", color: BRAND, delay: 0 },
          { label: "Avg Order Value", value: "₹113.58", sub: "this week", icon: "trend", color: BRAND2, delay: 80 },
          { label: "Total This Week", value: "₹50,200", sub: "442 orders", icon: "revenue", color: "#22c55e", delay: 160 },
        ].map((s, i) => (
          <div key={i} style={{ background: "#fff", borderRadius: 18, padding: 22,
            boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)",
            display: "flex", alignItems: "center", gap: 16,
            animation: `fadeSlideUp 0.4s ease ${s.delay}ms both` }}>
            <div style={{ width: 52, height: 52, borderRadius: 16,
              background: `linear-gradient(135deg, ${s.color}22, ${s.color}44)`,
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              boxShadow: `0 4px 14px ${s.color}33` }}>
              <Icon name={s.icon} size={24} color={s.color} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 11, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</p>
              <p style={{ margin: "4px 0 2px", fontSize: 22, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.5px" }}>{s.value}</p>
              <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>{s.sub}</p>
            </div>
          </div>
        ))}
      </div>
      <div style={{ background: "#fff", borderRadius: 20, padding: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)", animation: "fadeSlideUp 0.5s ease 0.3s both" }}>
        <h3 style={{ margin: "0 0 20px", fontSize: 15, fontWeight: 800, color: "#0f172a" }}>Revenue vs Orders — Weekly</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={revenueData} barGap={6}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <YAxis yAxisId="rev" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <YAxis yAxisId="ord" orientation="right" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 8px 30px rgba(0,0,0,0.12)" }} />
            <Legend />
            <Bar yAxisId="rev" dataKey="revenue" fill={BRAND} radius={[8,8,0,0]} barSize={24} name="Revenue (₹)" />
            <Bar yAxisId="ord" dataKey="orders" fill={BRAND2} radius={[8,8,0,0]} barSize={24} name="Orders" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div style={{ background: "#fff", borderRadius: 20, padding: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)", animation: "fadeSlideUp 0.5s ease 0.4s both" }}>
        <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 800, color: "#0f172a" }}>Item Performance Report</h3>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f8fafc" }}>
              {["Rank", "Item Name", "Total Orders", "Revenue", "Avg/Day"].map(h => (
                <th key={h} style={{ padding: "11px 16px", textAlign: "left", fontSize: 11,
                  fontWeight: 700, color: "#64748b", borderBottom: "1px solid #f1f5f9",
                  textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {topItems.map((item, i) => (
              <tr key={i} style={{ borderBottom: "1px solid #f8fafc", animation: `fadeSlideUp 0.35s ease ${i * 50}ms both` }}>
                <td style={{ padding: "12px 16px" }}>
                  <span style={{ width: 26, height: 26, borderRadius: "50%", fontSize: 11, fontWeight: 800,
                    background: i === 0 ? "#fef3c7" : i === 1 ? "#f1f5f9" : "#fafafa",
                    color: i === 0 ? "#d97706" : "#64748b",
                    display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</span>
                </td>
                <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{item.name}</td>
                <td style={{ padding: "12px 16px", fontSize: 13, color: "#475569", fontWeight: 600 }}>{item.orders}</td>
                <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 800, color: "#22c55e" }}>₹{item.revenue.toLocaleString()}</td>
                <td style={{ padding: "12px 16px", fontSize: 13, color: "#64748b" }}>~{Math.round(item.orders / 7)}/day</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const pages = {
    dashboard:  { title: "Dashboard",   component: <DashboardPage /> },
    categories: { title: "Categories",  component: <CategoriesPage /> },
    menu:       { title: "Menu Items",   component: <MenuPage /> },
    orders:     { title: "Orders",       component: <OrdersPage /> },
    reports:    { title: "Reports",      component: <ReportsPage /> },
    settings:   { title: "Settings",     component: <div style={{ background: "#fff", borderRadius: 20, padding: 48, textAlign: "center", color: "#94a3b8", fontSize: 15 }}>⚙️ Settings coming soon...</div> },
  };

  const current = pages[activeNav as keyof typeof pages];

  return (
    <div style={{ display: "flex", height: "100vh", background: "#f1f5f9", fontFamily: "'Segoe UI', -apple-system, sans-serif", overflow: "hidden" }}>
      <style>{`
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        @keyframes slideUp { from { opacity:0; transform:translateY(30px); } to { opacity:1; transform:translateY(0); } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
      `}</style>
      <Sidebar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
        <Topbar title={current.title} />
        <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
          {current.component}
        </div>
      </div>
    </div>
  );
}