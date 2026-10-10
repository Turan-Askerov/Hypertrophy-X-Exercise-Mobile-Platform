import { ApiError } from "../api/api-error.ts";
import type { User, UserLoginResponse } from "../types/user";

export type SessionState =
  | { status: "loading" }
  | { status: "signedOut" }
  | { status: "signedIn"; user: User }
  | { status: "unreachable"; message: string };

export type SessionDeps = {
  tokenStorage: {
    getToken: () => Promise<string | null>;
    saveToken: (token: string) => Promise<void>;
    clearToken: () => Promise<void>;
  };
  authApi: {
    login: (username: string, password: string) => Promise<UserLoginResponse>;
    register: (username: string, password: string, email?: string) => Promise<unknown>;
  };
  usersApi: {
    getMe: () => Promise<User>;
  };
};

export function createSessionService(deps: SessionDeps) {
  async function restore(): Promise<SessionState> {
    const token = await deps.tokenStorage.getToken();
    if (token === null) return { status: "signedOut" };

    try {
      const user = await deps.usersApi.getMe();
      return { status: "signedIn", user };
    } catch (err) {
      if (err instanceof ApiError && err.info.kind === "unauthorized") {
        await deps.tokenStorage.clearToken();
        return { status: "signedOut" };
      }
      const message =
        err instanceof ApiError ? err.message : "Beklenmeyen bir hata oluştu.";
      return { status: "unreachable", message };
    }
  }

  async function signIn(username: string, password: string): Promise<SessionState> {
    const { token, ...user } = await deps.authApi.login(username, password);
    await deps.tokenStorage.saveToken(token);
    return { status: "signedIn", user };
  }

  async function register(
    username: string,
    password: string,
    email?: string
  ): Promise<SessionState> {
    await deps.authApi.register(username, password, email);
    return signIn(username, password);
  }

  async function signOut(): Promise<SessionState> {
    await deps.tokenStorage.clearToken();
    return { status: "signedOut" };
  }

  return { restore, signIn, register, signOut };
}