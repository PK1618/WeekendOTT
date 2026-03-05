import { Link } from "react-router-dom";
import type { MovieCard as MovieCardType } from "../types";
import PlatformBadge from "./PlatformBadge";
import StarRating from "./StarRating";

type Props = {
  movie: MovieCardType;
  index?: number;
};

export default function MovieCard({ movie, index = 0 }: Props) {
  return (
    <Link
      to={`/movies/${movie.id}`}
      className="movie-card group block relative rounded-xl overflow-hidden bg-zinc-900 border border-white/5 hover:border-amber-400/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/60"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Poster - fixed height, fills full width */}
      <div style={{ height: "280px", overflow: "hidden", background: "#27272a", position: "relative" }}>
        {movie.posterUrl ? (
          <img
            src={movie.posterUrl}
            alt={movie.title}
            style={{
              display: "block",
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center top",
            }}
            loading="lazy"
          />
        ) : (
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "8px" }}>
            <span style={{ fontSize: "2.5rem", opacity: 0.2 }}>🎬</span>
            <span style={{ fontSize: "0.7rem", color: "#52525b" }}>No poster</span>
          </div>
        )}

        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Rating pill */}
        {movie.avgRating !== null && (
          <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm rounded-md px-1.5 py-0.5 flex items-center gap-1">
            <span className="text-amber-400 text-xs">★</span>
            <span className="text-white text-xs font-semibold">
              {movie.avgRating.toFixed(1)}
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 space-y-2">
        <div>
          <h3 className="font-medium text-white text-sm leading-tight line-clamp-1 group-hover:text-amber-300 transition-colors">
            {movie.title}
          </h3>
          {movie.releaseYear && (
            <p className="text-zinc-500 text-xs mt-0.5">{movie.releaseYear}</p>
          )}
        </div>

        {/* Platform badges — grouped by platform */}
        {movie.availabilityBadges.length > 0 && (() => {
          const grouped = movie.availabilityBadges.reduce<
            Record<string, string[]>
          >((acc, b) => {
            if (!acc[b.platform]) acc[b.platform] = [];
            if (b.language && !acc[b.platform].includes(b.language))
              acc[b.platform].push(b.language);
            return acc;
          }, {});

          const platforms = Object.entries(grouped);
          const visible = platforms.slice(0, 2);
          const overflow = platforms.length - 2;

          return (
            <div className="flex flex-col gap-1">
              {visible.map(([platform, langs]) => (
                <div key={platform} className="flex items-center gap-1.5 flex-wrap">
                  <PlatformBadge platform={platform} size="sm" />
                  {langs.length > 0 && (
                    <span className="text-[10px] text-zinc-500">
                      {langs.slice(0, 3).join(", ")}
                      {langs.length > 3 ? ` +${langs.length - 3}` : ""}
                    </span>
                  )}
                </div>
              ))}
              {overflow > 0 && (
                <span className="text-[10px] text-zinc-500">+{overflow} more platform{overflow > 1 ? "s" : ""}</span>
              )}
            </div>
          );
        })()}

        {/* Star rating */}
        <StarRating rating={movie.avgRating} count={movie.ratingCount} size="sm" />
      </div>
    </Link>
  );
}