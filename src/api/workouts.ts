import { api } from "./client";
import type { WorkoutListItem } from "../types/workout";

export const workoutsApi = {
  list: () => api.call<WorkoutListItem[]>("/api/workouts"),
};