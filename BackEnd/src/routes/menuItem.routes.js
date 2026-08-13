import { Router }    from "express";
import { upload } from "../middleware/multer.middleware.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import {
  createItem, getAllItems, getItem,
  updateItem, deleteItem,
  toggleStatus, toggleAvailability,
} from "../controllers/menuItem.controller.js";

const router = Router();

// ── Public (no auth) ──────────────────────────────────────────
router.get("/", getAllItems);
router.get("/:id", getItem);

// ── Protected (auth required) ─────────────────────────────────
router.post("/", verifyJWT, upload.single("image"), createItem);

router.patch("/:id", verifyJWT, upload.single("image"), updateItem);
router.delete("/:id", verifyJWT, deleteItem);

router.patch("/:id/toggle-status", verifyJWT, toggleStatus);
router.patch("/:id/toggle-availability", verifyJWT, toggleAvailability);                

export default router;