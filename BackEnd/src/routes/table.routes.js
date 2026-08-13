import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import {
  // Table CRUD
  createTable,
  getAllTables,
  getTable,
  updateTable,
  deleteTable,
  updateTableStatus,
  // Reservation
  createReservation,
  getReservations,
  getAllReservations,
  updateReservation,
  confirmReservation,
  cancelReservation,
  checkIn,
  checkOut,
  markNoShow,
} from "../controllers/table.controller.js";

const router = Router();

// ── /reservations/all MUST come before /:id or Express will swallow it ──────
router.get("/reservations/all", verifyJWT, getAllReservations);

// ── Table CRUD ───────────────────────────────────────────────────────────────
router.get("/", getAllTables);
router.get("/:id", getTable);

router.post("/", verifyJWT, createTable);
router.patch("/:id", verifyJWT, updateTable);
router.delete("/:id", verifyJWT, deleteTable);
router.patch("/:id/status", verifyJWT, updateTableStatus);

// ── Reservations ─────────────────────────────────────────────────────────────
router.post("/:id/reservations", createReservation);
router.get("/:id/reservations", verifyJWT, getReservations);

router.patch("/:id/reservations/:reservationId", verifyJWT, updateReservation);
router.patch(
  "/:id/reservations/:reservationId/confirm",
  verifyJWT,
  confirmReservation,
);
router.patch(
  "/:id/reservations/:reservationId/cancel",
  verifyJWT,
  cancelReservation,
);
router.patch("/:id/reservations/:reservationId/checkin", verifyJWT, checkIn);
router.patch("/:id/reservations/:reservationId/checkout", verifyJWT, checkOut);
router.patch("/:id/reservations/:reservationId/noshow", verifyJWT, markNoShow);

export default router;
