import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { InvoiceService } from "../services/InvoiceService.js";

// GET /api/invoices/:orderId
// Get invoice for a specific order
const getInvoice = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const userId = req.user?._id || null;
  const invoice = await InvoiceService.getInvoice(orderId, userId);
  res.status(200).json(new ApiResponse(200, invoice, "Invoice generated"));
});

// GET /api/invoices
// List all invoices (admin only)
// Query: ?page=1&limit=20&status=pending|confirmed|cancelled
const listInvoices = asyncHandler(async (req, res) => {
  const { page, limit, status } = req.query;
  const filter = {};
  if (status) filter.orderstatus = status;

  const result = await InvoiceService.listInvoices(filter, { page, limit });
  res.status(200).json(new ApiResponse(200, result, "Invoices fetched"));
});

// GET /api/invoices/:orderId/download
// Download invoice as PDF (would require PDF library like pdfkit or similar)
// For now, returns invoice data that frontend can use to generate PDF
const downloadInvoicePDF = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const userId = req.user?._id || null;
  const invoice = await InvoiceService.getInvoice(orderId, userId);

  // Set response headers for PDF download
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Content-Disposition", `attachment; filename="invoice-${invoice.invoiceNumber}.json"`);

  res.status(200).json(new ApiResponse(200, invoice, "Invoice ready for download"));
});

export {
  getInvoice,
  listInvoices,
  downloadInvoicePDF,
};
