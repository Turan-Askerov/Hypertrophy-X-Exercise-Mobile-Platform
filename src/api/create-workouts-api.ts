import type { Workout, WorkoutCreate, WorkoutUpdate } from "../types/workout.ts";
import type { ApiCaller } from "./create-auth-api.ts";

export type SaveWorkoutResponse = {
  id: number;
  message?: string;
  [key: string]: unknown;
};

export type DeleteWorkoutResponse = {
  success?: boolean;
  message?: string;
  [key: string]: unknown;
};

export type UpdateWorkoutResponse = {
  success?: boolean;
  message?: string;
  [key: string]: unknown;
};

export function createWorkoutsApi(client: ApiCaller) {
  function listWorkouts(): Promise<Workout[]> {
    return client.call<Workout[]>("/api/workouts", {
      method: "GET",
      auth: true,
    });
  }

  function saveWorkout(data: WorkoutCreate): Promise<SaveWorkoutResponse> {
    return client.call<SaveWorkoutResponse>("/api/workouts", {
      method: "POST",
      body: data,
      auth: true,
    });
  }

  function deleteWorkout(id: number): Promise<DeleteWorkoutResponse> {
    return client.call<DeleteWorkoutResponse>(`/api/workouts/${id}`, {
      method: "DELETE",
      auth: true,
    });
  }

  function updateWorkout(
    id: number,
    data: WorkoutUpdate
  ): Promise<UpdateWorkoutResponse> {
    return client.call<UpdateWorkoutResponse>(`/api/workouts/${id}`, {
      method: "PUT",
      body: data,
      auth: true,
    });
  }

  return {
    listWorkouts,
    saveWorkout,
    deleteWorkout,
    updateWorkout,
  };
}
