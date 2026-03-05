import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { adminListMovies, adminDeleteMovie, adminUploadPoster } from "../../api/admin";
import type { AdminMovieResponse } from "../../types/admin";
import PlatformBadge from "../../components/PlatformBadge";

export default function AdminMovieList() {
  const navigate = useNavigate();
  const [movies, setMovies] = useState<AdminMovieResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadTargetId = useRef<string | null>(null);

  const load = (p = 0) => {
    setLoading(true);
    adminListMovies(p, 20)
      .then((res) => {
        setMovies(res.content);
        setTotalPages(res.totalPages);
        setTotalElements(res.totalElements);
        setPage(res.number);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(0); }, []);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await adminDeleteMovie(id);
      setMovies((prev) => prev.filter((m) => m.id !== id));
      setTotalElements((t) => t - 1);
      setConfirmDelete(null);
    } finally {
      setDeletingId(null);
    }
  };

  const handlePosterClick = (movieId: string) => {
    uploadTargetId.current = movieId;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const movieId = uploadTargetId.current;
    if (!file || !movieId) return;

    setUploadingId(movieId);
    setUploadSuccess(null);
    try {
      const res = await adminUploadPoster(movieId, file);
      setMovies((prev) =>
        prev.map((m) => (m.id === movieId ? { ...m, posterUrl: res.posterUrl } : m))
      );
      setUploadSuccess(movieId);
      setTimeout(() => setUploadSuccess(null), 3000);
    } finally {
      setUploadingId(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl text-white">Movies</h1>
          <p className="text-zinc-500 text-sm mt-1">{totalElements} total movies</p>
        </div>
        <button
          onClick={() => navigate("/admin/movies/new")}
          className="px-4 py-2 bg-amber-400 text-black text-sm font-semibold rounded-lg hover:bg-amber-300 transition-all flex items-center gap-2"
        >
          <span>➕</span> Add Movie
        </button>
      </div>

      {/* Hidden file input for poster upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Table */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 bg-zinc-900 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : movies.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-4">🎬</p>
          <p className="text-zinc-500">No movies yet.</p>
          <button
            onClick={() => navigate("/admin/movies/new")}
            className="mt-4 px-4 py-2 bg-amber-400 text-black text-sm font-semibold rounded-lg hover:bg-amber-300 transition-all"
          >
            Add your first movie
          </button>
        </div>
      ) : (
        <div className="bg-zinc-900/60 border border-white/8 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/8">
                <th className="text-left px-4 py-3 text-xs text-zinc-500 uppercase tracking-widest font-medium w-12">Poster</th>
                <th className="text-left px-4 py-3 text-xs text-zinc-500 uppercase tracking-widest font-medium">Title</th>
                <th className="text-left px-4 py-3 text-xs text-zinc-500 uppercase tracking-widest font-medium hidden md:table-cell">Year</th>
                <th className="text-left px-4 py-3 text-xs text-zinc-500 uppercase tracking-widest font-medium hidden lg:table-cell">Platforms</th>
                <th className="text-left px-4 py-3 text-xs text-zinc-500 uppercase tracking-widest font-medium hidden lg:table-cell">Genres</th>
                <th className="text-right px-4 py-3 text-xs text-zinc-500 uppercase tracking-widest font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {movies.map((movie, i) => (
                <tr
                  key={movie.id}
                  className={`border-b border-white/5 hover:bg-white/3 transition-colors ${i === movies.length - 1 ? "border-b-0" : ""
                    }`}
                >
                  {/* Poster thumbnail */}
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handlePosterClick(movie.id)}
                      className="relative group w-9 h-12 rounded overflow-hidden bg-zinc-800 block flex-shrink-0"
                      title="Click to upload poster"
                    >
                      {movie.posterUrl ? (
                        <img src={movie.posterUrl} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-600 text-xs">🎬</div>
                      )}
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        {uploadingId === movie.id ? (
                          <span className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <span className="text-white text-[10px]">📤</span>
                        )}
                      </div>
                      {/* Success flash */}
                      {uploadSuccess === movie.id && (
                        <div className="absolute inset-0 bg-emerald-500/60 flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                    </button>
                  </td>

                  {/* Title */}
                  <td className="px-4 py-3">
                    <span className="text-white text-sm font-medium line-clamp-1">{movie.title}</span>
                  </td>

                  {/* Year */}
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-zinc-500 text-sm">{movie.releaseYear ?? "—"}</span>
                  </td>

                  {/* Platforms */}
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {movie.availability.slice(0, 2).map((a, idx) => (
                        <PlatformBadge key={idx} platform={a.platform} size="sm" />
                      ))}
                      {movie.availability.length > 2 && (
                        <span className="text-[10px] text-zinc-600">+{movie.availability.length - 2}</span>
                      )}
                      {movie.availability.length === 0 && (
                        <span className="text-zinc-600 text-xs">None</span>
                      )}
                    </div>
                  </td>

                  {/* Genres */}
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="text-zinc-500 text-xs">
                      {movie.genres.length > 0 ? movie.genres.slice(0, 2).join(", ") : "—"}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => navigate(`/admin/movies/${movie.id}/edit`)}
                        className="px-3 py-1.5 text-xs border border-white/10 rounded-lg text-zinc-300 hover:text-white hover:border-amber-400/40 transition-all"
                      >
                        Edit
                      </button>
                      {confirmDelete === movie.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleDelete(movie.id)}
                            disabled={deletingId === movie.id}
                            className="px-3 py-1.5 text-xs bg-red-500/20 border border-red-500/40 rounded-lg text-red-400 hover:bg-red-500/30 transition-all disabled:opacity-50"
                          >
                            {deletingId === movie.id ? "..." : "Confirm"}
                          </button>
                          <button
                            onClick={() => setConfirmDelete(null)}
                            className="px-2 py-1.5 text-xs text-zinc-600 hover:text-zinc-400 transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDelete(movie.id)}
                          className="px-3 py-1.5 text-xs border border-white/10 rounded-lg text-zinc-500 hover:text-red-400 hover:border-red-400/30 transition-all"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => load(page - 1)}
            disabled={page === 0}
            className="px-3 py-1.5 text-sm border border-white/10 rounded-lg text-zinc-400 hover:text-white disabled:opacity-30 transition-all"
          >
            ← Prev
          </button>
          <span className="text-zinc-600 text-sm">
            Page {page + 1} of {totalPages}
          </span>
          <button
            onClick={() => load(page + 1)}
            disabled={page >= totalPages - 1}
            className="px-3 py-1.5 text-sm border border-white/10 rounded-lg text-zinc-400 hover:text-white disabled:opacity-30 transition-all"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}