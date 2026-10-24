import { api } from "./client.ts";
import { createExercisesApi } from "./create-exercises-api.ts";

export const exercisesApi = createExercisesApi(api);
