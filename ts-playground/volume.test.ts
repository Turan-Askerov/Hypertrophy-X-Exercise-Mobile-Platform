import assert from "node:assert/strict";
import {
  exerciseVolume,
  formatVolume,
  setVolume,
  workoutSetCount,
  workoutVolume,
} from "../src/lib/volume.ts";

// setVolume
assert.equal(setVolume(10, 80, false), 800);
assert.equal(setVolume(10, 0, true), 10); // vücut ağırlığı -> sadece reps
assert.equal(setVolume(10, 20, true), 10); // vücut ağırlığında ağırlık olsa bile reps
assert.equal(setVolume(0, 80, false), 0);
assert.equal(setVolume(-5, 80, false), 0);
assert.equal(setVolume(10, -5, false), 0);

// exerciseVolume
assert.equal(
  exerciseVolume(
    [
      { reps: 10, weight_kg: 80 },
      { reps: 8, weight_kg: 80 },
    ],
    false
  ),
  1440
);

assert.equal(
  exerciseVolume(
    [
      { reps: 12, weight_kg: 0 },
      { reps: 10, weight_kg: 0 },
    ],
    true
  ),
  22
);

// workoutVolume
const sampleWorkoutExercises = [
  {
    is_bodyweight: false,
    sets_data: [
      { reps: 10, weight_kg: 100 },
      { reps: 10, weight_kg: 100 },
    ],
  },
  {
    is_bodyweight: true,
    sets_data: [
      { reps: 15, weight_kg: 0 },
    ],
  },
];
assert.equal(workoutVolume(sampleWorkoutExercises), 2015);

// workoutSetCount
assert.equal(workoutSetCount(sampleWorkoutExercises), 3);
assert.equal(workoutSetCount([]), 0);

// formatVolume
assert.equal(formatVolume(1240), "1.240 kg");
assert.equal(formatVolume(800), "800 kg");
assert.equal(formatVolume(0), "0 kg");
assert.equal(formatVolume(-10), "0 kg");

console.log("Volume testleri geçti ✅");
