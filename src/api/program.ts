import { api } from "./client.ts";
import { createProgramApi } from "./create-program-api.ts";

export const programApi = createProgramApi(api);
