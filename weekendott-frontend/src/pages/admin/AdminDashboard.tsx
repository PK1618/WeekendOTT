import { useEffect, useState } from "react";
import { adminListMovies } from "../../api/admin";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const [totalMovies, setTotalMovies] = useState<number | null>(null);
  const [recent, setRecent] = useState<{ id: string; title: string; posterUrl: string | null }[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    adminListMovies(0, 5).then((res) => {
      setTotalMovies(res.totalElements);
      setRecent(res.content.map((m) => ({ id: m.id, title: m.title, posterUrl: m.posterUrl })));
    });
  }, []);

  const stats = [
    { label: "Total Movies", value: totalMovies ?? "—", icon: "🎬", color: "from-amber-500/20 to-amber-500/5", border: "border-amber-500/20" },
    { label: "Platforms", value: "—", icon: "📺", color: "from-blue-500/20 to-blue-500/5", border: "border-blue-500/20" },
    { label: "Comments", value: "—", icon: "💬", color: "from-emerald-500/20 to-emerald-500/5", border: "border-emerald-500/20" },
    { label: "Ratings", value: "—", icon: "⭐", color: "from-orange-500/20 to-orange-500/5", border: "border-orange-500/20" },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl text-white">Dashboard</h1>
        <p className="text-zinc-500 text-sm mt-1">WeekendOTT Admin Panel</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map((s) => (
          <div
            key={s.label}
            className={`bg-gradient-to-br ${s.color} border ${s.border} rounded-xl p-5`}
          >
            <div className="text-2xl mb-2">{s.icon}</div>
            <div className="text-2xl font-bold text-white font-display">{s.value}</div>
            <div className="text-zinc-500 text-xs mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-zinc-900/60 border border-white/8 rounded-xl p-6">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <span>⚡</span> Quick Actions
          </h2>
          <div className="space-y-2">
            <button
              onClick={() => navigate("/admin/movies/new")}
              className="w-full text-left px-4 py-3 rounded-lg bg-amber-400/10 border border-amber-400/20 text-amber-400 text-sm hover:bg-amber-400/20 transition-all flex items-center gap-3"
            >
              <span>➕</span>
              Add New Movie
            </button>
            <button
              onClick={() => navigate("/admin/movies")}
              className="w-full text-left px-4 py-3 rounded-lg bg-white/5 border border-white/8 text-zinc-300 text-sm hover:bg-white/10 transition-all flex items-center gap-3"
            >
              <span>📋</span>
              Manage All Movies
            </button>
          </div>
        </div>

        {/* Recent movies */}
        <div className="bg-zinc-900/60 border border-white/8 rounded-xl p-6">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <span>🕐</span> Recent Movies
          </h2>
          {recent.length === 0 ? (
            <p className="text-zinc-600 text-sm">No movies yet.</p>
          ) : (
            <div className="space-y-2">
              {recent.map((m) => (
                <button
                  key={m.id}
                  onClick={() => navigate(`/admin/movies/${m.id}/edit`)}
                  className="w-full flex items-center gap-3 text-left hover:bg-white/5 rounded-lg p-2 transition-all group"
                >
                  <div className="w-8 h-10 rounded bg-zinc-800 flex-shrink-0 overflow-hidden">
                    {m.posterUrl ? (
                      <img src={m.posterUrl} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-zinc-600">🎬</div>
                    )}
                  </div>
                  <span className="text-zinc-300 text-sm group-hover:text-amber-400 transition-colors line-clamp-1">
                    {m.title}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}