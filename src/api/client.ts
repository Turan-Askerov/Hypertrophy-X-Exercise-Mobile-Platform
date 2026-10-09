import { tokenStorage } from "../auth/token-storage";
import { API_BASE_URL } from "../config/env";
import { createApiClient } from "./api-client";

let unauthorizedHandler: () => void = () => {};

export function setUnauthorizedHandler(handler: () => void) {
  unauthorizedHandler = handler;
}

export const api = createApiClient({
  baseUrl: API_BASE_URL,
  fetchImpl: (input, init) => fetch(input, init),
  getToken: () => tokenStorage.getToken(),
  onUnauthorized: () => unauthorizedHandler(),
});