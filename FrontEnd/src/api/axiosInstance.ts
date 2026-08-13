import axios, {
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";

// ─────────────────────────────────────────────────────────────────────────────
// Base URL
// ─────────────────────────────────────────────────────────────────────────────

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";

// ─────────────────────────────────────────────────────────────────────────────
// Axios Instance
// ─────────────────────────────────────────────────────────────────────────────

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 15_000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface RetryRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

interface PendingRequest {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Refresh State
// ─────────────────────────────────────────────────────────────────────────────

let isRefreshing = false;

let failedQueue: PendingRequest[] = [];

// ─────────────────────────────────────────────────────────────────────────────
// Process Queue
// ─────────────────────────────────────────────────────────────────────────────

const processQueue = (error: unknown, token: string | null = null): void => {
  failedQueue.forEach((request) => {
    if (error) {
      request.reject(error);
    } else if (token) {
      request.resolve(token);
    }
  });

  failedQueue = [];
};

// ─────────────────────────────────────────────────────────────────────────────
// Request Interceptor
// ─────────────────────────────────────────────────────────────────────────────

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // localStorage only exists in browser
    if (typeof window === "undefined") {
      return config;
    }

    const url = config.url || "";

    // Check whether this is a delivery-boy API
    const isDeliveryRoute = url.includes("/delivery");

    // Get tokens
    const accessToken = localStorage.getItem("accessToken");
    const deliveryToken = localStorage.getItem("db_accessToken");

    // Delivery routes use delivery token first
    // Normal routes use normal access token
    const token = isDeliveryRoute ? deliveryToken || accessToken : accessToken;

    // Attach Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  },
);

// ─────────────────────────────────────────────────────────────────────────────
// Response Interceptor
// ─────────────────────────────────────────────────────────────────────────────

api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },

  async (error) => {
    // Must run only in browser
    if (typeof window === "undefined") {
      return Promise.reject(error);
    }

    const originalRequest = error.config as RetryRequestConfig | undefined;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    const url = originalRequest.url || "";

    // ───────────────────────────────────────────────────────────────────────
    // Auth endpoints
    // ───────────────────────────────────────────────────────────────────────

    const isAuthEndpoint =
      url.includes("/auth/login") ||
      url.includes("/auth/register") ||
      url.includes("/auth/refresh-token") ||
      url.includes("/delivery/login") ||
      url.includes("/delivery/register") ||
      url.includes("/delivery/refresh-token");

    // Never refresh auth endpoints
    if (isAuthEndpoint) {
      return Promise.reject(error);
    }

    // Only handle 401
    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    // Don't retry the same request twice
    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    // ───────────────────────────────────────────────────────────────────────
    // Get current token
    // ───────────────────────────────────────────────────────────────────────

    const isDeliveryRoute = url.includes("/delivery");

    const accessToken = localStorage.getItem("accessToken");
    const deliveryToken = localStorage.getItem("db_accessToken");

    const currentToken = isDeliveryRoute
      ? deliveryToken || accessToken
      : accessToken;

    // No token means user isn't authenticated.
    // Don't try refresh.
    if (!currentToken) {
      return Promise.reject(error);
    }

    // ───────────────────────────────────────────────────────────────────────
    // If another request is already refreshing
    // ───────────────────────────────────────────────────────────────────────

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({
          resolve,
          reject,
        });
      })
        .then((newToken) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;

          return api(originalRequest);
        })
        .catch((queueError) => {
          return Promise.reject(queueError);
        });
    }

    // ───────────────────────────────────────────────────────────────────────
    // Start refresh
    // ───────────────────────────────────────────────────────────────────────

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      console.log("🔄 Access token expired. Refreshing token...");

      const response = await api.post<{
        data: {
          accessToken: string;
        };
      }>("/auth/refresh-token");

      const newToken = response.data?.data?.accessToken;

      if (!newToken) {
        throw new Error("Refresh token response did not contain accessToken");
      }

      // Save new token
      localStorage.setItem("accessToken", newToken);

      // Update Axios default header
      api.defaults.headers.common.Authorization = `Bearer ${newToken}`;

      console.log("✅ Access token refreshed successfully");

      // Resolve all queued requests
      processQueue(null, newToken);

      // Retry original request
      originalRequest.headers.Authorization = `Bearer ${newToken}`;

      return api(originalRequest);
    } catch (refreshError) {
      console.error("❌ Token refresh failed:", refreshError);

      // Reject queued requests
      processQueue(refreshError, null);

      // Remove invalid access token
      localStorage.removeItem("accessToken");

      // Remove Axios default Authorization
      delete api.defaults.headers.common.Authorization;

      // Don't automatically redirect
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default api;
