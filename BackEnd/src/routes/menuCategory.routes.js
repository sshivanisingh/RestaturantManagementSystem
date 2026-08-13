import { Router }    from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import {
  createCategory,
  getAllCategories,
  getCategory,
  updateCategory,
  deleteCategory,
  toggleStatus,
} from "../controllers/menuCategory.controller.js";

const router = Router();

// ── Public (no auth) ──────────────────────────────────────────
router.get("/", getAllCategories);
router.get("/:id", getCategory);

// ── Protected (auth required) ─────────────────────────────────
router.post("/", verifyJWT, createCategory);

router.patch("/:id", verifyJWT, updateCategory);
router.delete("/:id", verifyJWT, deleteCategory);

router.patch("/:id/toggle", verifyJWT, toggleStatus);   

export default router;