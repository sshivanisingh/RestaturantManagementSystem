import {
  useQueries,
  useQuery,
  useMutation,
  useQueryClient,
  UseMutationOptions,
  queryOptions,
} from "@tanstack/react-query";
import {
  registerApi, loginApi, logoutApi,
  verifyOtpApi, sendOtpApi, resendOtpApi,
  forgotPasswordApi, resetPasswordApi,
  getProfileApi
} from "../api";
import { queryKeys } from "../api/queryKeys";
import type {
  ApiResponse,
  LoginPayload,
  LoginResponse,
  OtpPayload,
  SendOtpPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
} from "../types/api.types";



// ─── useRegister ──────────────────────────────────────────────────────────────
export const useRegister = (
  options?: UseMutationOptions<ApiResponse<LoginResponse>, Error, FormData>
) => {
  return useMutation({
    mutationFn: registerApi,
    ...options,
  });
};

// ─── useLogin ─────────────────────────────────────────────────────────────────
export const useLogin = (
  options?: UseMutationOptions<ApiResponse<LoginResponse>, Error, LoginPayload>
) => {
  const queryClient = useQueryClient();

  const { onSuccess, onError, ...restOptions } = options ?? {};

  return useMutation({
    mutationFn: loginApi,
    ...restOptions,
    onSuccess: (data, variables, context) => {
      localStorage.setItem("accessToken", data.data.accessToken);
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
      onSuccess?.(data, variables, context, undefined as any);
    },
    onError: (error, variables, context) => {
      onError?.(error, variables, context, undefined as any);
    },
  });
};

// ─── useLogout ────────────────────────────────────────────────────────────────
export const useLogout = (
  options?: UseMutationOptions<ApiResponse<null>, Error, void>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logoutApi,
    onSuccess: (data, variables, context) => {
      localStorage.removeItem("accessToken");
      queryClient.clear();
      options?.onSuccess?.(data, variables, context, undefined as any);
    },
    ...options,
  });
};

// ─── useVerifyOtp ─────────────────────────────────────────────────────────────
export const useVerifyOtp = (
  options?: UseMutationOptions<ApiResponse<null>, Error, OtpPayload>
) => {
  return useMutation({
    mutationFn: verifyOtpApi,
    ...options,
  });
};

// ─── useSendOtp ───────────────────────────────────────────────────────────────
export const useSendOtp = (
  options?: UseMutationOptions<ApiResponse<null>, Error, SendOtpPayload>
) => {
  return useMutation({
    mutationFn: sendOtpApi,
    ...options,
  });
};

// ─── useResendOtp ─────────────────────────────────────────────────────────────
export const useResendOtp = (
  options?: UseMutationOptions<ApiResponse<null>, Error, SendOtpPayload>
) => {
  return useMutation({
    mutationFn: resendOtpApi,
    ...options,
  });
};

// ─── useForgotPassword ────────────────────────────────────────────────────────
export const useForgotPassword = (
  options?: UseMutationOptions<ApiResponse<null>, Error, ForgotPasswordPayload>
) => {
  return useMutation({
    mutationFn: forgotPasswordApi,
    ...options,
  });
};




// ─── useResetPassword ─────────────────────────────────────────────────────────
export const useResetPassword = (
  options?: UseMutationOptions<ApiResponse<null>, Error, ResetPasswordPayload>
) => {
  return useMutation({
    mutationFn: resetPasswordApi,
    ...options,
  });
};


// ─── useGetProfile ───────────────────────────────────────────────────────────
export const useGetProfile = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: getProfileApi,
    retry: false,
    staleTime: 5 * 60 * 1000,
    enabled: options?.enabled ?? true,
  });
};
