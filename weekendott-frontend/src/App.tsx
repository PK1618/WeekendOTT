import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import MovieDetails from "./pages/MovieDetails";
import AuthCallback from "./pages/AuthCallback";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminMovieList from "./pages/admin/AdminMovieList";
import AddMovie from "./pages/admin/AddMovie";
import EditMovie from "./pages/admin/EditMovie";

// ── Not found / no access page ─────────────────────────────────────────────
function NotAllowedPage({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center gap-6 px-4">
      {/* Broken robot SVG */}
      <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Body */}
        <rect x="30" y="50" width="60" height="45" rx="6" fill="#27272a" stroke="#3f3f46" strokeWidth="2" />
        {/* Head */}
        <rect x="35" y="20" width="50" height="35" rx="6" fill="#27272a" stroke="#3f3f46" strokeWidth="2" />
        {/* Antenna — bent/broken */}
        <line x1="60" y1="20" x2="60" y2="10" stroke="#3f3f46" strokeWidth="2" strokeLinecap="round" />
        <line x1="60" y1="10" x2="70" y2="4" stroke="#3f3f46" strokeWidth="2" strokeLinecap="round" />
        <circle cx="70" cy="4" r="2.5" fill="#ef4444" />
        {/* Left eye — X */}
        <line x1="46" y1="31" x2="52" y2="37" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="52" y1="31" x2="46" y2="37" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
        {/* Right eye — normal */}
        <rect x="62" y="31" width="12" height="8" rx="2" fill="#f59e0b" />
        {/* Mouth — frown */}
        <path d="M46 47 Q60 42 74 47" stroke="#52525b" strokeWidth="2" strokeLinecap="round" fill="none" />
        {/* Arms */}
        <rect x="10" y="55" width="20" height="8" rx="4" fill="#27272a" stroke="#3f3f46" strokeWidth="2" />
        <rect x="90" y="55" width="20" height="8" rx="4" fill="#27272a" stroke="#3f3f46" strokeWidth="2" />
        {/* Legs */}
        <rect x="40" y="95" width="14" height="18" rx="4" fill="#27272a" stroke="#3f3f46" strokeWidth="2" />
        <rect x="66" y="95" width="14" height="18" rx="4" fill="#27272a" stroke="#3f3f46" strokeWidth="2" />
        {/* Chest panel */}
        <rect x="45" y="62" width="30" height="20" rx="3" fill="#18181b" stroke="#3f3f46" strokeWidth="1.5" />
        <circle cx="54" cy="72" r="4" fill="#ef4444" opacity="0.6" />
        <circle cx="66" cy="72" r="4" fill="#3f3f46" />
        {/* Crack line on body */}
        <path d="M60 50 L55 65 L62 70 L58 95" stroke="#3f3f46" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 2" />
      </svg>

      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-white font-display">Oops, nothing here</h1>
        <p className="text-zinc-500 text-sm max-w-xs">{message}</p>
      </div>

      <Link
        to="/"
        className="px-5 py-2.5 bg-amber-400 text-black text-sm font-semibold rounded-xl hover:bg-amber-300 transition-all"
      >
        Back to home
      </Link>
    </div>
  );
}

// ── Admin route guard ───────────────────────────────────────────────────────
function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || !user.isAdmin) {
    return (
      <NotAllowedPage message="The requested URL was not found on this server. That’s all we know." />
    );
  }

  return <>{children}</>;
}

// ── App routes ──────────────────────────────────────────────────────────────
function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <div className="min-h-screen bg-zinc-950 text-white">
            <Navbar />
            <Home />
          </div>
        }
      />
      <Route
        path="/movies/:movieId"
        element={
          <div className="min-h-screen bg-zinc-950 text-white">
            <Navbar />
            <MovieDetails />
          </div>
        }
      />

      <Route path="/auth/callback" element={<AuthCallback />} />

      <Route
        path="/admin"
        element={
          <AdminGuard>
            <AdminLayout />
          </AdminGuard>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="movies" element={<AdminMovieList />} />
        <Route path="movies/new" element={<AddMovie />} />
        <Route path="movies/:id/edit" element={<EditMovie />} />
      </Route>

      {/* Any unknown route → broken robot */}
      <Route
        path="*"
        element={<NotAllowedPage message="This page doesn't exist or may have been moved." />}
      />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;