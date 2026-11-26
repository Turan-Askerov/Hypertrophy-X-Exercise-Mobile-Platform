import { getNextAvailableSupersetLetter } from "../constants/superset.ts";
import type { Exercise } from "../types/exercise.ts";
import type { ExerciseEntry, WorkoutCreate } from "../types/workout.ts";

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
  session_type: "",
  notes: "",
  exercises: [],
};

let currentDraft: WorkoutCreate = { ...initialDraft, exercises: [] };
const listeners = new Set<Listener>();

function notify() {
  for (const l of listeners) l();
}

let setIdCounter = 0;
export function generateSetId(): string {
  return `set_${Date.now()}_${++setIdCounter}_${Math.random().toString(36).slice(2, 7)}`;
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

  setGym(gym_id?: string | null, gym_name?: string | null) {
    currentDraft = { ...currentDraft, gym_id, gym_name };
    notify();
  },

  setNotes(notes: string) {
    currentDraft = { ...currentDraft, notes };
    notify();
  },

  addExercise(exercise: Exercise) {
    workoutDraft.addExercises([exercise]);
  },

  addExercises(exercises: Exercise[]) {
    if (!exercises || exercises.length === 0) return;

    // Filter out duplicates that already exist in the workout
    const uniqueExercises = exercises.filter(
      (exercise) =>
        !currentDraft.exercises.some(
          (e) =>
            e.exercise_id === exercise.id ||
            e.canonical_exercise_id === exercise.id ||
            (exercise.canonical_exercise_id &&
              (e.exercise_id === exercise.canonical_exercise_id ||
                e.canonical_exercise_id === exercise.canonical_exercise_id))
        )
    );

    if (uniqueExercises.length === 0) return;

    const newEntries: ExerciseEntry[] = uniqueExercises.map((exercise) => ({
      exercise_id: exercise.id,
      exercise_name: exercise.name,
      muscle_group: exercise.muscle || exercise.muscle_group,
      is_bodyweight: exercise.is_bodyweight || exercise.bw,
      canonical_exercise_id: exercise.canonical_exercise_id || exercise.id,
      exercise_meta_version: 2,
      sets_data: [
        { reps: 0, weight_kg: 0, rir: null, _id: generateSetId() },
        { reps: 0, weight_kg: 0, rir: null, _id: generateSetId() },
        { reps: 0, weight_kg: 0, rir: null, _id: generateSetId() },
      ],
    }));

    currentDraft = {
      ...currentDraft,
      exercises: [...currentDraft.exercises, ...newEntries],
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

  replaceExercise(index: number, newExercise: Exercise) {
    if (index < 0 || index >= currentDraft.exercises.length) return;
    const replacement: ExerciseEntry = {
      exercise_id: newExercise.id,
      exercise_name: newExercise.name,
      muscle_group: newExercise.muscle || newExercise.muscle_group,
      is_bodyweight: newExercise.is_bodyweight || newExercise.bw,
      canonical_exercise_id: newExercise.canonical_exercise_id || newExercise.id,
      exercise_meta_version: 2,
      sets_data: currentDraft.exercises[index]?.sets_data?.length
        ? currentDraft.exercises[index].sets_data.map((s) => ({
            ...s,
            _id: s._id || generateSetId(),
          }))
        : [
            { reps: 0, weight_kg: 0, rir: null, _id: generateSetId() },
            { reps: 0, weight_kg: 0, rir: null, _id: generateSetId() },
            { reps: 0, weight_kg: 0, rir: null, _id: generateSetId() },
          ],
      superset_id: null,
    };
    const next = [...currentDraft.exercises];
    next[index] = replacement;
    currentDraft = { ...currentDraft, exercises: next };
    notify();
  },

  linkSuperset(indexA: number, indexB: number) {
    if (
      indexA < 0 ||
      indexA >= currentDraft.exercises.length ||
      indexB < 0 ||
      indexB >= currentDraft.exercises.length ||
      indexA === indexB
    ) {
      return;
    }

    const exA = currentDraft.exercises[indexA];
    const exB = currentDraft.exercises[indexB];

    // Akıllı Grup Tayini:
    // 1. Eğer exB zaten bir gruptaysa, exA o gruba katılır (Tri-set / 3'lü süperset).
    // 2. Eğer exA zaten bir gruptaysa, exB o gruba katılır.
    // 3. İkisi de henüz grupta değilse, sıradaki boş harf tahsis edilir (Grup A, Grup B...).
    let supersetId: string;
    if (exB.superset_id) {
      supersetId = exB.superset_id;
    } else if (exA.superset_id) {
      supersetId = exA.superset_id;
    } else {
      supersetId = getNextAvailableSupersetLetter(currentDraft.exercises);
    }

    const next = [...currentDraft.exercises];
    next[indexA] = { ...exA, superset_id: supersetId };
    next[indexB] = { ...exB, superset_id: supersetId };
    currentDraft = { ...currentDraft, exercises: next };
    notify();
  },

  unlinkSuperset(index: number) {
    if (index < 0 || index >= currentDraft.exercises.length) return;
    const target = currentDraft.exercises[index];
    const oldSupersetId = target.superset_id;
    if (!oldSupersetId) return;

    let next = [...currentDraft.exercises];
    next[index] = { ...target, superset_id: null };

    // Başka sadece 1 hareket kaldıysa onun da süperset bağını temizle
    const remainingWithId = next.filter((e) => e.superset_id === oldSupersetId);
    if (remainingWithId.length <= 1) {
      next = next.map((e) =>
        e.superset_id === oldSupersetId ? { ...e, superset_id: null } : e
      );
    }

    currentDraft = { ...currentDraft, exercises: next };
    notify();
  },

  reorderExercises(newExercises: ExerciseEntry[]) {
    currentDraft = { ...currentDraft, exercises: newExercises };
    notify();
  },

  moveExercise(fromIndex: number, toIndex: number) {
    if (
      fromIndex < 0 ||
      fromIndex >= currentDraft.exercises.length ||
      toIndex < 0 ||
      toIndex >= currentDraft.exercises.length
    ) {
      return;
    }
    const next = [...currentDraft.exercises];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    currentDraft = { ...currentDraft, exercises: next };
    notify();
  },

  moveExerciseUp(index: number) {
    if (index > 0) {
      workoutDraft.moveExercise(index, index - 1);
    }
  },

  moveExerciseDown(index: number) {
    if (index < currentDraft.exercises.length - 1) {
      workoutDraft.moveExercise(index, index + 1);
    }
  },

  clearExercises() {
    currentDraft = {
      ...currentDraft,
      exercises: [],
    };
    notify();
  },

  reset() {
    currentDraft = {
      date: getTodayIso(),
      session_type: "",
      notes: "",
      exercises: [],
      gym_id: null,
      gym_name: null,
    };
    notify();
  },

  loadWorkout(workout: WorkoutCreate) {
    currentDraft = {
      date: workout.date,
      session_type: workout.session_type,
      notes: workout.notes ?? "",
      gym_id: workout.gym_id ?? null,
      gym_name: workout.gym_name ?? null,
      exercises: workout.exercises.map((e) => ({
        ...e,
        sets_data: e.sets_data.map((s) => ({
          ...s,
          _id: s._id || generateSetId(),
        })),
      })),
    };
    notify();
  },
};
