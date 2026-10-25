import { api } from "./client";
import { createProgressApi } from "./create-progress-api";

export const progressApi = createProgressApi(api);
export * from "./create-progress-api";
