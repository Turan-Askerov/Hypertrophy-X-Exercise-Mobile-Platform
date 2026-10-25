import { api } from "./client";
import { createNutritionApi } from "./create-nutrition-api";

export const nutritionApi = createNutritionApi(api);
