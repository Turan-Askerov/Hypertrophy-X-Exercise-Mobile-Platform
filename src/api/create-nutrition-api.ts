import type { ApiCaller } from "./create-auth-api";
import type {
  NutritionHistoryItem,
  NutritionLog,
  NutritionLogPayload,
} from "../types/nutrition";

export function createNutritionApi(client: ApiCaller) {
  function getTodayNutrition(): Promise<{ success: boolean; log: NutritionLog }> {
    return client.call<{ success: boolean; log: NutritionLog }>("/api/nutrition/today", {
      method: "GET",
      auth: true,
    });
  }

  function getNutritionHistory(): Promise<{
    success: boolean;
    history: NutritionHistoryItem[];
  }> {
    return client.call<{ success: boolean; history: NutritionHistoryItem[] }>(
      "/api/nutrition/history",
      {
        method: "GET",
        auth: true,
      }
    );
  }

  function saveNutritionLog(
    data: NutritionLogPayload
  ): Promise<{ success: boolean; message: string }> {
    return client.call<{ success: boolean; message: string }>("/api/nutrition/log", {
      method: "POST",
      body: data,
      auth: true,
    });
  }

  function deleteNutritionLog(
    dateStr: string
  ): Promise<{ success: boolean; message: string }> {
    return client.call<{ success: boolean; message: string }>(
      `/api/nutrition/log?log_date=${encodeURIComponent(dateStr)}`,
      {
        method: "DELETE",
        auth: true,
      }
    );
  }

  return {
    getTodayNutrition,
    getNutritionHistory,
    saveNutritionLog,
    deleteNutritionLog,
  };
}

