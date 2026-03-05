import { NavLink, Outlet, useNavigate } from "react-router-dom";

const NAV = [
  { to: "/admin", label: "Dashboard", icon: "⬛" },
  { to: "/admin/movies", label: "Movies", icon: "🎬" },
  { to: "/admin/movies/new", label: "Add Movie", icon: "➕" },
];

export default function AdminLayout() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex bg-zinc-950">
      {/* Sidebar */}
      <aside
        className="w-56 flex-shrink-0 border-r border-white/8 flex flex-col"
        style={{ background: "linear-gradient(180deg, #111118 0%, #0d0d14 100%)" }}
      >
        {/* Logo */}
        <div className="px-5 py-5 border-b border-white/8">
          <button onClick={() => navigate("/")} className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <span className="text-black font-black text-xs">W</span>
            </div>
            <div>
              <div className="text-white font-semibold text-sm leading-none">
                Weekend<span className="text-amber-400">OTT</span>
              </div>
              <div className="text-zinc-600 text-[10px] mt-0.5 uppercase tracking-widest">Admin</div>
            </div>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/admin"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${isActive
                  ? "bg-amber-400/10 text-amber-400 border border-amber-400/20"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
                }`
              }
            >
              <span className="text-base w-5 text-center">{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-white/8">
          <button
            onClick={() => navigate("/")}
            className="text-xs text-zinc-600 hover:text-amber-400 transition-colors flex items-center gap-1.5"
          >
            ← Back to site
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}