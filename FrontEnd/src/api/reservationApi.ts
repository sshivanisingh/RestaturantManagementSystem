// api/reservationApi.ts
import api from "./axiosInstance";
import type {
  ApiResponse,
  Reservation,
  CreateReservationParams,
  UpdateReservationParams,
  CancelReservationParams,
} from "../types/api.types";

// ─── Reservation API ────────────────────────────────────────────────────────────────

// GET /tables/reservations/all
export const getAllReservationsApi = (): Promise<ApiResponse<Reservation[]>> =>
  api
    .get<ApiResponse<Reservation[]>>("/table/reservations/all")
    .then((r) => r.data);

// GET /tables/:id/reservations?status=&date=
export const getReservationsApi = (
  tableId: string,
  params?: { status?: string; date?: string }
): Promise<ApiResponse<Reservation[]>> =>
  api
    .get<ApiResponse<Reservation[]>>(`/table/${tableId}/reservations`, { params })
    .then((r) => r.data);

// POST /tables/:id/reservations
export const createReservationApi = (
  tableId: string,
  data: CreateReservationParams
): Promise<ApiResponse<Reservation>> =>
  api
    .post<ApiResponse<Reservation>>(`/table/${tableId}/reservations`, data)
    .then((r) => r.data);

// PATCH /tables/:id/reservations/:reservationId
export const updateReservationApi = (
  tableId: string,
  reservationId: string,
  data: UpdateReservationParams
): Promise<ApiResponse<Reservation>> =>
  api
    .patch<ApiResponse<Reservation>>(`/table/${tableId}/reservations/${reservationId}`, data)
    .then((r) => r.data);

// PATCH /tables/:id/reservations/:reservationId/confirm
export const confirmReservationApi = (
  tableId: string,
  reservationId: string
): Promise<ApiResponse<Reservation>> =>
  api
    .patch<ApiResponse<Reservation>>(`/table/${tableId}/reservations/${reservationId}/confirm`)
    .then((r) => r.data);

// PATCH /tables/:id/reservations/:reservationId/cancel
export const cancelReservationApi = (
  tableId: string,
  reservationId: string,
  data: CancelReservationParams
): Promise<ApiResponse<Reservation>> =>
  api
    .patch<ApiResponse<Reservation>>(`/table/${tableId}/reservations/${reservationId}/cancel`, data)
    .then((r) => r.data);

// PATCH /tables/:id/reservations/:reservationId/checkin
export const checkInApi = (
  tableId: string,
  reservationId: string
): Promise<ApiResponse<Reservation>> =>
  api
    .patch<ApiResponse<Reservation>>(`/table/${tableId}/reservations/${reservationId}/checkin`)
    .then((r) => r.data);

// PATCH /tables/:id/reservations/:reservationId/checkout
export const checkOutApi = (
  tableId: string,
  reservationId: string
): Promise<ApiResponse<Reservation>> =>
  api
    .patch<ApiResponse<Reservation>>(`/table/${tableId}/reservations/${reservationId}/checkout`)
    .then((r) => r.data);

// PATCH /tables/:id/reservations/:reservationId/noshow
export const markNoShowApi = (
  tableId: string,
  reservationId: string
): Promise<ApiResponse<Reservation>> =>
  api
    .patch<ApiResponse<Reservation>>(`/table/${tableId}/reservations/${reservationId}/noshow`)
    .then((r) => r.data);