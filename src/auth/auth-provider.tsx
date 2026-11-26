import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { User } from "@/types/user";
import { authApi } from "@/api/auth";
import { setUnauthorizedHandler } from "@/api/client";
import { usersApi } from "@/api/users";
import { USER_QUERY_KEY } from "@/hooks/use-user";

import { createSessionService, type SessionState } from "./create-session-service";
import { tokenStorage } from "./token-storage";

const service = createSessionService({ tokenStorage, authApi, usersApi });

type AuthContextValue = {
  state: SessionState;
  signIn: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, email?: string) => Promise<void>;
  signOut: () => Promise<void>;
  completeSignIn: (token: string, user: User) => Promise<void>;
  retry: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [state, setState] = useState<SessionState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  // Açılışta (ve "tekrar dene"de) oturumu geri yükle
  useEffect(() => {
    let cancelled = false;
    service.restore().then((next) => {
      if (cancelled) return;
      if (next.status === "signedIn") {
        queryClient.setQueryData(USER_QUERY_KEY, next.user);
      }
      setState(next);
    });
    return () => {
      cancelled = true;
    };
  }, [attempt, queryClient]);

  // Oturum kullanım sırasında biterse (token'lı istek 401 alırsa) çıkış yap
  useEffect(() => {
    setUnauthorizedHandler(() => {
      service.signOut().then((next) => {
        queryClient.clear();
        setState(next);
      });
    });
    return () => setUnauthorizedHandler(() => {});
  }, [queryClient]);

  const applySignedInState = (next: SessionState) => {
    queryClient.clear();
    if (next.status === "signedIn") {
      queryClient.setQueryData(USER_QUERY_KEY, next.user);
    }
    setState(next);
  };

  const value: AuthContextValue = {
    state,
    signIn: async (username, password) => applySignedInState(await service.signIn(username, password)),
    register: async (username, password, email) =>
      applySignedInState(await service.register(username, password, email)),
    completeSignIn: async (token, user) =>
      applySignedInState(await service.completeSignIn(token, user)),
    signOut: async () => {
      const next = await service.signOut();
      queryClient.clear();
      setState(next);
    },
    retry: () => {
      setState({ status: "loading" });
      setAttempt((n) => n + 1);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (ctx === null) throw new Error("useAuth, AuthProvider içinde kullanılmalı.");
  return ctx;
}