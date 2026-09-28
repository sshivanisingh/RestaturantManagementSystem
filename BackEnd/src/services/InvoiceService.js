import path from "path";
import fs from "fs";

import { Order } from "../models/order.payment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { sendEmail } from "../utils/sendEmail.js";
import { invoiceEmailTemplate } from "../utils/emailTemplates.js";
import { generateInvoicePdf } from "../utils/generateInvoicePdf.js";

class InvoiceService {
  // ═══════════════════════════════════════════════════════════════════════════
  // GENERATE INVOICE
  // ═══════════════════════════════════════════════════════════════════════════

  static async generateInvoice(orderId) {
    const order = await Order.findById(orderId)
      .populate("userId", "name email phone address")
      .populate("restaurantId", "name phone email address")
      .populate("items.menuItemId", "name price");

    if (!order) {
      throw new ApiError(404, "Order not found");
    }

    const invoice = {
      invoiceNumber: `INV-${order._id.toString().slice(-8).toUpperCase()}`,

      invoiceDate: new Date().toISOString().split("T")[0],

      orderDate: order.createdAt
        ? order.createdAt.toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],

      // ═════════════════════════════════════════════════════════════════════
      // CUSTOMER
      // ═════════════════════════════════════════════════════════════════════

      customer: {
        name: order.userId?.name || "Guest",
        email: order.userId?.email || "",
        phone: order.userId?.phone || "",
        address: order.userId?.address || "",
      },

      // ═════════════════════════════════════════════════════════════════════
      // RESTAURANT
      // ═════════════════════════════════════════════════════════════════════

      restaurant: {
        name: order.restaurantId?.name || "Restaurant",
        email: order.restaurantId?.email || "",
        phone: order.restaurantId?.phone || "",
        address: order.restaurantId?.address || "",
      },

      // ═════════════════════════════════════════════════════════════════════
      // ITEMS
      // ═════════════════════════════════════════════════════════════════════

      items: (order.items || []).map((item) => ({
        name: item.menuItemId?.name || "Item",

        quantity: Number(item.quantity || 0),

        unitPrice: Number(item.price || 0),

        total: Number(item.price || 0) * Number(item.quantity || 0),
      })),

      // ═════════════════════════════════════════════════════════════════════
      // PRICING
      // ═════════════════════════════════════════════════════════════════════

      subtotal: Number(order.pricing?.subtotal || 0),

      tax: Number(order.pricing?.tax || 0),

      deliveryCharge: Number(order.pricing?.deliveryCharge || 0),

      discount: Number(order.pricing?.discount || 0),

      total: Number(order.pricing?.total || 0),

      // ═════════════════════════════════════════════════════════════════════
      // ORDER INFORMATION
      // ═════════════════════════════════════════════════════════════════════

      orderId: order._id.toString(),

      status: order.orderstatus || "pending",

      deliveryStatus: order.deliverystatus || "pending",

      paymentMethod:
        order.paymentId?.method || order.paymentMethod || "Not specified",

      paymentStatus: order.paymentId?.status || "pending",
    };

    return invoice;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SEND INVOICE EMAIL + PDF
  // ═══════════════════════════════════════════════════════════════════════════

  static async sendInvoiceEmail(orderId) {
    // Generate invoice data
    const invoice = await this.generateInvoice(orderId);

    // Customer email required
    if (!invoice.customer.email) {
      throw new ApiError(
        400,
        "Customer email is not available for this invoice",
      );
    }

    // ═══════════════════════════════════════════════════════════════════════
    // EMAIL TEMPLATE
    // ═══════════════════════════════════════════════════════════════════════

    const email = invoiceEmailTemplate(invoice);

    // ═══════════════════════════════════════════════════════════════════════
    // LOGO PATH
    // ═══════════════════════════════════════════════════════════════════════

    const logoPath = path.join(process.cwd(), "assets", "bitenest-logo.png");

    if (!fs.existsSync(logoPath)) {
      throw new Error(`BiteNest logo not found at: ${logoPath}`);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // GENERATE PDF
    // ═══════════════════════════════════════════════════════════════════════

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📄 GENERATING INVOICE PDF");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    const pdfBuffer = await generateInvoicePdf(invoice, logoPath);

    console.log("📄 PDF Size:", `${(pdfBuffer.length / 1024).toFixed(2)} KB`);

    // ═══════════════════════════════════════════════════════════════════════
    // LOGO → BUFFER
    // ═══════════════════════════════════════════════════════════════════════

    const logoBuffer = fs.readFileSync(logoPath);

    // ═══════════════════════════════════════════════════════════════════════
    // SEND EMAIL
    // ═══════════════════════════════════════════════════════════════════════

    const result = await sendEmail({
      to: invoice.customer.email,

      subject: email.subject,

      html: email.html,

      text: email.text,

      attachments: [
        // ───────────────────────────────────────────────────────────────────
        // BiteNest Logo
        // Used by HTML email through CID
        // ───────────────────────────────────────────────────────────────────

        {
          filename: "bitenest-logo.png",

          content: logoBuffer,

          contentType: "image/png",

          cid: "bitenest-logo",
        },

        // ───────────────────────────────────────────────────────────────────
        // Invoice PDF
        // ───────────────────────────────────────────────────────────────────

        {
          filename: `BiteNest-Invoice-${invoice.invoiceNumber}.pdf`,

          content: pdfBuffer,

          contentType: "application/pdf",
        },
      ],
    });

    // ═══════════════════════════════════════════════════════════════════════
    // SUCCESS LOG
    // ═══════════════════════════════════════════════════════════════════════

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🧾 INVOICE EMAIL SENT");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    console.log("📄 Invoice Number:", invoice.invoiceNumber);

    console.log("📩 Customer:", invoice.customer.email);

    console.log("📎 PDF:", `BiteNest-Invoice-${invoice.invoiceNumber}.pdf`);

    console.log("📨 Message ID:", result?.messageId);

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    return {
      success: true,

      invoice,

      messageId: result?.messageId,

      message: "Invoice email and PDF sent successfully",
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GET SINGLE INVOICE
  // ═══════════════════════════════════════════════════════════════════════════

  static async getInvoice(orderId, userId = null) {
    const order = await Order.findById(orderId);

    if (!order) {
      throw new ApiError(404, "Order not found");
    }

    if (
      userId &&
      order.userId &&
      order.userId.toString() !== userId.toString()
    ) {
      throw new ApiError(403, "Not authorized to view this invoice");
    }

    return this.generateInvoice(orderId);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // LIST INVOICES
  // ═══════════════════════════════════════════════════════════════════════════

  static async listInvoices(filter = {}, { page = 1, limit = 20 } = {}) {
    const pageNumber = Number(page);

    const limitNumber = Number(limit);

    const skip = (pageNumber - 1) * limitNumber;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .select("_id userId orderstatus createdAt pricing")
        .populate("userId", "name email")
        .sort({
          createdAt: -1,
        })
        .skip(skip)
        .limit(limitNumber),

      Order.countDocuments(filter),
    ]);

    const invoices = orders.map((order) => ({
      invoiceNumber: `INV-${order._id.toString().slice(-8).toUpperCase()}`,

      orderId: order._id.toString(),

      customerName: order.userId?.name || "Guest",

      invoiceDate: order.createdAt
        ? order.createdAt.toISOString().split("T")[0]
        : "",

      amount: Number(order.pricing?.total || 0),

      status: order.orderstatus || "pending",
    }));

    return {
      invoices,

      pagination: {
        total,

        page: pageNumber,

        totalPages: Math.ceil(total / limitNumber),

        limit: limitNumber,
      },
    };
  }
}

export { InvoiceService };
