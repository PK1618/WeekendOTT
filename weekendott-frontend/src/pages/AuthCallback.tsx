import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AuthCallback() {
  const navigate = useNavigate();
  const { setTokenAndUser } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    // Read redirect IMMEDIATELY on mount — before anything else can clear it
    const redirect = localStorage.getItem("wott_redirect") || "/";
    // console.log("[AuthCallback] token present:", !!token);
    // console.log("[AuthCallback] redirect target:", redirect);
    // console.log("[AuthCallback] all localStorage:", JSON.stringify({ ...localStorage }));

    if (!token) {
      navigate("/", { replace: true });
      return;
    }

    setTokenAndUser(token).then(() => {
      // console.log("[AuthCallback] setTokenAndUser done, navigating to:", redirect);
      localStorage.removeItem("wott_redirect");
      navigate(redirect, { replace: true });
    });
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-zinc-400 text-sm">Signing you in...</p>
      </div>
    </div>
  );
}