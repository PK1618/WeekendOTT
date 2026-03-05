import { useEffect, useState, useRef, useCallback } from "react";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import { fetchComments, postComment } from "../api";
import { useAuth } from "../context/AuthContext";
import LoginPromptModal from "./LoginPromptModal";
import type { Comment } from "../types";

type Props = {
  movieId: string;
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

function CommentBubble({ comment }: { comment: Comment }) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="border border-white/8 rounded-xl p-4 bg-zinc-900/40">
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <div className="w-7 h-7 rounded-full overflow-hidden bg-gradient-to-br from-amber-500 to-orange-600 flex-shrink-0">
          {comment.userPicture ? (
            <img
              src={comment.userPicture}
              alt={comment.userName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs font-bold text-black">
              {comment.userName?.charAt(0).toUpperCase() ?? "?"}
            </div>
          )}
        </div>
        <span className="text-zinc-400 text-xs font-medium">{comment.userName}</span>
        {comment.watched && (
          <span className="text-[10px] bg-emerald-900/50 text-emerald-400 border border-emerald-400/20 px-1.5 py-0.5 rounded-full">
            ✓ Watched
          </span>
        )}
        {comment.spoiler && (
          <span className="text-[10px] bg-red-900/50 text-red-400 border border-red-400/20 px-1.5 py-0.5 rounded-full">
            ⚠ Spoiler
          </span>
        )}
        <span className="text-zinc-600 text-xs ml-auto">{timeAgo(comment.createdAt)}</span>
      </div>

      {comment.spoiler && !revealed ? (
        <button
          onClick={() => setRevealed(true)}
          className="text-xs text-zinc-500 hover:text-amber-400 transition-colors"
        >
          Click to reveal spoiler →
        </button>
      ) : (
        <p className="text-zinc-300 text-sm leading-relaxed">{comment.text}</p>
      )}
    </div>
  );
}

