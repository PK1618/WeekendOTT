import { useState, useRef } from "react";
import type { AdminMovieRequest, AdminMovieResponse } from "../../types/admin";
import { adminUploadPoster } from "../../api/admin";
import PlatformBadge from "../../components/PlatformBadge";

const PLATFORM_OPTIONS = [
  "Netflix", "Amazon Prime", "Hotstar",
  "ZEE5", "SonyLIV", "JioCinema", "Apple TV+", "HBO",
];

const GENRE_OPTIONS = [
  "Action", "Adventure", "Animation", "Comedy", "Crime",
  "Documentary", "Drama", "Fantasy", "Horror", "Mystery",
  "Romance", "Sci-Fi", "Thriller", "Western",
];

const LANGUAGE_OPTIONS = [
  "English", "Hindi", "Telugu", "Tamil", "Malayalam",
  "Kannada", "Bengali", "Marathi", "Punjabi",
];

type Props = {
  initial?: AdminMovieResponse;
  onSubmit: (req: AdminMovieRequest) => Promise<void>;
  submitLabel: string;
};

// One row = one platform + multiple languages + one OTT date
type AvailabilityRow = {
  platform: string;
  languages: string[];   // ← multi-select
  ottReleaseDate: string;
};

// Collapse incoming availability entries (one per language) into rows
// e.g. Netflix/English + Netflix/Hindi → one row with languages: ["English","Hindi"]
function groupAvailability(
  entries: AdminMovieResponse["availability"]
): AvailabilityRow[] {
  const map = new Map<string, AvailabilityRow>();
  for (const e of entries) {
    const key = `${e.platform}__${e.ottReleaseDate}`;
    if (map.has(key)) {
      map.get(key)!.languages.push(e.language);
    } else {
      map.set(key, {
        platform: e.platform,
        languages: [e.language],
        ottReleaseDate: e.ottReleaseDate,
      });
    }
  }
  return map.size > 0
    ? Array.from(map.values())
    : [{ platform: "", languages: [], ottReleaseDate: "" }];
}

// Expand rows back to flat entries for the backend
function expandAvailability(
  rows: AvailabilityRow[]
): AdminMovieRequest["availability"] {
  const entries: AdminMovieRequest["availability"] = [];
  for (const row of rows) {
    if (!row.platform || !row.ottReleaseDate || row.languages.length === 0) continue;
    for (const lang of row.languages) {
      entries.push({
        platform: row.platform,
        language: lang,
        ottReleaseDate: row.ottReleaseDate,
      });
    }
  }
  return entries;
}

