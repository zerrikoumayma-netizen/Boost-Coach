import { createContext, useContext, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { clearSession, getStoredSession, storeSession } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const queryClient = useQueryClient();
  const [session, setSession] = useState(() => getStoredSession());

  function signIn(nextSession) {
    storeSession(nextSession);
    setSession(nextSession);
  }

  function signOut() {
    clearSession();
    setSession(null);
    queryClient.clear();
  }

  function refreshSession(patch) {
    setSession((current) => {
      if (!current) return current;
      const updated = { ...current, ...patch };
      storeSession(updated);
      return updated;
    });
  }

  const value = useMemo(() => {
    const roles = session?.roles || [];
    return {
      session,
      isAuthenticated: Boolean(session?.token),
      isAdmin: roles.includes("ROLE_ADMIN"),
      signIn,
      signOut,
      refreshSession,
    };
  }, [session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
