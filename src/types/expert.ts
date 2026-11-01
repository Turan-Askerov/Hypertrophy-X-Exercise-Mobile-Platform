export interface Gym {
  id: string;
  name: string;
  equipment: string[];
  is_default: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface GymEquipmentCatalogItem {
  id: string;
  label: string;
  group: string;
  default_available?: boolean;
}

export interface ExercisePreferenceCatalogItem {
  id: string;
  name: string;
  group: string;
  display_groups: string[];
  primary_muscles: string[];
  category: string;
  bw?: boolean;
  weighted?: boolean;
}

export interface TargetMuscles {
  primary_goal?: string;
  priority_muscles?: string[];
  priority_note?: string;
  updated_at?: string;
}

export interface ExpertCatalog {
  primary_goals: Record<string, string>;
  detailed_muscles: string[];
  gym_equipment: GymEquipmentCatalogItem[];
  exercise_preferences: ExercisePreferenceCatalogItem[];
  max_priority_muscles: number;
  injury_areas?: string[];
  injury_types?: Record<string, string>;
}

export interface ExpertDataState {
  success: boolean;
  user: {
    id: number;
    username?: string;
    created_at?: string;
  };
  gyms: Gym[];
  preferred_equipment: string[];
  preferred_exercise_ids: string[];
  avoid_exercise_ids: string[];
  default_gym_id: string | null;
  default_gym_name: string | null;
  equipment_source: string;
  equipment_source_label: string;
  target_muscles: TargetMuscles;
  catalog: ExpertCatalog;
  injuries?: unknown[];
  rpe_checkins?: unknown[];
  recommendation?: unknown;
  metrics?: unknown;
}

export interface SaveGymRequest {
  name: string;
  equipment: string[];
  is_default: boolean;
}

export interface SaveEquipmentPreferencesRequest {
  preferred_equipment: string[];
}

export interface SaveMovementPreferencesRequest {
  preferred_exercise_ids: string[];
  avoid_exercise_ids: string[];
}

export interface SaveGoalsRequest {
  primary_goal: string;
  priority_muscles: string[];
  priority_note: string;
}
