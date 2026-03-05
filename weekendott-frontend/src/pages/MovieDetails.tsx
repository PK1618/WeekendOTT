import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchMovieDetails } from "../api";
import type { MovieDetails } from "../types";
import RatingBox from "../components/RatingBox";
import CommentsPanel from "../components/CommentsPanel";
import PlatformBadge from "../components/PlatformBadge";

export default function MovieDetails() {
  const { movieId } = useParams<{ movieId: string }>();
  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!movieId) return;
    setLoading(true);
    setError(false);
    fetchMovieDetails(movieId)
      .then(setMovie)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [movieId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 pt-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-[280px_1fr] gap-8 animate-pulse">
            <div className="aspect-[2/3] bg-zinc-900 rounded-xl" />
            <div className="space-y-4 pt-4">
              <div className="h-8 bg-zinc-900 rounded w-3/4" />
              <div className="h-4 bg-zinc-900 rounded w-1/4" />
              <div className="h-20 bg-zinc-900 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-zinc-950 pt-24 flex items-center justify-center">
        <div className="text-center">
          <p className="text-4xl mb-4">🎬</p>
          <p className="text-zinc-400 mb-4">Movie not found.</p>
          <Link to="/" className="text-amber-400 hover:underline text-sm">
            ← Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Blurred poster background */}
      {movie.posterUrl && (
        <div className="absolute inset-0 h-[60vh] overflow-hidden pointer-events-none">
          <img
            src={movie.posterUrl}
            alt=""
            className="w-full h-full object-cover blur-3xl scale-110 opacity-10"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/50 to-zinc-950" />
        </div>
      )}

      <div className="relative max-w-6xl mx-auto px-6 pt-24 pb-20">
        {/* Back link */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-zinc-500 hover:text-amber-400 text-sm mb-8 transition-colors group"
        >
          <span className="transition-transform group-hover:-translate-x-0.5">←</span>
          Back to Discover
        </Link>

        {/* Main content */}
        <div className="grid md:grid-cols-[260px_1fr] gap-10">
          {/* Poster */}
          <div className="flex-shrink-0">
            <div className="aspect-[2/3] rounded-xl overflow-hidden border border-white/10 shadow-2xl shadow-black/60">
              {movie.posterUrl ? (
                <img
                  src={movie.posterUrl}
                  alt={movie.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
                  <span className="text-5xl opacity-20">🎬</span>
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="space-y-5">
            {/* Title */}
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-white leading-tight">
                {movie.title}
              </h1>
              {movie.releaseYear && (
                <p className="text-zinc-500 mt-1">{movie.releaseYear}</p>
              )}
            </div>

            {/* Genres */}
            {movie.genres.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {movie.genres.map((g) => (
                  <span
                    key={g}
                    className="text-xs px-2.5 py-1 rounded-full border border-white/10 text-zinc-400 bg-zinc-900/60"
                  >
                    {g}
                  </span>
                ))}
              </div>
            )}

            {/* Description */}
            {movie.description && (
              <p className="text-zinc-300 text-sm leading-relaxed max-w-prose">
                {movie.description}
              </p>
            )}

            {/* Where to watch — grouped by platform */}
            {movie.availability.length > 0 && (() => {
              // Group entries by platform name
              const grouped = movie.availability.reduce<
                Record<string, { languages: string[]; ottReleaseDate: string }>
              >((acc, a) => {
                if (!acc[a.platform]) {
                  acc[a.platform] = { languages: [], ottReleaseDate: a.ottReleaseDate };
                }
                if (a.language && !acc[a.platform].languages.includes(a.language)) {
                  acc[a.platform].languages.push(a.language);
                }
                return acc;
              }, {});

              return (
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-widest mb-3">
                    Where to Watch
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {Object.entries(grouped).map(([platform, { languages, ottReleaseDate }]) => (
                      <div
                        key={platform}
                        className="bg-zinc-900 border border-white/8 rounded-xl px-4 py-3 flex flex-col gap-2 min-w-[160px]"
                      >
                        {/* Platform name + date */}
                        <div className="flex items-center justify-between gap-4">
                          <PlatformBadge platform={platform} size="md" />
                          {ottReleaseDate && (
                            <span className="text-[11px] text-zinc-600">
                              {new Date(ottReleaseDate).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                          )}
                        </div>
                        {/* Language chips — only if more than one or explicitly set */}
                        {languages.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {languages.map((lang) => (
                              <span
                                key={lang}
                                className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 border border-white/8 text-zinc-400"
                              >
                                {lang}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Rating box */}
            <RatingBox
              movieId={movie.id}
              currentAvg={movie.avgRating}
              currentCount={movie.ratingCount}
            />
          </div>
        </div>

        {/* Comments */}
        <div className="mt-16 border-t border-white/5 pt-10">
          <CommentsPanel movieId={movie.id} />
        </div>
      </div>
    </div>
  );
}