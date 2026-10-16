export type WorkoutSetItem = {
  id: number;
  workout_exercise_id: number;
  set_number: number;
  weight: number;
  reps: number;
  rir: number;
  rest_seconds: number | null;
  completed: number;
  created_at: string;
  updated_at: string;
};

export type WorkoutExerciseItem = {
  id: number;
  workout_id: number;
  exercise_id: number;
  exercise_name: string;
  order_index: number;
  notes: string | null;
  sets: WorkoutSetItem[];
};

export type WorkoutListItem = {
  id: number;
  user_id: number;
  workout_date: string;
  start_time: string | null;
  end_time: string | null;
  duration_minutes: number | null;
  notes: string | null;
  total_sets: number | null;
  total_volume: number | null;
  exercises: WorkoutExerciseItem[];
};