import api from "./axiosInstance";
import type {
  ApiResponse,
  LoginPayload,
  LoginResponse,
  OtpPayload,
  SendOtpPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  ProfileResponse
} from "../types/api.types";


// ─── Auth API ─────────────────────────────────────────────────────────────────

export const registerApi = (
  formData: FormData
): Promise<ApiResponse<LoginResponse>> =>
  api
    .post<ApiResponse<LoginResponse>>("/auth/register", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((r) => r.data);

export const loginApi = (
  payload: LoginPayload
): Promise<ApiResponse<LoginResponse>> =>
  api
    .post<ApiResponse<LoginResponse>>("/auth/login", payload)
    .then((r) => r.data);

export const logoutApi = (): Promise<ApiResponse<null>> =>
  api.post<ApiResponse<null>>("/auth/logout").then((r) => r.data);

export const verifyOtpApi = (
  payload: OtpPayload
): Promise<ApiResponse<null>> =>
  api
    .post<ApiResponse<null>>("/auth/verify-otp", payload)
    .then((r) => r.data);

export const sendOtpApi = (
  payload: SendOtpPayload
): Promise<ApiResponse<null>> =>
  api
    .post<ApiResponse<null>>("/auth/send-otp", payload)
    .then((r) => r.data);

export const resendOtpApi = (
  payload: SendOtpPayload
): Promise<ApiResponse<null>> =>
  api
    .post<ApiResponse<null>>("/auth/resend-otp", payload)
    .then((r) => r.data);

export const forgotPasswordApi = (
  payload: ForgotPasswordPayload
): Promise<ApiResponse<null>> =>
  api
    .post<ApiResponse<null>>("/auth/forgot-password", payload)
    .then((r) => r.data);

export const resetPasswordApi = (
  payload: ResetPasswordPayload
): Promise<ApiResponse<null>> =>
  api
    .post<ApiResponse<null>>("/auth/reset-password", payload)
    .then((r) => r.data);

export const refreshTokenApi = (): Promise<
  ApiResponse<{ accessToken: string }>
> =>
  api
    .post<ApiResponse<{ accessToken: string }>>("/auth/refresh-token")
    .then((r) => r.data);



  // ─── Get Profile ──────────────────────────────────────────────────────────────
export const getProfileApi = (): Promise<ApiResponse<ProfileResponse>> =>
  api.get<ApiResponse<ProfileResponse>>("/auth/profile").then((r) => r.data);

export const updateProfileApi = (formData: FormData): Promise<ApiResponse<ProfileResponse>> =>
  api.patch<ApiResponse<ProfileResponse>>("/auth/profile", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  }).then((r) => r.data);

export const changePasswordApi = (payload: {
  currentPassword: string; newPassword: string;
}): Promise<ApiResponse<null>> =>
  api.patch<ApiResponse<null>>("/auth/change-password", payload).then((r) => r.data);
 
