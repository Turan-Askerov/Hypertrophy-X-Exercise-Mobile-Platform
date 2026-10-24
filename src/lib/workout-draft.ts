import type { Exercise } from "../types/exercise.ts";
import type { ExerciseEntry, SetData, WorkoutCreate } from "../types/workout.ts";

type Listener = () => void;

function getTodayIso(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const initialDraft: WorkoutCreate = {
  date: getTodayIso(),
  session_type: "Üst Vücut",
  notes: "",
  exercises: [],
};

let currentDraft: WorkoutCreate = { ...initialDraft, exercises: [] };
const listeners = new Set<Listener>();

function notify() {
  for (const l of listeners) l();
}

export const workoutDraft = {
  getSnapshot(): WorkoutCreate {
    return currentDraft;
  },

  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  setDate(date: string) {
    currentDraft = { ...currentDraft, date };
    notify();
  },

  setSessionType(session_type: string) {
    currentDraft = { ...currentDraft, session_type };
    notify();
  },

  setNotes(notes: string) {
    currentDraft = { ...currentDraft, notes };
    notify();
  },

  addExercise(exercise: Exercise) {
    // İlk set olarak boş bir set ekle
    const initialSet: SetData = {
      reps: 0,
      weight_kg: 0,
      rir: null,
    };

    const newEntry: ExerciseEntry = {
      exercise_id: exercise.id,
      exercise_name: exercise.name,
      muscle_group: exercise.muscle || exercise.muscle_group,
      is_bodyweight: exercise.is_bodyweight || exercise.bw,
      canonical_exercise_id: exercise.canonical_exercise_id || exercise.id,
      exercise_meta_version: 2,
      sets_data: [initialSet],
    };

    currentDraft = {
      ...currentDraft,
      exercises: [...currentDraft.exercises, newEntry],
    };
    notify();
  },

  updateExercise(index: number, updated: ExerciseEntry) {
    const next = [...currentDraft.exercises];
    next[index] = updated;
    currentDraft = { ...currentDraft, exercises: next };
    notify();
  },

  removeExercise(index: number) {
    const next = currentDraft.exercises.filter((_, i) => i !== index);
    currentDraft = { ...currentDraft, exercises: next };
    notify();
  },

  reset() {
    currentDraft = {
      date: getTodayIso(),
      session_type: "Üst Vücut",
      notes: "",
      exercises: [],
    };
    notify();
  },

  loadWorkout(workout: WorkoutCreate) {
    currentDraft = {
      date: workout.date,
      session_type: workout.session_type,
      notes: workout.notes ?? "",
      exercises: workout.exercises.map((e) => ({
        ...e,
        sets_data: e.sets_data.map((s) => ({ ...s })),
      })),
    };
    notify();
  },
};
