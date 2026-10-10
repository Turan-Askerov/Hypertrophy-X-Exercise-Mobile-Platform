import { api } from "./client";
import { createUsersApi } from "./create-users-api";

export const usersApi = createUsersApi(api);