import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse }  from "../utils/ApiResponse.js";
import { ApiError }     from "../utils/ApiError.js";
import { TableService } from "../services/TableService.js";

// ══════════════════════════════════════════════════════════════
//  TABLE CRUD
// ══════════════════════════════════════════════════════════════

const createTable = asyncHandler(async (req, res) => {
  const restaurantId = req.restaurant?._id;
  if (!restaurantId) throw new ApiError(403, "Only restaurants can create tables");
  const table = await TableService.create(restaurantId, req.body);
  res.status(201).json(new ApiResponse(201, table, "Table created"));
});

const getAllTables = asyncHandler(async (req, res) => {
  // ?status=available&section=Rooftop
  const restaurantId = req.restaurant?._id;
  if (!restaurantId) throw new ApiError(403, "Only restaurants can view tables");
  const tables = await TableService.getAllByRestaurant(restaurantId, req.query);
  res.status(200).json(new ApiResponse(200, tables, "Tables fetched"));
});

const getTable = asyncHandler(async (req, res) => {
  const restaurantId = req.restaurant?._id;
  if (!restaurantId) throw new ApiError(403, "Only restaurants can view tables");
  const table = await TableService.getOne(req.params.id, restaurantId);
  res.status(200).json(new ApiResponse(200, table, "Table fetched"));
});

const updateTable = asyncHandler(async (req, res) => {
  const restaurantId = req.restaurant?._id;
  if (!restaurantId) throw new ApiError(403, "Only restaurants can update tables");
  const table = await TableService.update(
    req.params.id,
    restaurantId,
    req.body
  );
  res.status(200).json(new ApiResponse(200, table, "Table updated"));
});

const deleteTable = asyncHandler(async (req, res) => {
  const restaurantId = req.restaurant?._id;
  if (!restaurantId) throw new ApiError(403, "Only restaurants can delete tables");
  const result = await TableService.delete(req.params.id, restaurantId);
  res.status(200).json(new ApiResponse(200, result, result.message));
});

const updateTableStatus = asyncHandler(async (req, res) => {
  const restaurantId = req.restaurant?._id;
  if (!restaurantId) throw new ApiError(403, "Only restaurants can update table status");
  const result = await TableService.updateStatus(
    req.params.id,
    restaurantId,
    req.body   // { status, userId? }
  );
  res.status(200).json(new ApiResponse(200, result, result.message));
});

// ══════════════════════════════════════════════════════════════
//  RESERVATION CONTROLLERS
// ══════════════════════════════════════════════════════════════

// POST /tables/:id/reservations
// Body: { userId?, guestName, guestPhone, guestEmail?, date, partySize, durationMins?, specialRequest? }
const createReservation = asyncHandler(async (req, res) => {
  const restaurantId = req.restaurant?._id;
  if (!restaurantId) throw new ApiError(403, "Only restaurants can create reservations");
  const result = await TableService.createReservation(
    req.params.id,
    restaurantId,
    req.body
  );
  res.status(201).json(new ApiResponse(201, result, result.message));
});

// GET /tables/:id/reservations?status=pending&date=2026-04-10
const getReservations = asyncHandler(async (req, res) => {
  const restaurantId = req.restaurant?._id;
  if (!restaurantId) throw new ApiError(403, "Only restaurants can view reservations");
  const result = await TableService.getReservations(
    req.params.id,
    restaurantId,
    req.query
  );
  res.status(200).json(new ApiResponse(200, result, "Reservations fetched"));
});

// GET /tables/reservations/all?status=pending&date=2026-04-10&guestPhone=9027
const getAllReservations = asyncHandler(async (req, res) => {
  const restaurantId = req.restaurant?._id;
  if (!restaurantId) throw new ApiError(403, "Only restaurants can view reservations");
  const reservations = await TableService.getAllReservations(
    restaurantId,
    req.query
  );
  res.status(200).json(new ApiResponse(200, reservations, "All reservations fetched"));
});

// PATCH /tables/:id/reservations/:reservationId
const updateReservation = asyncHandler(async (req, res) => {
  const restaurantId = req.restaurant?._id;
  if (!restaurantId) throw new ApiError(403, "Only restaurants can update reservations");
  const result = await TableService.updateReservation(
    req.params.id,
    restaurantId,
    req.params.reservationId,
    req.body
  );
  res.status(200).json(new ApiResponse(200, result, result.message));
});

// PATCH /tables/:id/reservations/:reservationId/confirm
const confirmReservation = asyncHandler(async (req, res) => {
  const restaurantId = req.restaurant?._id;
  if (!restaurantId) throw new ApiError(403, "Only restaurants can confirm reservations");
  const result = await TableService.confirmReservation(
    req.params.id,
    restaurantId,
    req.params.reservationId,
    req.user?._id   // staff id
  );
  res.status(200).json(new ApiResponse(200, result, result.message));
});

// PATCH /tables/:id/reservations/:reservationId/cancel
// Body: { reason? }
const cancelReservation = asyncHandler(async (req, res) => {
  const restaurantId = req.restaurant?._id;
  if (!restaurantId) throw new ApiError(403, "Only restaurants can cancel reservations");
  const result = await TableService.cancelReservation(
    req.params.id,
    restaurantId,
    req.params.reservationId,
    req.body
  );
  res.status(200).json(new ApiResponse(200, result, result.message));
});

// PATCH /tables/:id/reservations/:reservationId/checkin
const checkIn = asyncHandler(async (req, res) => {
  const restaurantId = req.restaurant?._id;
  if (!restaurantId) throw new ApiError(403, "Only restaurants can check in reservations");
  const result = await TableService.checkIn(
    req.params.id,
    restaurantId,
    req.params.reservationId
  );
  res.status(200).json(new ApiResponse(200, result, result.message));
});

// PATCH /tables/:id/reservations/:reservationId/checkout
const checkOut = asyncHandler(async (req, res) => {
  const restaurantId = req.restaurant?._id;
  if (!restaurantId) throw new ApiError(403, "Only restaurants can check out reservations");
  const result = await TableService.checkOut(
    req.params.id,
    restaurantId,
    req.params.reservationId
  );
  res.status(200).json(new ApiResponse(200, result, result.message));
});

// PATCH /tables/:id/reservations/:reservationId/noshow
const markNoShow = asyncHandler(async (req, res) => {
  const restaurantId = req.restaurant?._id;
  if (!restaurantId) throw new ApiError(403, "Only restaurants can mark reservations as no-show");
  const result = await TableService.markNoShow(
    req.params.id,
    restaurantId,
    req.params.reservationId
  );
  res.status(200).json(new ApiResponse(200, result, result.message));
});

export {
  // Table
  createTable, getAllTables, getTable,
  updateTable, deleteTable, updateTableStatus,
  // Reservation
  createReservation, getReservations, getAllReservations,
  updateReservation, confirmReservation, cancelReservation,
  checkIn, checkOut, markNoShow,
};