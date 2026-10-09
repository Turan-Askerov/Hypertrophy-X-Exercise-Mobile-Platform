import assert from "node:assert/strict";
import { parseResponseBody } from "../src/api/parse-body.ts";
import { buildUrl } from "../src/api/url.ts";

const base = "http://192.168.1.89:8000";

assert.equal(buildUrl(base, "/api/health"), "http://192.168.1.89:8000/api/health");
assert.equal(buildUrl(base, "api/health"), "http://192.168.1.89:8000/api/health");
assert.equal(buildUrl(base, "/api/workouts", { page: 2, done: true }), "http://192.168.1.89:8000/api/workouts?page=2&done=true");
assert.equal(buildUrl(base, "/api/workouts", { a: "1", b: undefined, c: false }), "http://192.168.1.89:8000/api/workouts?a=1&c=false");
assert.equal(buildUrl(base, "/api/workouts", { b: undefined }), "http://192.168.1.89:8000/api/workouts");
assert.equal(buildUrl(base, "/api/workouts", {}), "http://192.168.1.89:8000/api/workouts");
assert.equal(buildUrl(base, "/api/exercises", { q: "kol antrenmanı" }), "http://192.168.1.89:8000/api/exercises?q=kol+antrenman%C4%B1");
assert.equal(buildUrl(base, "/api/x", { n: 0 }), "http://192.168.1.89:8000/api/x?n=0");

assert.equal(parseResponseBody(""), null);
assert.equal(parseResponseBody("   "), null);
assert.deepEqual(parseResponseBody('{"a":1}'), { a: 1 });
assert.deepEqual(parseResponseBody("[1,2]"), [1, 2]);
assert.equal(parseResponseBody("null"), null);
assert.equal(parseResponseBody('"x"'), "x");
assert.equal(parseResponseBody("<html>Not Found</html>"), "<html>Not Found</html>");
assert.equal(parseResponseBody("{bozuk"), "{bozuk");

console.log("url ve parse-body testleri geçti ✅");