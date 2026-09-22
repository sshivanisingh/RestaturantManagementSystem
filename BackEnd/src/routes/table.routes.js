import { Router } from "express";

import { verifyJWT } from "../middleware/auth.middleware.js";

import {
  createTable,
  getAllTables,
  getPublicTables,
  getTable,
  updateTable,
  deleteTable,
  updateTableStatus,
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

// ============================================================
// PUBLIC / CUSTOMER
// ============================================================

// IMPORTANT:
// This route MUST be before /:id

router.get("/public", getPublicTables);

// Customer creates reservation
router.post("/:id/reservations", createReservation);

// ============================================================
// PROTECTED RESTAURANT OWNER
// ============================================================

router.get("/reservations/all", verifyJWT, getAllReservations);

router.get("/", verifyJWT, getAllTables);

router.get("/:id", verifyJWT, getTable);

router.post("/", verifyJWT, createTable);

router.patch("/:id", verifyJWT, updateTable);

router.delete("/:id", verifyJWT, deleteTable);

router.patch("/:id/status", verifyJWT, updateTableStatus);

// ============================================================
// RESERVATION MANAGEMENT
// ============================================================

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