export default function MovieForm({ initial, onSubmit, submitLabel }: Props) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [releaseYear, setReleaseYear] = useState(
    initial?.releaseYear?.toString() ?? ""
  );
  const [genres, setGenres] = useState<string[]>(initial?.genres ?? []);
  const [availability, setAvailability] = useState<AvailabilityRow[]>(
    initial?.availability ? groupAvailability(initial.availability)
      : [{ platform: "", languages: [], ottReleaseDate: "" }]
  );

  // Poster
  const [posterPreview, setPosterPreview] = useState<string | null>(initial?.posterUrl ?? null);
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [uploadingPoster, setUploadingPoster] = useState(false);
  const [posterSuccess, setPosterSuccess] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ── Genre toggle ───────────────────────────────────────────────────────────
  const toggleGenre = (g: string) =>
    setGenres((prev) =>
      prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]
    );

  // ── Availability row helpers ───────────────────────────────────────────────
  const addRow = () =>
    setAvailability((prev) => [
      ...prev,
      { platform: "", languages: [], ottReleaseDate: "" },
    ]);

  const removeRow = (i: number) =>
    setAvailability((prev) => prev.filter((_, idx) => idx !== i));

  const updatePlatform = (i: number, value: string) =>
    setAvailability((prev) =>
      prev.map((row, idx) => (idx === i ? { ...row, platform: value } : row))
    );

  const updateDate = (i: number, value: string) =>
    setAvailability((prev) =>
      prev.map((row, idx) => (idx === i ? { ...row, ottReleaseDate: value } : row))
    );

  const toggleLanguage = (i: number, lang: string) =>
    setAvailability((prev) =>
      prev.map((row, idx) => {
        if (idx !== i) return row;
        const has = row.languages.includes(lang);
        return {
          ...row,
          languages: has
            ? row.languages.filter((l) => l !== lang)
            : [...row.languages, lang],
        };
      })
    );

  // ── Poster ─────────────────────────────────────────────────────────────────
  const handlePosterSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPosterFile(file);
    setPosterPreview(URL.createObjectURL(file));
    setPosterSuccess(false);
  };

  // ── Validation ─────────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = "Title is required";
    if (releaseYear && (isNaN(Number(releaseYear)) || Number(releaseYear) < 1900))
      errs.releaseYear = "Enter a valid year";
    availability.forEach((row, i) => {
      if (!row.platform) errs[`platform_${i}`] = "Select a platform";
      if (row.languages.length === 0) errs[`lang_${i}`] = "Select at least one language";
      if (!row.ottReleaseDate) errs[`date_${i}`] = "Select a release date";
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const req: AdminMovieRequest = {
        title: title.trim(),
        description: description.trim(),
        releaseYear: releaseYear ? Number(releaseYear) : null,
        genres,
        // Expand: Netflix + [English, Hindi] → two backend entries
        availability: expandAvailability(availability),
      };
      await onSubmit(req);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">

      {/* ── Basic Info ──────────────────────────────────────────────────────── */}
      <section className="bg-zinc-900/60 border border-white/8 rounded-xl p-6">
        <h2 className="text-white font-semibold mb-5 flex items-center gap-2">
          <span className="w-1.5 h-5 bg-amber-400 rounded-full" />
          Basic Information
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-xs text-zinc-400 uppercase tracking-widest mb-1.5">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Interstellar"
              className={`w-full bg-zinc-800 border rounded-lg px-3 py-2.5 text-white text-sm
                placeholder-zinc-600 focus:outline-none focus:border-amber-400/60 transition-colors
                ${errors.title ? "border-red-500/60" : "border-white/10"}`}
            />
            {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-xs text-zinc-400 uppercase tracking-widest mb-1.5">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Movie synopsis..."
              rows={3}
              maxLength={2000}
              className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2.5 text-white
                text-sm placeholder-zinc-600 focus:outline-none focus:border-amber-400/60
                transition-colors resize-none"
            />
            <p className="text-zinc-600 text-xs mt-1 text-right">{description.length}/2000</p>
          </div>

          <div>
            <label className="block text-xs text-zinc-400 uppercase tracking-widest mb-1.5">
              Release Year
            </label>
            <input
              type="number"
              value={releaseYear}
              onChange={(e) => setReleaseYear(e.target.value)}
              placeholder="e.g. 2024"
              min="1900"
              max="2099"
              className={`w-32 bg-zinc-800 border rounded-lg px-3 py-2.5 text-white text-sm
                placeholder-zinc-600 focus:outline-none focus:border-amber-400/60 transition-colors
                ${errors.releaseYear ? "border-red-500/60" : "border-white/10"}`}
            />
            {errors.releaseYear && <p className="text-red-400 text-xs mt-1">{errors.releaseYear}</p>}
          </div>
        </div>
      </section>

      {/* ── Poster ──────────────────────────────────────────────────────────── */}
      <section className="bg-zinc-900/60 border border-white/8 rounded-xl p-6">
        <h2 className="text-white font-semibold mb-5 flex items-center gap-2">
          <span className="w-1.5 h-5 bg-orange-500 rounded-full" />
          Movie Poster
        </h2>
        <div className="flex items-start gap-6">
          <div
            className="w-28 flex-shrink-0 rounded-xl overflow-hidden border border-white/10 bg-zinc-800 cursor-pointer group"
            style={{ height: "168px" }}
            onClick={() => fileRef.current?.click()}
          >
            {posterPreview ? (
              <div className="relative w-full h-full">
                <img src={posterPreview} className="w-full h-full object-cover" alt="Poster preview" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white text-xs">Change</span>
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-2 group-hover:bg-white/5 transition-colors">
                <span className="text-2xl opacity-30">🎬</span>
                <span className="text-zinc-600 text-xs">Click to upload</span>
              </div>
            )}
          </div>
          <div className="flex-1">
            <p className="text-zinc-400 text-sm mb-3">
              Upload the movie poster. Stored in AWS S3 and served as a public URL.
            </p>
            <p className="text-zinc-600 text-xs mb-4">Accepted: JPEG, PNG, WebP · Max 5MB</p>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handlePosterSelect}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="px-4 py-2 text-sm border border-white/10 rounded-lg text-zinc-300
                hover:text-white hover:border-amber-400/40 transition-all"
            >
              {posterPreview ? "Change Poster" : "Select Poster"}
            </button>
            {posterFile && (
              <p className="text-amber-400 text-xs mt-2">⚠ Poster uploads after saving the movie</p>
            )}
            {posterSuccess && (
              <p className="text-emerald-400 text-xs mt-2">✓ Poster uploaded successfully</p>
            )}
            {uploadingPoster && (
              <p className="text-zinc-500 text-xs mt-2">Uploading poster...</p>
            )}
          </div>
        </div>
      </section>

      {/* ── Genres ──────────────────────────────────────────────────────────── */}
      <section className="bg-zinc-900/60 border border-white/8 rounded-xl p-6">
        <h2 className="text-white font-semibold mb-5 flex items-center gap-2">
          <span className="w-1.5 h-5 bg-blue-500 rounded-full" />
          Genres
        </h2>
        <div className="flex flex-wrap gap-2">
          {GENRE_OPTIONS.map((g) => {
            const active = genres.includes(g);
            return (
              <button
                key={g}
                type="button"
                onClick={() => toggleGenre(g)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${active
                  ? "bg-amber-400/15 border-amber-400/40 text-amber-400"
                  : "bg-transparent border-white/10 text-zinc-500 hover:border-white/20 hover:text-zinc-300"
                  }`}
              >
                {active && <span className="mr-1">✓</span>}
                {g}
              </button>
            );
          })}
        </div>
        {genres.length > 0 && (
          <p className="text-zinc-600 text-xs mt-3">Selected: {genres.join(", ")}</p>
        )}
      </section>

      {/* ── Platform Availability ────────────────────────────────────────────── */}
      <section className="bg-zinc-900/60 border border-white/8 rounded-xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-white font-semibold flex items-center gap-2">
              <span className="w-1.5 h-5 bg-emerald-500 rounded-full" />
              Platform Availability
            </h2>
            <p className="text-zinc-600 text-xs mt-1">
              Each platform row can have multiple languages — one DB entry is created per language.
            </p>
          </div>
          <button
            type="button"
            onClick={addRow}
            className="text-xs text-amber-400 hover:text-amber-300 border border-amber-400/20
              hover:border-amber-400/40 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1"
          >
            + Add Platform
          </button>
        </div>

        <div className="space-y-4">
          {availability.map((row, i) => (
            <div
              key={i}
              className="border border-white/8 rounded-xl p-4 bg-zinc-800/40 space-y-4"
            >
              {/* Row header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {row.platform && <PlatformBadge platform={row.platform} size="sm" />}
                  {row.languages.length > 0 && (
                    <span className="text-zinc-500 text-xs">
                      {row.languages.length} language{row.languages.length > 1 ? "s" : ""}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeRow(i)}
                  disabled={availability.length === 1}
                  className="text-zinc-600 hover:text-red-400 transition-colors text-sm
                    disabled:opacity-20 disabled:cursor-not-allowed"
                >
                  Remove
                </button>
              </div>

              {/* Platform + Date in a row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-zinc-600 uppercase tracking-widest mb-1">
                    Platform <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={row.platform}
                    onChange={(e) => updatePlatform(i, e.target.value)}
                    className={`w-full bg-zinc-900 border rounded-lg px-3 py-2 text-sm text-white
                      focus:outline-none focus:border-amber-400/60 transition-colors
                      ${errors[`platform_${i}`] ? "border-red-500/60" : "border-white/10"}`}
                  >
                    <option value="">Select platform</option>
                    {PLATFORM_OPTIONS.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                  {errors[`platform_${i}`] && (
                    <p className="text-red-400 text-xs mt-1">{errors[`platform_${i}`]}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] text-zinc-600 uppercase tracking-widest mb-1">
                    OTT Release Date <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="date"
                    value={row.ottReleaseDate}
                    onChange={(e) => updateDate(i, e.target.value)}
                    className={`w-full bg-zinc-900 border rounded-lg px-3 py-2 text-sm text-white
                      focus:outline-none focus:border-amber-400/60 transition-colors
                      ${errors[`date_${i}`] ? "border-red-500/60" : "border-white/10"}`}
                  />
                  {errors[`date_${i}`] && (
                    <p className="text-red-400 text-xs mt-1">{errors[`date_${i}`]}</p>
                  )}
                </div>
              </div>

              {/* Language multi-select — pill toggles */}
              <div>
                <label className="block text-[10px] text-zinc-600 uppercase tracking-widest mb-2">
                  Languages <span className="text-red-400">*</span>
                  <span className="text-zinc-700 normal-case tracking-normal ml-2">
                    (select all that apply)
                  </span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {LANGUAGE_OPTIONS.map((lang) => {
                    const active = row.languages.includes(lang);
                    return (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => toggleLanguage(i, lang)}
                        className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${active
                          ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400"
                          : "bg-transparent border-white/10 text-zinc-500 hover:border-white/20 hover:text-zinc-300"
                          }`}
                      >
                        {active && <span className="mr-1">✓</span>}
                        {lang}
                      </button>
                    );
                  })}
                </div>
                {errors[`lang_${i}`] && (
                  <p className="text-red-400 text-xs mt-2">{errors[`lang_${i}`]}</p>
                )}

                {/* Preview of what gets sent to backend */}
                {row.platform && row.languages.length > 0 && row.ottReleaseDate && (
                  <div className="mt-3 pt-3 border-t border-white/5">
                    <p className="text-[10px] text-zinc-600 uppercase tracking-widest mb-1.5">
                      Will create {row.languages.length} DB {row.languages.length === 1 ? "entry" : "entries"}:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {row.languages.map((lang) => (
                        <span
                          key={lang}
                          className="text-[10px] bg-zinc-900 border border-white/8 px-2 py-0.5 rounded text-zinc-400"
                        >
                          {row.platform} · {lang} · {row.ottReleaseDate}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Submit ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-end gap-3 pb-8">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className="px-6 py-2.5 bg-amber-400 text-black font-semibold text-sm rounded-lg
            hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all
            flex items-center gap-2"
        >
          {submitting ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            submitLabel
          )}
        </button>
      </div>
    </div>
  );
}