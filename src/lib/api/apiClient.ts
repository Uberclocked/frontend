import axios, { AxiosError } from "axios";

import { isApiErrorPayload, type ApiError } from "./api.types";

const axiosInstance = axios.create({
  baseURL: "/api",
  headers: { "Content-type": "application/json" },
  timeout: 10000,
});

axiosInstance.interceptors.response.use(
  (response) => response.data,
  (error: AxiosError) => {
    let apiError: ApiError;
    if (!error.response) {
      apiError = {
        code: "NETWORK_ERROR",
        message: error.message,
      };
    } else {
      const { status, data } = error.response;
      if (isApiErrorPayload(data)) {
        apiError = {
          code: data.code ?? `HTTP_${status}`,
          message: data.message ?? "Something went wrong",
          details: data.details,
        };
      } else {
        apiError = {
          code: `HTTP_${status}`,
          message: "Unexpected error response",
        };
      }
    }
    return Promise.reject(apiError);
  },
);

const apiClient = {
  get: <T>(url: string, config?: object) =>
    axiosInstance.get<T, T>(url, config),

  post: <T, B>(url: string, body: B, config?: object) =>
    axiosInstance.post<T, T>(url, body, config),

  put: <T, B>(url: string, body: B, config?: object) =>
    axiosInstance.put<T, T>(url, body, config),

  delete: <T>(url: string, config?: object) =>
    axiosInstance.delete<T, T>(url, config),
};

export default apiClient;
