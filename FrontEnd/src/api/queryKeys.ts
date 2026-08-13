// ─── Query Keys ───────────────────────────────────────────────────────────────

export const queryKeys = {
  auth: {
    me: ["auth", "me"] as const,
  },

  categories: {
    all   : ()           => ["categories"]               as const,
    lists : ()           => ["categories", "list"]       as const,
    detail: (id: string) => ["categories", "detail", id] as const,
  },

  items: {
    all   : ()           => ["items"]               as const,
    lists : ()           => ["items", "list"]       as const,
    detail: (id: string) => ["items", "detail", id] as const,
  },

  tables: {
    all   : ()           => ["tables"]               as const,
    lists : ()           => ["tables", "list"]       as const,
    detail: (id: string) => ["tables", "detail", id] as const,
  },

  user: {
    profile : ()           => ["user", "profile"]    as const,
    cart    : ()           => ["user", "cart"]       as const,
    wishlist: ()           => ["user", "wishlist"]   as const,
    orders  : ()           => ["user", "orders"]     as const,
    order   : (id: string) => ["user", "orders", id] as const,
  },

  orders: {
    all   : (restaurantId?: string) => ["orders", restaurantId ?? "all"]    as const,
    lists : (status?: string)       => ["orders", "list", status ?? "all"] as const,
    detail: (orderId: string)       => ["orders", "detail", orderId]       as const,
  },

  reservations: {
    all   : ()                                                              => ["reservations"]                                  as const,
    list  : (tableId: string, params?: { status?: string; date?: string }) => ["reservations", "table", tableId, params]        as const,
    detail: (tableId: string, reservationId: string)                       => ["reservations", "table", tableId, reservationId] as const,
  },

  // ── Delivery Boy ─────────────────────────────────────────────────────────────
  deliveryBoy: {
    // Delivery boy's own profile
    profile        : ()              => ["deliveryBoy", "profile"]            as const,

    // Current active order
    currentOrder   : ()              => ["deliveryBoy", "currentOrder"]       as const,

    // Past delivered orders (paginated)
    history        : (page?: number) => ["deliveryBoy", "history", page ?? 1] as const,

    // Unassigned orders delivery boy can accept
    availableOrders: ()              => ["deliveryBoy", "availableOrders"]    as const,

    // Admin — all delivery boys list
    list: (params?: { isOnline?: boolean; page?: number }) =>
      ["deliveryBoy", "list", params]                                         as const,

    // Single delivery boy detail
    detail  : (id: string)      => ["deliveryBoy", "detail", id]              as const,

    // Customer — live location for a given order
    location: (orderId: string) => ["deliveryBoy", "location", orderId]       as const,
  },
} as const;