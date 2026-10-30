"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { googleIdToken } from "@/lib/firebase";
export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role?: string;
  about?: string;
  skills?: string[];
  nextChapter?: string;
  openToWork?: boolean;
  location?: string;
};
type AuthState = {
  user: AuthUser | null;
  loading: boolean;
  sessionError: string;
  refreshSession: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  loginGoogle: () => Promise<void>;
  linkGoogle: () => Promise<void>;
  logout: () => Promise<void>;
};
const Context = createContext<AuthState | null>(null);
async function authRequest(action: string, body?: unknown) {
  const response = await fetch(`/api/auth/${action}`, {
    method: action === "session" ? "GET" : "POST",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  const data = response.status === 204 ? null : await response.json();
  if (!response.ok)
    throw Object.assign(
      new Error(data?.error?.message ?? "Unable to sign in. Please try again."),
      { status: response.status },
    );
  return data;
}
export function AuthProvider({ children }: { children: ReactNode }) {
  const epoch = useRef(0);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionError, setSessionError] = useState("");
  const refreshSession = useCallback(async () => {
    const generation = epoch.current;
    setLoading(true);
    setSessionError("");
    try {
      const current = await authRequest("session");
      if (generation === epoch.current) setUser(current);
    } catch (error) {
      if (generation !== epoch.current) return;
      if ((error as { status?: number }).status === 401) setUser(null);
      else
        setSessionError("We couldn’t restore your session. Please try again.");
    } finally {
      if (generation === epoch.current) setLoading(false);
    }
  }, []);
  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);
  useEffect(() => {
    const update = () => {
      if (document.visibilityState === "visible") void refreshSession();
    };
    document.addEventListener("visibilitychange", update);
    window.addEventListener("auth:expired", update);
    return () => {
      document.removeEventListener("visibilitychange", update);
      window.removeEventListener("auth:expired", update);
    };
  }, [refreshSession]);
  async function complete(action: string, body: unknown) {
    epoch.current++;
    setLoading(false);
    const result = await authRequest(action, body);
    setUser(result.user);
    setSessionError("");
  }
  return (
    <Context.Provider
      value={{
        user,
        loading,
        sessionError,
        refreshSession,
        login: (email, password) => complete("login", { email, password }),
        register: (name, email, password) =>
          complete("register", { name, email, password }),
        loginGoogle: async () =>
          complete("google", { idToken: await googleIdToken() }),
        linkGoogle: async () => {
          await authRequest("link-google", { idToken: await googleIdToken() });
        },
        logout: async () => {
          epoch.current++;
          await authRequest("logout");
          setLoading(false);
          setUser(null);
          setSessionError("");
        },
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useAuth() {
  const context = useContext(Context);
  if (!context) throw new Error("AuthProvider missing");
  return context;
}
export function userInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}
