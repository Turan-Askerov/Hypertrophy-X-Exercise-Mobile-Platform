import assert from "node:assert/strict";
import { formatPercent, formatWeight, toNumber } from "../src/lib/number.ts";
import { formatTrDate, rirSummaryFromSets, rirToRpe } from "../src/lib/rpe.ts";

// toNumber
assert.equal(toNumber(null, 5), 5);
assert.equal(toNumber("", 5), 5);
assert.equal(toNumber(undefined, 5), 5);
assert.equal(toNumber("3.5", 5), 3.5);
assert.equal(toNumber("abc", 5), 5);
assert.equal(toNumber(0, 5), 0); // gerçek sıfır korunmalı!

// formatWeight & formatPercent
assert.equal(formatWeight(80), "80");
assert.equal(formatWeight(80.5), "80.5");
assert.equal(formatWeight(0), "0");
assert.equal(formatPercent(87.333), "87.3");

// formatTrDate
assert.equal(formatTrDate("2026-10-04"), "04.10.2026");
assert.equal(formatTrDate("2026-10-04T18:30:00"), "04.10.2026");
assert.equal(formatTrDate("  2026-10-04  "), "04.10.2026");
assert.equal(formatTrDate(""), "—");
assert.equal(formatTrDate(null), "—");
assert.equal(formatTrDate("bozuk"), "bozuk");
assert.equal(formatTrDate("2026--04"), "2026--04");

// rirToRpe
assert.equal(rirToRpe(0), 10);
assert.equal(rirToRpe(1), 9);
assert.equal(rirToRpe(3), 7);
assert.equal(rirToRpe(5), 5);
assert.equal(rirToRpe(-1), 10); // sınır: negatifler 0 kabul edilip RPE 10
assert.equal(rirToRpe(6), 5); // sınır: 5'ten büyükler 5 kabul edilip RPE 5

// rirSummaryFromSets
assert.equal(rirSummaryFromSets([]), null);
assert.equal(rirSummaryFromSets([{ rir: null }, { rir: undefined }]), null);

const summary = rirSummaryFromSets([
  { rir: 2 },
  { rir: 0 },
  { rir: 1 },
]);
assert.ok(summary);
assert.equal(summary.setCount, 3);
assert.equal(summary.lowestRir, 0);
assert.equal(summary.highestRpe, 10);
assert.equal(summary.averageRir, 1);
assert.equal(summary.averageRpe, 9);

const partialSummary = rirSummaryFromSets([
  { rir: 3 },
  { rir: null },
  { rir: 1 },
]);
assert.ok(partialSummary);
assert.equal(partialSummary.setCount, 2);
assert.equal(partialSummary.lowestRir, 1);
assert.equal(partialSummary.highestRpe, 9);
assert.equal(partialSummary.averageRir, 2);
assert.equal(partialSummary.averageRpe, 8);

console.log("RPE testleri geçti ✅");
