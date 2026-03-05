import { useState } from "react";

export type Filters = {
  q: string;
  platform: string;
  genre: string;
  language: string;
};

type Props = {
  onFilterChange: (filters: Filters) => void;
};

const PLATFORMS = ["", "Netflix", "Amazon Prime", "Hotstar", "ZEE5", "SonyLIV", "JioCinema", "Apple TV+"];
const GENRES = ["", "Action", "Comedy", "Drama", "Horror", "Romance", "Thriller", "Sci-Fi", "Animation", "Documentary"];
const LANGUAGES = ["English", "Hindi", "Telugu", "Tamil", "Malayalam", "Kannada", "Bengali", "Marathi", "Punjabi"];

export default function FilterBar({ onFilterChange }: Props) {
  const [q, setQ] = useState("");
  const [platform, setPlatform] = useState("");
  const [genre, setGenre] = useState("");
  const [language, setLanguage] = useState("");

  const handleChange = (
    updates: Partial<{ q: string; platform: string; genre: string; language: string }>
  ) => {
    const next = {
      q: updates.q ?? q,
      platform: updates.platform ?? platform,
      genre: updates.genre ?? genre,
      language: updates.language ?? language
    };
    if ("q" in updates) setQ(next.q);
    if ("platform" in updates) setPlatform(next.platform);
    if ("genre" in updates) setGenre(next.genre);
    if ("language" in updates) setLanguage(next.language);
    onFilterChange(next);
  };

  const hasFilters = q || platform || genre || language;

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px] max-w-xs">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">🔍</span>
        <input
          type="text"
          placeholder="Search movies..."
          value={q}
          onChange={(e) => handleChange({ q: e.target.value })}
          className="w-full bg-zinc-900 border border-white/10 rounded-lg pl-8 pr-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400/50 transition-colors"
        />
      </div>

      {/* Platform filter */}
      <select
        value={platform}
        onChange={(e) => handleChange({ platform: e.target.value })}
        className="bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400/50 transition-colors cursor-pointer"
      >
        <option value="">All Platforms</option>
        {PLATFORMS.filter(Boolean).map((p) => (
          <option key={p} value={p}>{p}</option>
        ))}
      </select>

      {/* Genre filter */}
      <select
        value={genre}
        onChange={(e) => handleChange({ genre: e.target.value })}
        className="bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400/50 transition-colors cursor-pointer"
      >
        <option value="">All Genres</option>
        {GENRES.filter(Boolean).map((g) => (
          <option key={g} value={g}>{g}</option>
        ))}
      </select>

      {/* Language filter */}
      <select
        value={language}
        onChange={(e) => handleChange({ language: e.target.value })}
        className="bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400/50 transition-colors cursor-pointer"
      >
        <option value="">All Languages</option>
        {LANGUAGES.filter(Boolean).map((l) => (
          <option key={l} value={l}>{l}</option>
        ))}
      </select>

      {/* Clear */}
      {hasFilters && (
        <button
          onClick={() => handleChange({ q: "", platform: "", genre: "", language: "" })}
          className="text-xs text-zinc-500 hover:text-amber-400 transition-colors px-2 py-1"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
