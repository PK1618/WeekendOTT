import { api } from "./index";
import type { AdminMovieResponse, AdminMovieRequest, AdminPage } from "../types/admin";

// List all movies (paginated)
export const adminListMovies = (
  page = 0,
  size = 20
): Promise<AdminPage<AdminMovieResponse>> =>
  api
    .get<AdminPage<AdminMovieResponse>>("/api/admin/movies", { params: { page, size } })
    .then((r) => r.data);

// Get single movie for editing
export const adminGetMovie = (id: string): Promise<AdminMovieResponse> =>
  api.get<AdminMovieResponse>(`/api/admin/movies/${id}`).then((r) => r.data);

// Create movie
export const adminCreateMovie = (
  req: AdminMovieRequest
): Promise<AdminMovieResponse> =>
  api.post<AdminMovieResponse>("/api/admin/movies", req).then((r) => r.data);

// Update movie
export const adminUpdateMovie = (
  id: string,
  req: AdminMovieRequest
): Promise<AdminMovieResponse> =>
  api.put<AdminMovieResponse>(`/api/admin/movies/${id}`, req).then((r) => r.data);

// Delete movie
export const adminDeleteMovie = (id: string): Promise<void> =>
  api.delete(`/api/admin/movies/${id}`).then(() => undefined);

// Upload poster to S3
export const adminUploadPoster = (
  movieId: string,
  file: File
): Promise<{ posterUrl: string }> => {
  const form = new FormData();
  form.append("file", file);
  return api
    .post<{ posterUrl: string }>(`/api/movies/${movieId}/poster`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((r) => r.data);
};