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
  loading: boolean;
  login: () => void;        // redirects to Google
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

// On mount — verify session via HttpOnly cookie
  useEffect(() => {
    api.get("/auth/me")
        .then(res => setUser(res.data))
        .catch(() => setUser(null))
        .finally(() => setLoading(false));
  }, []);

  // Redirect to Google login via Spring's OAuth2 endpoint
  const login = () => {
    // Save current path to redirect back after login
    const returnTo = window.location.pathname + window.location.search;
    localStorage.setItem("wott_redirect", returnTo);
    window.location.href = `${import.meta.env.VITE_API_BASE_URL}/oauth2/authorization/google`;
  };

const logout = async () => {
  try {
    await api.post("/auth/logout");
  } catch {
    // ignore
  }
  setUser(null);
  localStorage.removeItem("wott_redirect");
  localStorage.removeItem("wott_pending_action");
  window.location.href = "/";  // ← full navigation, not reload
};

  return (
      <AuthContext.Provider value={{ user, loading, login, logout }}>
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