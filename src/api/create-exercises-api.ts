import type { ExercisesResponse } from "../types/exercise.ts";
import type { ApiCaller } from "./create-auth-api.ts";

export function createExercisesApi(client: ApiCaller) {
  function listExercises(): Promise<ExercisesResponse> {
    return client.call<ExercisesResponse>("/api/exercises", {
      method: "GET",
      auth: true,
    });
  }

  return {
    listExercises,
  };
}
