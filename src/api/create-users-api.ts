import type { User } from "../types/user";
import type { ApiCaller } from "./create-auth-api.ts";

export function createUsersApi(client: ApiCaller) {
  function getMe() {
    // GET /api/user → User
    // auth: false VERME. Bu istek token'la gitmeli.
    return client.call<User>("/api/user", { method: "GET", auth: true });
  }

  return { getMe };
}