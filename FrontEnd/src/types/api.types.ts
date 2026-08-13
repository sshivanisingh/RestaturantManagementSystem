// ════════════════════════════════════════════════════════════════════════════
//  GLOBAL API RESPONSE SHAPE
// ════════════════════════════════════════════════════════════════════════════

export interface ApiResponse<T = unknown> {
  success:    boolean;
  statusCode: number;
  data:       T;
  message:    string;
}

// ════════════════════════════════════════════════════════════════════════════
//  SHARED UTILITY TYPES
// ════════════════════════════════════════════════════════════════════════════

export interface PaginatedResponse<T> {
  orders?:       T[];   // delivery history uses "orders"
  deliveryBoys?: T[];   // admin list uses "deliveryBoys"
  total:         number;
  page:          number;
  totalPages:    number;
}

export interface TokenResponse {
  accessToken:  string;
  refreshToken: string;
}

// ════════════════════════════════════════════════════════════════════════════
//  AUTH TYPES
// ════════════════════════════════════════════════════════════════════════════

export interface User {
  _id:        string;
  name:       string;
  email:      string;
  phone?:     string;
  logo?:      string;
  role:       "customer" | "admin" | "manager" | "staff";
  isVerified: boolean;
  isActive?:  boolean;
  cart?:      any[];
  orders?:    string[] | Order[];
  createdAt:  string;
  updatedAt:  string;
}

export interface AuthTokens {
  accessToken:  string;
  refreshToken?: string;
}

export interface LoginPayload {
  email:    string;
  password: string;
}

export type ProfileResponse = {
  role: "restaurant" | "customer";
  data: Record<string, unknown>;
};

export interface RegisterPayload {
  name:     string;
  email:    string;
  password: string;
  logo?:    File;
}

export interface OtpPayload {
  email: string;
  otp:   string;
}

export interface SendOtpPayload {
  email: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token:    string;
  password: string;
}

export interface LoginResponse {
  user:        User;
  accessToken: string;
}

// ════════════════════════════════════════════════════════════════════════════
//  MENU CATEGORY TYPES
// ════════════════════════════════════════════════════════════════════════════

export interface MenuCategory {
  icon:         any;
  _id:          string;
  name:         string;
  description?: string;
  isActive:     boolean;
  createdAt:    string;
  updatedAt:    string;
}

export interface CreateCategoryPayload {
  name:         string;
  description?: string;
}

export interface UpdateCategoryPayload {
  name?:        string;
  description?: string;
}

// ════════════════════════════════════════════════════════════════════════════
//  MENU ITEM TYPES
// ════════════════════════════════════════════════════════════════════════════

export interface MenuItem {
  _id:             string;
  name:            string;
  description?:    string;
  price:           number;
  discountedPrice?: number;
  discountPercent?: number;
  image?:          string;
  categoryId:      string;
  category?:       MenuCategory;
  type?:           string;
  isBestSeller?:   boolean;
  preparationTime?: number;
  servingSize?:    string;
  ingredients?:    string[];
  nutrition?:      Record<string, string>;
  rating?:         number;
  isActive:        boolean;
  isAvailable:     boolean;
  createdAt:       string;
  updatedAt:       string;
}

export interface CreateItemPayload {
  name:         string;
  price:        number;
  categoryId:   string;
  description?: string;
  image?:       File;
}

export interface UpdateItemPayload {
  name?:        string;
  price?:       number;
  categoryId?:  string;
  description?: string;
  image?:       File;
}

// ════════════════════════════════════════════════════════════════════════════
//  HOOK PARAM TYPES
// ════════════════════════════════════════════════════════════════════════════

export interface UpdateCategoryParams {
  id:      string;
  payload: UpdateCategoryPayload;
}

export interface UpdateItemParams {
  id:       string;
  formData: FormData;
}

// ════════════════════════════════════════════════════════════════════════════
//  TABLE TYPES
// ════════════════════════════════════════════════════════════════════════════

