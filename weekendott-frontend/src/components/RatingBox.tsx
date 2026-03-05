import { useState, useEffect, useRef } from "react";
import { submitRating, getMyRating } from "../api";
import { useAuth } from "../context/AuthContext";
import LoginPromptModal from "./LoginPromptModal";
import type { RatingResponse } from "../types";

type Props = {
  movieId: string;
  currentAvg: number | null;
  currentCount: number;
};

export default function RatingBox({ movieId, currentAvg, currentCount }: Props) {
  const { user } = useAuth();
  const [hovered, setHovered] = useState<number | null>(null);
  const [selected, setSelected] = useState<number | null>(null);  // user's current rating
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RatingResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const pendingFiredRef = useRef(false);

  const displayAvg = result?.avgRating ?? currentAvg;
  const displayCount = result?.ratingCount ?? currentCount;

  // Load user's existing rating OR fire pending action — not both
  useEffect(() => {
    if (!user || pendingFiredRef.current) return;

    // Check for a pending rating first (user clicked star while logged out)
    const raw = localStorage.getItem("wott_pending_action");
    if (raw) {
      try {
        const action = JSON.parse(raw);
        if (action.type === "rate" && action.score) {
          pendingFiredRef.current = true;
          localStorage.removeItem("wott_pending_action");
          doRate(action.score); // this sets selected to the new score
          return; // skip fetching old rating
        }
      } catch {
        localStorage.removeItem("wott_pending_action");
      }
    }

    // No pending action — load their existing rating from DB
    getMyRating(movieId)
      .then(({ score }) => {
        if (score !== null) setSelected(score);
      })
      .catch(() => { });
  }, [user, movieId]);

  const doRate = async (score: number) => {
    setSelected(score);
    setLoading(true);
    setError(null);
    try {
      const res = await submitRating(movieId, score);
      setResult(res);
    } catch {
      setError("Couldn't submit rating. Try again.");
      setSelected(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRate = (score: number) => {
    if (!user) {
      localStorage.setItem("wott_pending_action", JSON.stringify({ type: "rate", movieId, score }));
      setShowLoginPrompt(true);
      return;
    }
    doRate(score);
  };

  return (
    <>
      {showLoginPrompt && (
        <LoginPromptModal action="rate this movie" onClose={() => setShowLoginPrompt(false)} />
      )}

      <div className="bg-zinc-900/60 border border-white/8 rounded-xl p-5">
        {/* Community rating */}
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-amber-400 text-3xl font-bold font-display">
            {displayAvg !== null ? displayAvg.toFixed(1) : "—"}
          </span>
          <span className="text-zinc-500 text-sm">/ 5</span>
          <span className="text-zinc-600 text-xs ml-1">
            {displayCount.toLocaleString()} {displayCount === 1 ? "rating" : "ratings"}
          </span>
        </div>

        {/* Stars */}
        <div className="space-y-2">
          <p className="text-zinc-400 text-xs uppercase tracking-widest">
            {selected !== null ? "Your rating" : "Rate this movie"}
          </p>
          <div className="flex gap-1" onMouseLeave={() => setHovered(null)}>
            {[1, 2, 3, 4, 5].map((star) => {
              const active = hovered !== null ? star <= hovered : selected !== null ? star <= selected : false;
              return (
                <button
                  key={star}
                  type="button"
                  disabled={loading}
                  onMouseEnter={() => !loading && setHovered(star)}
                  onClick={() => handleRate(star)}
                  className={`text-3xl transition-all duration-150 ${loading ? "cursor-default opacity-50" : "cursor-pointer hover:scale-110"
                    } ${active ? "text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" : "text-zinc-700"}`}
                >
                  ★
                </button>
              );
            })}
          </div>

          {/* Sign in nudge when not logged in */}
          {!user && (
            <p className="text-zinc-600 text-xs">
              <button
                onClick={() => setShowLoginPrompt(true)}
                className="text-amber-400/70 hover:text-amber-400 underline underline-offset-2 transition-colors"
              >
                Sign in
              </button>
              {" "}to rate this movie
            </p>
          )}

          {selected !== null && !loading && (
            <p className="text-amber-400/80 text-xs">
              ✓ {result ? "Rating saved!" : `You rated ${selected} star${selected > 1 ? "s" : ""}`}
              {" · "}
              <button
                onClick={() => setSelected(null)}
                className="text-zinc-500 hover:text-zinc-300 underline underline-offset-2 transition-colors"
              >
                Change
              </button>
            </p>
          )}
          {loading && <p className="text-zinc-500 text-xs">Submitting...</p>}
          {error && <p className="text-red-400 text-xs">{error}</p>}
        </div>
      </div>
    </>
  );
}