export type NutritionTargets = {
  calories: number;
  protein_g: number;
  carbohydrates_g: number;
  fat_g: number;
};

export type NutritionLog = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  notes?: string;
  updated_at?: string;
};

export type NutritionHistoryItem = {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  notes?: string;
  updated_at?: string;
};

export type NutritionLogPayload = {
  username: string;
  log_date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  notes?: string;
};
