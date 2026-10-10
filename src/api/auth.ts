import { api } from "./client";
import { createAuthApi } from "./create-auth-api";

export const authApi = createAuthApi(api);