import assert from "node:assert/strict";
import { createNutritionApi } from "../src/api/create-nutrition-api.ts";
import { createProgramApi } from "../src/api/create-program-api.ts";
import { createUsersApi } from "../src/api/create-users-api.ts";
import type { ApiCaller } from "../src/api/create-auth-api.ts";
import type { CustomProgramRequest } from "../src/types/program.ts";
import type { NutritionLogPayload } from "../src/types/nutrition.ts";
import type { User, UserProfile } from "../src/types/user.ts";
import { sampleUser } from "./fixtures.ts";

const calls: Array<{ path: string; method?: string; body?: unknown; auth?: boolean }> = [];

const stubUser: User = {
  ...sampleUser,
  nickname: "Demir Atlet",
  avatar_url: "data:image/jpeg;base64,/9j/4AAQ==",
  target_weight: 76.5,
};

const mockClient = {
  call: async <T>(
    path: string,
    options: { method?: string; body?: unknown; auth?: boolean } = {}
  ): Promise<T> => {
    calls.push({ path, method: options.method, body: options.body, auth: options.auth });
    if (path === "/api/custom-program") {
      return { success: true, message: "ok", program: [] } as T;
    }
    if (path === "/api/nutrition/log") {
      return { success: true, message: "ok" } as T;
    }
    return stubUser as T;
  },
} as unknown as ApiCaller;

async function run() {
  const usersApi = createUsersApi(mockClient);
  const programApi = createProgramApi(mockClient);
  const nutritionApi = createNutritionApi(mockClient);

  // 1. UserProfile username olmadan nickname, avatar_url, target_weight gönderebilir
  const profilePayload: UserProfile = {
    nickname: "Demir Atlet",
    avatar_url: "data:image/jpeg;base64,/9j/4AAQ==",
    target_weight: 76.5,
  };
  const updated = await usersApi.updateProfile(profilePayload);
  assert.equal(updated.nickname, "Demir Atlet");
  assert.equal(updated.target_weight, 76.5);
  assert.equal((calls[0].body as UserProfile).username, undefined);

  // 2. CustomProgramRequest username olmadan çalışır
  const programPayload: CustomProgramRequest = {
    program: [
      [
        { day: "Pazartesi", type: "Push", focus: "Chest", isRest: false },
        { day: "Salı", type: "Pull", focus: "Back", isRest: false },
        { day: "Çarşamba", type: "Legs", focus: "Quads", isRest: false },
        { day: "Perşembe", type: "Rest", focus: "Dinlenme", isRest: true },
        { day: "Cuma", type: "Upper", focus: "Shoulders", isRest: false },
        { day: "Cumartesi", type: "Lower", focus: "Hamstrings", isRest: false },
        { day: "Pazar", type: "Rest", focus: "Dinlenme", isRest: true },
      ],
    ],
  };
  const progRes = await programApi.saveCustomProgram(programPayload);
  assert.equal(progRes.success, true);
  assert.equal((calls[1].body as CustomProgramRequest).username, undefined);

  // 3. NutritionLogPayload username olmadan çalışır
  const nutritionPayload: NutritionLogPayload = {
    log_date: "2026-11-26",
    calories: 2400,
    protein: 180,
    carbs: 250,
    fat: 70,
    notes: "Test",
  };
  const nutriRes = await nutritionApi.saveNutritionLog(nutritionPayload);
  assert.equal(nutriRes.success, true);
  assert.equal((calls[2].body as NutritionLogPayload).username, undefined);

  console.log("profile-contracts testleri geçti ✅");
}

await run();
