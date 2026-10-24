import type { CustomProgramRequest, CustomProgramResponse } from "../types/program.ts";
import type { ApiCaller } from "./create-auth-api.ts";

export function createProgramApi(client: ApiCaller) {
  function saveCustomProgram(
    data: CustomProgramRequest
  ): Promise<CustomProgramResponse> {
    return client.call<CustomProgramResponse>("/api/custom-program", {
      method: "POST",
      body: data,
      auth: true,
    });
  }

  return {
    saveCustomProgram,
  };
}
