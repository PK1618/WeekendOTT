import type { MovieCard as MovieCardType } from "../types";
import MovieCard from "./MovieCard";

type Props = {
  movies: MovieCardType[];
  loading?: boolean;
};

function SkeletonCard() {
  return (
    <div className="rounded-xl overflow-hidden bg-zinc-900 border border-white/5 animate-pulse">
      <div className="aspect-[2/3] bg-zinc-800" />
      <div className="p-3 space-y-2">
        <div className="h-3 bg-zinc-800 rounded w-3/4" />
        <div className="h-2 bg-zinc-800 rounded w-1/2" />
        <div className="h-4 bg-zinc-800 rounded w-1/3" />
      </div>
    </div>
  );
}

export default function MovieGrid({ movies, loading }: Props) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (movies.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-4xl mb-3">🎬</p>
        <p className="text-zinc-500 text-sm">No movies found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {movies.map((m, i) => (
        <MovieCard key={m.id} movie={m} index={i} />
      ))}
    </div>
  );
}
