import type { ApiCaller } from "./create-auth-api";
import type { ProgressChartResponse, ProgressResponse } from "../types/progress";

export function createProgressApi(client: ApiCaller) {
  function getProgress(): Promise<ProgressResponse> {
    return client.call<ProgressResponse>("/api/progress", {
      method: "GET",
      auth: true,
    });
  }

  function getExerciseChart(params: {
    exercise_id?: string;
    exercise?: string;
  }): Promise<ProgressChartResponse> {
    const query = new URLSearchParams();
    if (params.exercise_id) query.append("exercise_id", params.exercise_id);
    if (params.exercise) query.append("exercise", params.exercise);
    return client.call<ProgressChartResponse>(`/api/progress/chart?${query.toString()}`, {
      method: "GET",
      auth: true,
    });
  }

  return {
    getProgress,
    getExerciseChart,
  };
}

