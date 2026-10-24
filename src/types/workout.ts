// Backend schemas.py (SetData, ExerciseEntry, WorkoutCreate, WorkoutUpdate) modellerine uyumlu tipler

export type SetData = {
  reps: number;
  weight_kg: number;
  rir?: number | null;
};

export type ExerciseEntry = {
  exercise_id: string;
  exercise_name: string;
  muscle_group: string;
  sets_data: SetData[];
  is_bodyweight: boolean;
  canonical_exercise_id?: string | null;
  exercise_meta_version?: number;
  legacy_exercise_name?: string | null;
};

export type WorkoutCreate = {
  date: string; // ISO format (YYYY-MM-DD)
  session_type: string;
  notes?: string;
  exercises: ExerciseEntry[];
  gym_id?: string | null;
  gym_name?: string | null;
};

export type WorkoutUpdate = Partial<Omit<WorkoutCreate, "exercises">> & {
  exercises?: ExerciseEntry[];
};

export type Workout = WorkoutCreate & {
  id: number;
  user_id: number;
  total_volume: number;
  created_at?: string;
  updated_at?: string;
};

export type WorkoutSessionType =
  | "Üst Vücut"
  | "Alt Vücut"
  | "Tam Vücut"
  | "Push"
  | "Pull"
  | "Legs"
  | "Kardiyo"
  | "Diğer";

export const DEFAULT_SESSION_TYPES: WorkoutSessionType[] = [
  "Üst Vücut",
  "Alt Vücut",
  "Tam Vücut",
  "Push",
  "Pull",
  "Legs",
  "Kardiyo",
  "Diğer",
];

// Geriye dönük uyumluluk alias'ı
export type WorkoutListItem = Workout;
