import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

import { authApi } from "@/api/auth";
import { setUnauthorizedHandler } from "@/api/client";
import { usersApi } from "@/api/users";
import type { User } from "@/types/user";

import { createSessionService, type SessionState } from "./create-session-service";
import { tokenStorage } from "./token-storage";

const service = createSessionService({ tokenStorage, authApi, usersApi });

type AuthContextValue = {
  state: SessionState;
  signIn: (username: string, password: string) => Promise<void>;
  completeSignIn: (token: string, user: User) => Promise<void>;
  signOut: () => Promise<void>;
  retry: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SessionState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  // Açılışta (ve "tekrar dene"de) oturumu geri yükle
  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });
    service.restore().then((next) => {
      if (!cancelled) setState(next);
    });
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  // Oturum kullanım sırasında biterse (token'lı istek 401 alırsa) çıkış yap
  useEffect(() => {
    setUnauthorizedHandler(() => {
      service.signOut().then(setState);
    });
    return () => setUnauthorizedHandler(() => {});
  }, []);

  const value: AuthContextValue = {
    state,
    signIn: async (username, password) => setState(await service.signIn(username, password)),
    completeSignIn: async (token, user) =>
      setState(await service.completeSignIn(token, user)),
    signOut: async () => setState(await service.signOut()),
    retry: () => setAttempt((n) => n + 1),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (ctx === null) throw new Error("useAuth, AuthProvider içinde kullanılmalı.");
  return ctx;
}