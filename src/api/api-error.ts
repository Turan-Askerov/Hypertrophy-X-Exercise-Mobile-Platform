import type { ApiErrorInfo } from "../types/common";

export class ApiError extends Error {
  info: ApiErrorInfo;

  constructor(info: ApiErrorInfo) {
    super(info.message);
    this.name = "ApiError";
    this.info = info;
  }
}