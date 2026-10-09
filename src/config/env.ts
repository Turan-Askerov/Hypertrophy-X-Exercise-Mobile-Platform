import { normalizeBaseUrl } from "./base-url";

export const API_BASE_URL = normalizeBaseUrl(process.env.EXPO_PUBLIC_API_URL);