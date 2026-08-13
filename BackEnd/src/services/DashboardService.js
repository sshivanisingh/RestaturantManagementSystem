import { Order } from "../models/order.payment.model.js";
import { MenuItem } from "../models/menuItem.model.js";
import { User } from "../models/user.model.js";
import { Table } from "../models/table.model.js";
import { ApiError } from "../utils/ApiError.js";

class DashboardService {
  static async getOverviewStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalOrders, confirmedOrders, pendingOrders, totalRevenue, todayRevenue] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ orderstatus: "confirmed" }),
      Order.countDocuments({ orderstatus: "pending" }),
      Order.aggregate([
        { $match: { orderstatus: "confirmed" } },
        { $group: { _id: null, total: { $sum: "$pricing.total" } } },
      ]),
      Order.aggregate([
        { $match: { orderstatus: "confirmed", createdAt: { $gte: today } } },
        { $group: { _id: null, total: { $sum: "$pricing.total" } } },
      ]),
    ]);

    return {
      totalOrders,
      confirmedOrders,
      pendingOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      todayRevenue: todayRevenue[0]?.total || 0,
    };
  }

  static async getRevenueChart(days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const data = await Order.aggregate([
      {
        $match: {
          orderstatus: "confirmed",
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
            },
          },
          revenue: { $sum: "$pricing.total" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return data.map(item => ({
      date: item._id,
      revenue: item.revenue,
      orders: item.orders,
    }));
  }

  static async getTopItems(limit = 10) {
    const data = await Order.aggregate([
      { $match: { orderstatus: "confirmed" } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.menuItemId",
          name: { $first: "$items.menuItemId" },
          quantity: { $sum: "$items.quantity" },
          revenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } },
        },
      },
      { $sort: { quantity: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: "menuitems",
          localField: "_id",
          foreignField: "_id",
          as: "item",
        },
      },
    ]);

    return data.map(item => ({
      itemId: item._id,
      itemName: item.item[0]?.name || "Unknown",
      quantity: item.quantity,
      revenue: item.revenue,
    }));
  }

  static async getOrderStatus() {
    const data = await Order.aggregate([
      {
        $group: {
          _id: "$orderstatus",
          count: { $sum: 1 },
        },
      },
    ]);

    const statusMap = {
      pending: 0,
      confirmed: 0,
      cancelled: 0,
    };

    data.forEach(item => {
      if (statusMap.hasOwnProperty(item._id)) {
        statusMap[item._id] = item.count;
      }
    });

    return [
      { status: "pending", count: statusMap.pending },
      { status: "confirmed", count: statusMap.confirmed },
      { status: "cancelled", count: statusMap.cancelled },
    ];
  }

  static async getDeliveryStats() {
    const [total, delivered, pending] = await Promise.all([
      Order.countDocuments({ deliveryBoyId: { $exists: true, $ne: null } }),
      Order.countDocuments({ deliverystatus: "delivered" }),
      Order.countDocuments({ deliverystatus: { $in: ["assigned", "out_for_delivery"] } }),
    ]);

    return {
      totalDeliveries: total,
      deliveredCount: delivered,
      pendingDeliveries: pending,
      deliveryRate: total > 0 ? ((delivered / total) * 100).toFixed(2) : 0,
    };
  }

  static async getActiveTables() {
    const activeTables = await Table.countDocuments({ isOccupied: true });
    const totalTables = await Table.countDocuments();

    return {
      activeTables,
      totalTables,
      occupancyRate: totalTables > 0 ? ((activeTables / totalTables) * 100).toFixed(2) : 0,
    };
  }

  static async getCustomerStats() {
    const totalCustomers = await User.countDocuments({ role: "customer" });
    const activeCustomers = await User.countDocuments({
      role: "customer",
      isActive: true,
    });

    return {
      totalCustomers,
      activeCustomers,
      inactiveCustomers: totalCustomers - activeCustomers,
    };
  }

  static async getFullDashboard() {
    const [overview, revenue, topItems, orderStatus, delivery, tables, customers] = await Promise.all([
      this.getOverviewStats(),
      this.getRevenueChart(30),
      this.getTopItems(10),
      this.getOrderStatus(),
      this.getDeliveryStats(),
      this.getActiveTables(),
      this.getCustomerStats(),
    ]);

    return {
      overview,
      charts: {
        revenue,
        orderStatus,
      },
      topItems,
      delivery,
      tables,
      customers,
      generatedAt: new Date().toISOString(),
    };
  }
}

export { DashboardService };
