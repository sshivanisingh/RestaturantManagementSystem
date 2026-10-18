import { Router } from "express";
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
} from "../controllers/TableController.js";

// Import your existing authentication middleware here.
import { verifyRestaurant } from "../middlewares/auth.middleware.js";

const router = Router();

// PUBLIC: customers can view tables without logging in.
// Register before "/:id".
router.get("/public", getPublicTables);

// PROTECTED: restaurant/admin table management.
router.get("/", verifyRestaurant, getAllTables);
router.post("/", verifyRestaurant, createTable);

router.get("/reservations/all", verifyRestaurant, getAllReservations);

router.get("/:id", getTable);
router.patch("/:id", verifyRestaurant, updateTable);
router.delete("/:id", verifyRestaurant, deleteTable);
router.patch("/:id/status", verifyRestaurant, updateTableStatus);

// Customer reservation creation remains public.
router.post("/:id/reservations", createReservation);

// Protected reservation management.
router.get("/:id/reservations", verifyRestaurant, getReservations);
router.patch("/:id/reservations/:reservationId", verifyRestaurant, updateReservation);
router.patch("/:id/reservations/:reservationId/confirm", verifyRestaurant, confirmReservation);
router.patch("/:id/reservations/:reservationId/cancel", verifyRestaurant, cancelReservation);
router.patch("/:id/reservations/:reservationId/checkin", verifyRestaurant, checkIn);
router.patch("/:id/reservations/:reservationId/checkout", verifyRestaurant, checkOut);
router.patch("/:id/reservations/:reservationId/noshow", verifyRestaurant, markNoShow);

export default router;
