import { useNavigate } from "react-router-dom";
import { adminCreateMovie, adminUploadPoster } from "../../api/admin";
import type { AdminMovieRequest } from "../../types/admin";
import MovieForm from "../../components/admin/MovieForm";
import { useState } from "react";

export default function AddMovie() {
  const navigate = useNavigate();
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (req: AdminMovieRequest) => {
    setError(null);
    try {
      const created = await adminCreateMovie(req);

      // If a poster was selected in the form, upload it now that we have the ID
      const fileInput = document.querySelector<HTMLInputElement>("input[type='file']");
      const file = fileInput?.files?.[0] ?? null;
      if (file) {
        await adminUploadPoster(created.id, file);
      }

      setSuccessMsg(`"${created.title}" created successfully!`);
      setTimeout(() => navigate("/admin/movies"), 1200);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create movie";
      setError(message);
    }
  };

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
        <h1 className="font-display text-3xl text-white">Add New Movie</h1>
        <p className="text-zinc-500 text-sm mt-1">Fill in the details and add platform availability</p>
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

      <MovieForm
        onSubmit={handleSubmit}
        submitLabel="Create Movie"
      />
    </div>
  );
}