import { api } from "./client.ts";
import { createWorkoutsApi } from "./create-workouts-api.ts";

const rawWorkoutsApi = createWorkoutsApi(api);

export const workoutsApi = {
  ...rawWorkoutsApi,
  list: rawWorkoutsApi.listWorkouts,
};
