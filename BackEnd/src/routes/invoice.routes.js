import { Router } from "express";
import {
  getInvoice,
  listInvoices,
  downloadInvoicePDF,
} from "../controllers/invoice.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

// All invoice routes require authentication
router.use(verifyJWT);

// GET /api/invoices/:orderId
// Get invoice for a specific order (customer or admin)
router.get("/:orderId", getInvoice);

// GET /api/invoices
// List all invoices (admin only)
router.get("/", listInvoices);

// GET /api/invoices/:orderId/download
// Download invoice as PDF
router.get("/:orderId/download", downloadInvoicePDF);

export default router;
