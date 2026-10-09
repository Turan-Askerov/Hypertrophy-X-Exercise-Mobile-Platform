import { ApiError } from "./api-error.ts";
import { request, type RequestOptions } from "./request.ts";

export type ApiClientConfig = {
  baseUrl: string;
  fetchImpl: typeof fetch;
  getToken: () => Promise<string | null> | string | null;
  onUnauthorized: () => void;
};

export type ApiCallOptions = Omit<RequestOptions, "token"> & {
  auth?: boolean;
};

export function createApiClient(config: ApiClientConfig) {
  async function call<T>(path: string, options: ApiCallOptions = {}): Promise<T> {
    const { auth = true, ...rest } = options;
    const token = auth ? await config.getToken() : null;

    try {
      return await request<T>(
        { baseUrl: config.baseUrl, fetchImpl: config.fetchImpl },
        path,
        { ...rest, token }
      );
    } catch (err) {
      if (token && err instanceof ApiError && err.info.kind === "unauthorized") {
        config.onUnauthorized();
      }
      throw err;
    }
  }

  return { call };
}