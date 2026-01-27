export type ApiErrorPayload = {
  code?: string;
  message?: string;
  details?: unknown;
};

export function isApiErrorPayload(data: unknown): data is ApiErrorPayload {
  if (typeof data !== "object" || data === null) return false;

  const d = data as Record<string, unknown>;

  const hasValidMessage = typeof d.message === "string";

  const hasValidCode = typeof d.code === "string";

  return hasValidMessage || hasValidCode;
}

export type ApiError = {
  code: string;
  message: string;
  details?: unknown;
};

export function isApiError(error: unknown): error is ApiError {
  if (typeof error !== "object" || error === null) return false;

  const e = error as Record<string, unknown>;

  return typeof e.code === "string" && typeof e.message === "string";
}
