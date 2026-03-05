export type AdminAvailabilityEntry = {
  id?: string;
  platform: string;
  language: string;
  ottReleaseDate: string
};

export type AdminMovieResponse = {
  id: string;
  title: string;
  description: string | null;
  posterUrl: string | null;
  releaseYear: string | null;
  genres: string[];
  availability: AdminAvailabilityEntry[];
}

export type AdminMovieRequest = {
  title: string;
  description: string;
  releaseYear: number | null;
  genres: string[];
  availability: {
    platform: string;
    language: string;
    ottReleaseDate: string;
  }[];
};

export type AdminPage<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  last: boolean;
  first: boolean;
};