export interface Table {
  _id:          string;
  restaurantId: string;
  tableLabel:   string;
  userId:       string | null;
  status:       "available" | "occupied" | "reserved";
  createdAt:    string;
  updatedAt:    string;
}

export interface UpdateTableParams {
  id:   string;
  data: Partial<Pick<Table, "tableLabel" | "status" | "userId">>;
}

export interface UpdateTableStatusParams {
  status:  Table["status"];
  userId?: string | null;
}

// ════════════════════════════════════════════════════════════════════════════
//  RESERVATION TYPES
// ════════════════════════════════════════════════════════════════════════════

export type ReservationStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "no-show";

export interface Reservation {
  id:              string;
  userId?:         string | null;
  guestName?:      string | null;
  guestPhone?:     string | null;
  guestEmail?:     string | null;
  date:            string;
  partySize:       number;
  durationMins?:   number;
  specialRequest?: string | null;
  status:          ReservationStatus;
  confirmedBy?:    string | null;
  cancelReason?:   string | null;
  checkedInAt?:    string | null;
  checkedOutAt?:   string | null;
  createdAt:       string;
  updatedAt:       string;
}

export interface CreateReservationParams {
  userId?:         string;
  guestName?:      string;
  guestPhone?:     string;
  guestEmail?:     string;
  date:            string;
  partySize:       number;
  durationMins?:   number;
  specialRequest?: string;
}

export interface UpdateReservationParams
  extends Partial<CreateReservationParams> {
  status?:       ReservationStatus;
  confirmedBy?:  string;
  cancelReason?: string;
}

export interface CancelReservationParams {
  reason?: string;
}

// ════════════════════════════════════════════════════════════════════════════
//  ORDER TYPES
// ════════════════════════════════════════════════════════════════════════════

export type OrderStatus    = "pending" | "confirmed" | "cancelled";
export type DeliveryStatus = "pending" | "assigned" | "out_for_delivery" | "delivered";

export interface OrderItem {
  menuItemId: string;
  name:       string;
  image?:     string;
  price:      number;
  quantity:   number;
}

export interface DeliveryInfo {
  name:    string;
  phone:   string;
  email?:  string;
  address: string;
  city:    string;
  state?:  string;
  pincode: string;
  type:    "delivery" | "pickup";
}

export interface OrderPricing {
  subtotal:       number;
  tax:            number;
  deliveryCharge: number;
  discount:       number;
  total:          number;
}

export interface StatusHistoryEntry {
  status:    string;
  timestamp: string;
  note?:     string;
}

export interface DeliveryRating {
  rating:   number | null;
  comment:  string | null;
  ratedAt:  string | null;
}

export interface Order {
  _id:                  string;
  orderId:              string;
  userId:               string | { _id: string; name: string; phone: string; email: string } | null;
  paymentId:            string | PaymentSummary | null;
  restaurantId:         string | null;
  deliveryBoyId:        string | null;
  deliveryBoyAssignedAt?: string | null;
  items:                OrderItem[];
  deliveryInfo:         DeliveryInfo;
  customerLocation?:    GeoLocation | null;
  pricing:              OrderPricing;
  couponCode?:          string | null;
  orderstatus:          OrderStatus;
  deliverystatus:       DeliveryStatus;
  statusHistory:        StatusHistoryEntry[];
  notes?:               string;
  estimatedTime?:       number;
  isGuestOrder:         boolean;
  deliveryRating:       DeliveryRating;
  createdAt:            string;
  updatedAt:            string;
}

export interface PaymentSummary {
  _id:           string;
  status:        "pending" | "paid" | "failed" | "refunded" | "partially_refunded";
  method:        "COD" | "UPI" | "CARD" | "NETBANKING" | "WALLET" | "RAZORPAY";
  amount:        number;
  paidAt?:       string;
  transactionId?: string;
  gatewayOrderId?: string;
}

