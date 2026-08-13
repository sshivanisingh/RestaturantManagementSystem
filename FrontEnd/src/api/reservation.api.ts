import api from "./axiosInstance";
import type { ApiResponse, Reservation } from "../types/api.types";

// ─── Reservation API ──────────────────────────────────────────────────────────
export const getReservationsApi = (
  tableId: string,
  params?: { status?: string; date?: string }
): Promise<ApiResponse<Reservation[]>> =>
  api
    .get<ApiResponse<Reservation[]>>(`/table/${tableId}/reservations`, { params })
    .then((r) => r.data);

export const getAllReservationsApi = (
  params?: { status?: string; date?: string; guestPhone?: string }
): Promise<ApiResponse<Reservation[]>> =>
  api
    .get<ApiResponse<Reservation[]>>("/table/reservations/all", { params })
    .then((r) => r.data);

export const createReservationApi = (
  tableId: string,
  data: {
    userId?: string;
    guestName: string;
    guestPhone: string;
    guestEmail?: string;
    date: string;
    partySize: number;
    durationMins?: number;
    specialRequest?: string;
  }
): Promise<ApiResponse<Reservation>> =>
  api
    .post<ApiResponse<Reservation>>(`/table/${tableId}/reservations`, data)
    .then((r) => r.data);

export const updateReservationApi = (
  tableId: string,
  reservationId: string,
  data: {
    userId?: string;
    guestName?: string;
    guestPhone?: string;
    guestEmail?: string;
    date?: string;
    partySize?: number;
    durationMins?: number;
    specialRequest?: string;
  }
): Promise<ApiResponse<Reservation>> =>
  api
    .patch<ApiResponse<Reservation>>(
      `/table/${tableId}/reservations/${reservationId}`,
      data
    )
    .then((r) => r.data);

export const confirmReservationApi = (
  tableId: string,
  reservationId: string
): Promise<ApiResponse<Reservation>> =>
  api
    .patch<ApiResponse<Reservation>>(
      `/table/${tableId}/reservations/${reservationId}/confirm`
    )
    .then((r) => r.data);

export const cancelReservationApi = (
  tableId: string,
  reservationId: string,
  data?: { reason?: string }
): Promise<ApiResponse<Reservation>> =>
  api
    .patch<ApiResponse<Reservation>>(
      `/table/${tableId}/reservations/${reservationId}/cancel`,
      data
    )
    .then((r) => r.data);

export const checkInApi = (
  tableId: string,
  reservationId: string
): Promise<ApiResponse<Reservation>> =>
  api
    .patch<ApiResponse<Reservation>>(
      `/table/${tableId}/reservations/${reservationId}/checkin`
    )
    .then((r) => r.data);

export const checkOutApi = (
  tableId: string,
  reservationId: string
): Promise<ApiResponse<Reservation>> =>
  api
    .patch<ApiResponse<Reservation>>(
      `/table/${tableId}/reservations/${reservationId}/checkout`
    )
    .then((r) => r.data);

export const markNoShowApi = (
  tableId: string,
  reservationId: string
): Promise<ApiResponse<Reservation>> =>
  api
    .patch<ApiResponse<Reservation>>(
      `/table/${tableId}/reservations/${reservationId}/noshow`
    )
    .then((r) => r.data);