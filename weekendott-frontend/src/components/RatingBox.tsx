import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { submitRating, getMyRating } from "../api";

type Props = {
  movieId: string;
};

export default function RatingBox({ movieId }: Props) {
  const { user, login } = useAuth();
  const [myRating, setMyRating] = useState<number | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showChange, setShowChange] = useState(false);
  const pendingFiredRef = useRef(false);

  // Load existing rating on mount
  useEffect(() => {
    if (!user) return;
    getMyRating(movieId)
        .then(res => setMyRating(res.score))
        .catch(() => {});
  }, [user, movieId]);

  // Handle pending rating action after login
  useEffect(() => {
    if (!user || pendingFiredRef.current) return;

    const raw = localStorage.getItem("wott_pending_action");
    if (!raw) return;

    try {
      const action = JSON.parse(raw);
      if (action.type === "rate" && action.movieId === movieId) {
        pendingFiredRef.current = true;
        localStorage.removeItem("wott_pending_action");
        doRate(action.score);
      }
    } catch {
      localStorage.removeItem("wott_pending_action");
    }
  }, [user]);

  const doRate = async (score: number) => {
    setSubmitting(true);
    try {
      await submitRating(movieId, score);
      setMyRating(score);
      setShowChange(false);
    } catch {
      // handle error
    } finally {
      setSubmitting(false);
    }
  };

  const handleRate = (score: number) => {
    if (!user) {
      localStorage.setItem("wott_pending_action", JSON.stringify({ type: "rate", movieId, score }));
      login();
      return;
    }
    doRate(score);
  };

  const displayRating = hovered ?? myRating;
  const isRated = myRating !== null && !showChange;

  return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
              <button
                  key={star}
                  disabled={submitting || isRated}
                  onMouseEnter={() => !isRated && setHovered(star)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => handleRate(star)}
                  className={`text-2xl transition-transform ${
                      !isRated ? "hover:scale-110 cursor-pointer" : "cursor-default"
                  } ${
                      displayRating !== null && star <= displayRating
                          ? "text-amber-400"
                          : "text-zinc-600"
                  }`}
              >
                ★
              </button>
          ))}
          {submitting && (
              <span className="text-xs text-zinc-400 ml-1">Saving...</span>
          )}
        </div>

        {isRated && (
            <button
                onClick={() => setShowChange(true)}
                className="text-xs text-zinc-500 hover:text-amber-400 transition-colors text-left"
            >
              Change rating
            </button>
        )}

        {!user && (
            <p className="text-xs text-zinc-500">
              <button onClick={login} className="text-amber-400 hover:underline">
                Sign in
              </button>{" "}
              to rate
            </p>
        )}
      </div>
  );
}