// ════════════════════════════════════════════════════════════════════════════
//  DELIVERY BOY TYPES
// ════════════════════════════════════════════════════════════════════════════

export type VehicleType = "bike" | "bicycle" | "scooter" | "car";

export interface GeoLocation {
  type:        "Point";
  coordinates: [number, number]; // [longitude, latitude]
}

export interface DeliveryBoy {
  _id:                   string;
  restaurantId:          string;
  name:                  string;
  email:                 string;
  phone:                 string;
  avatar?:               string | null;
  vehicleType:           VehicleType;
  vehicleNumber?:        string | null;
  isActive:              boolean;
  isOnline:              boolean;
  isApproved:            boolean;
  isVerified:            boolean;
  currentLocation:       GeoLocation;
  lastLocationUpdatedAt: string | null;
  currentOrderId:        string | Order | null;
  totalDeliveries:       number;
  totalEarnings:         number;
  averageRating:         number;
  totalRatings:          number;
  createdAt:             string;
  updatedAt:             string;
}

export interface DeliveryBoyLoginResponse {
  deliveryBoy:  Omit<DeliveryBoy, "currentLocation" | "totalEarnings">;
  accessToken:  string;
  refreshToken: string;
}

export interface RegisterDeliveryBoyPayload {
  name:          string;
  email:         string;
  phone:         string;
  password:      string;
  vehicleType?:  VehicleType;
  vehicleNumber?: string;
}

export interface UpdateDeliveryBoyProfilePayload {
  name?:          string;
  phone?:         string;
  vehicleType?:   VehicleType;
  vehicleNumber?: string;
}

export interface ChangeDeliveryBoyPasswordPayload {
  oldPassword: string;
  newPassword: string;
}

// ─── Available Order (what delivery boy sees before accepting) ────────────────
export interface AvailableOrder {
  _id:             string;
  orderId:         string;
  items:           Pick<OrderItem, "name" | "quantity">[];
  deliveryInfo:    Pick<DeliveryInfo, "address" | "city" | "pincode" | "type">;
  pricing:         Pick<OrderPricing, "total" | "deliveryCharge">;
  customerLocation?: GeoLocation | null;
  createdAt:       string;
  userId?:         { name: string; phone: string; email: string } | null;
}

// ─── Order History entry (delivered orders list) ──────────────────────────────
export interface OrderHistory {
  _id:           string;
  orderId:       string;
  items:         Pick<OrderItem, "name" | "quantity">[];
  pricing:       Pick<OrderPricing, "total" | "deliveryCharge">;
  deliveryInfo:  Pick<DeliveryInfo, "address" | "city">;
  deliveryRating: DeliveryRating;
  createdAt:     string;
}

// ─── Delivery Boy Location (customer tracking) ────────────────────────────────
export interface DeliveryBoyLocation {
  deliveryBoy?: {
    name:                  string;
    phone:                 string;
    vehicleType:           VehicleType;
    currentLocation:       GeoLocation;
    lastLocationUpdatedAt: string | null;
  } | null;
  orderStatus: DeliveryStatus;
  message?:    string;
}

// ─── Update Delivery Status Params ───────────────────────────────────────────
export interface UpdateDeliveryStatusParams {
  orderId:        string;
  deliverystatus: "out_for_delivery" | "delivered";
  note?:          string;
}

// ─── Assign Delivery Boy Params ───────────────────────────────────────────────
export interface AssignDeliveryBoyParams {
  orderId:       string;
  deliveryBoyId: string;
}

// ─── Approve / Toggle Delivery Boy Params ────────────────────────────────────
export interface ApproveDeliveryBoyParams {
  deliveryBoyId: string;
  isApproved?:   boolean;
  isActive?:     boolean;
}

// ─── Rate Delivery Params ────────────────────────────────────────────────────
export interface RateDeliveryParams {
  orderId:  string;
  rating:   number;
  comment?: string;
}