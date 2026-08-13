import api from "./axiosInstance";
import type { ApiResponse, Table, UpdateTableStatusParams } from "../types/api.types";

// ─── Table API ────────────────────────────────────────────────────────────────

export const getAllTablesApi = (): Promise<ApiResponse<Table[]>> =>
  api
    .get<ApiResponse<Table[]>>("/table")
    .then((r) => r.data);

export const getTableApi = (id: string): Promise<ApiResponse<Table>> =>
  api
    .get<ApiResponse<Table>>(`/table/${id}`)
    .then((r) => r.data);

export const createTableApi = (
  data: Pick<Table, "tableLabel"> & { status?: Table["status"] }
): Promise<ApiResponse<Table>> =>
  api
    .post<ApiResponse<Table>>("/table", data)
    .then((r) => r.data);

export const updateTableApi = (
  id: string,
  data: Partial<Pick<Table, "tableLabel" | "status" | "userId">>
): Promise<ApiResponse<Table>> =>
  api
    .patch<ApiResponse<Table>>(`/table/${id}`, data)
    .then((r) => r.data);

export const deleteTableApi = (id: string): Promise<ApiResponse<null>> =>
  api
    .delete<ApiResponse<null>>(`/table/${id}`)
    .then((r) => r.data);

export const updateTableStatusApi = (
  id: string,
  data: UpdateTableStatusParams
): Promise<ApiResponse<Table>> =>
  api
    .patch<ApiResponse<Table>>(`/table/${id}/status`, data)
    .then((r) => r.data);