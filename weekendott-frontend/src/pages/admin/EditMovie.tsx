import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { adminGetMovie, adminUpdateMovie, adminUploadPoster } from "../../api/admin";
import type { AdminMovieRequest, AdminMovieResponse } from "../../types/admin";
import MovieForm from "../../components/admin/MovieForm";

export default function EditMovie() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [movie, setMovie] = useState<AdminMovieResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    adminGetMovie(id)
      .then(setMovie)
      .catch(() => setError("Movie not found"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (req: AdminMovieRequest) => {
    if (!id) return;
    setError(null);
    try {
      await adminUpdateMovie(id, req);

      // Upload poster if a new file was selected
      const fileInput = document.querySelector<HTMLInputElement>("input[type='file'][accept]");
      const file = fileInput?.files?.[0] ?? null;
      if (file) {
        await adminUploadPoster(id, file);
      }

      setSuccessMsg("Movie updated successfully!");
      setTimeout(() => navigate("/admin/movies"), 1200);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update movie";
      setError(message);
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-3xl">
        <div className="space-y-4 animate-pulse">
          <div className="h-8 bg-zinc-900 rounded w-1/3" />
          <div className="h-64 bg-zinc-900 rounded-xl" />
          <div className="h-32 bg-zinc-900 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error && !movie) {
    return (
      <div className="p-8">
        <p className="text-red-400">{error}</p>
        <button onClick={() => navigate("/admin/movies")} className="mt-4 text-zinc-500 hover:text-amber-400 text-sm transition-colors">
          ← Back
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate("/admin/movies")}
          className="text-zinc-500 hover:text-amber-400 text-sm transition-colors mb-4 flex items-center gap-1.5 group"
        >
          <span className="group-hover:-translate-x-0.5 transition-transform">←</span>
          Back to Movies
        </button>
        <h1 className="font-display text-3xl text-white">Edit Movie</h1>
        <p className="text-zinc-500 text-sm mt-1 line-clamp-1">{movie?.title}</p>
      </div>

      {successMsg && (
        <div className="mb-6 px-4 py-3 bg-emerald-900/40 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm flex items-center gap-2">
          <span>✓</span> {successMsg}
        </div>
      )}

      {error && (
        <div className="mb-6 px-4 py-3 bg-red-900/40 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-2">
          <span>✕</span> {error}
        </div>
      )}

      {movie && (
        <MovieForm
          initial={movie}
          onSubmit={handleSubmit}
          submitLabel="Save Changes"
        />
      )}
    </div>
  );
}