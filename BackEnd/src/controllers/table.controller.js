import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { TableService } from "../services/TableService.js";

// ═════════════════════════════════════════════════════════════════════════════
// Helper
// ═════════════════════════════════════════════════════════════════════════════

const getPublicRestaurantId = (req) => {
  const restaurantId =
    req.query?.restaurantId ||
    req.body?.restaurantId ||
    process.env.RESTAURANT_ID;

  if (!restaurantId) {
    throw new ApiError(400, "Restaurant ID is required");
  }

  return restaurantId;
};

// ═════════════════════════════════════════════════════════════════════════════
// TABLE CRUD
// ═════════════════════════════════════════════════════════════════════════════

// POST /api/v1/table
// Protected — restaurant/admin
const createTable = asyncHandler(async (req, res) => {
  const restaurantId = req.restaurant?._id;

  if (!restaurantId) {
    throw new ApiError(403, "Only restaurants can create tables");
  }

  const table = await TableService.create(restaurantId, req.body);

  res.status(201).json(new ApiResponse(201, table, "Table created"));
});

// GET /api/v1/table
// PUBLIC — customers can view available tables
const getAllTables = asyncHandler(async (req, res) => {
  const restaurantId = getPublicRestaurantId(req);

  const tables = await TableService.getAllByRestaurant(restaurantId, req.query);

  res.status(200).json(new ApiResponse(200, tables, "Tables fetched"));
});

// GET /api/v1/table/:id
// PUBLIC — customer can view a table
const getTable = asyncHandler(async (req, res) => {
  const restaurantId = req.query?.restaurantId || process.env.RESTAURANT_ID;

  if (!restaurantId) {
    throw new ApiError(400, "Restaurant ID is required");
  }

  const table = await TableService.getOne(req.params.id, restaurantId);

  res.status(200).json(new ApiResponse(200, table, "Table fetched"));
});

// PATCH /api/v1/table/:id
// Protected — restaurant/admin
const updateTable = asyncHandler(async (req, res) => {
  const restaurantId = req.restaurant?._id;

  if (!restaurantId) {
    throw new ApiError(403, "Only restaurants can update tables");
  }

  const table = await TableService.update(
    req.params.id,
    restaurantId,
    req.body,
  );

  res.status(200).json(new ApiResponse(200, table, "Table updated"));
});

// DELETE /api/v1/table/:id
// Protected — restaurant/admin
const deleteTable = asyncHandler(async (req, res) => {
  const restaurantId = req.restaurant?._id;

  if (!restaurantId) {
    throw new ApiError(403, "Only restaurants can delete tables");
  }

  const result = await TableService.delete(req.params.id, restaurantId);

  res.status(200).json(new ApiResponse(200, result, result.message));
});

// PATCH /api/v1/table/:id/status
// Protected — restaurant/admin
const updateTableStatus = asyncHandler(async (req, res) => {
  const restaurantId = req.restaurant?._id;

  if (!restaurantId) {
    throw new ApiError(403, "Only restaurants can update table status");
  }

  const result = await TableService.updateStatus(
    req.params.id,
    restaurantId,
    req.body,
  );

  res.status(200).json(new ApiResponse(200, result, result.message));
});

// ═════════════════════════════════════════════════════════════════════════════
// RESERVATIONS
// ═════════════════════════════════════════════════════════════════════════════

// POST /api/v1/table/:id/reservations
// PUBLIC — customer/guest can make reservation
const createReservation = asyncHandler(async (req, res) => {
  const restaurantId = getPublicRestaurantId(req);

  const result = await TableService.createReservation(
    req.params.id,
    restaurantId,
    req.body,
  );

  res.status(201).json(new ApiResponse(201, result, result.message));
});

