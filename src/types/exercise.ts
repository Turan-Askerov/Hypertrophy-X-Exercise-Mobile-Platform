// Backend routers/exercises.py get_exercises() çıktısı ile uyumlu tipler

export type ExerciseAnalysis = {
  family?: string;
  load_mode?: string;
  primary_muscles?: string[];
  secondary_muscles?: string[];
  equipment?: string[];
  [key: string]: unknown;
};

export type Exercise = {
  id: string;
  name: string;
  muscle_group: string;
  muscle: string;
  display_muscle_groups: string[];
  is_bodyweight: boolean;
  bw: boolean;
  weighted: boolean;
  canonical_exercise_id: string;
  analysis?: ExerciseAnalysis;
};

export type ExercisesResponse = {
  exercises: Exercise[];
  muscle_groups: string[];
};
