// Aligned to backend DTOs

export type AvailabilityBadge = {
  platform: string;
  language: string;
  ottReleaseDate: string; // LocalDate as ISO string
};

export type MovieCard = {
  id: string;
  title: string;
  posterUrl: string | null;
  releaseYear: number | null;
  avgRating: number | null;
  ratingCount: number;
  availabilityBadges: AvailabilityBadge[];
};

export type MovieAvailability = {
  id: string;
  platform: string;
  language: string;
  ottReleaseDate: string;
};

export type MovieDetails = {
  id: string;
  title: string;
  description: string | null;
  posterUrl: string | null;
  releaseYear: number | null;
  genres: string[];
  avgRating: number | null;
  ratingCount: number;
  availability: MovieAvailability[];
};

export type Comment = {
  id: string;
  userId: string;
  userName: string;
  userPicture: string | null;
  text: string;
  watched: boolean;
  spoiler: boolean;
  createdAt: string;
};

export type HomeResponse = {
  recentReleases: MovieCard[];
  topRated: MovieCard[];
};

export type Page<T> = {
  content: T[];
  last: boolean;
  number: number;
  totalElements: number;
  totalPages: number;
};

export type RatingResponse = {
  avgRating: number;
  ratingCount: number;
};