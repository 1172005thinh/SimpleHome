"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

type AuthContextValue = {
  isReady: boolean;
  isAuthenticated: boolean;
  token: string | null;
  username: string | null;
  signIn: (token: string, username: string) => void;
  signOut: () => void;
};

type PersistedAuth = {
  token: string;
  username: string;
};

const STORAGE_KEY = "simplehome_auth";

const AuthContext = createContext<AuthContextValue | null>(null);

function readPersistedAuth(): PersistedAuth | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as PersistedAuth;
    if (parsed.token && parsed.username) {
      return parsed;
    }
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
  }

  return null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = useState<PersistedAuth | null>(readPersistedAuth);

  const signIn = useCallback((newToken: string, newUsername: string) => {
    const payload: PersistedAuth = { token: newToken, username: newUsername };
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    }
    setAuth(payload);
  }, []);

  const signOut = useCallback(() => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    setAuth(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      isReady: true,
      isAuthenticated: Boolean(auth?.token),
      token: auth?.token ?? null,
      username: auth?.username ?? null,
      signIn,
      signOut,
    }),
    [auth, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