// GET /api/v1/table/:id/reservations
// Protected — restaurant/admin
const getReservations = asyncHandler(async (req, res) => {
  const restaurantId = req.restaurant?._id;

  if (!restaurantId) {
    throw new ApiError(403, "Only restaurants can view reservations");
  }

  const result = await TableService.getReservations(
    req.params.id,
    restaurantId,
    req.query,
  );

  res.status(200).json(new ApiResponse(200, result, "Reservations fetched"));
});

// GET /api/v1/table/reservations/all
// Protected — restaurant/admin
const getAllReservations = asyncHandler(async (req, res) => {
  const restaurantId = req.restaurant?._id;

  if (!restaurantId) {
    throw new ApiError(403, "Only restaurants can view reservations");
  }

  const reservations = await TableService.getAllReservations(
    restaurantId,
    req.query,
  );

  res
    .status(200)
    .json(new ApiResponse(200, reservations, "All reservations fetched"));
});

// PATCH /api/v1/table/:id/reservations/:reservationId
// Protected — restaurant/admin
const updateReservation = asyncHandler(async (req, res) => {
  const restaurantId = req.restaurant?._id;

  if (!restaurantId) {
    throw new ApiError(403, "Only restaurants can update reservations");
  }

  const result = await TableService.updateReservation(
    req.params.id,
    restaurantId,
    req.params.reservationId,
    req.body,
  );

  res.status(200).json(new ApiResponse(200, result, result.message));
});

// PATCH /api/v1/table/:id/reservations/:reservationId/confirm
// Protected — restaurant/admin
const confirmReservation = asyncHandler(async (req, res) => {
  const restaurantId = req.restaurant?._id;

  if (!restaurantId) {
    throw new ApiError(403, "Only restaurants can confirm reservations");
  }

  const result = await TableService.confirmReservation(
    req.params.id,
    restaurantId,
    req.params.reservationId,
    req.user?._id,
  );

  res.status(200).json(new ApiResponse(200, result, result.message));
});

// PATCH /api/v1/table/:id/reservations/:reservationId/cancel
// Protected — restaurant/admin
const cancelReservation = asyncHandler(async (req, res) => {
  const restaurantId = req.restaurant?._id;

  if (!restaurantId) {
    throw new ApiError(403, "Only restaurants can cancel reservations");
  }

  const result = await TableService.cancelReservation(
    req.params.id,
    restaurantId,
    req.params.reservationId,
    req.body,
  );

  res.status(200).json(new ApiResponse(200, result, result.message));
});

// PATCH /api/v1/table/:id/reservations/:reservationId/checkin
// Protected — restaurant/admin
const checkIn = asyncHandler(async (req, res) => {
  const restaurantId = req.restaurant?._id;

  if (!restaurantId) {
    throw new ApiError(403, "Only restaurants can check in reservations");
  }

  const result = await TableService.checkIn(
    req.params.id,
    restaurantId,
    req.params.reservationId,
  );

  res.status(200).json(new ApiResponse(200, result, result.message));
});

// PATCH /api/v1/table/:id/reservations/:reservationId/checkout
// Protected — restaurant/admin
const checkOut = asyncHandler(async (req, res) => {
  const restaurantId = req.restaurant?._id;

  if (!restaurantId) {
    throw new ApiError(403, "Only restaurants can check out reservations");
  }

  const result = await TableService.checkOut(
    req.params.id,
    restaurantId,
    req.params.reservationId,
  );

  res.status(200).json(new ApiResponse(200, result, result.message));
});

// PATCH /api/v1/table/:id/reservations/:reservationId/noshow
// Protected — restaurant/admin
const markNoShow = asyncHandler(async (req, res) => {
  const restaurantId = req.restaurant?._id;

  if (!restaurantId) {
    throw new ApiError(
      403,
      "Only restaurants can mark reservations as no-show",
    );
  }

  const result = await TableService.markNoShow(
    req.params.id,
    restaurantId,
    req.params.reservationId,
  );

  res.status(200).json(new ApiResponse(200, result, result.message));
});

// ═════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═════════════════════════════════════════════════════════════════════════════

export {
  // Table
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
};
