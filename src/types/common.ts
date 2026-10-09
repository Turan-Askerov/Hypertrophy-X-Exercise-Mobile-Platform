export type ApiErrorKind =
  | "network"
  | "timeout"
  | "unauthorized"
  | "rate-limited"
  | "validation"
  | "client"
  | "server"
  | "unknown";

export type ApiErrorInfo = {
  kind: ApiErrorKind;
  message: string;
  status?: number;
  retryAfterSeconds?: number;
};