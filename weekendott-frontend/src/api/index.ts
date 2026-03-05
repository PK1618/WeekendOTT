import axios from "axios";
import type {
  HomeResponse,
  MovieCard,
  MovieDetails,
  Comment,
  Page,
  RatingResponse,
} from "../types";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080",
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token to every request automatically
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("wott_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Movies
export const fetchHome = (): Promise<HomeResponse> =>
  api.get<HomeResponse>("/api/home").then((r) => r.data);

export const fetchMovies = (params: {
  q?: string;
  platform?: string;
  language?: string;
  genre?: string;
  limit?: number;
}): Promise<MovieCard[]> =>
  api.get<MovieCard[]>("/api/movies", { params }).then((r) => r.data);

export const fetchRecentMovies = (limit = 20): Promise<MovieCard[]> =>
  api.get<MovieCard[]>("/api/movies/recent", { params: { limit } }).then((r) => r.data);

export const fetchMovieDetails = (id: string): Promise<MovieDetails> =>
  api.get<MovieDetails>(`/api/movies/${id}`).then((r) => r.data);

// Comments
export const fetchComments = (
  movieId: string,
  page = 0,
  size = 10
): Promise<Page<Comment>> =>
  api
    .get<Page<Comment>>(`/api/movies/${movieId}/comments`, {
      params: { page, size },
    })
    .then((r) => r.data);

export const postComment = (
  movieId: string,
  payload: { text: string; watched: boolean; spoiler: boolean }
): Promise<Comment> =>
  api.post<Comment>(`/api/movies/${movieId}/comments`, payload).then((r) => r.data);

// Rating (1–5)
export const submitRating = (
  movieId: string,
  score: number
): Promise<RatingResponse> =>
  api
    .post<RatingResponse>(`/api/movies/${movieId}/rating`, { score })
    .then((r) => r.data);

export const getMyRating = (movieId: string): Promise<{ score: number | null }> =>
  api
    .get<{ score: number | null }>(`/api/movies/${movieId}/rating/mine`)
    .then((r) => r.data);