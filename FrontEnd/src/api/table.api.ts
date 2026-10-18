
import api from "./axiosInstance";
import type {
  ApiResponse,
  Table,
  UpdateTableStatusParams,
} from "../types/api.types";

// ─── Public Table API ────────────────────────────────────────────────────────

export const getAvailableTablesApi = (): Promise<ApiResponse<Table[]>> =>
  api
    .get<ApiResponse<Table[]>>("/table/public")
    .then((response) => response.data);

// ─── Single Table API ───────────────────────────────────────────────────────

export const getTableApi = (
  id: string
): Promise<ApiResponse<Table>> =>
  api
    .get<ApiResponse<Table>>(`/table/${id}`)
    .then((response) => response.data);

// ─── Create Table API ───────────────────────────────────────────────────────

export const createTableApi = (
  data: Pick<Table, "tableLabel"> & { status?: Table["status"] }
): Promise<ApiResponse<Table>> =>
  api
    .post<ApiResponse<Table>>("/table", data)
    .then((response) => response.data);

// ─── Update Table API ───────────────────────────────────────────────────────

export const updateTableApi = (
  id: string,
  data: Partial<
    Pick<Table, "tableLabel" | "status" | "userId">
  >
): Promise<ApiResponse<Table>> =>
  api
    .patch<ApiResponse<Table>>(`/table/${id}`, data)
    .then((response) => response.data);

// ─── Delete Table API ───────────────────────────────────────────────────────

export const deleteTableApi = (
  id: string
): Promise<ApiResponse<null>> =>
  api
    .delete<ApiResponse<null>>(`/table/${id}`)
    .then((response) => response.data);

// ─── Update Table Status API ────────────────────────────────────────────────

export const updateTableStatusApi = (
  id: string,
  data: UpdateTableStatusParams
): Promise<ApiResponse<Table>> =>
  api
    .patch<ApiResponse<Table>>(`/table/${id}/status`, data)
    .then((response) => response.data);
