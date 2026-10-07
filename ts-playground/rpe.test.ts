import assert from "node:assert/strict";
import { toNumber,formatTrDate } from "./rpe.ts";

assert.equal(toNumber(null, 5), 5);
assert.equal(toNumber("", 5), 5);
assert.equal(toNumber(undefined, 5), 5);
assert.equal(toNumber("3.5", 5), 3.5);
assert.equal(toNumber("abc", 5), 5);
assert.equal(toNumber(0, 5), 0);       // gerçek sıfır korunmalı!

assert.equal(formatTrDate("2026-10-04"), "04.10.2026");
assert.equal(formatTrDate("2026-10-04T18:30:00"), "04.10.2026");
assert.equal(formatTrDate("  2026-10-04  "), "04.10.2026");
assert.equal(formatTrDate(""), "—");
assert.equal(formatTrDate(null), "—");
assert.equal(formatTrDate("bozuk"), "bozuk");
assert.equal(formatTrDate("2026--04"), "2026--04");

console.log("Tüm testler geçti ✅");