import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { fetchComments, postComment } from "../api";
import type { Comment, Page } from "../types";

type Props = {
  movieId: string;
};

export default function CommentsPanel({ movieId }: Props) {
  const { user, login } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");
  const [watched, setWatched] = useState(true);
  const [spoiler, setSpoiler] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const pendingFiredRef = useRef(false);

  useEffect(() => {
    loadComments(0);
  }, [movieId]);

  // Handle pending comment action after login
  useEffect(() => {
    if (!user || pendingFiredRef.current) return;

    const raw = localStorage.getItem("wott_pending_action");
    if (!raw) return;

    try {
      const action = JSON.parse(raw);
      if (action.type === "comment" && action.movieId === movieId) {
        pendingFiredRef.current = true;
        localStorage.removeItem("wott_pending_action");
        submitPendingComment(action.text, action.watched, action.spoiler);
      }
    } catch {
      localStorage.removeItem("wott_pending_action");
    }
  }, [user]);

  const loadComments = async (pageNum: number) => {
    setLoading(true);
    try {
      const data: Page<Comment> = await fetchComments(movieId, pageNum);
      if (pageNum === 0) {
        setComments(data.content);
      } else {
        setComments(prev => [...prev, ...data.content]);
      }
      setHasMore(!data.last);
      setPage(pageNum);
    } catch {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  const submitPendingComment = async (
      pendingText: string,
      pendingWatched: boolean,
      pendingSpoiler: boolean
  ) => {
    try {
      const newComment = await postComment(movieId, {
        text: pendingText,
        watched: pendingWatched,
        spoiler: pendingSpoiler,
      });
      setComments(prev => [newComment, ...prev]);
    } catch {
      // handle error
    }
  };

  const handleSubmit = async () => {
    if (!text.trim()) return;

    if (!user) {
      localStorage.setItem(
          "wott_pending_action",
          JSON.stringify({ type: "comment", movieId, text, watched, spoiler })
      );
      login();
      return;
    }

    setSubmitting(true);
    try {
      const newComment = await postComment(movieId, { text, watched, spoiler });
      setComments(prev => [newComment, ...prev]);
      setText("");
    } catch {
      // handle error
    } finally {
      setSubmitting(false);
    }
  };

  return (
      <div className="flex flex-col gap-4">
        {/* Comment input */}
        <div className="bg-zinc-900 rounded-xl p-4 border border-white/5">
        <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={user ? "Share your thoughts..." : "Sign in to comment"}
            disabled={!user}
            rows={3}
            className="w-full bg-transparent text-white text-sm resize-none outline-none placeholder:text-zinc-500 disabled:cursor-not-allowed"
        />
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer">
                <input
                    type="checkbox"
                    checked={watched}
                    onChange={e => setWatched(e.target.checked)}
                    className="accent-amber-400"
                />
                Watched
              </label>
              <label className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer">
                <input
                    type="checkbox"
                    checked={spoiler}
                    onChange={e => setSpoiler(e.target.checked)}
                    className="accent-amber-400"
                />
                Spoiler
              </label>
            </div>
            <button
                onClick={user ? handleSubmit : login}
                disabled={submitting || (user !== null && !text.trim())}
                className="px-4 py-1.5 bg-amber-400 text-zinc-950 text-xs font-semibold rounded-lg hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {user ? (submitting ? "Posting..." : "Post") : "Sign in"}
            </button>
          </div>
        </div>

        {/* Comments list */}
        {comments.map(comment => (
            <div key={comment.id} className="bg-zinc-900 rounded-xl p-4 border border-white/5">
              <div className="flex items-center gap-3 mb-2">
                {comment.userPicture ? (
                    <img
                        src={comment.userPicture}
                        alt={comment.userName}
                        referrerPolicy="no-referrer"
                        className="w-7 h-7 rounded-full object-cover"
                    />
                ) : (
                    <div className="w-7 h-7 rounded-full bg-amber-400 flex items-center justify-center text-zinc-950 text-xs font-bold">
                      {comment.userName?.[0]?.toUpperCase() ?? "?"}
                    </div>
                )}
                <div>
                  <span className="text-sm font-medium text-white">{comment.userName}</span>
                  {comment.spoiler && (
                      <span className="ml-2 text-xs text-orange-400 bg-orange-400/10 px-1.5 py-0.5 rounded">
                  Spoiler
                </span>
                  )}
                </div>
              </div>
              <p className="text-sm text-zinc-300 leading-relaxed">{comment.text}</p>
            </div>
        ))}

        {/* Load more */}
        {hasMore && !loading && (
            <button
                onClick={() => loadComments(page + 1)}
                className="text-xs text-zinc-500 hover:text-amber-400 transition-colors text-center py-2"
            >
              Load more comments
            </button>
        )}

        {loading && (
            <div className="text-center py-4">
              <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
        )}
      </div>
  );
}