export default function CommentsPanel({ movieId }: Props) {
  const SIZE = 5;
  const { user } = useAuth();

  const [comments, setComments] = useState<Comment[]>([]);
  const [page, setPage] = useState(0);
  const [isLast, setIsLast] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [total, setTotal] = useState(0);

  const [text, setText] = useState("");
  const [watched, setWatched] = useState(false);
  const [spoiler, setSpoiler] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const emojiRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) {
        setShowEmojis(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const pendingFiredRef = useRef(false);

  // Fire pending comment once user becomes available (after login redirect)
  // We watch `user` — it goes null → null → UserObject after OAuth callback
  useEffect(() => {
    // Skip if no user yet, or already fired
    if (!user || pendingFiredRef.current) return;

    const raw = localStorage.getItem("wott_pending_action");
    if (!raw) return;

    let action: { type: string; text?: string; watched?: boolean; spoiler?: boolean };
    try {
      action = JSON.parse(raw);
    } catch {
      localStorage.removeItem("wott_pending_action");
      return;
    }

    if (action.type === "comment" && action.text?.trim()) {
      pendingFiredRef.current = true;
      localStorage.removeItem("wott_pending_action");

      const text = action.text.trim();
      const watched = action.watched || false;
      const spoiler = action.spoiler || false;

      setSubmitting(true);
      setSubmitError(null);

      postComment(movieId, { text, watched, spoiler })
        .then((newComment) => {
          setComments((prev) => [newComment, ...prev]);
          setTotal((t) => t + 1);
        })
        .catch(() => setSubmitError("Failed to post comment. Try again."))
        .finally(() => setSubmitting(false));
    }
  }, [user, movieId]);

  const loadInitial = async () => {
    setLoading(true);
    try {
      const res = await fetchComments(movieId, 0, SIZE);
      setComments(res.content);
      setIsLast(res.last);
      setPage(0);
      setTotal(res.totalElements);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const res = await fetchComments(movieId, nextPage, SIZE);
      setComments((prev) => [...prev, ...res.content]);
      setIsLast(res.last);
      setPage(nextPage);
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    loadInitial();
  }, [movieId]);

  const insertEmoji = (emoji: { native: string }) => {
    const el = textareaRef.current;
    const native = emoji.native;
    if (!el) {
      setText((prev) => prev + native);
      setShowEmojis(false);
      return;
    }
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const newText = text.slice(0, start) + native + text.slice(end);
    setText(newText);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + native.length, start + native.length);
    }, 0);
    setShowEmojis(false);
  };

  const handleSubmit = async () => {
    if (!user) {
      // Save what they were trying to post so we can re-fire after login
      localStorage.setItem("wott_pending_action", JSON.stringify({
        type: "comment",
        movieId,
        text,
        watched,
        spoiler,
      }));
      setShowLoginPrompt(true);
      return;
    }
    if (!text.trim()) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const newComment = await postComment(movieId, {
        text: text.trim(),
        watched,
        spoiler,
      });
      setComments((prev) => [newComment, ...prev]);
      setTotal((t) => t + 1);
      setText("");
      setWatched(false);
      setSpoiler(false);
    } catch {
      setSubmitError("Failed to post comment. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {showLoginPrompt && (
        <LoginPromptModal
          action="post a comment"
          onClose={() => setShowLoginPrompt(false)}
        />
      )}

      <div>
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-lg font-semibold font-display text-white">Comments</h2>
          <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full">
            {total}
          </span>
        </div>

        {/* Comment form */}
        <div className="bg-zinc-900/60 border border-white/8 rounded-xl p-4 mb-6">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={user ? "Share your thoughts about this movie..." : "Sign in to leave a comment..."}
            maxLength={1000}
            rows={3}
            className="w-full bg-transparent text-sm text-white placeholder-zinc-600 resize-none focus:outline-none"
          />

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5 flex-wrap gap-3">
            {/* Left: checkboxes + emoji */}
            <div className="flex items-center gap-4 flex-wrap">
              <label className="flex items-center gap-1.5 cursor-pointer text-xs text-zinc-400 hover:text-white transition-colors">
                <input
                  type="checkbox"
                  checked={watched}
                  onChange={(e) => setWatched(e.target.checked)}
                  className="accent-amber-400"
                />
                I watched it
                {watched && <span className="text-emerald-400">✓</span>}
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer text-xs text-zinc-400 hover:text-white transition-colors">
                <input
                  type="checkbox"
                  checked={spoiler}
                  onChange={(e) => setSpoiler(e.target.checked)}
                  className="accent-red-400"
                />
                Contains spoiler
              </label>

              {/* Emoji picker */}
              <div className="relative" ref={emojiRef}>
                <button
                  type="button"
                  onClick={() => setShowEmojis((v) => !v)}
                  className={`text-xl leading-none transition-all hover:scale-110 ${showEmojis ? "opacity-100" : "opacity-50 hover:opacity-100"
                    }`}
                  title="Add emoji"
                >
                  😊
                </button>

                {showEmojis && (
                  <div className="absolute bottom-10 left-0 z-50 shadow-2xl shadow-black/60">
                    <Picker
                      data={data}
                      onEmojiSelect={insertEmoji}
                      theme="dark"
                      previewPosition="none"
                      skinTonePosition="none"
                      searchPosition="top"
                      maxFrequentRows={2}
                      perLine={8}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Right: char count + post button */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-zinc-600">{text.length}/1000</span>
              <button
                onClick={user ? handleSubmit : () => setShowLoginPrompt(true)}
                disabled={submitting || (!!user && !text.trim())}
                className="px-4 py-1.5 bg-amber-400 text-black text-xs font-semibold rounded-lg hover:bg-amber-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                {submitting ? "Posting..." : user ? "Post" : "Sign in to post"}
              </button>
            </div>
          </div>

          {submitError && (
            <p className="text-red-400 text-xs mt-2">{submitError}</p>
          )}
        </div>

        {/* Comment list */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="border border-white/5 rounded-xl p-4 animate-pulse">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-full bg-zinc-800" />
                  <div className="h-3 bg-zinc-800 rounded w-24" />
                </div>
                <div className="space-y-1.5">
                  <div className="h-3 bg-zinc-800 rounded w-full" />
                  <div className="h-3 bg-zinc-800 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-10 text-zinc-600 text-sm">
            No comments yet. Be the first to share your thoughts!
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {comments.map((c) => (
                <CommentBubble key={c.id} comment={c} />
              ))}
            </div>

            {!isLast && (
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="mt-4 w-full py-2.5 border border-white/8 rounded-lg text-sm text-zinc-400 hover:text-white hover:border-amber-400/30 hover:bg-amber-400/5 disabled:opacity-50 transition-all"
              >
                {loadingMore ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-3 h-3 border border-zinc-500 border-t-amber-400 rounded-full animate-spin" />
                    Loading...
                  </span>
                ) : (
                  "Load 5 more comments"
                )}
              </button>
            )}

            {isLast && comments.length > 0 && (
              <p className="mt-4 text-center text-xs text-zinc-600">
                All {total} comments loaded
              </p>
            )}
          </>
        )}
      </div>
    </>
  );
}