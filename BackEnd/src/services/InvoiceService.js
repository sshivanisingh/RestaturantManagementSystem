import { Order } from "../models/order.payment.model.js";
import { MenuItem } from "../models/menuItem.model.js";
import { Restaurant } from "../models/restaurant.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";

class InvoiceService {
  static async generateInvoice(orderId) {
    const order = await Order.findById(orderId)
      .populate("userId", "name email phone address")
      .populate("restaurantId", "name phone email address")
      .populate("items.menuItemId", "name price");

    if (!order) throw new ApiError(404, "Order not found");

    const invoice = {
      invoiceNumber: `INV-${order._id.toString().slice(-8).toUpperCase()}`,
      invoiceDate: new Date().toISOString().split('T')[0],
      orderDate: order.createdAt.toISOString().split('T')[0],

      // Customer details
      customer: {
        name: order.userId?.name || "Guest",
        email: order.userId?.email || "",
        phone: order.userId?.phone || "",
        address: order.userId?.address || "",
      },

      // Restaurant details
      restaurant: {
        name: order.restaurantId?.name || "Restaurant",
        email: order.restaurantId?.email || "",
        phone: order.restaurantId?.phone || "",
        address: order.restaurantId?.address || "",
      },

      // Order details
      items: order.items.map(item => ({
        name: item.menuItemId?.name || "Item",
        quantity: item.quantity,
        unitPrice: item.price,
        total: item.price * item.quantity,
      })),

      // Pricing breakdown
      subtotal: order.pricing?.subtotal || 0,
      tax: order.pricing?.tax || 0,
      deliveryCharge: order.pricing?.deliveryCharge || 0,
      discount: order.pricing?.discount || 0,
      total: order.pricing?.total || 0,

      // Order status
      orderId: order._id.toString(),
      status: order.orderstatus,
      deliveryStatus: order.deliverystatus,
      paymentMethod: order.paymentId?.method || "Not specified",
      paymentStatus: order.paymentId?.status || "pending",
    };

    return invoice;
  }

  static async getInvoice(orderId, userId = null) {
    const order = await Order.findById(orderId);
    if (!order) throw new ApiError(404, "Order not found");

    // Check authorization — only customer, restaurant owner, or admin can view
    if (userId && order.userId.toString() !== userId.toString()) {
      throw new ApiError(403, "Not authorized to view this invoice");
    }

    return this.generateInvoice(orderId);
  }

  static async listInvoices(filter = {}, { page = 1, limit = 20 } = {}) {
    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      Order.find(filter)
        .select("_id userId orderstatus createdAt pricing")
        .populate("userId", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments(filter),
    ]);

    const invoices = orders.map(order => ({
      invoiceNumber: `INV-${order._id.toString().slice(-8).toUpperCase()}`,
      orderId: order._id.toString(),
      customerName: order.userId?.name || "Guest",
      invoiceDate: order.createdAt.toISOString().split('T')[0],
      amount: order.pricing?.total || 0,
      status: order.orderstatus,
    }));

    return {
      invoices,
      pagination: {
        total,
        page: Number(page),
        totalPages: Math.ceil(total / limit),
        limit: Number(limit),
      },
    };
  }
}

export { InvoiceService };
