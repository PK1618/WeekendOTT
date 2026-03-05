import { useEffect, useState, useCallback } from "react";
import { fetchHome, fetchMovies } from "../api";
import type { MovieCard, HomeResponse } from "../types";
import MovieGrid from "../components/MovieGrid";
import FilterBar, { type Filters } from "../components/FilterBar";

export default function Home() {
  const [homeData, setHomeData] = useState<HomeResponse | null>(null);
  const [homeLoading, setHomeLoading] = useState(true);

  // Filtered/search state
  const [filtered, setFiltered] = useState<MovieCard[] | null>(null);
  const [filterLoading, setFilterLoading] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Filters>({
    q: "",
    platform: "",
    genre: "",
    language: ""
  });
  const isFiltering = activeFilters.q || activeFilters.platform || activeFilters.genre || activeFilters.language;

  useEffect(() => {
    fetchHome()
      .then(setHomeData)
      .finally(() => setHomeLoading(false));
  }, []);

  const handleFilterChange = useCallback(async (filters: Filters) => {
    setActiveFilters(filters);
    const hasFilter = filters.q || filters.platform || filters.genre || filters.language;

    if (!hasFilter) {
      setFiltered(null);
      return;
    }

    setFilterLoading(true);
    try {
      const results = await fetchMovies({
        q: filters.q || undefined,
        platform: filters.platform || undefined,
        genre: filters.genre || undefined,
        language: filters.language || undefined,
        limit: 50,
      });
      setFiltered(results);
    } finally {
      setFilterLoading(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Hero */}
      <div className="relative overflow-hidden pt-24 pb-12 px-6">
        {/* Ambient glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-amber-500/8 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto relative">
          <div className="mb-2">
            <span className="text-xs font-medium text-amber-400 uppercase tracking-widest">
              Discover · Stream · Watch
            </span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white leading-tight">
            What to watch this<br />
            <span className="text-amber-400">weekend?</span>
          </h1>
          <p className="mt-3 text-zinc-400 text-base max-w-lg">
            Genuine ratings from real viewers. No paid promotions. Just honest picks across every OTT platform.
          </p>

          {/* Filter bar */}
          <div className="mt-8">
            <FilterBar onFilterChange={handleFilterChange} />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 pb-16">

        {/* Filtered results */}
        {isFiltering ? (
          <section>
            <div className="flex items-center gap-3 mb-5">
              <h2 className="font-display text-xl font-semibold text-white">
                Search Results
              </h2>
              {filtered && !filterLoading && (
                <span className="text-xs text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded-full">
                  {filtered.length} found
                </span>
              )}
            </div>
            <MovieGrid movies={filtered ?? []} loading={filterLoading} />
          </section>
        ) : (
          <>
            {/* Recent Releases */}
            <section className="mb-12">
              <div className="flex items-center gap-3 mb-5">
                <span className="w-1 h-5 bg-amber-400 rounded-full" />
                <h2 className="font-display text-xl font-semibold text-white">
                  Recent Releases
                </h2>
              </div>
              <MovieGrid
                movies={homeData?.recentReleases ?? []}
                loading={homeLoading}
              />
            </section>

            {/* Top Rated */}
            <section>
              <div className="flex items-center gap-3 mb-5">
                <span className="w-1 h-5 bg-orange-500 rounded-full" />
                <h2 className="font-display text-xl font-semibold text-white">
                  Top Rated
                </h2>
              </div>
              <MovieGrid
                movies={homeData?.topRated ?? []}
                loading={homeLoading}
              />
            </section>
          </>
        )}
      </div>
    </div>
  );
}
