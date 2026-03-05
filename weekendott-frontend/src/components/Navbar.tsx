import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, login, logout } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/80 backdrop-blur-md border-b border-white/5">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow shadow-amber-500/20">
            <span className="text-black font-black text-[10px]">W</span>
          </div>
          <span className="font-display text-lg text-white tracking-wide">
            Weekend<span className="text-amber-400">OTT</span>
          </span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {/* Admin link — only visible to admins */}
              {user.isAdmin && (
                <Link
                  to="/admin"
                  className="text-xs text-zinc-400 hover:text-amber-400 transition-colors border border-white/10 hover:border-amber-400/30 px-3 py-1.5 rounded-lg"
                >
                  Admin
                </Link>
              )}

              {/* User menu */}
              <div className="flex items-center gap-2 group relative">
                <div className="flex items-center gap-2 cursor-pointer">
                  {/* Avatar — Google profile photo or initial fallback */}
                  <div className="w-7 h-7 rounded-full overflow-hidden bg-zinc-800 border border-white/10 flex-shrink-0">
                    {user.picture ? (
                      <img
                        src={user.picture}
                        alt={user.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-zinc-400 font-medium">
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <span className="text-zinc-300 text-sm hidden sm:block">
                    {user.name?.split(" ")[0]}
                  </span>
                </div>

                {/* Dropdown on hover */}
                <div className="absolute right-0 top-8 w-44 bg-zinc-900 border border-white/10 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all py-1">
                  <div className="px-3 py-2 border-b border-white/8">
                    <p className="text-white text-xs font-medium truncate">{user.name}</p>
                    <p className="text-zinc-500 text-[10px] truncate">{user.email}</p>
                  </div>
                  <button
                    onClick={logout}
                    className="w-full text-left px-3 py-2 text-xs text-zinc-400 hover:text-red-400 hover:bg-white/5 transition-colors"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            </>
          ) : (
            <button
              onClick={login}
              className="flex items-center gap-2 px-3 py-1.5 bg-white text-zinc-900 text-xs font-semibold rounded-lg hover:bg-zinc-100 transition-all"
            >
              {/* Google G icon */}
              <svg width="12" height="12" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Sign in with Google
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}