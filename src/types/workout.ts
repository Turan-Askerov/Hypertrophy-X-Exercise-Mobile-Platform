// Backend schemas.py (SetData, ExerciseEntry, WorkoutCreate, WorkoutUpdate) modellerine uyumlu tipler

export type SetData = {
  reps: number;
  weight_kg: number;
  rir?: number | null;
  rest_seconds?: number | null;
  _id?: string;
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
  superset_id?: string | null;
};

export type WorkoutCreate = {
  date: string; // ISO format (YYYY-MM-DD)
  session_type: string;
  notes?: string;
  exercises: ExerciseEntry[];
  gym_id?: string | null;
  gym_name?: string | null;
  duration_seconds?: number;
  rest_time_seconds?: number;
  entry_mode?: 'live' | 'manual';
};

export type WorkoutUpdate = Partial<Omit<WorkoutCreate, "exercises">> & {
  exercises?: ExerciseEntry[];
  duration_seconds?: number;
  rest_time_seconds?: number;
  entry_mode?: 'live' | 'manual';
};

export type Workout = WorkoutCreate & {
  id: number;
  user_id: number;
  total_volume: number;
  duration_seconds?: number;
  rest_time_seconds?: number;
  entry_mode?: 'live' | 'manual';
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
