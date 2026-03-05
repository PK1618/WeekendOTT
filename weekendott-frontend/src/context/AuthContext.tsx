import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { api } from "../api";

type AuthUser = {
  id: string;
  email: string;
  name: string;
  picture: string;
  role: string;
  isAdmin: boolean;
};

type AuthContextType = {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: () => void;        // redirects to Google
  logout: () => void;
  setTokenAndUser: (token: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // On mount — check if we have a token in sessionStorage (tab survives refresh)
  useEffect(() => {
    const saved = sessionStorage.getItem("wott_token");
    if (saved) {
      verifyToken(saved);
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async (t: string) => {
    // Save to sessionStorage FIRST so the api interceptor picks it up automatically
    sessionStorage.setItem("wott_token", t);
    try {
      const res = await api.get("/auth/me");
      setToken(t);
      setUser(res.data);
    } catch {
      // Token invalid or expired — clear it
      sessionStorage.removeItem("wott_token");
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Called by AuthCallback page after Google redirect
  const setTokenAndUser = useCallback(async (t: string) => {
    await verifyToken(t);
  }, []);

  // Redirect to Google login via Spring's OAuth2 endpoint
  const login = () => {
    // localStorage survives full page navigation (Google OAuth does a full redirect)
    // sessionStorage would be cleared during the Google → backend → frontend redirect chain
    const returnTo = window.location.pathname + window.location.search;
    localStorage.setItem("wott_redirect", returnTo);
    window.location.href = "http://localhost:8080/oauth2/authorization/google";
  };

  const logout = () => {
    sessionStorage.removeItem("wott_token");
    localStorage.removeItem("wott_redirect");
    localStorage.removeItem("wott_pending_action");
    setToken(null);
    setUser(null);
    // Reload so all component state (selected stars, comment form) resets cleanly
    window.location.reload();
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, setTokenAndUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}