import { Router } from "express";
import {
  getInventory,
  getInventoryItem,
  createInventory,
  updateInventory,
  deleteInventory,
  adjustStock,
  getLowStock,
} from "../controllers/inventory.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

// All inventory routes require authentication
router.use(verifyJWT);

// Collection
router.get("/", getInventory);
router.post("/", createInventory);

// Low stock items
router.get("/status/low-stock", getLowStock);

// Single item
router.get("/:id", getInventoryItem);
router.patch("/:id", updateInventory);
router.delete("/:id", deleteInventory);

// Adjust stock (add / deduct)
router.patch("/:id/adjust", adjustStock);

export default router;
